import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import User from './models/User.js';
import Goal from './models/Goal.js';
import DailyLog from './models/DailyLog.js';
import Food from './models/Food.js';
import Achievement from './models/Achievement.js';
import foodDatabase from './data/foodDatabase.js';
import badgeDefinitions from './data/badgeDefinitions.js';

// Route imports
import { securityMonitor } from './middleware/securityMonitor.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import logRoutes from './routes/logRoutes.js';
import waterRoutes from './routes/waterRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';

// Config
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityMonitor());

// Static files (for uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🏋️ FitFuel API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production or if client/dist exists (single-service deployment)
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server and DB
const startServer = async () => {
  const isMemory = await connectDB();
  
  console.log('🌱 Synchronizing food database & badge definitions...');
  // Upsert all recipes to ensure latest verified YouTube video links and metadata
  await Food.deleteMany({ isCustom: { $ne: true } });
  await Food.insertMany(foodDatabase);
  console.log(`✅ Recipes database updated with ${foodDatabase.length} recipes & verified YouTube videos!`);

  const badgeCount = await Achievement.countDocuments();
  if (badgeCount === 0) {
    await Achievement.insertMany(badgeDefinitions);
    console.log('✅ Badges initialized!');
  }

  // Ensure default demo athlete account is always ready for 1-click login
  try {
    const demoExists = await User.findOne({ email: 'demo@fitfuel.com' });
    if (!demoExists) {
      console.log('👤 Seeding default demo athlete user...');
      const demoUser = await User.create({
        name: 'Demo Athlete',
        email: 'demo@fitfuel.com',
        password: 'password123',
        age: 26,
        gender: 'male',
        height: 175,
        weight: 72,
        activityLevel: 'moderate',
        goal: 'lose',
        targetWeight: 68,
        level: 'intermediate',
        xp: 350,
        streak: { current: 5, longest: 7 }
      });

      await Goal.create({
        userId: demoUser._id,
        goalType: 'weightLoss',
        currentWeight: 72,
        targetWeight: 68,
        dailyCalorieTarget: 1950,
        dailyProteinTarget: 145,
        dailyCarbsTarget: 190,
        dailyFatsTarget: 55,
        trainingDayCalories: 2150,
        restDayCalories: 1750,
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      });

      await DailyLog.create({
        userId: demoUser._id,
        date: new Date(),
        weight: 72,
        waterIntake: 6,
        caloriesConsumed: 1450,
        caloriesBurned: 350,
        netCalories: 1100,
        mood: 'good',
        healthScore: 82,
        notes: 'Hit high-protein targets and completed morning workout.'
      });

      console.log('✅ Demo user seeded: demo@fitfuel.com / password123');
    }
  } catch (err) {
    console.error('Error seeding demo athlete:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n🏋️  FitFuel Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();

export default app;
