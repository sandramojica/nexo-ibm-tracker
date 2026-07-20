// ─────────────────────────────────────────────────────────────────
//  src/routes/subscriptions.js  –  Stub route for smoke-test
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  res.status(201).json({ message: "Subscription saved (stub)." });
});

router.delete("/", (req, res) => {
  res.json({ message: "Subscription removed (stub)." });
});

export default router;
