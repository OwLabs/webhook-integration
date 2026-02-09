import { jest } from "@jest/globals";
import {
  logEnvironmentStatus,
  logRepoNotMapped,
  logIncomingWebhook,
  logRepositoryDetails,
} from "../../utils/webhook-logger";

// Mock console methods to avoid cluttering test output
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("logEnvironmentStatus", () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  it("should log environment variable status", () => {
    logEnvironmentStatus();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Environment vars loaded:",
      expect.objectContaining({
        AI: expect.any(Boolean),
        CORE: expect.any(Boolean),
        HOMELAND: expect.any(Boolean),
        WEB: expect.any(Boolean),
        INTEGRATION: expect.any(Boolean),
      }),
    );
  });

  it("should reflect actual environment variable presence", () => {
    // Save original value
    const originalCore = process.env.DISCORD_WEBHOOK_CORE;

    process.env.DISCORD_WEBHOOK_AI = "https://discord.com/webhook";
    delete process.env.DISCORD_WEBHOOK_CORE;

    logEnvironmentStatus();

    const loggedData = consoleLogSpy.mock.calls[0][1];
    expect(loggedData.AI).toBe(true);
    expect(loggedData.CORE).toBe(false);

    // Restore original value
    if (originalCore !== undefined) {
      process.env.DISCORD_WEBHOOK_CORE = originalCore;
    }
  });
});

describe("logRepoNotMapped", () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  it("should log repo not mapped error with repo name", () => {
    logRepoNotMapped("test-repo");

    expect(consoleLogSpy).toHaveBeenCalledWith("❌ Repo not mapped or webhook URL not configured");
    expect(consoleLogSpy).toHaveBeenCalledWith("❌ Looking for repo name:", '"test-repo"');
  });

  it("should log repo not mapped error with undefined repo name", () => {
    logRepoNotMapped(undefined);

    expect(consoleLogSpy).toHaveBeenCalledWith("❌ Looking for repo name:", '"undefined"');
  });

  it("should log available mappings", () => {
    logRepoNotMapped("test-repo");

    const calls = consoleLogSpy.mock.calls;
    const availableMappingsCall = calls.find((call) =>
      call[0]?.toString().includes("Available mappings"),
    );

    expect(availableMappingsCall).toBeDefined();
  });
});

describe("logIncomingWebhook", () => {
  const mockPayload = {
    repository: { name: "test-repo" },
    action: "opened",
  };

  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  it("should log webhook separator", () => {
    logIncomingWebhook("pull_request", "pull_request", mockPayload);

    expect(consoleLogSpy).toHaveBeenCalledWith("=== Incoming webhook ===");
  });

  it("should log event header", () => {
    logIncomingWebhook("pull_request", "pull_request", mockPayload);

    expect(consoleLogSpy).toHaveBeenCalledWith("Event header:", "pull_request");
  });

  it("should log parsed event", () => {
    logIncomingWebhook("pull_request", "pull_request", mockPayload);

    expect(consoleLogSpy).toHaveBeenCalledWith("Event:", "pull_request");
  });

  it("should log full payload as JSON", () => {
    logIncomingWebhook("pull_request", "pull_request", mockPayload);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Full payload:",
      JSON.stringify(mockPayload, null, 2),
    );
  });

  it("should handle array event headers", () => {
    logIncomingWebhook(["pull_request", "fallback"], "pull_request", mockPayload);

    expect(consoleLogSpy).toHaveBeenCalledWith("Event header:", ["pull_request", "fallback"]);
  });
});

describe("logRepositoryDetails", () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  it("should log repository name", () => {
    logRepositoryDetails("test-repo", true);

    expect(consoleLogSpy).toHaveBeenCalledWith("Repository name:", "test-repo");
  });

  it("should log webhook URL found status", () => {
    logRepositoryDetails("test-repo", true);

    expect(consoleLogSpy).toHaveBeenCalledWith("Webhook URL found:", true);
  });

  it("should log webhook URL not found", () => {
    logRepositoryDetails("test-repo", false);

    expect(consoleLogSpy).toHaveBeenCalledWith("Webhook URL found:", false);
  });
});
