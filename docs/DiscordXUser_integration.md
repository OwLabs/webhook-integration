# Discord x GitHub User Integration

This document explains how to configure GitHub to Discord user mention mappings for automatic PR notifications.

## Overview

When someone interacts with a pull request, relevant users can be automatically pinged on Discord.

**Who gets mentioned:**
- **PR Author** - When someone else acts on their PR (reviews, comments, etc.)
- **Requested Reviewer** - When someone requests them to review a PR

This enables instant feedback loops so:
- PR authors know when someone reviews, comments, or requests changes
- Reviewers know when someone requests them to review

**Supported:** All PR-related events (reviews, comments, status changes, etc.)

## How It Works

1. GitHub sends a webhook event for any PR-related activity
2. The server checks:
   - If the sender is different from the PR author → mention PR author
   - If a reviewer was requested → mention requested reviewer
3. If mapped users exist, pings are sent via Discord webhook `content` field

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

| Scenario | Who gets mentioned |
|----------|-------------------|
| Someone else approves your PR | PR author |
| Someone requests changes | PR author |
| Someone comments on your PR | PR author |
| You request someone to review | Requested reviewer |
| Someone else requests review | Requested reviewer + PR author |
| You take any action on your PR | No one |
| Unmapped GitHub user | No one |

## Example Scenarios

### Scenario 1: Review Requested

**GitHub Event:**
- PR Author: `alexdev`
- Sender: `alexdev`
- Requested Reviewer: `sarahcode`
- Action: `review_requested`

**Discord Message:**
```
@sarahcode
┌─────────────────────────────┐
│ 👀 Review requested         │
│ ...                         │
└─────────────────────────────┘
```

### Scenario 2: Approved PR

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

### Scenario 3: Someone Else Requests Review on Your PR

**GitHub Event:**
- PR Author: `alexdev`
- Sender: `mike`
- Requested Reviewer: `sarahcode`
- Action: `review_requested`

**Discord Message:**
```
@sarahcode @alexdev
┌─────────────────────────────┐
│ 👀 Review requested         │
│ ...                         │
└─────────────────────────────┘
```

### Scenario 4: Self-Action

**GitHub Event:**
- PR Author: `alexdev`
- Actor: `alexdev`
- Action: Any (comment, review, etc.)

**Discord Message:**
```
┌─────────────────────────────┐
│ 💬 Review comment           │
│ ...                         │
└─────────────────────────────┘
```
(No ping - actor is the author)

### Scenario 5: Unmapped User

**GitHub Event:**
- PR Author: `new-dev`
- Reviewer: `sarahcode`
- Action: Comment

**Discord Message:**
```
┌─────────────────────────────┐
│ 💬 New comment              │
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
   - `🔔 Will ping PR author/reviewer: xxx -> <@...>`
   - `🔔 Final mentions: <@...> <@...>`

### Pings Going to Wrong User

1. Double-check the Discord ID matches the intended user
2. Verify the GitHub username spelling is correct

### Seeing the Embed But No Ping

1. Check if it's a self-action (same user)
2. Confirm the GitHub usernames are in the ENV variables
3. Check logs for warning messages

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
- **Handler:** `src/handlers/webhook.ts` (PR mention logic)
- **ENV Example:** `.env.example`
