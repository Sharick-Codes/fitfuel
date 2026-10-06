import express from 'express';
import { getBadges, getLevel, getStreak, getLeaderboard, checkAchievements } from '../controllers/gamificationController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/badges', getBadges);
router.get('/level', getLevel);
router.get('/streak', getStreak);
router.get('/leaderboard', getLeaderboard);
router.post('/check', checkAchievements);

export default router;
