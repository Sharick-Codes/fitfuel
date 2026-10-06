/**
 * FitFuel Calculation Utilities
 * BMI, BMR, TDEE, Macro calculations
 */

// Activity Level Multipliers for TDEE
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  veryActive: 1.9      // Very hard exercise, physical job
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {object} { bmi, category, color }
 */
export const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const rounded = Math.round(bmi * 10) / 10;

  let category, color;
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#3B82F6';
  } else if (bmi < 25) {
    category = 'Normal Weight';
    color = '#4ADE80';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#FBBF24';
  } else {
    category = 'Obese';
    color = '#F87171';
  }

  return { bmi: rounded, category, color };
};

/**
 * Calculate Ideal Body Weight using the Devine Formula
 */
export const calculateIdealBodyWeight = (heightCm, gender = 'male') => {
  if (!heightCm) return { idealWeight: 70, minRange: 60, maxRange: 75 };
  const totalInches = heightCm / 2.54;
  const inchesOver5Feet = Math.max(0, totalInches - 60);

  let devine;
  if (gender === 'female') {
    devine = 45.5 + (2.3 * inchesOver5Feet);
  } else {
    devine = 50.0 + (2.3 * inchesOver5Feet);
  }
  const rounded = Math.round(devine * 10) / 10;

  return {
    idealWeight: rounded,
    minRange: Math.round((rounded - 3) * 10) / 10,
    maxRange: Math.round((rounded + 4) * 10) / 10
  };
};

/**
 * Daily Hydration Requirement based on body weight
 */
export const calculateWaterTarget = (weight, activityLevel = 'moderate') => {
  const baseMl = (weight || 70) * 35;
  const activityBonus = (activityLevel === 'active' || activityLevel === 'veryActive') ? 500 : 250;
  const totalMl = Math.round(baseMl + activityBonus);
  const glasses = Math.ceil(totalMl / 250);
  const liters = (totalMl / 1000).toFixed(1);

  return { totalMl, glasses, liters };
};


/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
export const calculateBMR = (weight, height, age, gender) => {
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  return Math.round(bmr);
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level string
 * @returns {number} TDEE in calories
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate daily calorie target based on goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - 'lose', 'maintain', 'gain', 'recomp'
 * @returns {object} { calories, deficit/surplus }
 */
export const calculateCalorieTarget = (tdee, goal) => {
  switch (goal) {
    case 'lose':
      return { calories: tdee - 500, adjustment: -500, description: '500 cal deficit for ~0.45kg/week loss' };
    case 'gain':
      return { calories: tdee + 400, adjustment: 400, description: '400 cal surplus for lean muscle gain' };
    case 'recomp':
      return { calories: tdee - 200, adjustment: -200, description: 'Slight deficit with high protein' };
    case 'maintain':
    default:
      return { calories: tdee, adjustment: 0, description: 'Maintenance calories' };
  }
};

/**
 * Calculate macro nutrient split based on goal
 * @param {number} calories - Daily calorie target
 * @param {string} goal - Goal type
 * @param {number} weight - Body weight in kg
 * @returns {object} { protein, carbs, fats } in grams
 */
export const calculateMacros = (calories, goal, weight) => {
  let proteinRatio, carbRatio, fatRatio;

  switch (goal) {
    case 'lose':
      // High protein, moderate carbs, moderate fats
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'gain':
      // High protein, high carbs, moderate fats
      proteinRatio = 0.30;
      carbRatio = 0.45;
      fatRatio = 0.25;
      break;
    case 'recomp':
      // Very high protein, moderate carbs, moderate fats
      proteinRatio = 0.40;
      carbRatio = 0.30;
      fatRatio = 0.30;
      break;
    case 'maintain':
    default:
      // Balanced split
      proteinRatio = 0.30;
      carbRatio = 0.40;
      fatRatio = 0.30;
      break;
  }

  // Ensure minimum protein: at least 1.6g per kg body weight
  let protein = Math.round((calories * proteinRatio) / 4);
  const minProtein = Math.round(weight * 1.6);
  protein = Math.max(protein, minProtein);

  const carbs = Math.round((calories * carbRatio) / 4);
  const fats = Math.round((calories * fatRatio) / 9);

  return { protein, carbs, fats };
};

/**
 * Calculate training vs rest day calories
 * @param {number} targetCalories - Base daily target
 * @param {string} goal - Goal type
 * @returns {object} { trainingDay, restDay }
 */
export const calculateTrainingRestCalories = (targetCalories, goal) => {
  switch (goal) {
    case 'lose':
      return {
        trainingDay: targetCalories + 200,
        restDay: targetCalories - 200
      };
    case 'gain':
      return {
        trainingDay: targetCalories + 200,
        restDay: targetCalories - 100
      };
    default:
      return {
        trainingDay: targetCalories + 150,
        restDay: targetCalories - 150
      };
  }
};

/**
 * Calculate cheat meal impact on weekly average
 * @param {number} dailyTarget - Daily calorie target
 * @param {number} cheatMealCalories - Calories in cheat meal
 * @param {number} normalMealCalories - Calories the cheat meal replaces
 * @returns {object} { excessCalories, weeklyImpact, recoveryDays }
 */
export const calculateCheatMealImpact = (dailyTarget, cheatMealCalories, normalMealCalories) => {
  const excessCalories = cheatMealCalories - normalMealCalories;
  const weeklyTotal = (dailyTarget * 7) + excessCalories;
  const newDailyAverage = Math.round(weeklyTotal / 7);
  const recoveryCalories = Math.round(excessCalories / 6); // Spread over remaining 6 days

  return {
    excessCalories,
    weeklyTotal,
    newDailyAverage,
    recoveryCalories,
    recoveryDays: excessCalories > 0 ? Math.ceil(excessCalories / 200) : 0,
    weeklyImpactPercent: Math.round((excessCalories / (dailyTarget * 7)) * 100 * 10) / 10
  };
};

/**
 * Calculate health score (0-100) based on daily metrics
 * @param {object} metrics - Daily metrics
 * @returns {number} Health score 0-100
 */
export const calculateHealthScore = (metrics) => {
  let score = 0;
  const weights = {
    calories: 30,
    water: 20,
    sleep: 20,
    exercise: 15,
    macroBalance: 15
  };

  // Calorie adherence (how close to target)
  if (metrics.caloriesConsumed && metrics.calorieTarget) {
    const ratio = metrics.caloriesConsumed / metrics.calorieTarget;
    if (ratio >= 0.9 && ratio <= 1.1) score += weights.calories;
    else if (ratio >= 0.8 && ratio <= 1.2) score += weights.calories * 0.7;
    else if (ratio >= 0.7 && ratio <= 1.3) score += weights.calories * 0.4;
  }

  // Water intake
  if (metrics.waterGlasses && metrics.waterTarget) {
    const waterRatio = Math.min(metrics.waterGlasses / metrics.waterTarget, 1);
    score += weights.water * waterRatio;
  }

  // Sleep
  if (metrics.sleepHours) {
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) score += weights.sleep;
    else if (metrics.sleepHours >= 6 && metrics.sleepHours <= 10) score += weights.sleep * 0.6;
    else score += weights.sleep * 0.3;
  }

  // Exercise
  if (metrics.exerciseDone) {
    score += weights.exercise;
  }

  // Macro balance (simplified)
  if (metrics.proteinHit) {
    score += weights.macroBalance;
  }

  return Math.round(score);
};

