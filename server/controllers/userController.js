import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'goal', 'targetWeight', 'profileImage'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
export const updatePreferences = async (req, res, next) => {
  try {
    const { dietMode, fastingSchedule, darkMode, waterTarget } = req.body;
    const update = {};

    if (dietMode !== undefined) update['preferences.dietMode'] = dietMode;
    if (fastingSchedule !== undefined) update['preferences.fastingSchedule'] = fastingSchedule;
    if (darkMode !== undefined) update['preferences.darkMode'] = darkMode;
    if (waterTarget !== undefined) update['preferences.waterTarget'] = waterTarget;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats summary
// @route   GET /api/users/stats
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      stats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        achievements: user.achievements.length,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
