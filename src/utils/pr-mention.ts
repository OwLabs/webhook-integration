import {
  GitHubPayload,
  ReviewPayload,
  PullRequestPayload,
  IssueCommentPayload,
  ReviewCommentPayload,
} from "../types/github";

/**
 * Result of extracting PR-related users from a webhook payload.
 */
export interface PRMentionInfo {
  prAuthor?: string;
  sender?: string;
  requestedReviewer?: string;
}

/**
 * Check if a webhook event is related to a pull request.
 *
 * @param eventName - The GitHub webhook event name
 * @param eventData - The webhook payload data
 * @returns true if this is a PR-related event
 */
export function isPREvent(
  eventName: string,
  eventData: GitHubPayload,
): boolean {
  const prEvents = [
    "pull_request",
    "pull_request_review",
    "pull_request_review_comment",
  ];

  if (prEvents.includes(eventName)) {
    return true;
  }

  if (eventName === "issue_comment") {
    return !!(eventData as IssueCommentPayload).issue?.pull_request;
  }

  return false;
}

/**
 * Extract PR author, sender, and requested reviewer information from a webhook payload.
 *
 * @param eventName - The GitHub webhook event name
 * @param eventData - The webhook payload data
 * @returns Object containing extracted user information
 */
export function extractPRMentionInfo(
  eventName: string,
  eventData: GitHubPayload,
): PRMentionInfo {
  let prAuthor: string | undefined;
  let sender: string | undefined;
  let requestedReviewer: string | undefined;

  switch (eventName) {
    case "pull_request": {
      const payload = eventData as PullRequestPayload;
      prAuthor = payload.pull_request?.user?.login;
      sender = payload.sender?.login;
      requestedReviewer = payload.requested_reviewer?.login;
      console.log(
        `🔍 PR event: action=${payload.action}, prAuthor=${prAuthor}, sender=${sender}, requestedReviewer=${requestedReviewer}`,
      );
      break;
    }

    case "pull_request_review": {
      const payload = eventData as ReviewPayload;
      prAuthor = payload.pull_request?.user?.login;
      sender = payload.review?.user?.login;
      console.log(
        `🔍 Review event: state=${payload.review?.state}, prAuthor=${prAuthor}, sender=${sender}`,
      );
      break;
    }

    case "pull_request_review_comment": {
      const payload = eventData as ReviewCommentPayload;
      // PR author not directly available in payload
      sender = payload.comment?.user?.login;
      console.log(
        `🔍 Review comment: sender=${sender}, PR author not available`,
      );
      break;
    }

    case "issue_comment": {
      const payload = eventData as IssueCommentPayload;
      if (payload.issue?.pull_request) {
        // This is a PR comment
        prAuthor = payload.issue?.user?.login;
        sender = payload.comment?.user?.login;
        console.log(`🔍 PR comment: prAuthor=${prAuthor}, sender=${sender}`);
      }
      break;
    }
  }

  return { prAuthor, sender, requestedReviewer };
}

/**
 * Determine which users should be mentioned based on PR event context.
 *
 * @param mentionInfo - Extracted PR mention information
 * @returns Array of GitHub usernames that should be mentioned
 */

export function getUsersToMention(mentionInfo: PRMentionInfo): string[] {
  const usersToMention: string[] = [];
  const { prAuthor, sender, requestedReviewer } = mentionInfo;

  if (prAuthor && sender && prAuthor !== sender) {
    usersToMention.push(prAuthor);
  }

  if (requestedReviewer) {
    usersToMention.push(requestedReviewer);
  }

  return usersToMention;
}
