function buildUserMap(): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("DISCORD_USER_") && value) {
      // Extract GitHub username from DISCORD_USER_<USERNAME>
      const githubUsername = key.slice("DISCORD_USER_".length).toLowerCase();
      mapping[githubUsername] = value;
    }
  }

  return mapping;
}

export const GITHUB_TO_DISCORD: Record<string, string> = buildUserMap();
