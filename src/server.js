const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");
const logger = require("./config/logger");
// const socketio = require("socket.io");

dotenv.config({ path: path.join(__dirname, "../.env") });

let server;

// Determine the environment and set the appropriate database URL
const isUat = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";


let dbUrl;

if (isUat) {
  dbUrl = process.env.MONGO_URI_UAT;
} else if (isProd) {
  dbUrl = process.env.MONGO_URI_PROD;
} else {
  throw new Error(
    "Unknown environment. Please set NODE_ENV to 'uat' or 'production'."
  );
}
// Connect to MongoDB
mongoose
  .connect(dbUrl, { compressors: ["snappy"] })
  .then(() => {
    logger.info("Connected to MongoDB");
    const server = app.listen(process.env.PORT, () => {
      console.log(`Listening to port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with failure
  });
