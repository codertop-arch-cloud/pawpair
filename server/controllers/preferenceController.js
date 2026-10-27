import AdopterPreferences from '../models/AdopterPreferences.js';

export const getPreferences = async (req, res, next) => {
  try {
    const user = req.user;
    const prefs = await AdopterPreferences.findOne({ userId: user.id });
    return res.status(200).json(prefs || null);
  } catch (error) {
    next(error);
  }
};

export const savePreferences = async (req, res, next) => {
  try {
    const user = req.user;
    const prefsData = req.body;

    const updated = await AdopterPreferences.findOneAndUpdate(
      { userId: user.id },
      { ...prefsData, userId: user.id },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
