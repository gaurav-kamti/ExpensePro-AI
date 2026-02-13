
const apiKey = "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function testApi() {
  console.log(`Testing URL: ${url.replace(apiKey, "HIDDEN_KEY")}`);
  
  const payload = {
    contents: [{
      parts: [{ text: "Hello, list 3 fruits." }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log("Error Body:", JSON.stringify(data, null, 2));
    } else {
      console.log("Success Body Preview:", JSON.stringify(data).substring(0, 200));
    }

  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

testApi();
