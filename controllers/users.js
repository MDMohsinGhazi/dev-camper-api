const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

// @desc     Get all users
// @router   GET /api/auth/users
// @access   Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    next(error);
  }
};

// @desc     Get single user
// @router   GET /api/auth/user
// @access   Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Create user
// @router   POST /api/auth/users
// @access   Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Update user
// @router   PUT /api/auth/user/:id
// @access   Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Delete user
// @router   DELETE /api/auth/user/:id
// @access   Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
