/**
 * Repository to Discord webhook URL mappings.
 *
 * Maps GitHub repository names to their corresponding Discord webhook URLs.
 * Each repository's webhook URL is configured via environment variables.
 *
 * Environment Variables:
 * - DISCORD_WEBHOOK_AI - Webhook URL for ng-ai repository
 * - DISCORD_WEBHOOK_CORE - Webhook URL for ng-core repository
 * - DISCORD_WEBHOOK_HOMELAND - Webhook URL for ng-homeland repository
 * - DISCORD_WEBHOOK_WEB - Webhook URL for ng-web repository
 * - DISCORD_WEBHOOK_INTEGRATION - Webhook URL for webhook-integration repository
 */
export const WEBHOOKS: Record<string, string | undefined> = {
  "ng-ai": process.env.DISCORD_WEBHOOK_AI,
  "ng-core": process.env.DISCORD_WEBHOOK_CORE,
  "ng-homeland": process.env.DISCORD_WEBHOOK_HOMELAND,
  "ng-web": process.env.DISCORD_WEBHOOK_WEB,
  "webhook-integration": process.env.DISCORD_WEBHOOK_INTEGRATION,
};
