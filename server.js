import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();
connectDB();

const PORT = 5001;

app.listen(PORT, () => {
  console.log("Server running on port 5001");
});
