import { jest } from "@jest/globals";
import type { Request, Response } from "express";

// Set up environment for webhooks BEFORE any module imports
process.env.DISCORD_WEBHOOK_INTEGRATION = "https://discord.com/api/webhooks/test";
process.env.DISCORD_USER_FROSTER01 = "620058726069567503";
process.env.DISCORD_USER_CHAAD98 = "335363734446931968";

// Mock axios to prevent actual Discord webhook calls
jest.mock("axios");
import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console to reduce test noise
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Now import the handler after env vars are set
import { handleWebhook } from "../../handlers/webhook.js";

describe("E2E: PR Mentions Integration", () => {
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockSendStatus: jest.Mock;

  afterAll(() => {
    delete process.env.DISCORD_WEBHOOK_INTEGRATION;
    delete process.env.DISCORD_USER_FROSTER01;
    delete process.env.DISCORD_USER_CHAAD98;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: { success: true } });

    // Mock response object methods
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn().mockReturnThis();
    mockSendStatus = jest.fn().mockReturnThis();
  });

  function createMockRequest(payload: unknown, event: string): Request {
    return {
      headers: { "x-github-event": event },
      body: payload,
    } as unknown as Request;
  }

  function createMockResponse(): Response {
    return {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
      sendStatus: mockSendStatus,
    } as unknown as Response;
  }

  describe("pull_request events", () => {
    it("should mention requested reviewer when PR author requests review", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "review_requested",
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        requested_reviewer: { login: "chaad98" },
        sender: { login: "froster01" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request"), createMockResponse());

      // Verify Discord webhook was called
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: "<@335363734446931968>",
          embeds: expect.any(Array),
        }),
      );
    });

    it("should mention both PR author and reviewer when someone else requests review", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "review_requested",
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        requested_reviewer: { login: "chaad98" },
        sender: { login: "third-party" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request"), createMockResponse());

      // Verify Discord webhook was called with mentions
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: expect.stringContaining("<@335363734446931968>"),
        }),
      );
    });

    it("should mention PR author when PR is ready for review by someone else", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "ready_for_review",
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        sender: { login: "chaad98" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: "<@620058726069567503>",
        }),
      );
    });

    it("should not mention when PR author marks their own PR as ready", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "ready_for_review",
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        sender: { login: "froster01" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request"), createMockResponse());

      // Verify content is undefined (no mentions)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: undefined,
        }),
      );
    });
  });

  describe("pull_request_review events", () => {
    it("should mention PR author when someone else approves", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "submitted",
        review: {
          state: "approved",
          body: "LGTM!",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "chaad98" },
          pull_request_url: "https://api.github.com/repos/OwLabs/webhook-integration/pulls/4",
        },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          number: 4,
          user: { login: "froster01" },
        },
        sender: { login: "chaad98" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request_review"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: "<@620058726069567503>",
        }),
      );
    });

    it("should mention PR author when changes are requested", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "submitted",
        review: {
          state: "changes_requested",
          body: "Please fix this",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "chaad98" },
          pull_request_url: "https://api.github.com/repos/OwLabs/webhook-integration/pulls/4",
        },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          number: 4,
          user: { login: "froster01" },
        },
        sender: { login: "chaad98" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request_review"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: "<@620058726069567503>",
        }),
      );
    });

    it("should not mention when PR author reviews their own PR", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "submitted",
        review: {
          state: "approved",
          body: "Self-approval",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          pull_request_url: "https://api.github.com/repos/OwLabs/webhook-integration/pulls/4",
        },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          number: 4,
          user: { login: "froster01" },
        },
        sender: { login: "froster01" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request_review"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: undefined,
        }),
      );
    });
  });

  describe("issue_comment events on PRs", () => {
    it("should mention PR author when someone comments", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "created",
        comment: {
          body: "Great work!",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4#issuecomment-1",
          user: { login: "chaad98" },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        issue: {
          number: 4,
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          pull_request: {
            html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
            diff_url: "https://github.com/OwLabs/webhook-integration/pull/4.diff",
          },
        },
        sender: { login: "chaad98" },
      };

      await handleWebhook(createMockRequest(payload, "issue_comment"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: "<@620058726069567503>",
        }),
      );
    });

    it("should not mention when PR author comments on their own PR", async () => {
      const payload = {
        repository: { name: "webhook-integration" },
        action: "created",
        comment: {
          body: "Self-comment",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4#issuecomment-1",
          user: { login: "froster01" },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        issue: {
          number: 4,
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          pull_request: {
            html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
            diff_url: "https://github.com/OwLabs/webhook-integration/pull/4.diff",
          },
        },
        sender: { login: "froster01" },
      };

      await handleWebhook(createMockRequest(payload, "issue_comment"), createMockResponse());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://discord.com/api/webhooks/test",
        expect.objectContaining({
          content: undefined,
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle Discord webhook failure gracefully", async () => {
      mockedAxios.post.mockRejectedValue(new Error("Network error"));

      const payload = {
        repository: { name: "webhook-integration" },
        action: "review_requested",
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/OwLabs/webhook-integration/pull/4",
          user: { login: "froster01" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        requested_reviewer: { login: "chaad98" },
        sender: { login: "froster01" },
      };

      await handleWebhook(createMockRequest(payload, "pull_request"), createMockResponse());

      // Should still send 200 response to GitHub
      expect(mockSendStatus).toHaveBeenCalledWith(200);
      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
