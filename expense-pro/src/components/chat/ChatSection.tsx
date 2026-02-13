'use client'
import { useState, useEffect, useRef } from 'react';
import { askAi } from '@/actions/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, BrainCircuit, Sparkles, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'ai';
    content: string;
    advice?: string;
    action?: string;
}

export default function ChatSection({ history }: { history: any[] }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: "Syncing with Neural Engine...",
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Generate personalized greeting using the REAL AI model
    useEffect(() => {
        const generateGreeting = async () => {
            if (history.length > 0) {
                setLoading(true);
                try {
                    const response = await askAi("Give me a very short 2-sentence summary of my current financial status and one piece of advice based on my history. Start by mentioning my balance.", history);
                    if (response && !response.error) {
                        setMessages([{
                            role: 'ai',
                            content: response.answer,
                            advice: response.advice,
                            action: response.suggestedAction
                        }]);
                    }
                } catch (e) {
                    console.error("Failed to generate AI greeting", e);
                } finally {
                    setLoading(false);
                }
            } else {
                setMessages([{
                    role: 'ai',
                    content: "Hello! I'm your Neural Advisor. I'm ready to audit your finances, but I need some transaction data first. Try recording your first income or expense!"
                }]);
            }
        };

        generateGreeting();
    }, [history.length === 0]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMessage: Message = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const response = await askAi(query, history);

            if (response.error) {
                setMessages(prev => [...prev, { role: 'ai', content: `Neural Error: ${response.error}` }]);
            } else {
                const aiMessage: Message = {
                    role: 'ai',
                    content: response.answer,
                    advice: response.advice,
                    action: response.suggestedAction
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', content: "Neural Core timeout. Please retry." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[700px] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-2xl shadow-blue-100/50">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <BrainCircuit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-slate-900 tracking-tight">Neural Core v2</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Intelligence</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth no-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                        "flex items-end gap-3",
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'
                        )}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={cn(
                            "max-w-[80%] p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed transition-all animate-in zoom-in-95",
                            msg.role === 'user'
                                ? 'bg-slate-900 text-white rounded-br-none shadow-xl shadow-slate-200'
                                : 'bg-slate-50 text-slate-900 rounded-bl-none border border-slate-100'
                        )}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {msg.role === 'ai' && (msg.advice || msg.action) && (
                                <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-3">
                                    {msg.advice && (
                                        <div className="flex gap-2.5 items-start text-xs font-bold text-slate-400 italic">
                                            <Sparkles className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />
                                            <span>{msg.advice}</span>
                                        </div>
                                    )}
                                    {msg.action && (
                                        <div className="inline-flex px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Rec: {msg.action}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-end gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] rounded-bl-none border border-slate-100 flex items-center gap-3 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing Stream...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-slate-50 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="relative group">
                    <Textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Inquire about your flow... e.g. 'Audit my Starbucks spend'"
                        className="min-h-[60px] max-h-[120px] rounded-2xl bg-slate-50 border-slate-100 p-5 pr-14 text-sm font-medium focus-visible:ring-blue-600/10 focus-visible:border-blue-600/20 transition-all resize-none no-scrollbar"
                    />
                    <Button
                        size="icon"
                        className="absolute right-3 bottom-3 h-10 w-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-30"
                        disabled={loading || !query.trim()}
                        onClick={handleSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
