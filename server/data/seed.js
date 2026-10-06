import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from '../models/Food.js';
import Achievement from '../models/Achievement.js';
import foodDatabase from './foodDatabase.js';
import badgeDefinitions from './badgeDefinitions.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Food.deleteMany({});
    await Achievement.deleteMany({});
    console.log('🗑️  Cleared existing food and badge data');

    // Seed foods
    const foods = await Food.insertMany(foodDatabase);
    console.log(`🍽️  Seeded ${foods.length} foods`);

    // Seed badges
    const badges = await Achievement.insertMany(badgeDefinitions);
    console.log(`🏆 Seeded ${badges.length} achievement badges`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
