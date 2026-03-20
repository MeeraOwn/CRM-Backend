import { pool } from "../database/init.js";

// history table (assignment):
// history: id, customer_id, subject, art, description, date, time,
//          created_by, created_at, completed (optional boolean)
const historyModel = {
  // Your assignment schema might name these columns differently
  // (e.g., `date`/`time` vs `date_val`/`time_val`).
  async _resolveDateTimeColumns() {
    if (historyModel._resolvedDateTimeColumns) {
      return historyModel._resolvedDateTimeColumns;
    }

    const schema = process.env.DB_NAME;

    const [dateRows] = await pool.query(
      `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'history'
        AND COLUMN_NAME IN ('date', 'date_val')
      `,
      [schema],
    );

    const [timeRows] = await pool.query(
      `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'history'
        AND COLUMN_NAME IN ('time', 'time_val')
      `,
      [schema],
    );

    const dateCol = dateRows.some((r) => r.COLUMN_NAME === "date")
      ? "date"
      : dateRows.some((r) => r.COLUMN_NAME === "date_val")
        ? "date_val"
        : null;

    const timeCol = timeRows.some((r) => r.COLUMN_NAME === "time")
      ? "time"
      : timeRows.some((r) => r.COLUMN_NAME === "time_val")
        ? "time_val"
        : null;

    if (!dateCol || !timeCol) {
      throw new Error(
        `history table missing expected date/time columns. Found date: ${dateRows
          .map((r) => r.COLUMN_NAME)
          .join(",")}; time: ${timeRows.map((r) => r.COLUMN_NAME).join(",")}`,
      );
    }

    historyModel._resolvedDateTimeColumns = { dateCol, timeCol };
    return historyModel._resolvedDateTimeColumns;
  },

  _qIdent(name) {
    // Identifier names are selected from a fixed set in _resolveDateTimeColumns.
    // Support qualified identifiers like `h.date_val`.
    return name
      .split(".")
      .map((part) => `\`${part}\``)
      .join(".");
  },

  async listAppointments() {
    const { dateCol, timeCol } = await historyModel._resolveDateTimeColumns();

    const [rows] = await pool.query(
      `
      SELECT
        h.id AS history_id,
        h.customer_id,
        c.first_name,
        c.last_name,
        ${historyModel._qIdent(`h.${dateCol}`)} AS date,
        ${historyModel._qIdent(`h.${timeCol}`)} AS time,
        h.description
      FROM history h
      INNER JOIN customers c ON c.id = h.customer_id
      WHERE h.art = 'appointment'
        AND COALESCE(h.completed, 0) = 0
      ORDER BY ${historyModel._qIdent(`h.${dateCol}`)} ASC, ${historyModel._qIdent(`h.${timeCol}`)} ASC
      `,
    );
    return rows;
  },

  async completeAppointment(historyId) {
    const [result] = await pool.query(
      `
      UPDATE history
      SET completed = 1
      WHERE id = ?
        AND art = 'appointment'
      `,
      [historyId],
    );
    return result?.affectedRows > 0;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM history
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0];
  },

  async listByCustomerId(customerId) {
    const { dateCol, timeCol } = await historyModel._resolveDateTimeColumns();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        customer_id,
        subject,
        art,
        description,
        ${historyModel._qIdent(dateCol)} AS date,
        ${historyModel._qIdent(timeCol)} AS time,
        created_by,
        created_at,
        completed
      FROM history
      WHERE customer_id = ?
      ORDER BY ${historyModel._qIdent(dateCol)} ASC, ${historyModel._qIdent(timeCol)} ASC
      `,
      [customerId],
    );
    return rows;
  },

  async createForCustomer({
    customer_id,
    subject,
    art,
    description,
    date,
    time,
    created_by,
  }) {
    const { dateCol, timeCol } = await historyModel._resolveDateTimeColumns();

    const [result] = await pool.query(
      `
      INSERT INTO history
        (customer_id, subject, art, description, ${historyModel._qIdent(dateCol)}, ${historyModel._qIdent(timeCol)}, created_by, created_at, completed)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, NOW(), 0)
      `,
      [customer_id, subject, art, description, date, time, created_by],
    );

    return this.findById(result.insertId);
  },

  async updateById(id, { subject, art, description, date, time }) {
    const { dateCol, timeCol } = await historyModel._resolveDateTimeColumns();

    await pool.query(
      `
      UPDATE history
      SET subject = ?,
          art = ?,
          description = ?,
          ${historyModel._qIdent(dateCol)} = ?,
          ${historyModel._qIdent(timeCol)} = ?
      WHERE id = ?
      `,
      [subject, art, description, date, time, id],
    );
    return this.findById(id);
  },

  async deleteById(id) {
    await pool.query(`DELETE FROM history WHERE id = ?`, [id]);
    return true;
  },
};

export default historyModel;
