const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(`\x1b[31m%s\x1b[0m`, "❌ MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
    });

    console.log(
      `\x1b[36m%s\x1b[0m`,
      `✅ MongoDB Connected: ${conn.connection.host}`,
    );

    mongoose.connection.removeAllListeners("error");
    mongoose.connection.removeAllListeners("disconnected");

    mongoose.connection.on("error", (err) => {
      console.error(`\x1b[31m%s\x1b[0m`, `❌ MongoDB Runtime Error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        `\x1b[33m%s\x1b[0m`,
        `⚠️  MongoDB Disconnected. Mongoose will auto-reconnect...`,
      );
    });

    mongoose.connection.on("reconnected", () => {
      console.log(`\x1b[32m%s\x1b[0m`, `✅ MongoDB Reconnected Successfully!`);
    });
  } catch (error) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `❌ Database Connection Failed: ${error.message}`,
    );
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `🔌 MongoDB connection closed (${signal})`,
    );
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m%s\x1b[0m`, `❌ Error closing MongoDB: ${err}`);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = connectDB;
