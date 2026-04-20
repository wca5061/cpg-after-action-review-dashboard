/**
 * Anthropic Messages API proxy for Vercel serverless deployment.
 * Keeps the Anthropic key on the server while allowing browser clients
 * to call the dashboard's AI panel through the same-origin API route.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Apply CORS headers for browser access, including OPTIONS preflight.
 * @param {import("http").ServerResponse} res
 */
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Read the incoming request body as a JSON string.
 * If Vercel has already parsed the body, re-serialize it.
 * @param {import("http").IncomingMessage & { body?: unknown }} req
 * @returns {Promise<string>}
 */
async function readBodyAsJsonString(req) {
  if (typeof req.body === "string") {
    return req.body;
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data || "{}"));
    req.on("error", reject);
  });
}

/**
 * Vercel serverless handler for the Anthropic proxy route.
 * @param {import("http").IncomingMessage & { body?: unknown; method?: string }} req
 * @param {import("http").ServerResponse & { status: (code:number) => any; json: (body: unknown) => any; end: (body?: string) => any }} res
 */
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({
      error: {
        message: "Method not allowed. Use POST."
      }
    });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: {
        message: "Server is missing ANTHROPIC_API_KEY."
      }
    });
    return;
  }

  let requestBody;
  try {
    requestBody = await readBodyAsJsonString(req);
  } catch (error) {
    res.status(400).json({
      error: {
        message: "Unable to read request body."
      }
    });
    return;
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: requestBody
    });

    const responseJson = await upstream.json();
    res.status(200).json(responseJson);
  } catch (error) {
    res.status(502).json({
      error: {
        message: error instanceof Error ? error.message : "Unable to reach Anthropic."
      }
    });
  }
}
