
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const logFile = 'gemini-test-result.txt';

function log(message) {
    fs.appendFileSync(logFile, message + '\n');
}

// Clear log
fs.writeFileSync(logFile, 'Starting Test...\n');

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
    log(`ERROR: Could not read .env.local: ${e.message}`);
    process.exit(1);
}

if (!apiKey) {
  log("ERROR: No GEMINI_API_KEY found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const expenseSchema = {
  description: "Expense data extraction",
  type: SchemaType.OBJECT,
  properties: {
    category: { type: SchemaType.STRING, description: "One of: Food, Transport, Housing, Utilities, Health, Entertainment, Shopping, Other" },
    subcategory: { type: SchemaType.STRING },
    amount: { type: SchemaType.NUMBER },
    currency: { type: SchemaType.STRING, description: "Default to INR if not specified" },
    date: { type: SchemaType.STRING, description: "ISO 8601 format YYYY-MM-DD" },
    confidence: { type: SchemaType.NUMBER },
    advice: { type: SchemaType.STRING, description: "Short, blunt financial advice based on the expense." }
  },
  required: ["category", "amount", "currency", "date", "advice"]
};

async function testModel(modelName) {
  log(`Testing model: ${modelName}`);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: expenseSchema,
    },
  });

  const prompt = `
    Current Date: ${new Date().toISOString().split('T')[0]}
    User Input: "Spent 500 rs on taxi to office"
    Context: Indian user. If vague, guess best category.
    Tone: Gentle, helpful.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    log(`SUCCESS with ${modelName}: Result: ${text.substring(0, 100)}...`);
  } catch (error) {
    log(`ERROR with ${modelName}: ${error.message}`);
  }
}

(async () => {
    try {
        await testModel("gemini-1.5-flash");
        log("--------------------------------");
        await testModel("gemini-2.0-pro-exp-02-05");
    } catch (e) {
        log(`FATAL ERROR: ${e.message}`);
    }
})();
