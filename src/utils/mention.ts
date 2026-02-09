import { GITHUB_TO_DISCORD } from "../config/user-map";

/**
 * Generate a Discord mention string for a GitHub user
 * @param githubUsername - The GitHub username to look up (case-insensitive)
 * @returns Discord mention string (<@userId>) or null if no mapping exists
 */
export function mentionGithubUser(githubUsername?: string): string | null {
  if (!githubUsername) return null;

  // Use lowercase for case-insensitive matching
  const discordId = GITHUB_TO_DISCORD[githubUsername.toLowerCase()];
  return discordId ? `<@${discordId}>` : null;
}
