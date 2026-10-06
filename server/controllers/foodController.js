import Food from '../models/Food.js';

// @desc    Get all foods with filters
// @route   GET /api/foods
export const getFoods = async (req, res, next) => {
  try {
    const { category, tags, cuisine, search, page = 1, limit = 20 } = req.query;
    const query = { isCustom: false };

    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    const foods = await Food.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ averageRating: -1 });

    const total = await Food.countDocuments(query);

    res.json({
      success: true,
      foods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food by ID
// @route   GET /api/foods/:id
export const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal suggestions based on remaining budget
// @route   GET /api/foods/suggestions/:mealType
export const getMealSuggestions = async (req, res, next) => {
  try {
    const { mealType } = req.params;
    const { remainingCalories, dietMode, limit = 10 } = req.query;

    const query = { category: mealType };
    
    if (remainingCalories) {
      query.calories = { $lte: parseInt(remainingCalories) };
    }
    
    if (dietMode && dietMode !== 'all') {
      const tagMap = {
        vegetarian: 'veg',
        vegan: 'vegan',
        keto: 'keto',
        highProtein: 'highProtein',
        lowCarb: 'lowCarb'
      };
      if (tagMap[dietMode]) {
        query.tags = { $in: [tagMap[dietMode]] };
      }
    }

    const foods = await Food.find(query)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, protein: -1 });

    res.json({ success: true, suggestions: foods });
  } catch (error) {
    next(error);
  }
};

// @desc    Search foods
// @route   GET /api/foods/search
export const searchFoods = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const foods = await Food.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    }).limit(20).sort({ averageRating: -1 });

    res.json({ success: true, foods });
  } catch (error) {
    next(error);
  }
};

// @desc    Add custom food
// @route   POST /api/foods/custom
export const addCustomFood = async (req, res, next) => {
  try {
    const food = await Food.create({
      ...req.body,
      isCustom: true,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a food
// @route   PUT /api/foods/:id/rate
export const rateFood = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    // Simple average calculation
    const newCount = food.ratingCount + 1;
    const newAvg = ((food.averageRating * food.ratingCount) + rating) / newCount;

    food.averageRating = Math.round(newAvg * 10) / 10;
    food.ratingCount = newCount;
    await food.save();

    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};
