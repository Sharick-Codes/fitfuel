import Sleep from '../models/Sleep.js';
import Supplement from '../models/Supplement.js';
import FastingSession from '../models/FastingSession.js';
import DailyLog from '../models/DailyLog.js';
import Meal from '../models/Meal.js';
import WaterLog from '../models/WaterLog.js';
import Exercise from '../models/Exercise.js';
import { calculateHealthScore } from '../utils/calculations.js';

// ========== SLEEP ==========

// @desc    Log sleep
// @route   POST /api/wellness/sleep
export const logSleep = async (req, res, next) => {
  try {
    const { bedtime, wakeTime, totalHours, quality, notes } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let sleep = await Sleep.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (sleep) {
      Object.assign(sleep, { bedtime, wakeTime, totalHours, quality, notes });
      await sleep.save();
    } else {
      sleep = await Sleep.create({
        userId: req.user.id,
        bedtime, wakeTime, totalHours, quality, notes
      });
    }

    res.status(201).json({ success: true, sleep });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sleep history
// @route   GET /api/wellness/sleep/history
export const getSleepHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sleepLogs = await Sleep.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const avgHours = sleepLogs.length > 0
      ? Math.round((sleepLogs.reduce((sum, s) => sum + (s.totalHours || 0), 0) / sleepLogs.length) * 10) / 10
      : 0;

    res.json({ success: true, sleepLogs, avgHours });
  } catch (error) {
    next(error);
  }
};

// ========== SUPPLEMENTS ==========

// @desc    Log supplements
// @route   POST /api/wellness/supplements
export const logSupplements = async (req, res, next) => {
  try {
    const { supplements } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let supplementLog = await Supplement.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (supplementLog) {
      supplementLog.supplements = supplements;
      await supplementLog.save();
    } else {
      supplementLog = await Supplement.create({
        userId: req.user.id,
        supplements
      });
    }

    res.status(201).json({ success: true, supplements: supplementLog });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's supplements
// @route   GET /api/wellness/supplements/today
export const getTodaySupplements = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const supplementLog = await Supplement.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({ success: true, supplements: supplementLog });
  } catch (error) {
    next(error);
  }
};

// ========== FASTING ==========

// @desc    Start fasting session
// @route   POST /api/wellness/fasting/start
export const startFasting = async (req, res, next) => {
  try {
    const { schedule } = req.body;
    const targetHoursMap = { '16:8': 16, '18:6': 18, '20:4': 20, 'OMAD': 23, 'custom': req.body.targetHours || 16 };

    const session = await FastingSession.create({
      userId: req.user.id,
      schedule,
      startTime: new Date(),
      targetHours: targetHoursMap[schedule] || 16
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    End fasting session
// @route   PUT /api/wellness/fasting/end
export const endFasting = async (req, res, next) => {
  try {
    const session = await FastingSession.findOne({
      userId: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No active fasting session' });
    }

    session.endTime = new Date();
    session.actualHours = Math.round((session.endTime - session.startTime) / (1000 * 60 * 60) * 10) / 10;
    session.status = session.actualHours >= session.targetHours ? 'completed' : 'broken';
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active fasting session
// @route   GET /api/wellness/fasting/active
export const getActiveFasting = async (req, res, next) => {
  try {
    const session = await FastingSession.findOne({
      userId: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (session) {
      const elapsed = Math.round((Date.now() - new Date(session.startTime)) / (1000 * 60 * 60) * 10) / 10;
      const remaining = Math.max(0, session.targetHours - elapsed);

      res.json({
        success: true,
        session,
        progress: {
          elapsedHours: elapsed,
          remainingHours: remaining,
          percentage: Math.min(Math.round((elapsed / session.targetHours) * 100), 100)
        }
      });
    } else {
      res.json({ success: true, session: null });
    }
  } catch (error) {
    next(error);
  }
};

// ========== HEALTH SCORE ==========

// @desc    Get today's health score
// @route   GET /api/wellness/health-score
export const getHealthScore = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Gather today's data
    const meals = await Meal.find({ userId: req.user.id, date: { $gte: today, $lt: tomorrow } });
    const water = await WaterLog.findOne({ userId: req.user.id, date: { $gte: today, $lt: tomorrow } });
    const sleep = await Sleep.findOne({ userId: req.user.id, date: { $gte: today, $lt: tomorrow } });
    const exercises = await Exercise.find({ userId: req.user.id, date: { $gte: today, $lt: tomorrow } });

    const caloriesConsumed = meals.reduce((sum, m) => sum + m.totalMealCalories, 0);
    const proteinConsumed = meals.reduce((sum, m) => sum + m.totalMealProtein, 0);

    const score = calculateHealthScore({
      caloriesConsumed,
      calorieTarget: 2000, // This would come from user's goal
      waterGlasses: water?.glasses || 0,
      waterTarget: water?.target || 8,
      sleepHours: sleep?.totalHours || 0,
      exerciseDone: exercises.length > 0,
      proteinHit: proteinConsumed >= 100 // Simplified check
    });

    res.json({
      success: true,
      healthScore: score,
      breakdown: {
        calories: caloriesConsumed,
        water: water?.glasses || 0,
        sleep: sleep?.totalHours || 0,
        exerciseCount: exercises.length,
        protein: proteinConsumed
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========== NUTRIENT ALERTS ==========

// @desc    Get nutrient deficiency alerts
// @route   GET /api/wellness/alerts
export const getNutrientAlerts = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: startDate }
    });

    if (meals.length === 0) {
      return res.json({ success: true, alerts: [{ type: 'info', message: 'Start logging meals to receive nutrient alerts' }] });
    }

    const daysCount = Math.max(1, new Set(meals.map(m => m.date.toISOString().split('T')[0])).size);
    const avgProtein = Math.round(meals.reduce((sum, m) => sum + m.totalMealProtein, 0) / daysCount);
    const avgCalories = Math.round(meals.reduce((sum, m) => sum + m.totalMealCalories, 0) / daysCount);
    const avgFats = Math.round(meals.reduce((sum, m) => sum + m.totalMealFats, 0) / daysCount);

    const alerts = [];

    if (avgProtein < 50) {
      alerts.push({ type: 'warning', nutrient: 'Protein', message: `Your avg protein is ${avgProtein}g/day. Aim for at least 1.6g per kg body weight.`, icon: '🥩' });
    }
    if (avgCalories < 1200) {
      alerts.push({ type: 'danger', nutrient: 'Calories', message: `Your avg calorie intake is ${avgCalories}/day. Eating below 1200 cal is unhealthy.`, icon: '⚠️' });
    }
    if (avgFats < 30) {
      alerts.push({ type: 'warning', nutrient: 'Fats', message: `Your avg fat intake is ${avgFats}g/day. Healthy fats are essential.`, icon: '🥑' });
    }
    if (avgCalories > 3500) {
      alerts.push({ type: 'warning', nutrient: 'Calories', message: `Your avg intake is ${avgCalories}/day. This may lead to excess weight gain.`, icon: '📊' });
    }

    if (alerts.length === 0) {
      alerts.push({ type: 'success', message: 'Great job! Your nutrition looks balanced! 💪', icon: '✅' });
    }

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};
