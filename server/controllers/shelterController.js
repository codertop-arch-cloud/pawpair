import Shelter from '../models/Shelter.js';

export const getShelters = async (req, res, next) => {
  try {
    const shelters = await Shelter.find({}).sort({ name: 1 });
    return res.status(200).json(shelters);
  } catch (error) {
    next(error);
  }
};

export const getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    return res.status(200).json(shelter);
  } catch (error) {
    next(error);
  }
};

export const updateShelter = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.shelterId !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to modify another shelter' });
    }

    const updated = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
