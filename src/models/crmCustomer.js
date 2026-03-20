import { pool } from "../database/init.js";

// CRM customers table (assignment):
// customers: id, first_name, last_name, email, phone, created_at
const crmCustomer = {
  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT id, first_name, last_name, email, phone, created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0];
  },

  async create(data) {
    const { first_name, last_name, email, phone } = data;
    const [result] = await pool.query(
      `
      INSERT INTO customers (first_name, last_name, email, phone, created_at)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [first_name, last_name, email, phone],
    );

    // If your table uses AUTO_INCREMENT id, MySQL2 returns insertId.
    return {
      id: result.insertId,
      first_name,
      last_name,
      email,
      phone,
    };
  },
};

export default crmCustomer;
