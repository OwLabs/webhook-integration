# GitHub Webhook to Discord

A Node.js + TypeScript server that receives GitHub webhook events and forwards them to Discord channels using embeds.

## Features

- **Multi-repository support** - Route different repos to different Discord channels
- **Event filtering** - Only processes relevant events (issues, PRs, reviews, push)
- **Clean Discord embeds** - Short, readable messages with consistent colors
- **All branch support** - Push events work on any branch
- **Modular architecture** - Well-organized codebase for easy maintenance
- **Rate limiting** - Built-in protection against DoS attacks (100 req/15min by default)
- **PR mentions** - Auto-mention PR authors and reviewers on Discord

## Supported Events

| Event | Actions Handled |
|-------|----------------|
| `issues` | opened, closed, reopened |
| `pull_request` | opened, closed, merged, reopened, review_requested, ready_for_review, converted_to_draft, auto_merge_enabled, auto_merge_disabled |
| `pull_request_review` | approved, changes_requested, commented |
| `pull_request_review_comment` | created |
| `issue_comment` | created |
| `push` | all branches (tags ignored) |

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=4001
DISCORD_WEBHOOK_AI=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_CORE=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_HOMELAND=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_WEB=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_INTEGRATION=https://discord.com/api/webhooks/...
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DISCORD_WEBHOOK_*` | Discord webhook URLs for each repo | - |
| `DISCORD_USER_*` | GitHub username to Discord user ID mappings | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per time window per IP | `100` |

### Verifying Configuration

When the server starts, it will display the webhook configuration status and rate limit settings:

```
🚀 Server running on port 4001
⚡ Rate limit: 100 requests per 15 minutes
Configured webhooks:
  ng-ai: ✓ configured
  ng-core: ✓ configured
  ng-homeland: ✓ configured
  ng-web: ✓ configured
```

If any show as `✗ NOT CONFIGURED`, check that the corresponding environment variable is set in your `.env` file.

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### With PM2 (recommended)

```bash
npm run build
pm2 start dist/server.js --name github-webhook
pm2 save
pm2 startup
```

### Restart with PM2

```bash
pm2 restart github-webhook
```

### View Logs

```bash
pm2 logs github-webhook
```

## Project Structure

```
src/
├── server.ts                 # Main entry point - Express app setup
├── config/
│   ├── index.ts             # Export all config
│   ├── webhooks.ts          # Webhook URL mappings
│   └── colors.ts            # Color constants
├── types/
│   ├── github.ts            # GitHub webhook payload types
│   └── discord.ts           # Discord embed types
├── embeds/
│   ├── index.ts             # Main embed router (buildEmbed function)
│   ├── pull-request.ts      # PR embed builders
│   ├── issue.ts             # Issue embed builders
│   ├── review.ts            # Review embed builders
│   └── push.ts              # Push embed builders
├── utils/
│   └── text.ts              # Text utility functions
└── handlers/
    └── webhook.ts           # Main webhook POST handler
```

### Module Overview

- **server.ts** - Express application setup, route registration, and server startup
- **config/** - Configuration values including webhook URLs and color constants
- **types/** - TypeScript type definitions for GitHub and Discord data structures
- **embeds/** - Embed builder functions for each GitHub event type
- **utils/** - Shared utility functions (text formatting, etc.)
- **handlers/** - Request handlers for webhook endpoints

## GitHub Webhook Setup

1. Go to repository **Settings** → **Webhooks**
2. Click **Add webhook**
3. Set **Payload URL** to: `http://your-server:4001/github/webhook`
4. Set **Content type** to: `application/json`
5. Select events: Issues, Pull requests, Pull request reviews, Pushes
6. Click **Add webhook**

**All repositories use the same webhook URL.** The server routes based on repository name.

## Repository Mapping

| Repository | Environment Variable |
|------------|---------------------|
| `ng-ai` | `DISCORD_WEBHOOK_AI` |
| `ng-core` | `DISCORD_WEBHOOK_CORE` |
| `ng-homeland` | `DISCORD_WEBHOOK_HOMELAND` |
| `ng-web` | `DISCORD_WEBHOOK_WEB` |
| `webhook-integration` | `DISCORD_WEBHOOK_INTEGRATION` |

