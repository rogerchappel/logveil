import type { RedactionRule } from "./types.js";

const fixed = (label: string) => () => `[REDACTED:${label}]`;
const indexed = (label: string) => (_match: string, index: number) => `[REDACTED:${label}_${index}]`;

export const defaultRules: RedactionRule[] = [
  {
    id: "openai-key",
    type: "api_key",
    severity: "secret",
    description: "OpenAI-style API key",
    pattern: /sk-[A-Za-z0-9_-]{20,}/g,
    replacement: indexed("API_KEY")
  },
  {
    id: "github-token",
    type: "token",
    severity: "secret",
    description: "GitHub personal or fine-grained access token",
    pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g,
    replacement: indexed("GITHUB_TOKEN")
  },
  {
    id: "slack-token",
    type: "token",
    severity: "secret",
    description: "Slack bot/user/app token",
    pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/g,
    replacement: indexed("SLACK_TOKEN")
  },
  {
    id: "aws-access-key",
    type: "aws_access_key",
    severity: "secret",
    description: "AWS access key id",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    replacement: indexed("AWS_ACCESS_KEY")
  },
  {
    id: "assignment-secret",
    type: "assignment_secret",
    severity: "secret",
    description: "Secret-looking key/value assignment",
    pattern: /\b(api[_-]?key|token|secret|password|passwd|pwd)\s*[:=]\s*['\"]?([^\s'\"]{8,})['\"]?/gi,
    replacement: fixed("SECRET_ASSIGNMENT")
  },
  {
    id: "email-address",
    type: "email",
    severity: "warning",
    description: "Email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: indexed("EMAIL")
  },
  {
    id: "home-path",
    type: "local_path",
    severity: "warning",
    description: "User home directory path",
    pattern: /\/(Users|home)\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._@%+=:,/-]*)?/g,
    replacement: indexed("LOCAL_PATH")
  },
  {
    id: "ipv4-private",
    type: "private_ip",
    severity: "info",
    description: "Private IPv4 address",
    pattern: /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/g,
    replacement: indexed("PRIVATE_IP")
  }
];
