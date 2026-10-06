import DailyLog from '../models/DailyLog.js';

// @desc    Create/update daily log
// @route   POST /api/logs
export const createLog = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if log exists for today — update it
    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (log) {
      Object.assign(log, req.body);
      log.netCalories = (log.caloriesConsumed || 0) - (log.caloriesBurned || 0);
      await log.save();
    } else {
      log = await DailyLog.create({
        userId: req.user.id,
        ...req.body,
        netCalories: (req.body.caloriesConsumed || 0) - (req.body.caloriesBurned || 0)
      });
    }

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's log
// @route   GET /api/logs/today
export const getTodayLog = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await DailyLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

// @desc    Get log history
// @route   GET /api/logs
export const getLogs = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress stats
// @route   GET /api/logs/stats
export const getStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await DailyLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (logs.length === 0) {
      return res.json({ success: true, stats: null, logs: [], message: 'No logs found' });
    }

    const weights = logs.filter(l => l.weight).map(l => l.weight);
    const calories = logs.filter(l => l.caloriesConsumed).map(l => l.caloriesConsumed);

    const stats = {
      totalLogs: logs.length,
      weightTrend: weights.length >= 2 ? {
        start: weights[0],
        current: weights[weights.length - 1],
        change: Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10,
        lowest: Math.min(...weights),
        highest: Math.max(...weights)
      } : null,
      calorieAvg: calories.length > 0 ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length) : 0,
      avgHealthScore: logs.length > 0 ? Math.round(logs.reduce((a, l) => a + (l.healthScore || 0), 0) / logs.length) : 0
    };

    res.json({ success: true, stats, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calorie heatmap data
// @route   GET /api/logs/heatmap
export const getHeatmap = async (req, res, next) => {
  try {
    const { months = 3 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).select('date caloriesConsumed healthScore mood').sort({ date: 1 });

    const heatmapData = logs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      calories: log.caloriesConsumed,
      healthScore: log.healthScore,
      mood: log.mood
    }));

    res.json({ success: true, heatmap: heatmapData });
  } catch (error) {
    next(error);
  }
};
