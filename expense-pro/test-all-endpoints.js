const fs = require('fs');

const apiKey = "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
const logFile = "api-test-results.txt";

async function testAllEndpoints() {
  let log = "=== TESTING ALL GEMINI ENDPOINTS ===\n\n";
  
  const endpoints = [
    { version: "v1beta", model: "gemini-pro" },
    { version: "v1", model: "gemini-pro" },
    { version: "v1beta", model: "gemini-1.5-flash" },
    { version: "v1beta", model: "gemini-2.0-flash" }
  ];

  for (const endpoint of endpoints) {
    const url = `https://generativelanguage.googleapis.com/${endpoint.version}/models/${endpoint.model}:generateContent?key=${apiKey}`;
    
    log += `\n--- Testing: ${endpoint.version}/${endpoint.model} ---\n`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Say hello" }]
          }]
        })
      });

      log += `Status: ${response.status} ${response.statusText}\n`;

      const data = await response.json();

      if (!response.ok) {
        log += `Error: ${JSON.stringify(data, null, 2)}\n`;
      } else {
        log += `✅ SUCCESS!\n`;
        log += `Response: ${JSON.stringify(data).substring(0, 200)}...\n`;
      }

    } catch (error) {
      log += `Fetch Error: ${error.message}\n`;
    }
  }

  log += "\n=== TEST COMPLETE ===\n";
  
  fs.writeFileSync(logFile, log);
  console.log(`Results written to ${logFile}`);
}

testAllEndpoints().catch(err => {
  fs.writeFileSync(logFile, `Fatal error: ${err.message}`);
});
