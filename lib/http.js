// Small helpers shared by the API functions.

function sendJson(res, status, body, cacheControl) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl || "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

// Query-string values can be repeated (?a=1&a=2). We only ever use the first.
function one(value) {
  return Array.isArray(value) ? value[0] : value;
}

// Turn "3" into 3, keep it between min and max, and fall back if it's junk.
function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(one(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Keep only characters that are safe to put in a search filter.
// This removes wildcards (% _ *), quotes, commas, brackets and backslashes,
// so a visitor can never change the meaning of the database query.
function cleanSearch(value) {
  const text = String(one(value) ?? "");
  return text
    .replace(/[^\p{L}\p{N}\s'&.\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

module.exports = { sendJson, sendError, one, clampInt, cleanSearch };
