/**
 * Badge Definitions for FitFuel Gamification System
 */

const badgeDefinitions = [
  // Streak Badges
  { badgeId: 'streak_3', name: 'Getting Started', description: 'Log meals for 3 consecutive days', icon: '🔥', category: 'streak', requirement: { type: 'streak', target: 3 }, xpReward: 25, rarity: 'common' },
  { badgeId: 'streak_7', name: 'Week Warrior', description: '7-day logging streak', icon: '⚡', category: 'streak', requirement: { type: 'streak', target: 7 }, xpReward: 50, rarity: 'common' },
  { badgeId: 'streak_14', name: 'Two Week Champion', description: '14-day logging streak', icon: '💪', category: 'streak', requirement: { type: 'streak', target: 14 }, xpReward: 100, rarity: 'rare' },
  { badgeId: 'streak_30', name: 'Monthly Master', description: '30-day logging streak', icon: '🏆', category: 'streak', requirement: { type: 'streak', target: 30 }, xpReward: 200, rarity: 'rare' },
  { badgeId: 'streak_60', name: 'Discipline King', description: '60-day logging streak', icon: '👑', category: 'streak', requirement: { type: 'streak', target: 60 }, xpReward: 400, rarity: 'epic' },
  { badgeId: 'streak_100', name: 'Centurion', description: '100-day logging streak', icon: '🏅', category: 'streak', requirement: { type: 'streak', target: 100 }, xpReward: 750, rarity: 'legendary' },
  { badgeId: 'streak_365', name: 'Year of Iron', description: '365-day logging streak', icon: '💎', category: 'streak', requirement: { type: 'streak', target: 365 }, xpReward: 2000, rarity: 'legendary' },

  // Nutrition Badges
  { badgeId: 'meals_1', name: 'First Bite', description: 'Log your first meal', icon: '🍽️', category: 'nutrition', requirement: { type: 'meals', target: 1 }, xpReward: 10, rarity: 'common' },
  { badgeId: 'meals_10', name: 'Regular Tracker', description: 'Log 10 meals', icon: '📝', category: 'nutrition', requirement: { type: 'meals', target: 10 }, xpReward: 30, rarity: 'common' },
  { badgeId: 'meals_50', name: 'Meal Planner', description: 'Log 50 meals', icon: '🥗', category: 'nutrition', requirement: { type: 'meals', target: 50 }, xpReward: 75, rarity: 'rare' },
  { badgeId: 'meals_100', name: 'Nutrition Pro', description: 'Log 100 meals', icon: '🥇', category: 'nutrition', requirement: { type: 'meals', target: 100 }, xpReward: 150, rarity: 'rare' },
  { badgeId: 'meals_500', name: 'Fuel Master', description: 'Log 500 meals', icon: '🌟', category: 'nutrition', requirement: { type: 'meals', target: 500 }, xpReward: 500, rarity: 'epic' },

  // Exercise Badges
  { badgeId: 'exercise_1', name: 'First Rep', description: 'Log your first workout', icon: '🏃', category: 'exercise', requirement: { type: 'exercises', target: 1 }, xpReward: 10, rarity: 'common' },
  { badgeId: 'exercise_10', name: 'Gym Regular', description: 'Log 10 workouts', icon: '💪', category: 'exercise', requirement: { type: 'exercises', target: 10 }, xpReward: 50, rarity: 'common' },
  { badgeId: 'exercise_50', name: 'Iron Addict', description: 'Log 50 workouts', icon: '🏋️', category: 'exercise', requirement: { type: 'exercises', target: 50 }, xpReward: 150, rarity: 'rare' },
  { badgeId: 'exercise_100', name: 'Beast Mode', description: 'Log 100 workouts', icon: '🦁', category: 'exercise', requirement: { type: 'exercises', target: 100 }, xpReward: 300, rarity: 'epic' },

  // Milestone Badges
  { badgeId: 'logs_7', name: 'First Week Done', description: 'Complete 7 daily logs', icon: '📊', category: 'milestone', requirement: { type: 'logs', target: 7 }, xpReward: 30, rarity: 'common' },
  { badgeId: 'logs_30', name: 'Monthly Logger', description: 'Complete 30 daily logs', icon: '📈', category: 'milestone', requirement: { type: 'logs', target: 30 }, xpReward: 100, rarity: 'rare' },
  { badgeId: 'logs_100', name: 'Data Enthusiast', description: 'Complete 100 daily logs', icon: '📉', category: 'milestone', requirement: { type: 'logs', target: 100 }, xpReward: 300, rarity: 'epic' },

  // XP Badges
  { badgeId: 'xp_100', name: 'Rising Star', description: 'Earn 100 XP', icon: '⭐', category: 'milestone', requirement: { type: 'xp', target: 100 }, xpReward: 20, rarity: 'common' },
  { badgeId: 'xp_500', name: 'Level Up', description: 'Earn 500 XP', icon: '🌟', category: 'milestone', requirement: { type: 'xp', target: 500 }, xpReward: 50, rarity: 'rare' },
  { badgeId: 'xp_1500', name: 'Power Player', description: 'Earn 1500 XP', icon: '💫', category: 'milestone', requirement: { type: 'xp', target: 1500 }, xpReward: 100, rarity: 'epic' },
  { badgeId: 'xp_5000', name: 'FitFuel Legend', description: 'Earn 5000 XP', icon: '🏆', category: 'milestone', requirement: { type: 'xp', target: 5000 }, xpReward: 250, rarity: 'legendary' }
];

export default badgeDefinitions;
