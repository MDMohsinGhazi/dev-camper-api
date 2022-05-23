const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
} = require("../controllers/users");

const advancedResults = require("../middleware/advancedResult");
const { protect, authorize } = require("../middleware/auth");
const Users = require("../models/User");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(Users), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
