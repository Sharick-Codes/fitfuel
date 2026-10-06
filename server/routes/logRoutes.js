import express from 'express';
import { createLog, getTodayLog, getLogs, getStats, getHeatmap } from '../controllers/logController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', createLog);
router.get('/today', getTodayLog);
router.get('/stats', getStats);
router.get('/heatmap', getHeatmap);
router.get('/', getLogs);

export default router;
