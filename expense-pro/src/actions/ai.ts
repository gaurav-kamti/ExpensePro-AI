'use server'

async function getAvailableModels(apiKey: string) {
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const listResponse = await fetch(listUrl);
  const listData = await listResponse.json();

  if (!listResponse.ok) {
    throw new Error(listData.error?.message || "Could not list models");
  }

  return listData.models
    ?.filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
    .map((m: any) => m.name.replace("models/", "")) || [];
}

async function callAiWithModels(apiKey: string, prompt: string) {
  const availableModels = await getAvailableModels(apiKey);
  if (availableModels.length === 0) {
    throw new Error("No Models Enabled");
  }

  const priority = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
  const sortedModels = [
    ...priority.filter(p => availableModels.includes(p)),
    ...availableModels.filter((a: string) => !priority.includes(a))
  ];

  for (const model of sortedModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        if (response.status === 429) continue;
        console.error(`❌ ${model} failed: ${data.error?.message}`);
      }
    } catch (e) {
      console.error(`Fatal error with model ${model}:`, e);
      continue;
    }
  }
}

export async function parseExpenseInput(input: string, userMode: 'basic' | 'pro') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "Missing API Key" };

  const prompt = `Input: "${input}"
    Current Date: ${new Date().toISOString().split('T')[0]}
    Context: Indian user.
    
    Task: 
    - You must extract the EXACT amount and item name from the user's input.
    - User Input: """${input}"""
    
    Rules for Extraction:
    1. If the input contains a number and a reason/noun, it is VALID.
    2. amount: Extract only the number.
    3. subcategory: Capitalize the item name (e.g., "Momo", "Chai", "Jeans", "Electricity Bill").
    4. category: MUST be one of the following ONLY:
       [Food, Transport, Shopping, Housing, Utilities, Health, Entertainment, Groceries, Personal Care, Education, Salary, Freelance, Investment, Gift, Other].
    
    Category Mapping Guide:
    - Clothes, shoes, gadgets, bags -> "Shopping"
    - Restaurants, tea, snacks, momos, lunch -> "Food"
    - Uber, auto, bus, fuel, petrol -> "Transport"
    - Rent, plumber, repair -> "Housing"
    - Bill, recharge, wifi -> "Utilities"
    
    5. Default type: "expense" (unless income is clearly mentioned).
    6. Currency: Always "INR".
    
    CRITICAL: Never default to "Food" if the item is clearly not food. Use the Mapping Guide. Use what the user actually typed.

    Return ONLY raw JSON.

    Return format:
    {
      "isValid": boolean,
      "type": "expense" | "income",
      "category": "One from the list",
      "subcategory": "Proper Name",
      "amount": number,
      "currency": "INR",
      "date": "YYYY-MM-DD",
      "advice": "Short witty tip",
      "error": "Reason ONLY if isValid is false" 
    }`;

  try {
    const text = await callAiWithModels(apiKey, prompt);
    if (!text) return { error: "Models busy" };
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function askAi(query: string, history: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "Missing API Key" };

  // --- Ground Truth Calculations (Exact sync with ForecasterWidget) ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dayOfMonth = today.getDate();

  const totalIncome = history.reduce((acc, curr) => curr.type === 'income' ? acc + Number(curr.amount || 0) : acc, 0);
  const totalExpense = history.reduce((acc, curr) => curr.type === 'expense' ? acc + Number(curr.amount || 0) : acc, 0);
  const liveBalance = totalIncome - totalExpense;

  const monthExpenses = history.filter(e => {
    const d = new Date(e.date);
    return e.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const spentThisMonth = monthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const burnRate = dayOfMonth > 0 ? Math.round(spentThisMonth / dayOfMonth) : 0;
  const runway = burnRate > 0 ? Math.floor(liveBalance / burnRate) : 999;

  const prompt = `
    User History: ${JSON.stringify(history)}
    Ground Truth Metrics (MANDATORY):
    - Current Balance: ₹${liveBalance}
    - Total Spent THIS ENTIRE MONTH: ₹${spentThisMonth}
    - Daily Burn Rate (Daily Average): ₹${burnRate}/day
    - Financial Runway: ${runway} days
    - Today's Date: ${today.toISOString().split('T')[0]}
    
    User Query: "${query}"
    
    CRITICAL RULES:
    1. EXCLUSIVELY USE THE "GROUND TRUTH METRICS" ABOVE.
    2. TOTAL SPENT is ₹${spentThisMonth}. Do NOT confuse this with the Daily Burn Rate.
    3. BURN RATE is ₹${burnRate}/day. Use this ONLY for talking about daily average or forecasting.
    4. Your summary MUST match these numbers: Balance ₹${liveBalance}, Monthly Spend ₹${spentThisMonth}, Burn Rate ₹${burnRate}/day.
    5. Be very clear: "You have spent ₹${spentThisMonth} so far this month, which is an average of ₹${burnRate} per day."
    
    Context: You are an elite, proactive personal financial advisor AI.
    
    Task:
    1. Status Report: Start with a clear summary: Balance, Month Total Spend, and Daily Average (using ground truth).
    2. Deep Analysis: Analyze the full history. Identify exactly WHERE the money is going (e.g., "70% on Food").
    3. Pattern Recognition: Mention specific recurring items (e.g., "I see you buy Chai almost every day").
    4. Projections: Forecast the runway clearly.
    5. Actionable Strategy: Provide 3 specific, tiered steps to improve their situation.

    - Be conversational but data-driven.
    - If in debt, act with urgency but remain encouraging.
    - If balance is healthy, suggest investment or optimization.

    Return ONLY a JSON object with this format:
    {
      "answer": "A comprehensive 3-paragraph summary covering Status, Analysis, and Patterns.",
      "advice": "High-level strategic financial wisdom",
      "suggestedAction": "A specific priority action for this week"
    }`;

  try {
    const text = await callAiWithModels(apiKey, prompt);
    if (!text) return { error: "Models busy" };
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e: any) {
    return { error: e.message };
  }
}