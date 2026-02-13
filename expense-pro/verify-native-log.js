
const fs = require('fs');

const apiKey = "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
const urlFlash = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const urlPro = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

const logFile = "api-check-log.txt";

function log(msg) {
    fs.appendFileSync(logFile, msg + "\n");
}

fs.writeFileSync(logFile, "Starting API Check...\n");

async function testUrl(name, url) {
  log(`Testing ${name}...`);
  
  const payload = {
    contents: [{
      parts: [{ text: "Hello" }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
        log(`ERROR BODY: ${JSON.stringify(data, null, 2)}`);
    } else {
        log(`SUCCESS: ${JSON.stringify(data).substring(0, 100)}...`);
    }

  } catch (error) {
    log(`FETCH ERROR: ${error.message}`);
  }
}

(async () => {
    await testUrl("Gemini 1.5 Flash", urlFlash);
    await testUrl("Gemini 1.0 Pro", urlPro);
})();
