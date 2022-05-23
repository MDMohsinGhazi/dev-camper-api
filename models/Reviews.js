const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Plese add Title for the review"],
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Plese give rating between 1-10"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  console.log("calculating... avg rating");

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};

//Call getAverage cost after sava

ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverage cost before remove

ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
