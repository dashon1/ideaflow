import assert from "node:assert/strict";
import crypto from "node:crypto";
import express from "express";
import session from "express-session";
import { db, pool } from "../server/db";
import { storage } from "../server/storage";
import { users, creditTransactions, settings } from "../shared/schema";
import { eq } from "drizzle-orm";
import { getOrCreateCsrfToken, verifyCsrf } from "../server/csrf";

// Regression checks use an isolated session server and one disposable DB user.
const app = express();
app.use(session({ secret: crypto.randomBytes(32).toString("hex"), resave: false, saveUninitialized: false }));
app.get("/token", (req, res) => res.json({ token: getOrCreateCsrfToken(req) }));
app.post("/mutation", verifyCsrf, (_req, res) => res.json({ ok: true }));
const server = app.listen(0, "127.0.0.1");
await new Promise<void>(resolve => server.once("listening", resolve));
const address = server.address();
assert(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;
const userId = `regression-${crypto.randomUUID()}`;
try {
  const tokenResponse = await fetch(`${base}/token`);
  const { token } = await tokenResponse.json() as { token: string };
  const cookie = tokenResponse.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await fetch(`${base}/mutation`, { method: "POST", headers: { Cookie: cookie } })).status, 403);
  assert.equal((await fetch(`${base}/mutation`, { method: "POST", headers: { Cookie: cookie, "X-CSRF-Token": "wrong" } })).status, 403);
  assert.equal((await fetch(`${base}/mutation`, { method: "POST", headers: { Cookie: cookie, "X-CSRF-Token": token } })).status, 200);
  console.log("PASS: CSRF accepts the session token and rejects missing/wrong tokens");

  await db.insert(users).values({ id: userId, creditsBalance: 100 });
  const deductions = await Promise.all([
    storage.deductCredits(userId, 60, "Regression deduction"),
    storage.deductCredits(userId, 60, "Regression deduction"),
  ]);
  assert.equal(deductions.filter(Boolean).length, 1);
  assert.equal((await storage.getUserCredits(userId)).balance, 40);
  await Promise.all([
    storage.addCredits(userId, 10, "Regression addition"),
    storage.addCredits(userId, 20, "Regression addition"),
  ]);
  assert.equal((await storage.getUserCredits(userId)).balance, 70);
  assert.equal((await storage.getCreditTransactions(userId)).length, 3);
  await assert.rejects(storage.deductCredits(userId, -5, "Invalid"));
  await assert.rejects(storage.addCredits(userId, 0.5, "Invalid"));
  console.log("PASS: concurrent credit operations, transaction records, and amount validation");

  await storage.setSetting({ userId, settingKey: "regression", settingValue: "first" });
  await storage.setSetting({ userId, settingKey: "regression", settingValue: "second" });
  assert.equal((await storage.getSetting(userId, "regression"))?.settingValue, "second");
  console.log("PASS: settings update without duplicate records");
} finally {
  await db.delete(settings).where(eq(settings.userId, userId));
  await db.delete(creditTransactions).where(eq(creditTransactions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  await pool.end();
}
