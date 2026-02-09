import { GITHUB_TO_DISCORD } from "../config/user-map";

/**
 * Generate a Discord mention string for a GitHub user.
 * The lookup is case-insensitive for GitHub usernames.
 */
export function mentionGithubUser(githubUsername?: string): string | null {
  if (!githubUsername) {
    return null;
  }

  const discordId = GITHUB_TO_DISCORD[githubUsername.toLowerCase()];
  return discordId ? `<@${discordId}>` : null;
}

/**
 * Generate Discord mentions for multiple GitHub users.
 * Filters out any users that don't have a mapping.
 */

export function mentionGithubUsers(githubUsernames: string[]): string[] {
  const mentions: string[] = [];

  for (const username of githubUsernames) {
    const mention = mentionGithubUser(username);
    if (mention) {
      mentions.push(mention);
    }
  }

  return mentions;
}
