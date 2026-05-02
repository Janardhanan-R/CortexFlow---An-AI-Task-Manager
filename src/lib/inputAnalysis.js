import { normalizePrompt, splitPromptIntoIdeas } from "./planner";

const FEATURE_DEFS = [
  { label: "Login", re: /\b(login|sign[\s-]?in|auth|authentication|jwt|oauth|session)\b/i },
  { label: "Payment", re: /\b(payment|stripe|checkout|billing|subscribe|wallet)\b/i },
  { label: "Ordering", re: /\b(order|ordering|cart|checkout\s*flow|purchase)\b/i },
  { label: "Delivery", re: /\b(deliver|delivery|dispatch|tracking|logistics)\b/i },
  { label: "Search", re: /\b(search|filter|discovery|catalog)\b/i },
  { label: "Notifications", re: /\b(notif|push|email\s*alert|sms)\b/i },
  { label: "Admin", re: /\b(admin|dashboard|moderation|cms)\b/i },
  { label: "API", re: /\b(api|rest|graphql|backend\s*service)\b/i },
  { label: "Mobile", re: /\b(mobile|ios|android|react\s*native)\b/i },
  { label: "Maps", re: /\b(map|geolocation|gps|routing)\b/i },
];

export function analyzeInputForFeatures(rawText) {
  const normalized = normalizePrompt(rawText || "");
  const ideas = splitPromptIntoIdeas(normalized);
  const combined = ideas.length ? ideas.join(" ") : normalized;
  const detected = [];
  for (const { label, re } of FEATURE_DEFS) {
    if (re.test(combined)) detected.push(label);
  }
  return {
    normalized,
    promptCount: ideas.length,
    detectedFeatures: detected,
  };
}
