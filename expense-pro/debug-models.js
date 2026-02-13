
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function debugModels() {
    console.log("Reading env...");
    const envPath = path.resolve(process.cwd(), '.env.local');
    let apiKey = '';
    
    try {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && key.trim() === 'GEMINI_API_KEY') {
                apiKey = value ? value.trim() : '';
                break;
            }
        }
    } catch (e) {
        fs.writeFileSync('debug-error.txt', `Env Read Error: ${e.message}`);
        return;
    }

    if (!apiKey) {
        fs.writeFileSync('debug-error.txt', 'API Key not found in .env.local');
        return;
    }

    console.log(`API Key found (length: ${apiKey.length})`);
    
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);
    let output = `Testing models with key ending in ...${apiKey.slice(-4)}\n\n`;

    for (const modelName of candidates) {
        console.log(`Checking ${modelName}...`);
        output += `Checking ${modelName}...\n`;
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = result.response.text();
            console.log(`✅ SUCCESS: ${modelName}`);
            output += `✅ SUCCESS. Response: ${response.substring(0, 50)}...\n\n`;
        } catch (e) {
            console.log(`❌ FAILED: ${modelName} - ${e.message}`);
            output += `❌ FAILED. Error: ${e.message}\n\n`;
        }
    }

    fs.writeFileSync('model-debug-results.txt', output);
    console.log("Done. Wrote results to model-debug-results.txt");
}

debugModels();
