
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envConfig[key.trim()] = value.trim();
  }
});

const apiKey = envConfig.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API KEY found");
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
  console.log(`Testing model: ${modelName}`);
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
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error(`Error with ${modelName}:`, error.message);
  }
}

(async () => {
    await testModel("gemini-1.5-flash");
    try {
        await testModel("gemini-2.0-pro-exp-02-05");
    } catch (e) {
        console.log("Gemini 2.0 Pro test failed (expected if model doesn't exist)");
    }
})();
