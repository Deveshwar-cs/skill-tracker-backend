import express from "express";
import noteRoutes from "./routes/noteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import rateLimit from "express-rate-limit";
import {notFound, errorHandler} from "./middleware/errorMiddleware.js";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://skill-tracker-frontend-kxbyaq967-logic-lords.vercel.app",
  "https://skill-tracker-frontend-git-main-logic-lords.vercel.app",
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

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

app.use("/notes", noteRoutes);
app.use("/auth", authRoutes);
app.use("/skills", skillRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
