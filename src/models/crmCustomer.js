import { pool } from "../database/init.js";

const crmCustomer = {
  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT id, first_name, last_name, \`customerId\`, email, phone, created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0];
  },

  async create(data) {
    const {
      first_name,
      last_name,
      customerId,
      email,
      phone,
      brokerNumber,
      customerTitle,
      customerDisplayName,
      customerDOB,
      customerStreet,
      customerHouseNumber,
      customerPostalCode,
      customerCity,
      customerStatus,
      description,
    } = data;
    const [result] = await pool.query(
      `
      INSERT INTO customers (
        first_name,
        last_name,
        \`customerId\`,
        email,
        phone,
        brokerNumber,
        customerTitle,
        customerDisplayName,
        customerDOB,
        customerStreet,
        customerHouseNumber,
        customerPostalCode,
        customerCity,
        customerStatus,
        description,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        first_name,
        last_name,
        customerId,
        email,
        phone,
        brokerNumber ?? "",
        customerTitle ?? "",
        customerDisplayName ?? "",
        customerDOB || "1990-01-01",
        customerStreet ?? "",
        customerHouseNumber ?? "",
        customerPostalCode ?? "",
        customerCity ?? "",
        customerStatus ?? "",
        description ?? "",
      ],
    );

    return {
      id: result.insertId,
      first_name,
      last_name,
      customerId,
      email,
      phone,
    };
  },
};

export default crmCustomer;
