
const fs = require('fs');

const apiKey = "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
// The user suggested gemini-2.0-flash
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function testGemini2() {
  const logFile = 'curl-result.log';
  fs.writeFileSync(logFile, "Starting...\n");
  
  const payload = {
    contents: [{
      parts: [{ text: "Explain how AI works in a few words" }]
    }]
  };

  try {
    // Note: Node 18+ has fetch built-in
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const statusLine = `Status: ${response.status} ${response.statusText}\n`;
    fs.appendFileSync(logFile, statusLine);
    
    if (!response.ok) {
        const errorText = await response.text();
        fs.appendFileSync(logFile, `Error Body: ${errorText}\n`);
    } else {
        const data = await response.json();
        fs.appendFileSync(logFile, `Success: ${JSON.stringify(data, null, 2)}\n`);
    }

  } catch (error) {
    fs.appendFileSync(logFile, `Fetch Error: ${error.message}\n`);
  }
}

testGemini2();
