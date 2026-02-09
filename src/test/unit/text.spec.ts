import { truncateText } from "../../utils/text";

describe("truncateText", () => {
  it("should not truncate text if it is shorter than maxLength", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("should truncate text if it is longer than maxLength", () => {
    expect(truncateText("hello world", 5)).toBe("he...");
  });

  it("should return the original text if length is equal tso maxLength", () => {
    expect(truncateText("hello", 5)).toBe("hello");
  });
});
