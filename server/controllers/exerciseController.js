import Exercise from '../models/Exercise.js';
import { calculateExerciseCalories } from '../utils/calculations.js';

// @desc    Log exercise
// @route   POST /api/exercise
export const logExercise = async (req, res, next) => {
  try {
    const { exerciseName, category, duration, intensity, sets, reps, weight, notes } = req.body;

    const caloriesBurned = calculateExerciseCalories(
      exerciseName, duration, req.user.weight || 70, intensity || 'medium'
    );

    const exercise = await Exercise.create({
      userId: req.user.id,
      exerciseName,
      category,
      duration,
      intensity: intensity || 'medium',
      caloriesBurned,
      sets,
      reps,
      weight,
      notes
    });

    res.status(201).json({ success: true, exercise });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's exercises
// @route   GET /api/exercise/today
export const getTodayExercises = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const exercises = await Exercise.find({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalBurned = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);

    res.json({ success: true, exercises, totalBurned, totalDuration });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exercise history
// @route   GET /api/exercise/history
export const getExerciseHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const exercises = await Exercise.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({ success: true, exercises });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workout suggestions
// @route   GET /api/exercise/suggestions
export const getWorkoutSuggestions = async (req, res, next) => {
  try {
    const userGoal = req.user.goal;

    const suggestions = {
      lose: [
        { name: 'Running', category: 'cardio', duration: 30, intensity: 'medium', description: 'Great for fat burning' },
        { name: 'HIIT', category: 'cardio', duration: 20, intensity: 'high', description: 'Maximum calorie burn in minimum time' },
        { name: 'Jump Rope', category: 'cardio', duration: 15, intensity: 'high', description: 'Full body cardio workout' },
        { name: 'Swimming', category: 'cardio', duration: 30, intensity: 'medium', description: 'Low impact, high calorie burn' },
        { name: 'Cycling', category: 'cardio', duration: 45, intensity: 'medium', description: 'Easy on joints, great cardio' },
        { name: 'Weightlifting', category: 'strength', duration: 45, intensity: 'medium', description: 'Build muscle to boost metabolism' }
      ],
      gain: [
        { name: 'Weightlifting', category: 'strength', duration: 60, intensity: 'high', description: 'Progressive overload for muscle growth' },
        { name: 'Bench Press', category: 'strength', duration: 20, intensity: 'high', description: 'Compound chest movement' },
        { name: 'Squats', category: 'strength', duration: 20, intensity: 'high', description: 'King of leg exercises' },
        { name: 'Deadlifts', category: 'strength', duration: 20, intensity: 'high', description: 'Full body compound lift' },
        { name: 'Pull-ups', category: 'strength', duration: 15, intensity: 'medium', description: 'Back and biceps builder' },
        { name: 'Walking', category: 'cardio', duration: 20, intensity: 'low', description: 'Light cardio for recovery' }
      ],
      maintain: [
        { name: 'Weightlifting', category: 'strength', duration: 45, intensity: 'medium', description: 'Maintain muscle mass' },
        { name: 'Running', category: 'cardio', duration: 25, intensity: 'medium', description: 'Maintain cardiovascular health' },
        { name: 'Yoga', category: 'flexibility', duration: 30, intensity: 'low', description: 'Flexibility and mental health' },
        { name: 'Swimming', category: 'cardio', duration: 30, intensity: 'medium', description: 'Full body low-impact workout' },
        { name: 'Cycling', category: 'cardio', duration: 30, intensity: 'medium', description: 'Endurance cardio' }
      ],
      recomp: [
        { name: 'Weightlifting', category: 'strength', duration: 60, intensity: 'high', description: 'Heavy compound lifts' },
        { name: 'HIIT', category: 'cardio', duration: 15, intensity: 'high', description: 'Short intense cardio' },
        { name: 'Walking', category: 'cardio', duration: 30, intensity: 'low', description: 'Active recovery' },
        { name: 'Squats', category: 'strength', duration: 20, intensity: 'high', description: 'Build lower body strength' },
        { name: 'Rowing', category: 'cardio', duration: 20, intensity: 'medium', description: 'Full body cardio + strength' }
      ]
    };

    const recommended = suggestions[userGoal] || suggestions.maintain;

    // Add estimated calorie burn
    const withCalories = recommended.map(ex => ({
      ...ex,
      estimatedCalories: calculateExerciseCalories(ex.name, ex.duration, req.user.weight || 70, ex.intensity)
    }));

    res.json({ success: true, suggestions: withCalories, forGoal: userGoal });
  } catch (error) {
    next(error);
  }
};
