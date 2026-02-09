const ENV_PREFIX = "DISCORD_USER_";

/**
 * @returns Record mapping GitHub usernames (lowercase) to Discord user IDs
 */

function buildUserMap(): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(ENV_PREFIX) && value) {
      // Extract GitHub username from DISCORD_USER_<USERNAME>
      // Convert to lowercase for case-insensitive matching
      const githubUsername = key.slice(ENV_PREFIX.length).toLowerCase();
      mapping[githubUsername] = value;
    }
  }

  return mapping;
}

/**
 * Populated from environment variables with format:
 * DISCORD_USER_<GITHUB_USERNAME>=<discord_user_id>
 */

export const GITHUB_TO_DISCORD: Record<string, string> = buildUserMap();
