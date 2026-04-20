/**
 * Minimal Anthropic proxy for hosted reviewer access.
 * Keeps the API key server-side so external reviewers can use the AI panel
 * without entering their own credential in the browser.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/**
 * Read the raw request body when the platform has not already parsed it.
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<string>}
 */
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/**
 * Normalize an incoming JSON request body.
 * @param {import("http").IncomingMessage & { body?: unknown }} req
 * @returns {Promise<object>}
 */
async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const rawBody = await readRawBody(req);
  return rawBody ? JSON.parse(rawBody) : {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    res.status(400).json({
      error: {
        message: "Invalid JSON body."
      }
    });
    return;
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    res.statusCode = upstream.status;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8"
    );

    const requestId = upstream.headers.get("request-id");
    if (requestId) {
      res.setHeader("x-anthropic-request-id", requestId);
    }

    if (!upstream.body) {
      const text = await upstream.text();
      res.end(text);
      return;
    }

    const reader = upstream.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    res.status(502).json({
      error: {
        message: error instanceof Error ? error.message : "Unable to reach Anthropic."
      }
    });
  }
};
