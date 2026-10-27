import SavedDog from '../models/SavedDog.js';

export const getSavedDogs = async (req, res, next) => {
  try {
    const user = req.user;
    const saved = await SavedDog.find({ userId: user.id });
    const dogIds = saved.map((s) => s.dogId);
    return res.status(200).json(dogIds);
  } catch (error) {
    next(error);
  }
};

export const toggleSaveDog = async (req, res, next) => {
  try {
    const user = req.user;
    const { dogId } = req.body;

    if (!dogId) {
      return res.status(400).json({ message: 'dogId is required' });
    }

    const existing = await SavedDog.findOne({ userId: user.id, dogId });
    if (existing) {
      await SavedDog.findByIdAndDelete(existing._id);
      return res.status(200).json({ saved: false, dogId });
    } else {
      await SavedDog.create({ userId: user.id, dogId });
      return res.status(200).json({ saved: true, dogId });
    }
  } catch (error) {
    next(error);
  }
};
