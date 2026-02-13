'use client'
import { useState } from 'react';
import { parseExpenseInput } from '@/actions/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/lib/store';
import { Loader2, Mic, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExpenseEntryForm({ onExpenseAdded }: { onExpenseAdded?: (expense: any) => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useUserStore();

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await parseExpenseInput(input, mode);

      if (data?.error || data?.isValid === false) {
        setError(data?.error || "I couldn't find a valid transaction in your input. Please try again with something like 'Spent 500 on dinner'.");
        setResult(data);
        return;
      }

      if (data && data.isValid !== false) {
        setResult(data);
        if (onExpenseAdded) {
          onExpenseAdded(data);
          setInput('');
        }
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-8 rounded-[2.5rem] bg-white border-none shadow-xl shadow-blue-100/50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-blue-600" />
          Neural Entry
        </h2>
        <div className="px-2 py-1 bg-blue-50 rounded-full">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Active</p>
        </div>
      </div>

      <div className="relative group">
        <Textarea
          placeholder="Type naturally... e.g. 'Coffee for 120 at Starbucks'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] bg-slate-50 border-slate-100 rounded-[1.5rem] p-5 text-base font-medium placeholder:text-slate-300 focus-visible:ring-blue-600/10 focus-visible:border-blue-600/20 transition-all resize-none"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 bottom-4 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-1">Processing Error</p>
          <p className="text-xs font-bold text-red-500/80 leading-relaxed">{error}</p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-30"
      >
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <>Process Transaction</>
        )}
      </Button>

      {result && !error && (
        <div className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              result.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            )}>
              {result.type || 'expense'} Detected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Category</p>
              <p className="font-black text-slate-900">{result.category}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Amount</p>
              <p className="font-black text-slate-900">₹{Number(result.amount).toLocaleString()}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-blue-600/60 italic leading-relaxed">
              <Sparkles className="h-3 w-3 inline mr-1 mb-1" />
              {result.advice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}