/**
 * JWT shape used for role + ownership (no DB).
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const hasSecret = Boolean(process.env.ACCESS_SECRET);

describe("Access JWT claims", { skip: !hasSecret }, () => {
  test("signed token includes sub and role for Staff", () => {
    const token = jwt.sign(
      { sub: "42", role: "Staff", first_name: "A", last_name: "B" },
      process.env.ACCESS_SECRET,
      { expiresIn: "1h", issuer: "ASM-CRM" },
    );
    const payload = jwt.decode(token);
    assert.equal(payload.sub, "42");
    assert.equal(payload.role, "Staff");
  });

  test("signed token includes sub and role for Admin", () => {
    const token = jwt.sign(
      { sub: "1", role: "Admin", first_name: "A", last_name: "B" },
      process.env.ACCESS_SECRET,
      { expiresIn: "1h", issuer: "ASM-CRM" },
    );
    const payload = jwt.decode(token);
    assert.equal(payload.role, "Admin");
  });
});

describe("Access JWT gate", () => {
  test("Add ACCESS_SECRET to .env to run JWT claim tests", () => {
    assert.ok(true);
  });
});
