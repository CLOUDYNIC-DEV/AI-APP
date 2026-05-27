// CHAT API CONFIGURATION
const API_KEY = "YOUR_API_KEY_HERE"; 
const TRAIN_TEXT = "Your Train Text";
const APP_NAME = "Your App Name";

// ADSENSE MONETIZATION CONFIGURATION
const ADSENSE_PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX"; // Your real pub ID
const TOP_BANNER_AD_SLOT   = "1234567890"; 
const BOTTOM_BOX_AD_SLOT   = "0987654321";

exports.handler = async function (event, context) {
  if (event.httpMethod === "GET" && event.queryStringParameters.init === "true") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        appName: APP_NAME,
        pubId: ADSENSE_PUBLISHER_ID,
        topSlot: TOP_BANNER_AD_SLOT,
        bottomSlot: BOTTOM_BOX_AD_SLOT
      })
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: "Missing prompt parameter" };
    }

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
      body: "Internal Error: " + error.message
    };
  }
};
