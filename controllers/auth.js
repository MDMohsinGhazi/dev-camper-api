const crypto = require("crypto");
const User = require("../models/User");
const sendMail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");

// @desc     Register user
// @router   POST /api/auth/register
// @access   Public
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    // send res
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc     Login user
// @router   POST /api/auth/register
// @access   Public

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Validate email and password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password ", 400)
      );
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid cradentials", 401));
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid cradentials", 401));
    }
    // Create token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc     Logout  / clear cookie
// @router   GET /api/v1/auth/me
// @access   Private

exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc     Get ciurrent logged in user
// @router   POST /api/v1/auth/me
// @access   Private

exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc     Forget password
// @router   POST /api/v1/auth/forgotPassword
// @access   public

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("user name not found", 404));
  }

  // Get reset token
  const resetToken = await user.getResetPasswordToken();
  await user.save({
    validateBeforeSave: false,
  });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `yoy got this mail as you reset password. make a put request to: \n\n ${resetUrl}`;
  try {
    await sendMail({
      email: user.email,
      subject: "Passwrd reset",
      text: message,
    });
    res.status(200).json({
      success: true,
      data: "message has sent",
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("reset mail could not be sent", 500));
  }
};

// @desc     Reset Password
// @router   PUT /api/v1/auth/resetPassword/:resetToken
// @access   Public

exports.resetPassword = async (req, res, next) => {
  try {
    //Get hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      next(new ErrorResponse("Invalid token", 400));
    }

    // set passwod
    user.password = req.body.password;
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};

// @desc     Get ciurrent logged in user
// @router   POST /api/v1/auth/me
// @access   Private

exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

// @desc    Update password
// @router   POST /api/v1/auth/updatepassword
// @access   Private

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    // check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("password is incirrect", 401));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(new ErrorResponse(error.message, 401));
  }
};

// Get token from model and create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
