const apiKey = "AIzaSyAy36pAq_QRcAKF6370Jr3E1-0R1MPGzHA";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  console.log("Listing available models for this key...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
        console.log("SUCCESS! Models found:", data.models?.length);
        const models = data.models?.map(m => m.name.replace("models/", ""));
        console.log("Models:", JSON.stringify(models, null, 2));
    } else {
        console.log("FAILED to list models:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
