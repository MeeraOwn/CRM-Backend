import mysql from "mysql2/promise";
import logger from "../utilities/logger.js";

let pool;

const initDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
    });

    const conn = await pool.getConnection();
    logger.info("✅ MySQL Connected");
    conn.release();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export { pool };
export default initDB;
