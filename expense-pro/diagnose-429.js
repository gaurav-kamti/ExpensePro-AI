const fs = require('fs');

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
const model = "gemini-2.0-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function diagnose429() {
  console.log("Testing API call to diagnose 429 error...");
  console.log(`Model: ${model}`);
  console.log(`API Key (last 4): ...${apiKey.slice(-4)}`);
  
  const payload = {
    contents: [{
      parts: [{ text: "Say hello" }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log("\nFull Response:");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
      console.log("\n=== ERROR DETAILS ===");
      console.log("Message:", data.error.message);
      console.log("Code:", data.error.code);
      console.log("Status:", data.error.status);
      if (data.error.details) {
        console.log("Details:", JSON.stringify(data.error.details, null, 2));
      }
    }

  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

diagnose429();
