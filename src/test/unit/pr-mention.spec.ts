import { describe, expect } from "@jest/globals";
import {
  isPREvent,
  extractPRMentionInfo,
  getUsersToMention,
  PRMentionInfo,
} from "../../utils/pr-mention";
import {
  PullRequestPayload,
  ReviewPayload,
  IssueCommentPayload,
  ReviewCommentPayload,
} from "../../types/github";

describe("isPREvent", () => {
  describe("returns true for PR events", () => {
    it("should identify pull_request events", () => {
      const payload = {} as PullRequestPayload;
      expect(isPREvent("pull_request", payload)).toBe(true);
    });

    it("should identify pull_request_review events", () => {
      const payload = {} as ReviewPayload;
      expect(isPREvent("pull_request_review", payload)).toBe(true);
    });

    it("should identify pull_request_review_comment events", () => {
      const payload = {} as ReviewCommentPayload;
      expect(isPREvent("pull_request_review_comment", payload)).toBe(true);
    });

    it("should identify issue_comment events that have pull_request field", () => {
      const payload = {
        issue: {
          pull_request: {
            html_url: "https://github.com/test/repo/pull/1",
            diff_url: "https://github.com/test/repo/pull/1.diff",
          },
        },
      } as IssueCommentPayload;
      expect(isPREvent("issue_comment", payload)).toBe(true);
    });
  });

  describe("returns false for non-PR events", () => {
    it("should return false for issue_comment without pull_request field", () => {
      const payload = {
        issue: {
          pull_request: undefined,
        },
      } as IssueCommentPayload;
      expect(isPREvent("issue_comment", payload)).toBe(false);
    });

    it("should return false for push events", () => {
      expect(isPREvent("push", {} as never)).toBe(false);
    });

    it("should return false for issues events", () => {
      expect(isPREvent("issues", {} as never)).toBe(false);
    });
  });
});

describe("extractPRMentionInfo", () => {
  describe("pull_request events", () => {
    it("should extract PR author, sender, and requested reviewer", () => {
      const payload: PullRequestPayload = {
        action: "review_requested",
        repository: { name: "test-repo" },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/test/repo/pull/1",
          user: { login: "pr-author" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        requested_reviewer: { login: "reviewer" },
        sender: { login: "sender" },
      };

      const result = extractPRMentionInfo("pull_request", payload);

      expect(result.prAuthor).toBe("pr-author");
      expect(result.sender).toBe("sender");
      expect(result.requestedReviewer).toBe("reviewer");
    });

    it("should handle missing optional fields", () => {
      const payload: PullRequestPayload = {
        action: "opened",
        repository: { name: "test-repo" },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/test/repo/pull/1",
          user: { login: "pr-author" },
          base: { ref: "main" },
          head: { ref: "feature" },
          merged: false,
        },
        sender: { login: "sender" },
      };

      const result = extractPRMentionInfo("pull_request", payload);

      expect(result.prAuthor).toBe("pr-author");
      expect(result.sender).toBe("sender");
      expect(result.requestedReviewer).toBeUndefined();
    });
  });

  describe("pull_request_review events", () => {
    it("should extract PR author and reviewer", () => {
      const payload: ReviewPayload = {
        action: "submitted",
        repository: { name: "test-repo" },
        review: {
          state: "approved",
          body: "LGTM",
          html_url: "https://github.com/test/repo/pull/1",
          user: { login: "reviewer" },
          pull_request_url: "https://api.github.com/repos/test/repo/pulls/1",
        },
        pull_request: {
          title: "Test PR",
          html_url: "https://github.com/test/repo/pull/1",
          number: 1,
          user: { login: "pr-author" },
        },
        sender: { login: "reviewer" },
      };

      const result = extractPRMentionInfo("pull_request_review", payload);

      expect(result.prAuthor).toBe("pr-author");
      expect(result.sender).toBe("reviewer");
      expect(result.requestedReviewer).toBeUndefined();
    });
  });

  describe("issue_comment events on PRs", () => {
    it("should extract PR author and commenter for PR comments", () => {
      const payload: IssueCommentPayload = {
        action: "created",
        repository: { name: "test-repo" },
        comment: {
          body: "Great work!",
          html_url: "https://github.com/test/repo/pull/1#issuecomment-1",
          user: { login: "commenter" },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        issue: {
          number: 1,
          title: "Test PR",
          html_url: "https://github.com/test/repo/pull/1",
          user: { login: "pr-author" },
          pull_request: {
            html_url: "https://github.com/test/repo/pull/1",
            diff_url: "https://github.com/test/repo/pull/1.diff",
          },
        },
        sender: { login: "commenter" },
      };

      const result = extractPRMentionInfo("issue_comment", payload);

      expect(result.prAuthor).toBe("pr-author");
      expect(result.sender).toBe("commenter");
    });
  });

  describe("unknown events", () => {
    it("should return empty info for unknown event types", () => {
      const result = extractPRMentionInfo("unknown_event", {} as never);

      expect(result.prAuthor).toBeUndefined();
      expect(result.sender).toBeUndefined();
      expect(result.requestedReviewer).toBeUndefined();
    });
  });
});

describe("getUsersToMention", () => {
  describe("PR author mentions", () => {
    it("should include PR author when sender is different", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "someone-else",
      };

      const result = getUsersToMention(info);

      expect(result).toContain("pr-author");
    });

    it("should not include PR author when sender is the same", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "pr-author",
      };

      const result = getUsersToMention(info);

      expect(result).not.toContain("pr-author");
    });

    it("should not include PR author when info is missing", () => {
      const info: PRMentionInfo = {
        sender: "someone-else",
      };

      const result = getUsersToMention(info);

      expect(result).not.toContain("pr-author");
    });
  });

  describe("requested reviewer mentions", () => {
    it("should always include requested reviewer when present", () => {
      const info: PRMentionInfo = {
        requestedReviewer: "reviewer",
        sender: "pr-author",
      };

      const result = getUsersToMention(info);

      expect(result).toContain("reviewer");
    });

    it("should not include reviewer when not present", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "someone-else",
      };

      const result = getUsersToMention(info);

      expect(result).not.toContain("reviewer");
    });
  });

  describe("combined scenarios", () => {
    it("should include both PR author and reviewer when applicable", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "someone-else",
        requestedReviewer: "reviewer",
      };

      const result = getUsersToMention(info);

      expect(result).toEqual(["pr-author", "reviewer"]);
    });

    it("should include only reviewer when PR author is the sender", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "pr-author",
        requestedReviewer: "reviewer",
      };

      const result = getUsersToMention(info);

      expect(result).toEqual(["reviewer"]);
    });

    it("should include only PR author when no reviewer requested", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "someone-else",
      };

      const result = getUsersToMention(info);

      expect(result).toEqual(["pr-author"]);
    });

    it("should return empty array when no one should be mentioned", () => {
      const info: PRMentionInfo = {
        prAuthor: "pr-author",
        sender: "pr-author",
      };

      const result = getUsersToMention(info);

      expect(result).toEqual([]);
    });
  });
});
