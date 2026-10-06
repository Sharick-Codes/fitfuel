import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import DailyLog from '../models/DailyLog.js';
import Meal from '../models/Meal.js';
import Exercise from '../models/Exercise.js';

// @desc    Get all badges with unlock status
// @route   GET /api/gamification/badges
export const getBadges = async (req, res, next) => {
  try {
    const allBadges = await Achievement.find();
    const user = await User.findById(req.user.id);
    const unlockedIds = user.achievements.map(a => a.badgeId);

    const badges = allBadges.map(badge => ({
      ...badge.toObject(),
      unlocked: unlockedIds.includes(badge.badgeId),
      unlockedAt: user.achievements.find(a => a.badgeId === badge.badgeId)?.unlockedAt
    }));

    res.json({
      success: true,
      badges,
      totalBadges: allBadges.length,
      unlockedCount: unlockedIds.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get XP and level info
// @route   GET /api/gamification/level
export const getLevel = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const levelThresholds = {
      beginner: 0,
      intermediate: 500,
      advanced: 1500,
      elite: 3500,
      legend: 7000
    };

    const levels = Object.keys(levelThresholds);
    const currentIndex = levels.indexOf(user.level);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    const nextLevelXP = nextLevel ? levelThresholds[nextLevel] : null;
    const xpToNext = nextLevelXP ? nextLevelXP - user.xp : 0;
    const progress = nextLevelXP
      ? Math.round(((user.xp - levelThresholds[user.level]) / (nextLevelXP - levelThresholds[user.level])) * 100)
      : 100;

    res.json({
      success: true,
      xp: user.xp,
      level: user.level,
      nextLevel,
      xpToNext,
      progress: Math.min(Math.max(progress, 0), 100)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get streak info
// @route   GET /api/gamification/streak
export const getStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      streak: {
        current: user.streak.current,
        longest: user.streak.longest,
        lastLogDate: user.streak.lastLogDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'xp' } = req.query;

    let sortField = {};
    if (type === 'streak') sortField = { 'streak.current': -1 };
    else sortField = { xp: -1 };

    const users = await User.find()
      .select('name level xp streak.current profileImage')
      .sort(sortField)
      .limit(20);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak.current,
      profileImage: user.profileImage
    }));

    // Find current user's rank
    const currentUser = leaderboard.find(u => u.name === req.user.name);

    res.json({ success: true, leaderboard, yourRank: currentUser?.rank || 'N/A' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and award badges + update streak
// @route   POST /api/gamification/check
export const checkAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const newBadges = [];
    let xpGained = 0;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLog = user.streak.lastLogDate ? new Date(user.streak.lastLogDate) : null;

    if (lastLog) {
      lastLog.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastLog) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak.current += 1;
      } else if (diffDays > 1) {
        user.streak.current = 1;
      }
      // diffDays === 0 means already logged today, keep current
    } else {
      user.streak.current = 1;
    }

    user.streak.lastLogDate = today;
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    // XP for daily activity
    xpGained += 10; // Base XP for logging

    // Check badge criteria
    const allBadges = await Achievement.find();
    const unlockedIds = user.achievements.map(a => a.badgeId);

    for (const badge of allBadges) {
      if (unlockedIds.includes(badge.badgeId)) continue;

      let earned = false;
      const req_type = badge.requirement?.type;
      const target = badge.requirement?.target;

      if (req_type === 'streak' && user.streak.current >= target) earned = true;
      if (req_type === 'xp' && user.xp >= target) earned = true;
      if (req_type === 'meals') {
        const mealCount = await Meal.countDocuments({ userId: user._id });
        if (mealCount >= target) earned = true;
      }
      if (req_type === 'exercises') {
        const exCount = await Exercise.countDocuments({ userId: user._id });
        if (exCount >= target) earned = true;
      }
      if (req_type === 'logs') {
        const logCount = await DailyLog.countDocuments({ userId: user._id });
        if (logCount >= target) earned = true;
      }

      if (earned) {
        user.achievements.push({ badgeId: badge.badgeId });
        xpGained += badge.xpReward;
        newBadges.push(badge);
      }
    }

    // Update XP and level
    user.xp += xpGained;
    if (user.xp >= 7000) user.level = 'legend';
    else if (user.xp >= 3500) user.level = 'elite';
    else if (user.xp >= 1500) user.level = 'advanced';
    else if (user.xp >= 500) user.level = 'intermediate';
    else user.level = 'beginner';

    await user.save();

    res.json({
      success: true,
      newBadges,
      xpGained,
      totalXP: user.xp,
      level: user.level,
      streak: user.streak
    });
  } catch (error) {
    next(error);
  }
};
