# ExpensePro AI: Specification & Implementation Guide

## 1. Brutally Honest Executive Summary

- **Time Estimate:** **4-6 Weeks** for a solo developer working evenings/weekends to reach a stable MVP. 3 months for a polished "Pro" version.
- **Cost:** **$0/month** initially. Vercel (Hobby), Supabase (Free Tier), and Google Gemini (Free Tier for Flash models) allow a free start.
  - _Warning:_ Gemini Pro (required for complex Pro features) can get expensive if usage scales.
- **Difficulty:** **High**. Integrating Auth, Database, Real-time AI, and interactive Charts in a PWA that feels "native" is significantly harder than a standard CRUD app. State management between "Basic" and "Pro" modes adds complexity.
- **Biggest Risk:** **Feature Creep & Burnout.** You will be tempted to add "just one more graph" or "OCR scanning". **Don't.** 90% of solo finance apps die because the developer spent 2 months on a receipt scanner that works 60% of the time instead of shipping the manual entry feature.

---

## 2. A-Z High-Level Specification

- **A - App Overview:** A dual-mode (Basic/Pro) PWA for Indian users to track expenses using natural language AI, emphasizing privacy and simplicity first.
- **B - Basic Mode:** The default view. High contrast, large text. Shows only "Money In", "Money Out", and "What's Left". One pie chart for categories. AI gives gentle, 1-sentence feedback.
- **C - Core Architecture:** Next.js 15 App Router. Server Actions for all data mutations and AI calls to keep API keys secure. Offline-first read capability via local storage caching.
- **D - Database Schema:** Users, Expenses, Categories, Budgets. Row Level Security (RLS) is mandatory.
- **E - Entry Mechanism:** Primary input is a "Smart Box" (Text/Voice). User says "Paid 500 for petrol via UPI", system extracts {amount: 500, category: "Transport", method: "UPI"}.
- **F - FinBot:** The AI personality. In Basic mode: supportive friend. In Pro mode: critical financial advisor (Dave Ramsey style).
- **G - Gemini Integration:** Uses `gemini-1.5-flash` for fast parsing (Basic) and `gemini-2.0-pro` for deep financial analysis (Pro).
- **I - Indian Context:** Hardcoded INR currency formatting (₹). UPI integration keywords recognized by AI. GST flagged on dining/luxury expenses.
- **M - Mode Toggle:** A global state switch. Persisted in user preferences. Instantly re-renders the UI to show/hide complexity.
- **P - PWA Strategy:** Manifest.json for installability. Service Workers for caching static assets. iOS touch icon support.
- **S - Security:** No banking credentials storage. We do NOT connect to bank APIs (Account Aggregators) in MVP due to regulatory/cost complexity. Manual/AI entry only.
- **Z - Zero-Based Budgeting:** (Pro Mode) Every Rupee must be assigned a job. Income - Expenses = Savings/Investments.

---

## 3. Recommended MVP Scope (Ruthless Cuts)

**Build ONLY this for v1.0:**

1.  **Auth:** Email/Password (Supabase Auth). No social login complexity yet.
2.  **Smart Entry:** Text input that sends string to Gemini -> returns JSON -> saves to DB.
3.  **Feed:** Simple list of this month's expenses. Click to edit.
4.  **Dashboard:**
    - Basic Mode: Big number (Balance), Pie Chart (Categories).
    - Pro Mode: Line Chart (Daily spend), List of "Wasteful" items identified by AI.
5.  **Settings:** Toggle Basic/Pro, Delete Account.
6.  **FinBot:** Simple chat interface to query _current month's_ data only.

**CUT these (Save for v1.1):**

- Recurring transactions (logic is a nightmare).
- Receipt scanning (OCR is flaky).
- Multiple wallets/accounts.
- Export to PDF/Excel.
- Investments/Stocks tracking.

---

## 4. Tech Stack Justification & Dependencies

- **Framework:** **Next.js 15 (App Router)**. React Server Components reduce client bundle size, critical for mobile performance on 4G networks.
- **Styling:** **Tailwind CSS + shadcn/ui**. Copy-paste components. Accessible, beautiful, fast to build.
- **State:** **Zustand**. Redux is too heavy. Context API causes too many re-renders. Zustand is perfect for the global "Mode" toggle.
- **Database:** **Supabase**. Postgres is robust. Built-in Auth saves weeks. Real-time subscriptions optional later.
- **AI:** **Google Generative AI SDK**. Best-in-class JSON mode. Flash model is free and fast.
- **Charts:** **Recharts**. Battle-tested, highly customizable, responsive.

**Dependencies:**

```bash
npx create-next-app@latest expense-pro --typescript --tailwind --eslint
cd expense-pro
npx shadcn@latest init
npx shadcn@latest add button input card dialog select switch scroll-area sheet
npm install @google/generative-ai @supabase/supabase-js @supabase/ssr zustand recharts lucide-react clsx tailwind-merge date-fns framer-motion
```

---

## 5. Project Folder Structure Tree

```
expense-pro/
├── .env.local                  # API Keys (Supabase, Gemini)
├── public/                     # manifest.json, icons
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + Providers
│   │   ├── page.tsx            # Landing or Redirect to Dashboard
│   │   ├── (auth)/             # Route Group: Login/Signup
│   │   ├── (dashboard)/        # Protected Routes
│   │   │   ├── layout.tsx      # Sidebar/Bottom Nav
│   │   │   ├── page.tsx        # Main Dashboard (renders Basic or Pro view)
│   │   │   ├── add/page.tsx    # Dedicated Add Expense page (mobile focus)
│   │   │   └── chat/page.tsx   # FinBot Interface
│   │   └── api/                # Edge functions (if needed)
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── dashboard/          # BasicDashboard, ProDashboard
│   │   ├── forms/              # ExpenseEntryForm
│   │   ├── charts/             # ExpensePieChart, SpendingTrend
│   │   └── shared/             # ModeToggle, Navbar
│   ├── lib/
│   │   ├── supabase/           # Client/Server clients
│   │   ├── gemini.ts           # AI Logic & Prompts
│   │   ├── utils.ts            # CN helper, formatCurrency (INR)
│   │   └── store.ts            # Zustand (user settings)
│   ├── actions/
│   │   ├── expenses.ts         # Server Actions: addExpense, getExpenses
│   │   └── ai.ts               # Server Action: parseExpenseString
│   └── types/                  # TypeScript interfaces
└── next.config.ts              # PWA config
```

