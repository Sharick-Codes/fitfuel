/**
 * FitFuel Calculation Utilities (Client-side)
 * Scientifically validated algorithms for body composition, metabolic rate, and nutrition targets
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'Sedentary', description: 'Desk job, little or no exercise', value: 1.2 },
  light: { label: 'Lightly Active', description: 'Light exercise 1–3 days/week', value: 1.375 },
  moderate: { label: 'Moderately Active', description: 'Moderate exercise 3–5 days/week', value: 1.55 },
  active: { label: 'Very Active', description: 'Hard exercise 6–7 days/week', value: 1.725 },
  veryActive: { label: 'Extremely Active', description: 'Very hard daily exercise or physical job', value: 1.9 }
};

export const GOAL_TYPES = {
  lose: { label: '🔥 Weight Loss', color: '#FF6B35', description: 'Caloric deficit to burn body fat safely' },
  gain: { label: '💪 Muscle Gain', color: '#7C5CFC', description: 'Caloric surplus for lean hypertrophy' },
  maintain: { label: '⚖️ Maintenance', color: '#00D4AA', description: 'Sustain weight and optimize performance' },
  recomp: { label: '🔄 Body Recomposition', color: '#FBBF24', description: 'Slight deficit with high protein to build muscle while losing fat' }
};

/**
 * Calculate BMI with WHO standard and Asian-population specific thresholds
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return { bmi: 0, category: 'N/A', color: '#888' };
  const hMeters = height / 100;
  const bmi = weight / (hMeters * hMeters);
  const rounded = Math.round(bmi * 10) / 10;

  // WHO Global Standard
  let category, color, severity;
  if (bmi < 16.0) { category = 'Severely Underweight'; color = '#3B82F6'; severity = 'high'; }
  else if (bmi < 18.5) { category = 'Underweight'; color = '#60A5FA'; severity = 'low'; }
  else if (bmi < 25.0) { category = 'Normal Weight'; color = '#4ADE80'; severity = 'normal'; }
  else if (bmi < 30.0) { category = 'Overweight'; color = '#FBBF24'; severity = 'low'; }
  else if (bmi < 35.0) { category = 'Obese Class I'; color = '#F87171'; severity = 'medium'; }
  else if (bmi < 40.0) { category = 'Obese Class II'; color = '#EF4444'; severity = 'high'; }
  else { category = 'Obese Class III'; color = '#DC2626'; severity = 'critical'; }

  // Asian Indian Specific Criteria (WHO Asian cutoffs: overweight >= 23, obese >= 27.5)
  let asianCategory;
  if (bmi < 18.5) asianCategory = 'Underweight';
  else if (bmi < 23.0) asianCategory = 'Normal (Healthy)';
  else if (bmi < 27.5) asianCategory = 'Overweight (Action Recommended)';
  else asianCategory = 'Obese (High Risk)';

  // Healthy Weight Range for this height (BMI 18.5 - 24.9)
  const minHealthyWeight = Math.round(18.5 * hMeters * hMeters * 10) / 10;
  const maxHealthyWeight = Math.round(24.9 * hMeters * hMeters * 10) / 10;

  return {
    bmi: rounded,
    category,
    asianCategory,
    color,
    severity,
    minHealthyWeight,
    maxHealthyWeight
  };
};

/**
 * Calculate Ideal Body Weight using the clinically recognized Devine Formula
 * Men: 50.0 kg + 2.3 kg per inch over 5 feet
 * Women: 45.5 kg + 2.3 kg per inch over 5 feet
 */
