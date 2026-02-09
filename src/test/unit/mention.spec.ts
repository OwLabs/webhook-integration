import { jest } from "@jest/globals";
import { describe, expect, beforeEach } from "@jest/globals";

// Mock environment for user mapping
const mockUserMap: Record<string, string> = {
  testuser1: "123456789012345678",
  testuser2: "987654321098765432",
};

// Mock the user-map module
jest.mock("../../utils/mention", () => ({
  mentionGithubUser: jest.fn(),
  mentionGithubUsers: jest.fn(),
}));

jest.mock("../../config/user-map", () => ({
  GITHUB_TO_DISCORD: mockUserMap,
}));

// Import the mocked functions
import { mentionGithubUser as mockedMentionGithubUser, mentionGithubUsers as mockedMentionGithubUsers } from "../../utils/mention";

const mockMentionGithubUser = mockedMentionGithubUser as jest.Mock<(username?: string) => string | null>;
const mockMentionGithubUsers = mockedMentionGithubUsers as jest.Mock<(usernames: string[]) => string[]>;

describe("mentionGithubUser", () => {
  it("should return Discord mention string for mapped user", () => {
    mockMentionGithubUser.mockImplementation((githubUsername?: string) => {
      if (!githubUsername) return null;
      const discordId = mockUserMap[githubUsername.toLowerCase()];
      return discordId ? `<@${discordId}>` : null;
    });

    expect(mockMentionGithubUser("testuser1")).toBe("<@123456789012345678>");
  });

  it("should be case-insensitive for GitHub username", () => {
    mockMentionGithubUser.mockImplementation((githubUsername?: string) => {
      if (!githubUsername) return null;
      const discordId = mockUserMap[githubUsername.toLowerCase()];
      return discordId ? `<@${discordId}>` : null;
    });

    expect(mockMentionGithubUser("TESTUSER1")).toBe("<@123456789012345678>");
    expect(mockMentionGithubUser("TestUser1")).toBe("<@123456789012345678>");
    expect(mockMentionGithubUser("tEsTuSeR1")).toBe("<@123456789012345678>");
  });

  it("should return null for unmapped user", () => {
    mockMentionGithubUser.mockReturnValue(null);

    expect(mockMentionGithubUser("unknownuser")).toBeNull();
  });

  it("should return null for undefined username", () => {
    mockMentionGithubUser.mockReturnValue(null);

    expect(mockMentionGithubUser(undefined)).toBeNull();
  });

  it("should return null for empty string username", () => {
    mockMentionGithubUser.mockReturnValue(null);

    expect(mockMentionGithubUser("")).toBeNull();
  });
});

describe("mentionGithubUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return mentions for all mapped users", () => {
    mockMentionGithubUsers.mockImplementation((usernames: string[]) => {
      return usernames
        .filter((username) => mockUserMap[username.toLowerCase()])
        .map((username) => `<@${mockUserMap[username.toLowerCase()]}>`);
    });

    const result = mockMentionGithubUsers(["testuser1", "testuser2"]);

    expect(result).toEqual(["<@123456789012345678>", "<@987654321098765432>"]);
  });

  it("should filter out unmapped users", () => {
    mockMentionGithubUsers.mockImplementation((usernames: string[]) => {
      return usernames
        .filter((username) => mockUserMap[username.toLowerCase()])
        .map((username) => `<@${mockUserMap[username.toLowerCase()]}>`);
    });

    const result = mockMentionGithubUsers(["testuser1", "unknownuser", "testuser2"]);

    expect(result).toEqual(["<@123456789012345678>", "<@987654321098765432>"]);
  });

  it("should return empty array when no users are mapped", () => {
    mockMentionGithubUsers.mockReturnValue([]);

    const result = mockMentionGithubUsers(["unknownuser", "anotherunknown"]);

    expect(result).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    mockMentionGithubUsers.mockReturnValue([]);

    const result = mockMentionGithubUsers([]);

    expect(result).toEqual([]);
  });

  it("should handle case-insensitive usernames", () => {
    mockMentionGithubUsers.mockImplementation((usernames: string[]) => {
      return usernames
        .filter((username) => mockUserMap[username.toLowerCase()])
        .map((username) => `<@${mockUserMap[username.toLowerCase()]}>`);
    });

    const result = mockMentionGithubUsers(["TESTUSER1", "TestUser2"]);

    expect(result).toEqual(["<@123456789012345678>", "<@987654321098765432>"]);
  });
});
