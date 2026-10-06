import express from 'express';
import { getTodayWater, addGlass, removeGlass } from '../controllers/waterController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/today', getTodayWater);
router.put('/add', addGlass);
router.put('/remove', removeGlass);

export default router;
