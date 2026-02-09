# Discord x GitHub User Integration

This document explains how to configure GitHub to Discord user mention mappings for automatic PR author notifications.

## Overview

When someone reviews a pull request, the system can automatically ping the PR author on Discord. This enables instant feedback loops so PR authors know immediately when:

- Someone approves their PR
- Someone requests changes on their PR

## How It Works

1. GitHub sends a `pull_request_review` webhook event
2. The server checks if the reviewer is different from the PR author
3. If the review state is `approved` or `changes_requested`, a ping is sent
4. The ping uses Discord user IDs via the webhook `content` field (not inside embeds)

## Configuration

### Step 1: Get Discord User IDs

For each GitHub user you want to map:

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **Developer Mode**
4. Right-click on the user → **Copy User ID**

### Step 2: Add Environment Variables

Add mappings to your `.env` file:

```env
# Format: DISCORD_USER_<GITHUB_USERNAME>=<discord_user_id>
DISCORD_USER_ALEXDEV=111122223333444455
DISCORD_USER_SARAHCODE=666677778888999000
```

**Format:**
- **Prefix:** `DISCORD_USER_`
- **GitHub username:** Case-insensitive (uppercase or lowercase works)
- **Value:** Discord user ID (18-19 digit number)

### Step 3: Rebuild and Restart

```bash
npm run build
pm2 restart github-webhook
```

## Behavior Matrix

| Scenario | Discord Message |
|----------|-----------------|
| Someone else approves your PR | Embed + `@YourDiscordName` ping |
| Someone requests changes | Embed + `@YourDiscordName` ping |
| You review your own PR | Embed only (no ping) |
| Comment-only review | Embed only (no ping) |
| Unmapped GitHub user | Embed only (warning logged) |

## Example Scenarios

### Scenario 1: Approved PR

**GitHub Event:**
- PR Author: `alexdev`
- Reviewer: `sarahcode`
- Review State: `approved`

**Discord Message:**
```
@alexdev
┌─────────────────────────────┐
│ ✅ Review approved          │
│ ...                         │
└─────────────────────────────┘
```

### Scenario 2: Self-Review

**GitHub Event:**
- PR Author: `alexdev`
- Reviewer: `alexdev`
- Review State: `approved`

**Discord Message:**
```
┌─────────────────────────────┐
│ ✅ Review approved          │
│ ...                         │
└─────────────────────────────┘
```
(No ping - reviewer is the author)

### Scenario 3: Unmapped User

**GitHub Event:**
- PR Author: `new-dev`
- Reviewer: `sarahcode`
- Review State: `changes_requested`

**Discord Message:**
```
┌─────────────────────────────┐
│ 🔄 Changes requested        │
│ ...                         │
└─────────────────────────────┘
```
(No ping - `new-dev` not in mapping)

**Server Log:**
```
⚠️ No Discord mapping found for GitHub user: new-dev
```

## Troubleshooting

### Pings Not Working

1. **Check ENV variable format:**
   - Must start with `DISCORD_USER_`
   - GitHub username is case-insensitive
   - Discord ID should be a valid 18-19 digit number

2. **Verify Discord ID is correct:**
   - Enable Developer Mode in Discord
   - Right-click user → Copy User ID
   - Should be 18-19 digits

3. **Check server logs:**
   ```bash
   pm2 logs github-webhook
   ```
   Look for:
   - `⚠️ No Discord mapping found for GitHub user: xxx`
   - `🔔 Pinging PR author: xxx -> <@...>`

### Pings Going to Wrong User

1. Double-check the Discord ID matches the intended user
2. Verify the GitHub username spelling is correct

### Seeing the Embed But No Ping

1. Check if it's a self-review (same user)
2. Verify the review state is `approved` or `changes_requested`
3. Confirm the GitHub username is in the ENV variables
4. Check logs for warning messages

## Security Considerations

- User mappings are stored in **environment variables** - not in code
- No Discord credentials are stored
- No personal data is transmitted beyond Discord user IDs
- GitHub usernames are case-insensitive for easier configuration

## Future Enhancements

Potential improvements (not currently implemented):

- Database-backed dynamic account linking
- Discord slash command for self-registration
- Automatic role-based notifications
- Per-repository user mappings

## File Reference

- **Config:** `src/config/user-map.ts` (reads from ENV)
- **Helper:** `src/utils/mention.ts` (case-insensitive matching)
- **Handler:** `src/handlers/webhook.ts` (lines 73-95)
- **ENV Example:** `.env.example`