export const calculateIdealBodyWeight = (heightCm, gender = 'male') => {
  if (!heightCm) return { devine: 70, minRange: 60, maxRange: 75 };
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
 * Calculate BMR (Basal Metabolic Rate)
 * Gold standard Mifflin-St Jeor Equation + Revised Harris-Benedict comparison
 */
export const calculateBMR = (weight, height, age, gender = 'male') => {
  if (!weight || !height || !age) return 1600;

  // Mifflin-St Jeor (Standard)
  let mifflin;
  if (gender === 'male') {
    mifflin = Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    mifflin = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }

  // Revised Harris-Benedict (1984)
  let harrisBenedict;
  if (gender === 'male') {
    harrisBenedict = Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    harrisBenedict = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }

  return mifflin;
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (bmr, activityLevel = 'moderate') => {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel]?.value || 1.55;
  return Math.round(bmr * mult);
};

/**
 * Daily Hydration Requirement based on body weight and activity
 * Formula: ~35ml per kg body weight (+ 350ml if active)
 */
export const calculateWaterTarget = (weight, activityLevel = 'moderate') => {
  const baseMl = (weight || 70) * 35;
  const activityBonus = (activityLevel === 'active' || activityLevel === 'veryActive') ? 500 : 250;
  const totalMl = Math.round(baseMl + activityBonus);
  const glasses = Math.ceil(totalMl / 250); // 1 standard glass = 250ml
  const liters = (totalMl / 1000).toFixed(1);

  return { totalMl, glasses, liters };
};

/**
 * Calculate Calorie Target with customizable pacing options
 */
export const calculateCalorieTarget = (tdee, goal = 'maintain', pace = 'moderate') => {
  switch (goal) {
    case 'lose': {
      let deficit = 500;
      let label = 'Moderate deficit (-500 kcal/day ~0.5kg/wk)';
      if (pace === 'mild') {
        deficit = 250;
        label = 'Mild deficit (-250 kcal/day ~0.25kg/wk)';
      } else if (pace === 'aggressive') {
        deficit = 750;
        label = 'Aggressive deficit (-750 kcal/day ~0.75kg/wk)';
      }
      return {
        calories: Math.max(1200, tdee - deficit),
        adjustment: -deficit,
        label,
        weeklyChangeKg: (deficit * 7) / 7700
      };
    }
    case 'gain': {
      let surplus = 350;
      let label = 'Lean bulk (+350 kcal/day for clean mass)';
      if (pace === 'mild') {
        surplus = 200;
        label = 'Mild surplus (+200 kcal/day minimal fat gain)';
      } else if (pace === 'aggressive') {
        surplus = 500;
        label = 'High bulk (+500 kcal/day)';
      }
      return {
        calories: tdee + surplus,
        adjustment: surplus,
        label,
        weeklyChangeKg: (surplus * 7) / 7700
      };
    }
    case 'recomp':
      return {
        calories: tdee - 200,
        adjustment: -200,
        label: 'Slight deficit (-200 kcal/day) with high protein for muscle building & fat loss',
        weeklyChangeKg: 0.15
      };
    case 'maintain':
    default:
      return {
        calories: tdee,
        adjustment: 0,
        label: 'Maintenance (Equal energy balance)',
        weeklyChangeKg: 0
      };
  }
};

/**
 * Calculate macronutrient split ensuring optimal protein per kg of bodyweight
 */
export const calculateMacros = (calories, goal = 'maintain', weight = 70) => {
  let pRatio, cRatio, fRatio;
  switch (goal) {
    case 'lose':
      pRatio = 0.35; cRatio = 0.35; fRatio = 0.30;
      break;
    case 'gain':
      pRatio = 0.30; cRatio = 0.45; fRatio = 0.25;
      break;
    case 'recomp':
      pRatio = 0.40; cRatio = 0.30; fRatio = 0.30;
      break;
    case 'maintain':
    default:
      pRatio = 0.30; cRatio = 0.40; fRatio = 0.30;
  }

  // Protein floor: at least 1.6g per kg of body weight, up to 2.2g for fat loss/recomp
  const minProteinGrams = Math.round(weight * 1.8);
  const calculatedProtein = Math.round((calories * pRatio) / 4);
  const protein = Math.max(calculatedProtein, minProteinGrams);

  // Re-adjust remaining calories for carbs and fats
  const remainingCals = Math.max(calories - (protein * 4), calories * 0.5);
  const carbs = Math.round((remainingCals * 0.58) / 4);
  const fats = Math.round((remainingCals * 0.42) / 9);

  return {
    protein,
    carbs,
    fats,
    proteinCalories: protein * 4,
    carbsCalories: carbs * 4,
    fatsCalories: fats * 9,
    proteinPercent: Math.round(((protein * 4) / calories) * 100),
    carbsPercent: Math.round(((carbs * 4) / calories) * 100),
    fatsPercent: Math.round(((fats * 9) / calories) * 100)
  };
};

/**
 * Estimate timeline to reach target weight
 */
export const estimateTimeline = (currentWeight, targetWeight, goal = 'lose', pace = 'moderate') => {
  const diff = Math.abs(currentWeight - targetWeight);
  if (diff <= 0.2) {
    return { weeks: 0, months: 0, targetDate: new Date(), weeklyRate: 0 };
  }

  let weeklyRate;
  if (goal === 'lose') {
    weeklyRate = pace === 'mild' ? 0.25 : pace === 'aggressive' ? 0.75 : 0.5;
  } else if (goal === 'gain') {
    weeklyRate = pace === 'mild' ? 0.2 : pace === 'aggressive' ? 0.45 : 0.3;
  } else {
    weeklyRate = 0.3;
  }

  const weeks = Math.max(1, Math.ceil(diff / weeklyRate));
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (weeks * 7));

  return {
    weeks,
    months: Math.round((weeks / 4.33) * 10) / 10,
    targetDate,
    weeklyRate
  };
};

export default {
  calculateBMI,
  calculateIdealBodyWeight,
  calculateBMR,
  calculateTDEE,
  calculateWaterTarget,
  calculateCalorieTarget,
  calculateMacros,
  estimateTimeline,
  ACTIVITY_MULTIPLIERS,
  GOAL_TYPES
};

