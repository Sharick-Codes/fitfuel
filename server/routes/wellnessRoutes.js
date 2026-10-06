import express from 'express';
import { logSleep, getSleepHistory, logSupplements, getTodaySupplements, startFasting, endFasting, getActiveFasting, getHealthScore, getNutrientAlerts } from '../controllers/wellnessController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Sleep
router.post('/sleep', logSleep);
router.get('/sleep/history', getSleepHistory);

// Supplements
router.post('/supplements', logSupplements);
router.get('/supplements/today', getTodaySupplements);

// Fasting
router.post('/fasting/start', startFasting);
router.put('/fasting/end', endFasting);
router.get('/fasting/active', getActiveFasting);

// Health Score & Alerts
router.get('/health-score', getHealthScore);
router.get('/alerts', getNutrientAlerts);

export default router;
