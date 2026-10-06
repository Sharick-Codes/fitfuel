import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacros } from '../utils/calculations.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, height, weight, activityLevel, goal, targetWeight } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please sign in instead.' });
    }

    const parsedAge = age ? Number(age) : 25;
    const parsedHeight = height ? Number(height) : 175;
    const parsedWeight = weight ? Number(weight) : 70;
    const parsedTargetWeight = targetWeight ? Number(targetWeight) : parsedWeight;

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      age: parsedAge,
      gender: gender || 'male',
      height: parsedHeight,
      weight: parsedWeight,
      activityLevel: activityLevel || 'moderate',
      goal: goal || 'maintain',
      targetWeight: parsedTargetWeight
    });

    // Calculate initial stats
    const bmi = calculateBMI(parsedWeight, parsedHeight);
    const bmr = calculateBMR(parsedWeight, parsedHeight, parsedAge, gender || 'male');
    const tdee = calculateTDEE(bmr, activityLevel || 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, goal || 'maintain');
    const macros = calculateMacros(calorieTarget.calories, goal || 'maintain', parsedWeight);

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetWeight: user.targetWeight,
        profileImage: user.profileImage,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        preferences: user.preferences,
        achievements: user.achievements || []
      },
      stats: { bmi, bmr, tdee, calorieTarget, macros }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'This account was registered with Google. Please use Google Sign-In.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Calculate stats
    const bmi = calculateBMI(user.weight || 70, user.height || 175);
    const bmr = calculateBMR(user.weight || 70, user.height || 175, user.age || 25, user.gender || 'male');
    const tdee = calculateTDEE(bmr, user.activityLevel || 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, user.goal || 'maintain');
    const macros = calculateMacros(calorieTarget.calories, user.goal || 'maintain', user.weight || 70);

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetWeight: user.targetWeight,
        profileImage: user.profileImage,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        preferences: user.preferences,
        achievements: user.achievements || []
      },
      stats: { bmi, bmr, tdee, calorieTarget, macros }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign In / Register
// @route   POST /api/auth/google
export const googleAuth = async (req, res, next) => {
  try {
    let { email, name, googleId, profileImage, credential } = req.body;

    // Decode Google ID Token if passed from Google Identity Services
    if (credential) {
      try {
        const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString('utf-8'));
        email = payload.email || email;
        name = payload.name || name;
        googleId = payload.sub || googleId;
        profileImage = payload.picture || profileImage;
      } catch (err) {
        console.warn('Failed to parse Google credential token:', err.message);
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        googleId: googleId || `g_${Date.now()}`,
        profileImage: profileImage || '',
        age: 25,
        gender: 'other',
        height: 175,
        weight: 70,
        activityLevel: 'moderate',
        goal: 'maintain',
        targetWeight: 70
      });
    } else {
      let shouldSave = false;
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }
      if (profileImage && !user.profileImage) {
        user.profileImage = profileImage;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    }

    const bmi = calculateBMI(user.weight || 70, user.height || 175);
    const bmr = calculateBMR(user.weight || 70, user.height || 175, user.age || 25, user.gender || 'other');
    const tdee = calculateTDEE(bmr, user.activityLevel || 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, user.goal || 'maintain');
    const macros = calculateMacros(calorieTarget.calories, user.goal || 'maintain', user.weight || 70);

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetWeight: user.targetWeight,
        profileImage: user.profileImage,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        preferences: user.preferences,
        achievements: user.achievements || []
      },
      stats: { bmi, bmr, tdee, calorieTarget, macros }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const bmi = calculateBMI(user.weight || 70, user.height || 175);
    const bmr = calculateBMR(user.weight || 70, user.height || 175, user.age || 25, user.gender || 'male');
    const tdee = calculateTDEE(bmr, user.activityLevel || 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, user.goal || 'maintain');
    const macros = calculateMacros(calorieTarget.calories, user.goal || 'maintain', user.weight || 70);

    return res.json({
      success: true,
      user,
      stats: { bmi, bmr, tdee, calorieTarget, macros }
    });
  } catch (error) {
    next(error);
  }
};
