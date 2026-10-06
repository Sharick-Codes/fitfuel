import Goal from '../models/Goal.js';
import { calculateCalorieTarget, calculateMacros, calculateTrainingRestCalories, estimateTimeline } from '../utils/calculations.js';

// @desc    Set a new goal
// @route   POST /api/goals
export const createGoal = async (req, res, next) => {
  try {
    const { goalType, currentWeight, targetWeight, tdee } = req.body;

    // Deactivate any existing active goals
    await Goal.updateMany(
      { userId: req.user.id, status: 'active' },
      { status: 'paused' }
    );

    const calorieTarget = calculateCalorieTarget(tdee, goalType === 'weightLoss' ? 'lose' : goalType === 'muscleGain' ? 'gain' : goalType === 'bodyRecomposition' ? 'recomp' : 'maintain');
    const macros = calculateMacros(calorieTarget.calories, goalType === 'weightLoss' ? 'lose' : goalType === 'muscleGain' ? 'gain' : goalType === 'bodyRecomposition' ? 'recomp' : 'maintain', currentWeight);
    const trainingRest = calculateTrainingRestCalories(calorieTarget.calories, goalType === 'weightLoss' ? 'lose' : goalType === 'muscleGain' ? 'gain' : 'maintain');
    const timeline = estimateTimeline(currentWeight, targetWeight, goalType === 'weightLoss' ? 'lose' : goalType === 'muscleGain' ? 'gain' : 'maintain');

    const goal = await Goal.create({
      userId: req.user.id,
      goalType,
      currentWeight,
      targetWeight,
      dailyCalorieTarget: calorieTarget.calories,
      dailyProteinTarget: macros.protein,
      dailyCarbsTarget: macros.carbs,
      dailyFatsTarget: macros.fats,
      trainingDayCalories: trainingRest.trainingDay,
      restDayCalories: trainingRest.restDay,
      targetDate: timeline.targetDate
    });

    res.status(201).json({ success: true, goal, timeline });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active goal
// @route   GET /api/goals/active
export const getActiveGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ userId: req.user.id, status: 'active' });
    if (!goal) {
      return res.json({ success: true, goal: null, message: 'No active goal' });
    }

    // Calculate progress
    const totalChange = Math.abs(goal.currentWeight - goal.targetWeight);
    const currentChange = Math.abs(goal.currentWeight - (req.user.weight || goal.currentWeight));
    const progress = totalChange > 0 ? Math.min(Math.round((currentChange / totalChange) * 100), 100) : 0;

    const daysElapsed = Math.floor((Date.now() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24));
    const daysRemaining = goal.targetDate ? Math.max(0, Math.floor((new Date(goal.targetDate) - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    res.json({
      success: true,
      goal,
      progress: {
        percentage: progress,
        daysElapsed,
        daysRemaining,
        weightChange: currentChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal progress
// @route   GET /api/goals/progress
export const getGoalProgress = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
};