---

## 6. Critical Code Snippets

### A. Server Action for Gemini Parsing (`src/actions/ai.ts`)

```typescript
"use server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const expenseSchema = {
  description: "Expense data extraction",
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description:
        "One of: Food, Transport, Housing, Utilities, Health, Entertainment, Shopping, Other",
    },
    subcategory: { type: SchemaType.STRING },
    amount: { type: SchemaType.NUMBER },
    currency: {
      type: SchemaType.STRING,
      description: "Default to INR if not specified",
    },
    date: {
      type: SchemaType.STRING,
      description: "ISO 8601 format YYYY-MM-DD",
    },
    confidence: { type: SchemaType.NUMBER },
    advice: {
      type: SchemaType.STRING,
      description: "Short, blunt financial advice based on the expense.",
    },
  },
  required: ["category", "amount", "currency", "date", "advice"],
};

export async function parseExpenseInput(
  input: string,
  userMode: "basic" | "pro",
) {
  const modelName =
    userMode === "pro" ? "gemini-2.0-pro-exp-02-05" : "gemini-1.5-flash";

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: expenseSchema,
    },
  });

  const prompt = `
    Current Date: ${new Date().toISOString().split("T")[0]}
    User Input: "${input}"
    Context: Indian user. If vague, guess best category.
    Tone: ${userMode === "pro" ? "Strict, Dave Ramsey style." : "Gentle, helpful."}
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
```

### B. Expense Entry Component (`src/components/forms/ExpenseEntryForm.tsx`)

```tsx
"use client";
import { useState } from "react";
import { parseExpenseInput } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/lib/store"; // Zustand store
import { Loader2, Mic } from "lucide-react";

export default function ExpenseEntryForm() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { mode } = useUserStore(); // 'basic' or 'pro'

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const data = await parseExpenseInput(input, mode);

    if (data) {
      // Show confirmation dialog with parsed data
      console.log("Parsed:", data);
      // In real app: call addExpense(data) server action here
      setInput("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <label className="text-sm font-medium">Quick Add (Text or Voice)</label>
      <div className="relative">
        <Textarea
          placeholder="e.g. Spent 450 on biryani via swiggy"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="pr-10"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 bottom-2 text-muted-foreground"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Analyze & Save"
        )}
      </Button>
    </div>
  );
}
```

### C. Mode Toggle Logic (Zustand) (`src/lib/store.ts`)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  mode: "basic" | "pro";
  toggleMode: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      mode: "basic",
      toggleMode: () =>
        set((state) => ({ mode: state.mode === "basic" ? "pro" : "basic" })),
    }),
    { name: "expense-pro-settings" },
  ),
);
```

### D. Environment Setup (`.env.local`)

```env
# Supabase - Get from Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI Studio - Get from https://aistudio.google.com/
GEMINI_API_KEY=AIzaSyD...

# Optional: Vercel specific
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Step-by-Step Launch Roadmap

1.  **Day 1: Setup & Auth.** Initialize Next.js. Setup Supabase project. Connect Auth. Create Database tables.
2.  **Day 2: The Core Loop.** Build `ExpenseEntryForm`. Implement `parseExpenseInput` with Gemini. Create the `addExpense` Server Action. Verify data lands in DB.
3.  **Day 3: Basic UI.** Build the `BasicDashboard`. Fetch daily expenses. Display simple Total Balance. Implement Delete functionality.
4.  **Day 4: Charts & Pro Mode.** Install Recharts. Build `ExpensePieChart`. Wire up the `useUserStore` toggle. Create the `ProDashboard` view.
5.  **Day 5: FinBot.** Build the chat interface. Create a system prompt that feeds the last 10 expenses as context to Gemini so it can answer questions.
6.  **Day 6: PWA Polish.** Add `manifest.json`. Add icons. Test "Add to Home Screen" on mobile. Ensure input fields don't zoom in on iOS (font-size 16px).
7.  **Day 7: Deployment.** Push to GitHub. Import to Vercel. Add Environment Variables. Run a live test with a friend.

---

## 8. Realistic Warnings (The "Don't Do It" Section)

- **Gemini Costs:** While `flash` is free-tier friendly, if you hit viral growth or use `pro` model heavily for the chat feature, costs will spike. **Mitigation:** Strict rate limiting (e.g., 50 chats/day per user) and caching common answers.
- **Privacy Trust:** You are asking users to tell you their financial secrets. One data leak and you are done. **Mitigation:** Use Supabase RLS (Row Level Security) correctly. Never log user expense data to your server console (except during dev).
- **Indian Data Laws:** Storing Indian financial data on US servers (if Supabase region is US) is a grey area for personal apps but critical for fintech. **Mitigation:** Choose Supabase's **Mumbai (ap-south-1)** region when creating the project.
- **The "Manual Entry" Wall:** 95% of users stop using these apps after 2 weeks because manual entry is tedious. **Mitigation:** The "Voice" entry and "Smart Parsing" must be flawless. If it takes more than 5 seconds to add an expense, they will quit.
