import { pool } from "../database/init.js";

// Assumes a `users` table for staff/admin auth:
// users: id, first_name, last_name, email, password, role
const User = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      `
      SELECT id, first_name, last_name, email, password, role
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );
    return rows[0];
  },
};

export default User;
