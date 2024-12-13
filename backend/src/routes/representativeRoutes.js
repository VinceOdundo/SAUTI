const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerRepresentative,
  verifyRepresentative,
  getRepresentative,
  updateRepresentative,
  followRepresentative,
  unfollowRepresentative,
  getRepresentativeStats,
  getRepresentatives,
  getRepresentativeProfile,
  addReview,
  getInteractions,
  handleCitizenRequest,
  getSchedule,
  updateAvailability,
  scheduleAppointment,
  getPerformanceMetrics
} = require('../controllers/representativeController');

// Public routes
router.get('/', getRepresentatives);
router.get('/:representativeId', getRepresentative);
router.get('/:representativeId/profile', getRepresentativeProfile);
router.get('/:representativeId/stats', getRepresentativeStats);

// Protected routes (requires authentication)
router.use(protect);

// Representative registration and profile
router.post('/', registerRepresentative);
router.put('/:representativeId', authorize('representative'), updateRepresentative);

// Citizen interactions with representatives
router.post('/:representativeId/follow', authorize('citizen'), followRepresentative);
router.delete('/:representativeId/follow', authorize('citizen'), unfollowRepresentative);
router.post('/:representativeId/reviews', authorize('citizen'), addReview);
router.post('/:representativeId/appointments', authorize('citizen'), scheduleAppointment);

// Representative-specific routes
router.get('/:representativeId/interactions', authorize('representative'), getInteractions);
router.put('/:representativeId/interactions/:interactionId', authorize('representative'), handleCitizenRequest);
router.get('/:representativeId/schedule', authorize('representative'), getSchedule);
router.put('/:representativeId/availability', authorize('representative'), updateAvailability);
router.get('/:representativeId/metrics', authorize('representative'), getPerformanceMetrics);

// Admin routes
router.put('/:representativeId/verify', authorize('admin'), verifyRepresentative);

module.exports = router;
