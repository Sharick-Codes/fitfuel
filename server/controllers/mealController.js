import Meal from '../models/Meal.js';
import Food from '../models/Food.js';

// @desc    Log a meal
// @route   POST /api/meals
export const logMeal = async (req, res, next) => {
  try {
    const { mealType, foods, date } = req.body;

    // Calculate totals for each food
    const processedFoods = [];
    let totalMealCalories = 0, totalMealProtein = 0, totalMealCarbs = 0, totalMealFats = 0;

    for (const item of foods) {
      const food = await Food.findById(item.foodId);
      if (!food) continue;

      const qty = item.quantity || 1;
      const totalCalories = Math.round(food.calories * qty);
      const totalProtein = Math.round(food.protein * qty);
      const totalCarbs = Math.round(food.carbs * qty);
      const totalFats = Math.round(food.fats * qty);

      processedFoods.push({
        foodId: food._id,
        name: food.name,
        quantity: qty,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats
      });

      totalMealCalories += totalCalories;
      totalMealProtein += totalProtein;
      totalMealCarbs += totalCarbs;
      totalMealFats += totalFats;
    }

    const meal = await Meal.create({
      userId: req.user.id,
      date: date || new Date(),
      mealType,
      foods: processedFoods,
      totalMealCalories,
      totalMealProtein,
      totalMealCarbs,
      totalMealFats
    });

    res.status(201).json({ success: true, meal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's meals
// @route   GET /api/meals/today
export const getTodayMeals = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).populate('foods.foodId').sort({ mealType: 1 });

    // Calculate daily totals
    const dailyTotals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalMealCalories,
      protein: acc.protein + meal.totalMealProtein,
      carbs: acc.carbs + meal.totalMealCarbs,
      fats: acc.fats + meal.totalMealFats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.json({ success: true, meals, dailyTotals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal history
// @route   GET /api/meals/history
export const getMealHistory = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({ success: true, meals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get favorite meals
// @route   GET /api/meals/favorites
export const getFavoriteMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({
      userId: req.user.id,
      isFavorite: true
    }).populate('foods.foodId').sort({ createdAt: -1 });

    res.json({ success: true, meals });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   POST /api/meals/:id/favorite
export const toggleFavorite = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    meal.isFavorite = !meal.isFavorite;
    await meal.save();

    res.json({ success: true, meal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-generate meal plan
// @route   GET /api/meals/plan
export const generateMealPlan = async (req, res, next) => {
  try {
    const { calorieTarget, dietMode } = req.query;
    const target = parseInt(calorieTarget) || 2000;

    // Distribute calories across meals
    const distribution = {
      breakfast: Math.round(target * 0.25),
      lunch: Math.round(target * 0.35),
      snack: Math.round(target * 0.15),
      dinner: Math.round(target * 0.25)
    };

    const plan = {};
    for (const [mealType, calories] of Object.entries(distribution)) {
      const query = { category: mealType, calories: { $lte: calories } };
      if (dietMode && dietMode !== 'all') {
        query.tags = { $in: [dietMode] };
      }

      const foods = await Food.find(query).sort({ averageRating: -1 }).limit(3);
      plan[mealType] = {
        targetCalories: calories,
        suggestions: foods
      };
    }

    res.json({ success: true, plan, totalTarget: target });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate grocery list from meal plan
// @route   GET /api/meals/grocery-list
export const generateGroceryList = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    // Get recent meals or planned meals
    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('foods.foodId');

    // Aggregate ingredients
    const ingredientMap = {};
    for (const meal of meals) {
      for (const foodItem of meal.foods) {
        if (foodItem.foodId && foodItem.foodId.ingredients) {
          for (const ingredient of foodItem.foodId.ingredients) {
            if (ingredientMap[ingredient]) {
              ingredientMap[ingredient].count += foodItem.quantity;
            } else {
              ingredientMap[ingredient] = { name: ingredient, count: foodItem.quantity };
            }
          }
        }
      }
    }

    const groceryList = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ success: true, groceryList, forDays: parseInt(days) });
  } catch (error) {
    next(error);
  }
};
