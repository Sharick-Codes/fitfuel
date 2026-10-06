import express from 'express';
import { uploadPhoto, getPhotos, getComparisonPhotos, deletePhoto } from '../controllers/photoController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.post('/', upload.single('photo'), uploadPhoto);
router.get('/', getPhotos);
router.get('/compare', getComparisonPhotos);
router.delete('/:id', deletePhoto);

export default router;
