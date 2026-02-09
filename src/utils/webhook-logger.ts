import { WEBHOOKS } from "../config";

export function logEnvironmentStatus(): void {
  console.log("Environment vars loaded:", {
    AI: !!process.env.DISCORD_WEBHOOK_AI,
    CORE: !!process.env.DISCORD_WEBHOOK_CORE,
    HOMELAND: !!process.env.DISCORD_WEBHOOK_HOMELAND,
    WEB: !!process.env.DISCORD_WEBHOOK_WEB,
    INTEGRATION: !!process.env.DISCORD_WEBHOOK_INTEGRATION,
  });
}

export function logRepoNotMapped(repoName: string | undefined): void {
  console.log("❌ Repo not mapped or webhook URL not configured");
  console.log("❌ Looking for repo name:", `"${repoName}"`);
  console.log(
    "❌ Available mappings:",
    Object.entries(WEBHOOKS).map(
      ([k, v]) => `${k}: ${v ? "configured" : "MISSING"}`,
    ),
  );
}

/**
 * Log incoming webhook details.
 *
 * @param eventHeader - The raw X-GitHub-Event header value
 * @param event - The parsed event name
 * @param payload - The full webhook payload
 */
export function logIncomingWebhook(
  eventHeader: string | string[] | undefined,
  event: string | undefined,
  payload: unknown,
): void {
  console.log("=== Incoming webhook ===");
  console.log("Event header:", eventHeader);
  console.log("Event:", event);
  console.log("Full payload:", JSON.stringify(payload, null, 2));
}

/**
 * Log repository details for a webhook.
 *
 * @param repoName - The repository name
 * @param webhookUrlFound - Whether a webhook URL was found
 */
export function logRepositoryDetails(
  repoName: string | undefined,
  webhookUrlFound: boolean,
): void {
  console.log("Repository name:", repoName);
  console.log("Available repo keys:", Object.keys(WEBHOOKS));
  console.log("Webhook URL found:", webhookUrlFound);
}
