import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import app from "./router.js";

import logger from "./utilities/logger.js";
import gracefulShutDown from "./utilities/shutdown.js";
import initDB from "./database/init.js";

const port = process.env.PORT;

const startServer = async () => {
  await initDB(); // ⭐ DB connect first

  app.listen(port, () => {
    logger.info(`<-- Server Listening on ${port} -->`);
    logger.info(`<-- Server Timezone : ${dayjs.tz.guess()} -->`);
  });
};

startServer();

process.on("SIGINT", () => {
  gracefulShutDown();
  process.exit(0);
});
