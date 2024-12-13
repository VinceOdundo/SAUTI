const express = require("express");
const router = express.Router();
const { getPublicStats } = require("../controllers/statsController");

// Public routes
router.get("/public", getPublicStats);

module.exports = router;
