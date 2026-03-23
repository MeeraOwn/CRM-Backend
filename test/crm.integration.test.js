/**
 * Integration tests for CRM assignment rules (requires MySQL + .env).
 * Default `npm test` skips this suite. Enable with RUN_CRM_INTEGRATION=1.
 */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";

dotenv.config();

import jwt from "jsonwebtoken";
import request from "supertest";

import app from "../src/router.js";
import initDB from "../src/database/init.js";
import { pool } from "../src/database/init.js";

const integrationEnabled = process.env.RUN_CRM_INTEGRATION === "1";

const api = (method, path) => request(app)[method.toLowerCase()](path);

function accessToken(user) {
  return jwt.sign(
    {
      sub: user.sub,
      role: user.role,
      first_name: "Test",
      last_name: "User",
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1h", issuer: "ASM-CRM" },
  );
}

async function cleanupTestData(emailPrefix) {
  const like = `${emailPrefix}%`;
  await pool.query(
    `
    DELETE h FROM history h
    INNER JOIN customers c ON c.id = h.customer_id
    WHERE c.email LIKE ?
    `,
    [like],
  );
  await pool.query(`DELETE FROM customers WHERE email LIKE ?`, [like]);
}

describe("CRM API (integration)", { skip: !integrationEnabled }, () => {
  const emailPrefix = `crmtest_${Date.now()}_`;

  /** @type {string} */
  let adminToken;
  /** @type {string} */
  let staffToken;
  /** @type {string} */
  let staffOtherToken;
  /** @type {number} */
  let customerId;
  /** @type {number} */
  let appointmentHistoryId;
  /** @type {number} */
  let serviceHistoryId;

  before(async () => {
    assert.ok(
      process.env.ACCESS_SECRET,
      "ACCESS_SECRET required for integration tests",
    );
    assert.ok(process.env.DB_HOST, "DB_HOST required for integration tests");
    await initDB();
    // `history.created_by` is numeric in this schema; token.sub must match.
    adminToken = accessToken({ sub: 900001, role: "Admin" });
    staffToken = accessToken({ sub: 900002, role: "Staff" });
    staffOtherToken = accessToken({ sub: 900003, role: "Staff" });

    await cleanupTestData(emailPrefix);

    const custRes = await api("post", "/api/customers")
      .set("x-access-token", adminToken)
      .send({
        first_name: "Integ",
        last_name: "Test",
        email: `${emailPrefix}customer@example.com`,
        phone: "555-0100",
        brokerNumber: "",
        customerTitle: "",
        customerDisplayName: "",
        customerDOB: "1990-01-01",
        customerStreet: "",
        customerHouseNumber: "",
        customerPostalCode: "",
        customerCity: "",
        customerStatus: "",
        description: "",
      });

    assert.equal(custRes.status, 201, `create customer: ${custRes.text}`);
    customerId = custRes.body?.data?.id;
    assert.ok(customerId, "customer id from create");

    const apptRes = await api("post", `/api/customers/${customerId}/history`)
      .set("x-access-token", staffToken)
      .send({
        subject: "Visit",
        art: "appointment",
        description: "Appointment row",
        date: "2099-01-15",
        time: "10:00",
      });
    assert.equal(
      apptRes.status,
      201,
      `create appointment history: ${apptRes.text}`,
    );
    appointmentHistoryId = apptRes.body?.data?.id;
    assert.ok(appointmentHistoryId);

    const svcRes = await api("post", `/api/customers/${customerId}/history`)
      .set("x-access-token", staffToken)
      .send({
        subject: "Oil change",
        art: "service",
        description: "Service only",
        date: "2099-02-01",
        time: "14:00",
      });
    assert.equal(svcRes.status, 201, `create service history: ${svcRes.text}`);
    serviceHistoryId = svcRes.body?.data?.id;
    assert.ok(serviceHistoryId);
  });

  after(async () => {
    try {
      await cleanupTestData(emailPrefix);
    } catch {
      // pool may be uninitialized if before() failed early
    }
    try {
      await pool.end();
    } catch {
      // ignore
    }
  });

  test("GET /api/appointments without token → 403", async () => {
    const res = await api("get", "/api/appointments");
    assert.equal(res.status, 403);
  });

  test("JWT access token includes role and sub (decode)", () => {
    const token = accessToken({ sub: "user-42", role: "Staff" });
    const payload = jwt.decode(token);
    assert.equal(payload.sub, "user-42");
    assert.equal(payload.role, "Staff");
  });

  test("GET /api/appointments merges customers + history, art=appointment only", async () => {
    const res = await api("get", "/api/appointments").set(
      "x-access-token",
      staffToken,
    );
    assert.equal(res.status, 200, res.text);
    const rows = res.body?.data || [];
    const match = rows.find(
      (r) =>
        r.history_id === appointmentHistoryId || r.customer_id === customerId,
    );
    assert.ok(match, "appointment visible in list");
    assert.equal(match.first_name, "Integ");
    assert.equal(match.last_name, "Test");
    assert.ok(match.description);
    const serviceInList = rows.some((r) => r.history_id === serviceHistoryId);
    assert.equal(
      serviceInList,
      false,
      "service history must not appear on appointments list",
    );
  });

  test("Staff POST /api/customers → 403", async () => {
    const res = await api("post", "/api/customers")
      .set("x-access-token", staffToken)
      .send({
        first_name: "X",
        last_name: "Y",
        email: `${emailPrefix}staffblocked@example.com`,
        phone: "1",
      });
    assert.equal(res.status, 403);
  });

  test("POST complete removes from appointments list; record stays in history with completed set", async () => {
    const completeRes = await api(
      "post",
      `/api/history/${appointmentHistoryId}/complete`,
    ).set("x-access-token", staffToken);
    assert.equal(completeRes.status, 200, completeRes.text);

    const listRes = await api("get", "/api/appointments").set(
      "x-access-token",
      staffToken,
    );
    assert.equal(listRes.status, 200);
    const stillThere = (listRes.body?.data || []).some(
      (r) => r.history_id === appointmentHistoryId,
    );
    assert.equal(stillThere, false);

    const histRes = await api(
      "get",
      `/api/customers/${customerId}/history`,
    ).set("x-access-token", staffToken);
    assert.equal(histRes.status, 200);
    const hist = histRes.body?.data || [];
    const row = hist.find((h) => h.id === appointmentHistoryId);
    assert.ok(row, "completed appointment still in history");
    assert.ok(
      row.completed === 1 || row.completed === true,
      "completed flag set",
    );
  });

  test("Staff cannot update history created by another staff (403)", async () => {
    const putRes = await api("put", `/api/history/${serviceHistoryId}`)
      .set("x-access-token", staffOtherToken)
      .send({
        subject: "Hacked",
        art: "service",
        description: "no",
        date: "2099-02-01",
        time: "15:00",
      });
    assert.equal(putRes.status, 403);
  });

  test("Staff cannot delete history created by another staff (403)", async () => {
    const delRes = await api("delete", `/api/history/${serviceHistoryId}`).set(
      "x-access-token",
      staffOtherToken,
    );
    assert.equal(delRes.status, 403);
  });

  test("Creator staff can update own history", async () => {
    const putRes = await api("put", `/api/history/${serviceHistoryId}`)
      .set("x-access-token", staffToken)
      .send({
        subject: "Oil change (updated)",
        art: "service",
        description: "Service only",
        date: "2099-02-01",
        time: "14:30",
      });
    assert.equal(putRes.status, 200, putRes.text);
  });

  test("Admin can update any history", async () => {
    const putRes = await api("put", `/api/history/${serviceHistoryId}`)
      .set("x-access-token", adminToken)
      .send({
        subject: "Admin edit",
        art: "other",
        description: "Admin was here",
        date: "2099-03-01",
        time: "09:00",
      });
    assert.equal(putRes.status, 200, putRes.text);
    assert.equal(putRes.body?.data?.subject, "Admin edit");
  });

  test("GET /api/customers/:id returns customer fields", async () => {
    const res = await api("get", `/api/customers/${customerId}`).set(
      "x-access-token",
      staffToken,
    );
    assert.equal(res.status, 200);
    assert.equal(res.body?.data?.first_name, "Integ");
  });
});

describe("CRM integration gate", () => {
  test("Set RUN_CRM_INTEGRATION=1 to run MySQL-backed API tests", () => {
    assert.ok(true);
  });
});
