import Photo from '../models/Photo.js';

// @desc    Upload progress photo
// @route   POST /api/photos
export const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo' });
    }

    const photo = await Photo.create({
      userId: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      bodyPart: req.body.bodyPart || 'front',
      weight: req.body.weight || req.user.weight,
      notes: req.body.notes || ''
    });

    res.status(201).json({ success: true, photo });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all photos
// @route   GET /api/photos
export const getPhotos = async (req, res, next) => {
  try {
    const { bodyPart } = req.query;
    const query = { userId: req.user.id };
    if (bodyPart) query.bodyPart = bodyPart;

    const photos = await Photo.find(query).sort({ date: -1 });
    res.json({ success: true, photos });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comparison photos (first vs latest)
// @route   GET /api/photos/compare
export const getComparisonPhotos = async (req, res, next) => {
  try {
    const { bodyPart = 'front' } = req.query;

    const oldest = await Photo.findOne({ userId: req.user.id, bodyPart }).sort({ date: 1 });
    const latest = await Photo.findOne({ userId: req.user.id, bodyPart }).sort({ date: -1 });

    res.json({
      success: true,
      comparison: {
        before: oldest,
        after: latest,
        daysBetween: oldest && latest ? Math.floor((new Date(latest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
export const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    next(error);
  }
};
