import AdoptionApplication from '../models/AdoptionApplication.js';
import Dog from '../models/Dog.js';
import Shelter from '../models/Shelter.js';
import { emitToShelter, emitToUser } from '../sockets/socketHandler.js';

export const getApplications = async (req, res, next) => {
  try {
    const user = req.user;
    let filter = {};

    if (user.role === 'shelter_staff') {
      filter = { shelterId: user.shelterId };
    } else {
      filter = { adopterId: user.id };
    }

    const applications = await AdoptionApplication.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      dogId,
      applicantPhone,
      address,
      housingType,
      hasYard,
      landlordApproval,
      hoursAlonePerDay,
      householdMembers,
      existingPetsDetails,
      vetReference,
      experienceDescription,
      reasonForAdopting,
    } = req.body;

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    const shelter = await Shelter.findById(dog.shelterId);
    const shelterName = shelter ? shelter.name : dog.shelterName || 'Partner Shelter';

    const newApp = await AdoptionApplication.create({
      dogId: dog.id,
      dogName: dog.name,
      dogPhoto: dog.photos && dog.photos[0] ? dog.photos[0] : '',
      shelterId: dog.shelterId,
      shelterName,
      adopterId: user.id,
      applicantName: user.fullName,
      applicantEmail: user.email,
      applicantPhone: applicantPhone || user.phone || '555-0100',
      address,
      housingType,
      hasYard: Boolean(hasYard),
      landlordApproval: Boolean(landlordApproval),
      hoursAlonePerDay: Number(hoursAlonePerDay) || 0,
      householdMembers,
      existingPetsDetails: existingPetsDetails || 'None',
      vetReference: vetReference || { clinicName: '', phone: '' },
      experienceDescription,
      reasonForAdopting,
      status: 'submitted',
      shelterNotes: '',
      timeline: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Application successfully received by PawPair system.',
          actorName: user.fullName,
        },
      ],
    });

    // Notify shelter staff
    emitToShelter(dog.shelterId, 'application:new', newApp);

    return res.status(201).json(newApp);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status, note } = req.body;

    const application = await AdoptionApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (user.role === 'shelter_staff' && application.shelterId !== user.shelterId) {
      return res.status(403).json({ message: 'Not authorized to manage applications for another shelter' });
    }

    // Adopter can withdraw their own application
    if (user.role === 'adopter') {
      if (application.adopterId !== user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (status !== 'withdrawn') {
        return res.status(400).json({ message: 'Adopters can only withdraw their application' });
      }
    }

    application.status = status;
    if (note) {
      application.shelterNotes = note;
    }

    application.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
      actorName: user.fullName,
    });

    await application.save();

    // If application is approved, optionally update dog status to pending_adoption
    if (status === 'approved') {
      await Dog.findByIdAndUpdate(application.dogId, { status: 'pending_adoption' });
    }

    // Real-time broadcast
    emitToUser(application.adopterId, 'application:updated', application);
    emitToShelter(application.shelterId, 'application:updated', application);

    return res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};
