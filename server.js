const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

//Load env vars
dotenv.config({ path: "config/config.env" });

//connect to database
connectDB();

//Route Files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

//Middleware
const logger = require("./middleware/logger");
// const req = require("express/lib/request");

const app = express();
// Body Parser
app.use(express.json());
//Cookie Parser
app.use(cookieParser());
// File Uploading
app.use(fileupload());

//momgoose sanitize
app.use(mongoSanitize());

// set security header
app.use(helmet());

// prevent XSS attecks
app.use(xss());
// static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// handele unhandeled promise rejection
process.on("unhandledRejection", (err, Promise) => {
  console.log("Error", err.message);

  server.close(() => process.exit(1));
});
