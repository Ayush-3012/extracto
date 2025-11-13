import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connect.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Extracto Backend Running ... "));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server is listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb Connection failed: ", err);
  });
