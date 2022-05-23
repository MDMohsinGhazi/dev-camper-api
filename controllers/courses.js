const ErrorResponse = require("../utils/errorResponse");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamps");

//@desc    Get all Courses
//@route   GET /api/v1/courses
//@route   GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public

exports.getCourses = async (req, res, next) => {
  try {
    if (req.params.bootcampId) {
      const courses = await Course.find({ bootcamp: req.params.bootcampId });
      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  } catch (error) {
    next(error);
  }
};

//@desc     Get single Course
//@route    GET /api/v1/courses/:id
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public

exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.Id).populate({
      path: "bootcamp",
      select: "name description",
    });
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Post single Course
//@route    POST /api/v1/courses/:id
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private

exports.addCourse = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  try {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `No Bootcamp with the Id of ${req.params.bootcampId}`,
          404
        )
      );
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorize to add a course to bootcamp ${bootcamp.name}`,
          401
        )
      );
    }

    const course = await Course.create(req.body);
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Update single Course
//@route    PUT /api/v1/courses/:id
//@access   Private

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.Id);
    if (!course) {
      return next(
        new ErrorResponse(`No course availible of ${req.params.Id} Id`)
      );
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.Id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorize to update course ${course.name}`,
          401
        )
      );
    }

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Delete single Course
//@route    Delete /api/v1/courses/:id
//@access   Private

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.Id);
    if (!course) {
      return next(
        new ErrorResponse(`No course availible of ${req.params.Id} Id`)
      );
    }

    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorize to update course ${course.name}`,
          401
        )
      );
    }

    await course.remove();
    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
