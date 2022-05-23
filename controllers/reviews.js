const ErrorResponse = require("../utils/errorResponse");
const Review = require("../models/Reviews");
const Bootcamp = require("../models/Bootcamps");

//@desc    Get reviews
//@route   GET /api/v1/reviews
//@route   GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public

exports.getReviews = async (req, res, next) => {
  console.log(req.params);
  try {
    if (req.params.bootcampId) {
      const reviews = await Review.find({ bootcamp: req.params.bootcampId });
      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  } catch (error) {
    next(error);
  }
};

//@desc    Get single review
//@route   GET /api/v1/reviews/:id
//@access  Public

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: "bootcamp",
      select: "name description",
    });

    if (!review) {
      return next(
        new ErrorResponse(`No review found with ${req.params.id}`, 400)
      );
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    create review
//@route   POST /api/v1/bootcamps/:bootcampId/reviews
//@access  Private

exports.addReview = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  try {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `no Bootcamp with id of ${req.params.bootcampId}`,
          404
        )
      );
    }

    const review = await Review.create(req.body);

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    update review
//@route   PUT /api/v1/reviews/:id
//@access  Private

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse(`no review of id ${req.params.id}`, 404));
    }
    // make sure revie is blong to user or admin use

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse(`Not authorize to update`, 401));
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Delete review
//@route   DELETE /api/v1/reviews/:id
//@access  Private

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse(`no review of id ${req.params.id}`, 404));
    }
    // make sure revie is blong to user or admin use

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse(`Not authorize to update`, 401));
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
