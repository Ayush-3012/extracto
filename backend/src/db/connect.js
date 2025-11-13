import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `\n MongoDB connected to ${connectionInstance.connection.name} !! DB HOST: ${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.log("MongoDB connection failed: ", error);
    process.exit(1);
  }
};

export default connectDB;