## PR Mentions

When someone interacts with a pull request, relevant users can be automatically pinged on Discord.

**Who gets mentioned:**
- **PR Author** - When someone else acts on their PR (reviews, comments, etc.)
- **Requested Reviewer** - When someone requests them to review a PR

**Supported events:** All PR-related events (reviews, comments, status changes, etc.)

### Setup

Add **GitHub username → Discord User ID** mappings in your `.env` file:

```env
# Format: DISCORD_USER_<GITHUB_USERNAME>=<DISCORD_USER_ID>
DISCORD_USER_ALEXDEV=111122223333444455
DISCORD_USER_SARAHCODE=666677778888999000
```

**Important:** This maps GitHub usernames to Discord **User IDs** (not Discord usernames).

| What | Example | Where to find it |
|------|---------|------------------|
| GitHub Username | `alexdev` | Your GitHub profile |
| Discord Username | `Alex#1234` | Discord display name (not used) |
| Discord User ID | `111122223333444455` | Discord Developer Mode → Copy User ID |

### How to Get Discord User ID

1. Enable **Developer Mode** in Discord (User Settings → Advanced)
2. Right-click on the user
3. Select **Copy User ID** (18-19 digit number)

### Behavior

| Scenario | Who gets mentioned |
|----------|-------------------|
| Someone approves your PR | PR author |
| Someone requests changes | PR author |
| Someone comments on your PR | PR author |
| You request someone to review | Requested reviewer |
| Someone else requests review | Requested reviewer + PR author |
| Self-action (any event) | No one |
| Unmapped GitHub user | No one |

## Rate Limiting

The server includes built-in rate limiting to prevent abuse and DoS attacks. By default, it allows **100 requests per 15 minutes per IP address**.

### Default Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Window | 15 minutes | Time window for rate limiting |
| Max requests | 100 | Maximum requests allowed per window |

### Customization

You can customize rate limiting by adding environment variables to your `.env` file:

```env
# Rate limiting (optional)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX=100            # Max requests per window
```

### Behavior

When a client exceeds the rate limit:
- Request is blocked with `429 Too Many Requests` status
- Response includes rate limit headers:
  - `RateLimit-Limit`: Max requests per window
  - `RateLimit-Remaining`: Remaining requests in current window
  - `RateLimit-Reset`: Unix timestamp when window resets

### Examples

Different rate limit scenarios:

```env
# Strict (10 requests per minute)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=10

# Relaxed (500 requests per hour)
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=500

# Disabled for testing (extremely high limit)
RATE_LIMIT_WINDOW_MS=1000
RATE_LIMIT_MAX=1000000
```

## Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `0x57F287` | Opened / Success |
| Red | `0xED4245` | Closed / Failed |
| Yellow | `0xFEE75C` | Reviews / Pending |
| Blue | `0x3498DB` | Push events / Comments |
| Purple | `0x9B59B6` | Merged PRs |
| Gray | `0x95A5A6` | Fallback |

## Troubleshooting

### No Discord message received

1. **Check logs:**
   ```bash
   pm2 logs github-webhook
   ```
   Look for `❌ Repo not mapped` or `❌ Failed to send webhook`

2. **Verify webhook URL in .env:**
   - Ensure the correct `DISCORD_WEBHOOK_*` variable is set
   - Test URL in browser (should show JSON with webhook info)

3. **Check GitHub webhook delivery:**
   - Go to repo Settings → Webhooks → Click your webhook
   - Scroll to "Recent Deliveries"
   - Check response status (should be `200 OK`)

4. **Verify repository name:**
   - Debug log shows "Repository name: xyz"
   - Ensure it matches keys: `ng-ai`, `ng-core`, `ng-homeland`, `ng-web`

5. **Test with ping:**
   ```bash
   curl -X POST http://localhost:4001/github/webhook \
     -H "Content-Type: application/json" \
     -H "X-GitHub-Event: ping"
   ```
   Should return `pong`
