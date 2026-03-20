import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import errorHandler from "./utilities/exception.js";
import helmet from "helmet";
import logger from "./utilities/logger.js";
import { default as auth } from "./routes/auth.js";
import { default as crm } from "./routes/crm.js";

const app = express();
dayjs.extend(utc);
dayjs.extend(timezone);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  logger.info(`health.ctrl.invoked.id.${req.id}`);
  res.send("Server Up!");
});

app.use("/api", auth);
app.use("/api", crm);

app.use(errorHandler);

export default app;
