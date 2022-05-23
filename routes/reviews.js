const express = require("express");
const Reviews = require("../models/Reviews");

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const advancedResult = require("../middleware/advancedResult");

router
  .route("/")
  .get(
    advancedResult(Reviews, {
      path: "bootcamp",
      Select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .delete(protect, authorize("user", "admin"), deleteReview)
  .put(protect, authorize("user", "admin"), updateReview);

module.exports = router;