/**
 * Estimate timeline to reach target weight
 * @param {number} currentWeight - Current weight in kg
 * @param {number} targetWeight - Target weight in kg
 * @param {string} goal - Goal type
 * @returns {object} { weeks, targetDate }
 */
export const estimateTimeline = (currentWeight, targetWeight, goal) => {
  const diff = Math.abs(currentWeight - targetWeight);
  let weeklyRate;

  switch (goal) {
    case 'lose':
      weeklyRate = 0.45; // Safe: ~0.45 kg per week
      break;
    case 'gain':
      weeklyRate = 0.25; // ~0.25 kg lean mass per week
      break;
    default:
      weeklyRate = 0.3;
  }

  const weeks = Math.ceil(diff / weeklyRate);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeks * 7);

  return {
    weeks,
    months: Math.round(weeks / 4.33),
    targetDate,
    weeklyRate
  };
};

/**
 * Calculate exercise calories burned
 * @param {string} exercise - Exercise name/type
 * @param {number} duration - Duration in minutes
 * @param {number} weight - Body weight in kg
 * @param {string} intensity - low/medium/high
 * @returns {number} Calories burned
 */
export const calculateExerciseCalories = (exercise, duration, weight, intensity) => {
  // MET values (Metabolic Equivalent of Task)
  const MET_VALUES = {
    running: { low: 7, medium: 10, high: 13.5 },
    walking: { low: 2.5, medium: 3.5, high: 5 },
    cycling: { low: 4, medium: 8, high: 12 },
    swimming: { low: 5, medium: 7, high: 10 },
    weightlifting: { low: 3, medium: 5, high: 6 },
    yoga: { low: 2.5, medium: 3, high: 4 },
    hiit: { low: 6, medium: 8, high: 12 },
    jumpRope: { low: 8, medium: 10, high: 12 },
    rowing: { low: 4.5, medium: 7, high: 10 },
    elliptical: { low: 4, medium: 6, high: 8 },
    stairClimbing: { low: 4, medium: 8, high: 12 },
    boxing: { low: 5, medium: 8, high: 11 },
    dancing: { low: 3, medium: 5, high: 7 },
    sports: { low: 5, medium: 7, high: 10 },
    stretching: { low: 2, medium: 2.5, high: 3 },
    default: { low: 3, medium: 5, high: 8 }
  };

  const exerciseKey = exercise.toLowerCase().replace(/\s+/g, '');
  const mets = MET_VALUES[exerciseKey] || MET_VALUES.default;
  const met = mets[intensity] || mets.medium;

  // Calories = MET × weight(kg) × duration(hours)
  const hours = duration / 60;
  return Math.round(met * weight * hours);
};

export default {
  calculateBMI,
  calculateIdealBodyWeight,
  calculateBMR,
  calculateTDEE,
  calculateWaterTarget,
  calculateCalorieTarget,
  calculateMacros,
  calculateTrainingRestCalories,
  calculateCheatMealImpact,
  calculateHealthScore,
  estimateTimeline,
  calculateExerciseCalories
};
