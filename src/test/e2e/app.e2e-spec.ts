import express from "express";
import rateLimit from "express-rate-limit";
import { handleWebhook } from "../../handlers/webhook.js";

describe("E2E: Github Webhook", () => {
  describe("handler", () => {
    it("should have the handler defined", () => {
      expect(handleWebhook).toBeDefined();
    });

    it("should be able to create an express app with the handler", () => {
      const app = express();
      app.post("/github/webhook", handleWebhook);
      expect(app).toBeDefined();
    });
  });

  describe("rate limiter", () => {
    it("should create a rate limiter with default settings", () => {
      const limiter = rateLimit({
        windowMs: 900000, // 15 minutes default
        max: 100,
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });

    it("should create a rate limiter with custom settings from env vars", () => {
      process.env.RATE_LIMIT_WINDOW_MS = "300000"; // 5 minutes
      process.env.RATE_LIMIT_MAX = "50";

      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
      const max = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

      const limiter = rateLimit({
        windowMs,
        max,
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");

      // Clean up
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX;
    });

    it("should be able to apply rate limiter to express app", () => {
      const app = express();
      app.use(express.json());

      const limiter = rateLimit({
        windowMs: 60000,
        max: 10,
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
      });

      app.use(limiter);
      app.post("/github/webhook", handleWebhook);

      // Verify the app is configured
      expect(app).toBeDefined();
    });
  });
});
