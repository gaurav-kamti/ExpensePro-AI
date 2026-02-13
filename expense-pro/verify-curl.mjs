
const apiKey = "AIzaSyC_TpuOLxC7_o_eiZK-xiDHCJpY_20RE_Q";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function testGemini2() {
  console.log(`Testing Gemini 2.0 Flash...`);
  
  const payload = {
    contents: [{
      parts: [{ text: "Explain how AI works in a few words" }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log("Error Body:", errorText);
    } else {
        const data = await response.json();
        console.log("Success:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

testGemini2();
