const path = require("path");
const Bootcamp = require("../models/Bootcamps");
const errorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
// const advancedResults = require("../middleware/advancedResult");

//@desc    Get all Bootcamps
//@router  GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    next(error);
  }
};

//@desc    Get single Bootcamps
//@router  GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(error);
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc    Create Bootcamps
//@router  POST /api/v1/bootcamps
//@access  Public
exports.createBootcamp = async (req, res, next) => {
  try {
    // Add user to body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin , can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") {
      return next(
        new errorResponse(
          `The user with Id ${req.user.id} has already published a bootcamp`,
          400
        )
      );
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Create Bootcamps
//@router  PUT /api/v1/bootcamps/id
//@access   Public
exports.updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(error);
    }
    // Make sur user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new errorResponse(`user ${req.user.id} is not authorize`));
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc    Create Bootcamps
//@router  DELETE /api/v1/bootcamps/id
//@access   Public
exports.deteteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(error);
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new errorResponse(`user ${req.user.id} is not authorize`));
    }
    bootcamp.remove();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bootcamps within Radious
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Get lat/log from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calculate radious using radions
  //Divided dist by radious of earth
  // Earth Radius = 6,371 km or 3,963 miles
  const radions = distance / 6371;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radions] } },
  });
  res.status(200).json({
    success: true,
    totalResult: bootcamps.length,
    data: bootcamps,
  });
};

//@desc    Upload photo for  Bootcamps
//@router  put /api/v1/bootcamps/:id/photo
//@access   private
exports.bootcampPhotoUpload = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(error);
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new errorResponse(`user ${req.user.id} is not authorize`));
    }

    if (!req.files) {
      return next(new errorResponse(`Please upload a file`, 400));
    }
    const file = req.files.file;

    //Make sure the file a photo
    if (!file.mimetype.startsWith("image")) {
      return next(new errorResponse(`Plese upload a image file`, 400));
    }
    if (file.size > 1000000) {
      return next(new errorResponse(`Plese upload a imge less than 1 mb`, 400));
    }
    // create file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(`./public/photo/${file.name}`, async (err) => {
      if (err) {
        console.log(err);
        return next(new errorResponse(`Problem with file upload`, 500));
      }
      await Bootcamp.findByIdAndUpdate(req.param.id, { photo: file.name });
      res.status(200).json({
        success: true,
        data: file.name,
      });
    });
  } catch (error) {
    next(error);
  }
};
