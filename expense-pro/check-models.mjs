
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && key.trim() === 'GEMINI_API_KEY') {
            apiKey = value.trim();
        }
    });
} catch (e) {
    console.error(`ERROR: Could not read .env.local: ${e.message}`);
    process.exit(1);
}

if (!apiKey) {
    console.error("ERROR: No GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        // Note: The Node SDK might not have a direct listModels method exposed easily on the main entry 
        // without using the specialized ModelManager (which implies different setup). 
        // However, we can try to just run a generation on the specific models we care about 
        // and see the specific error.
        
        console.log("Checking gemini-1.5-flash...");
        try {
            await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("Test");
            console.log("✅ gemini-1.5-flash is working.");
        } catch (e) {
            console.log(`❌ gemini-1.5-flash failed: ${e.message}`);
        }

        console.log("Checking gemini-2.0-pro-exp-02-05...");
        try {
            await genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" }).generateContent("Test");
            console.log("✅ gemini-2.0-pro-exp-02-05 is working.");
        } catch (e) {
            console.log(`❌ gemini-2.0-pro-exp-02-05 failed: ${e.message}`);
        }
        
        console.log("Checking gemini-1.5-pro...");
        try {
            await genAI.getGenerativeModel({ model: "gemini-1.5-pro" }).generateContent("Test");
            console.log("✅ gemini-1.5-pro is working.");
        } catch (e) {
            console.log(`❌ gemini-1.5-pro failed: ${e.message}`);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
