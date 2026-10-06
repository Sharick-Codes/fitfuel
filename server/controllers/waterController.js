import WaterLog from '../models/WaterLog.js';

// @desc    Get today's water intake
// @route   GET /api/water/today
export const getTodayWater = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let waterLog = await WaterLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!waterLog) {
      waterLog = { glasses: 0, target: req.user.preferences?.waterTarget || 8, timestamps: [] };
    }

    res.json({ success: true, water: waterLog });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a glass of water
// @route   PUT /api/water/add
export const addGlass = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let waterLog = await WaterLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (waterLog) {
      waterLog.glasses += 1;
      waterLog.timestamps.push({ time: new Date(), amount: 1 });
      await waterLog.save();
    } else {
      waterLog = await WaterLog.create({
        userId: req.user.id,
        glasses: 1,
        target: req.user.preferences?.waterTarget || 8,
        timestamps: [{ time: new Date(), amount: 1 }]
      });
    }

    res.json({ success: true, water: waterLog });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a glass of water
// @route   PUT /api/water/remove
export const removeGlass = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waterLog = await WaterLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (waterLog && waterLog.glasses > 0) {
      waterLog.glasses -= 1;
      await waterLog.save();
    }

    res.json({ success: true, water: waterLog });
  } catch (error) {
    next(error);
  }
};
