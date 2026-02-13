const apiKey = "AIzaSyAy36pAq_QRcAKF6370Jr3E1-0R1MPGzHA";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function quickTest() {
  console.log("Testing new API key...");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Say hello in 3 words" }]
        }]
      })
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Response:", data.candidates[0].content.parts[0].text);
    } else {
      console.log("❌ FAILED");
      console.log("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

quickTest();
