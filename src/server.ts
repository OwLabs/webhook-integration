import dotenv from "dotenv";

// Load environment variables before importing config
dotenv.config();

import express from "express";
import rateLimit from "express-rate-limit";
import { WEBHOOKS } from "./config";
import { handleWebhook } from "./handlers/webhook";

const app = express();
app.use(express.json());

const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "900000",
  10,
);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const PORT = process.env.PORT || 3000;

// Register routes
app.post("/github/webhook", handleWebhook);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `⚡ Rate limit: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW_MS / 60000} minutes`,
  );
  console.log("Configured webhooks:");
  Object.entries(WEBHOOKS).forEach(([repo, url]) => {
    console.log(`  ${repo}: ${url ? "✓ configured" : "✗ NOT CONFIGURED"}`);
  });
});
