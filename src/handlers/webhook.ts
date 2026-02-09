import { Request, Response } from "express";
import axios from "axios";
import { WEBHOOKS } from "../config";
import { buildEmbed } from "../embeds";
import { GitHubPayload } from "../types/github";
import { mentionGithubUser, mentionGithubUsers } from "../utils/mention";
import { isPREvent, extractPRMentionInfo, getUsersToMention } from "../utils/pr-mention";
import {
  logIncomingWebhook,
  logRepositoryDetails,
  logEnvironmentStatus,
  logRepoNotMapped,
} from "../utils/webhook-logger";

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const eventHeader = req.headers["x-github-event"];
  const event =
    typeof eventHeader === "string"
      ? eventHeader
      : Array.isArray(eventHeader)
        ? eventHeader[0]
        : undefined;
  const payload = req.body as GitHubPayload;

  // Log incoming webhook for debugging
  logIncomingWebhook(eventHeader, event, payload);

  // Handle GitHub ping/pong verification
  if (event === "ping") {
    console.log("🏓 Ping received, responding with pong");
    res.send("pong");
    return;
  }

  // Validate event header exists
  if (!event) {
    console.log("❌ No event header found");
    res.sendStatus(400);
    return;
  }

  // Get repository and find matching webhook
  const repoName: string | undefined = payload?.repository?.name;
  logRepositoryDetails(repoName, false);

  const webhookUrl = repoName ? WEBHOOKS[repoName] : undefined;
  console.log("Webhook URL found:", !!webhookUrl);

  if (!webhookUrl) {
    logEnvironmentStatus();
    logRepoNotMapped(repoName);
    res.status(200).send("Repo not mapped");
    return;
  }

  // Build Discord embed for the event
  const embed = buildEmbed(event, payload);
  console.log("Embed built:", !!embed);

  if (!embed) {
    console.log("⚠️ No embed returned (event ignored)");
    res.sendStatus(200);
    return;
  }

  // Determine mentions for PR-related events
  let mention: string | null = null;
  if (isPREvent(event, payload)) {
    mention = handlePRMentions(event, payload);
  }

  // Send to Discord
  await sendToDiscord(webhookUrl, repoName, mention, embed);

  res.sendStatus(200);
}

/**
 * Handle Discord mentions for PR-related events.
 *
 * @param event - The GitHub webhook event name
 * @param payload - The webhook payload data
 * @returns Discord mention string or null if no mentions needed
 */
function handlePRMentions(event: string, payload: GitHubPayload): string | null {
  const mentionInfo = extractPRMentionInfo(event, payload);
  const usersToMention = getUsersToMention(mentionInfo);

  if (usersToMention.length === 0) {
    console.log("ℹ️ No mentions to send (self-action or unmapped)");
    return null;
  }

  // Generate Discord mentions and log any unmapped users
  const mentions = mentionGithubUsers(usersToMention);
  logMentionResults(usersToMention, mentions);

  return mentions.length > 0 ? mentions.join(" ") : null;
}

/**
 * Log which users were successfully mapped to Discord mentions.
 *
 * @param usernames - GitHub usernames that were attempted to mention
 * @param mentions - Discord mentions that were successfully generated
 */
function logMentionResults(usernames: string[], mentions: string[]): void {
  for (const username of usernames) {
    const isMapped = mentions.some((m) => m === `<@${username}>`) ||
                     mentions.some((m) => m.includes(username)); // This check is imperfect but matches original behavior
    if (!isMapped) {
      console.log(`⚠️ No Discord mapping found for GitHub user: ${username}`);
    } else {
      const mention = mentionGithubUser(username);
      console.log(`🔔 Will ping: ${username} -> ${mention}`);
    }
  }

  if (mentions.length > 0) {
    console.log(`🔔 Final mentions: ${mentions.join(" ")}`);
  }
}

/**
 * Send webhook payload to Discord.
 *
 * @param webhookUrl - The Discord webhook URL
 * @param repoName - The repository name (for error logging)
 * @param mention - Optional Discord mention string
 * @param embed - The Discord embed to send
 */
async function sendToDiscord(
  webhookUrl: string,
  repoName: string | undefined,
  mention: string | null,
  embed: unknown,
): Promise<void> {
  try {
    console.log("📤 Sending to Discord...", mention ? `(with mention: ${mention})` : "(embed only)");
    await axios.post(webhookUrl, {
      content: mention ?? undefined,
      embeds: [embed],
    });
    console.log("✅ Successfully sent to Discord");
  } catch (error) {
    console.error(`❌ Failed to send webhook for ${repoName}:`, error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
  }
}
