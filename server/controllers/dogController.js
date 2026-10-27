import Dog from '../models/Dog.js';
import Shelter from '../models/Shelter.js';
import { emitBroadcast } from '../sockets/socketHandler.js';

export const getDogs = async (req, res, next) => {
  try {
    const {
      breed,
      size,
      energyLevel,
      ageGroup,
      status,
      shelterId,
      search,
      sort,
    } = req.query;

    const filter = {};

    if (breed) filter.breed = breed;
    if (size) filter.size = size;
    if (energyLevel) filter.energyLevel = energyLevel;
    if (ageGroup) filter.ageGroup = ageGroup;
    if (status) filter.status = status;
    if (shelterId) filter.shelterId = shelterId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { temperament: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let query = Dog.find(filter);

    if (sort === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sort === 'fee_low') {
      query = query.sort({ adoptionFee: 1 });
    } else if (sort === 'fee_high') {
      query = query.sort({ adoptionFee: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const dogs = await query.exec();
    return res.status(200).json(dogs);
  } catch (error) {
    next(error);
  }
};

export const getDogById = async (req, res, next) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }
    return res.status(200).json(dog);
  } catch (error) {
    next(error);
  }
};

export const createDog = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.shelterId) {
      return res.status(403).json({ message: 'Shelter staff must have an assigned shelter' });
    }

    const shelter = await Shelter.findById(user.shelterId);
    const shelterName = shelter ? shelter.name : 'PawPair Partner Shelter';

    const dogData = {
      ...req.body,
      shelterId: user.shelterId,
      shelterName: req.body.shelterName || shelterName,
      location: req.body.location || (shelter ? `${shelter.city}, ${shelter.state}` : 'Local Shelter'),
    };

    const newDog = await Dog.create(dogData);
    emitBroadcast('dog:created', newDog);

    return res.status(201).json(newDog);
  } catch (error) {
    next(error);
  }
};

export const updateDog = async (req, res, next) => {
  try {
    const user = req.user;
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Verify staff belongs to this dog's shelter
    if (dog.shelterId !== user.shelterId) {
      return res.status(403).json({ message: 'Not authorized to modify dogs from another shelter' });
    }

    const updated = await Dog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    emitBroadcast('dog:updated', updated);
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDog = async (req, res, next) => {
  try {
    const user = req.user;
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.shelterId !== user.shelterId) {
      return res.status(403).json({ message: 'Not authorized to delete dogs from another shelter' });
    }

    await Dog.findByIdAndDelete(req.params.id);
    emitBroadcast('dog:deleted', { id: req.params.id });

    return res.status(200).json({ success: true, message: 'Dog listing removed' });
  } catch (error) {
    next(error);
  }
};
