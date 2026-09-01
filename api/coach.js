/**
 * Vercel serverless function — proxies coach chat to the Anthropic API.
 *
 * Environment variables (set in Vercel dashboard):
 *   ANTHROPIC_API_KEY — your Anthropic API key
 *   APP_KEY           — a shared secret the app sends in the x-app-key header
 *
 * The function:
 *   1. Checks the x-app-key header matches APP_KEY (rejects with 401 if not)
 *   2. Forwards { messages } to the Anthropic Messages API
 *   3. Returns the response as JSON
 *   4. Never logs message contents
 */

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check app key
  const appKey = req.headers["x-app-key"];
  if (!appKey || appKey !== process.env.APP_KEY) {
    return res.status(401).json({ error: "Invalid or missing app key" });
  }

  // Validate body
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty messages array" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Pass through the status code and a clean error — never log the messages
      const errorMessage = data?.error?.message || `Anthropic API error (${response.status})`;
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(200).json(data);
  } catch (err) {
    // Network error reaching Anthropic — don't expose internals
    return res.status(502).json({ error: "Could not reach the AI service. Try again in a moment." });
  }
}
