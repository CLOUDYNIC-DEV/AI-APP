const API_KEY = "YOUR_API_KEY_HERE"; 
const TRAIN_TEXT = "Your Train Text";
const APP_NAME = "Your App Name";

// Payment Config
const UPI_ID = "yourname@upi"; 
const UPI_PAYMENT_URL = `upi://pay?pa=${UPI_ID}&pn=AIWorkspace&am=99.00&cu=INR`;

exports.handler = async function (event, context) {
  // Configuration Endpoint
  if (event.httpMethod === "GET" && event.queryStringParameters.init === "true") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        appName: APP_NAME,
        upiUrl: UPI_PAYMENT_URL
      })
    };
  }

  // Chat Endpoint
  if (event.httpMethod === "POST") {
    try {
      const { prompt } = JSON.parse(event.body);
      const cloudynicUrl = new URL("https://cloudynic.com/api/v1/prompt");
      cloudynicUrl.searchParams.append("prompt", prompt);
      cloudynicUrl.searchParams.append("key", API_KEY);
      if (TRAIN_TEXT) cloudynicUrl.searchParams.append("train", TRAIN_TEXT);

      const response = await fetch(cloudynicUrl.toString(), { method: "GET" });
      const data = await response.text();

      return { statusCode: response.status, body: data };
    } catch (error) {
      return { statusCode: 500, body: "Error: " + error.message };
    }
  }
  return { statusCode: 405, body: "Method Not Allowed" };
};
