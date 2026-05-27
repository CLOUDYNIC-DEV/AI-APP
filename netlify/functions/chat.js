// ==========================================
// CONFIGURATION VARIABLES (Change these)
// ==========================================
const API_KEY = "YOUR_API_KEY_HERE"; 
const TRAIN_TEXT = "Train data text";
const APP_NAME = "App Name";
// ==========================================

exports.handler = async function (event, context) {
  // Route 1: Handle Front-end initialization configurations safely
  if (event.httpMethod === "GET" && event.queryStringParameters.init === "true") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName: APP_NAME })
    };
  }

  // Route 2: Handle API Prompt Requests via POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: "Missing prompt parameter" };
    }

    // Build the underlying API request cleanly using parameters inside this script
    const cloudynicUrl = new URL("https://cloudynic.com/api/v1/prompt");
    cloudynicUrl.searchParams.append("prompt", prompt);
    cloudynicUrl.searchParams.append("key", API_KEY);
    if (TRAIN_TEXT) {
      cloudynicUrl.searchParams.append("train", TRAIN_TEXT);
    }

    const response = await fetch(cloudynicUrl.toString(), { method: "GET" });
    const data = await response.text();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: data
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: "Internal Server Error: " + error.message
    };
  }
};
