import ShelterVisit from '../models/ShelterVisit.js';
import VisitParticipant from '../models/VisitParticipant.js';
import Shelter from '../models/Shelter.js';
import { emitBroadcast } from '../sockets/socketHandler.js';

export const getVisits = async (req, res, next) => {
  try {
    const { shelterId } = req.query;
    const filter = {};
    if (shelterId) filter.shelterId = shelterId;

    const visits = await ShelterVisit.find(filter).sort({ date: 1, startTime: 1 });
    return res.status(200).json(visits);
  } catch (error) {
    next(error);
  }
};

export const getVisitById = async (req, res, next) => {
  try {
    const visit = await ShelterVisit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    return res.status(200).json(visit);
  } catch (error) {
    next(error);
  }
};

export const createVisit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.shelterId) {
      return res.status(403).json({ message: 'User must belong to a shelter' });
    }

    const shelter = await Shelter.findById(user.shelterId);
    const shelterName = shelter ? shelter.name : 'Partner Shelter';
    const shelterAddress = shelter ? `${shelter.address}, ${shelter.city}` : '123 Rescue Way';

    const { title, description, date, startTime, endTime, capacity } = req.body;

    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, date, startTime, and endTime are required' });
    }

    const visit = await ShelterVisit.create({
      shelterId: user.shelterId,
      shelterName,
      shelterAddress,
      title,
      description: description || '',
      date,
      startTime,
      endTime,
      capacity: Number(capacity) || 10,
      participantCount: 0,
      status: 'upcoming',
    });

    emitBroadcast('visit:created', visit);
    return res.status(201).json(visit);
  } catch (error) {
    next(error);
  }
};

export const joinVisit = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { notes } = req.body;

    const visit = await ShelterVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.status !== 'upcoming') {
      return res.status(400).json({ message: 'Cannot join a visit that is not upcoming' });
    }

    if (visit.participantCount >= visit.capacity) {
      return res.status(400).json({ message: 'This visit is already at full capacity' });
    }

    // Check if already registered
    const existing = await VisitParticipant.findOne({
      visitId: id,
      userId: user.id,
      status: 'confirmed',
    });

    if (existing) {
      return res.status(400).json({ message: 'You are already registered for this visit' });
    }

    // Upsert or create participant
    await VisitParticipant.findOneAndUpdate(
      { visitId: id, userId: user.id },
      {
        userName: user.fullName,
        userEmail: user.email,
        notes: notes || '',
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
      },
      { upsert: true, new: true }
    );

    // Atomically increment participant count
    const updatedVisit = await ShelterVisit.findByIdAndUpdate(
      id,
      { $inc: { participantCount: 1 } },
      { new: true }
    );

    emitBroadcast('visit:updated', updatedVisit);
    return res.status(200).json({ success: true, visit: updatedVisit });
  } catch (error) {
    next(error);
  }
};

export const leaveVisit = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const participant = await VisitParticipant.findOne({
      visitId: id,
      userId: user.id,
      status: 'confirmed',
    });

    if (!participant) {
      return res.status(400).json({ message: 'You are not registered for this visit' });
    }

    participant.status = 'cancelled';
    await participant.save();

    const updatedVisit = await ShelterVisit.findByIdAndUpdate(
      id,
      { $inc: { participantCount: -1 } },
      { new: true }
    );

    emitBroadcast('visit:updated', updatedVisit);
    return res.status(200).json({ success: true, visit: updatedVisit });
  } catch (error) {
    next(error);
  }
};

export const getVisitParticipants = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const visit = await ShelterVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (user.role !== 'shelter_staff' || user.shelterId !== visit.shelterId) {
      return res.status(403).json({ message: 'Access restricted to shelter staff' });
    }

    const participants = await VisitParticipant.find({
      visitId: id,
      status: 'confirmed',
    }).sort({ registeredAt: 1 });

    return res.status(200).json(participants);
  } catch (error) {
    next(error);
  }
};

export const getUserVisitStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const participant = await VisitParticipant.findOne({
      visitId: id,
      userId: user.id,
      status: 'confirmed',
    });

    return res.status(200).json({ isRegistered: Boolean(participant) });
  } catch (error) {
    next(error);
  }
};

export const cancelVisit = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const visit = await ShelterVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (user.shelterId !== visit.shelterId) {
      return res.status(403).json({ message: 'Not authorized to cancel visits for another shelter' });
    }

    visit.status = 'cancelled';
    await visit.save();

    emitBroadcast('visit:updated', visit);
    return res.status(200).json(visit);
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const user = req.user;
    const participants = await VisitParticipant.find({
      userId: user.id,
      status: 'confirmed',
    });
    const visitIds = participants.map((p) => p.visitId);
    return res.status(200).json(visitIds);
  } catch (error) {
    next(error);
  }
};

