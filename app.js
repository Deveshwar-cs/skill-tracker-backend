import express from "express";
import noteRoutes from "./routes/noteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import {notFound, errorHandler} from "./middleware/errorMiddleware.js";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://skill-tracker-frontend-kxbyaq967-logic-lords.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
