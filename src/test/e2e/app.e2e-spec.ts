import express from "express";
import { handleWebhook } from "../../handlers/webhook";

describe("E2E: Github Webhook", () => {
  it("should have the handler defined", () => {
    expect(handleWebhook).toBeDefined();
  });

  it("should be able to create an express app with the handler", () => {
    const app = express();
    app.post("/github/webhook", handleWebhook);
    expect(app).toBeDefined();
  });
});
