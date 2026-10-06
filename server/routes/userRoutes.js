import express from 'express';
import { updateProfile, updatePreferences, getUserStats } from '../controllers/userController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);
router.get('/stats', getUserStats);

export default router;
