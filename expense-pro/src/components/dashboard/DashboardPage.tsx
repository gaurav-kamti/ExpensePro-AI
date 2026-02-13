'use client'
import { useState, useEffect, useMemo } from "react";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { cn } from "@/lib/utils";
import ExpenseEntryForm from "@/components/forms/ExpenseEntryForm";
import ChatSection from "@/components/chat/ChatSection";
import SpendingInsights from "@/components/dashboard/SpendingInsights";
import GoalTracker from "@/components/dashboard/GoalTracker";
import ForecasterWidget from "@/components/dashboard/ForecasterWidget";
import ActivityCalendar from "@/components/dashboard/ActivityCalendar";
import MonthSummary from "@/components/dashboard/MonthSummary";
import { createClient } from "@/lib/supabase/client";
import { syncExpenses, fetchCloudExpenses } from "@/lib/supabase/expenses";
import LoginDialog from "@/components/auth/LoginDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    BrainCircuit,
    History as HistoryIcon,
    Sparkles,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    Target,
    Calendar as CalendarIcon,
    Edit2,
    Cloud,
    LogOut,
    User as UserIcon,
    LayoutDashboard,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";

const EditDialog = ({ expense, onSave }: { expense: any, onSave: (updated: any) => void }) => {
    const [amount, setAmount] = useState(expense.amount);
    const [category, setCategory] = useState(expense.category);
    const [subcategory, setSubcategory] = useState(expense.subcategory || '');

    return (
        <DialogContent className="max-w-sm rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
                <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Edit Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Amount (₹)</label>
                    <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Category</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex gap-3 mt-6">
                <DialogClose asChild>
                    <Button variant="ghost" className="flex-1 font-bold h-12 rounded-2xl text-slate-400">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        onClick={() => onSave({ ...expense, amount, category, subcategory })}
                        className="flex-1 font-black h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100"
                    >
                        Save
                    </Button>
                </DialogClose>
            </div>
        </DialogContent>
    );
};

export default function DashboardPage({ user, onLogout }: { user: any, onLogout: () => void }) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const saved = localStorage.getItem('expense_history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const migrated = parsed.map((e: any, i: number) => ({
                    ...e,
                    id: e.id || (Date.now() - i)
                }));
                setExpenses(migrated);
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }

        if (user) handleCloudSync();
    }, [user]);

    const handleCloudSync = async () => {
        setSyncing(true);
        try {
            const cloudData = await fetchCloudExpenses();
            setExpenses(prev => {
                const combined = [...cloudData];
                const cloudIds = new Set(cloudData.map(e => e.id));
                prev.forEach(local => {
                    if (!cloudIds.has(local.id)) combined.push(local);
                });
                return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('expense_history', JSON.stringify(expenses));
        if (user && !syncing) {
            syncExpenses(expenses);
        }
    }, [expenses, user]);

    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return expenses.filter(e => {
            const eDate = new Date(e.date);
            if (filter === 'today') return e.date === todayStr;
            if (filter === 'week') return eDate >= startOfWeek;
            if (filter === 'month') return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
            return true;
        });
    }, [expenses, filter]);

    const handleAddExpense = (newExpense: any) => {
        setExpenses((prev) => [{ ...newExpense, id: Date.now() }, ...prev]);
    };

    const deleteExpense = (id: number) => {
        if (!id) return;
        if (confirm("Delete this record permanently?")) {
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        }
    };

    const updateExpense = (id: number, updatedExpense: any) => {
        setExpenses((prev) => prev.map((e) => e.id === id ? updatedExpense : e));
    };

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear all records? This cannot be undone.")) {
            setExpenses([]);
        }
    };

    const totalIncome = expenses.reduce((acc, curr) => curr.type === 'income' ? acc + Number(curr.amount || 0) : acc, 0);
    const totalExpense = expenses.reduce((acc, curr) => curr.type === 'expense' ? acc + Number(curr.amount || 0) : acc, 0);
    const balance = totalIncome - totalExpense;

    return (
        <main className="min-h-screen bg-[#f8fafc] p-4 md:p-10 max-w-3xl mx-auto space-y-8">
            <header className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl shadow-blue-100/20">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-[1.25rem] shadow-lg shadow-blue-200">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">ExpensePro <span className="text-blue-600">AI</span></h1>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Master Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className={cn("h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 relative", user && "text-blue-600")}>
                                {user ? <UserIcon className="h-5 w-5" /> : <Cloud className="h-5 w-5" />}
                                {syncing && <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full animate-ping" />}
                            </Button>
                        </DialogTrigger>
                        {user ? (
                            <DialogContent className="max-w-xs rounded-[2rem] border-none shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-black uppercase text-center text-slate-400">Vault Access</DialogTitle>
                                </DialogHeader>
                                <div className="py-6 space-y-6 text-center">
                                    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center">
                                        <UserIcon className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-slate-400">Connected As</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Layer</p>
                                        <p className="text-[11px] font-bold text-green-600">Cloud Sync Protocol Active</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest gap-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                        onClick={clearHistory}
                                    >
                                        <Trash2 className="h-4 w-4" /> Clear History
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        onClick={onLogout}
                                    >
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </Button>
                                </div>
                            </DialogContent>
                        ) : <LoginDialog />}
                    </Dialog>
                </div>
            </header>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 rounded-[2rem] bg-slate-900 border-none shadow-2xl shadow-slate-200 text-white relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <Wallet className="h-5 w-5 text-blue-400 mb-4" />
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Portfolio Balance</p>
                    <p className="text-3xl font-black tracking-tight">₹{balance.toLocaleString()}</p>
                </Card>
                <Card className="p-6 rounded-[2rem] bg-white border-none shadow-xl shadow-slate-200/50 group">
                    <ArrowUpCircle className="h-5 w-5 text-green-500 mb-4" />
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Total Income</p>
                    <p className="text-3xl font-black tracking-tight text-slate-900">₹{totalIncome.toLocaleString()}</p>
                </Card>
                <Card className="p-6 rounded-[2rem] bg-white border-none shadow-xl shadow-slate-200/50 group">
                    <ArrowDownCircle className="h-5 w-5 text-red-500 mb-4" />
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Total Spent</p>
                    <p className="text-3xl font-black tracking-tight text-slate-900">₹{totalExpense.toLocaleString()}</p>
                </Card>
            </div>

            <ForecasterWidget expenses={expenses} balance={balance} />

            <Tabs defaultValue="log" className="w-full">
                <TabsList className="bg-white/50 backdrop-blur-lg border border-white p-1.5 rounded-[1.5rem] shadow-sm flex mb-8">
                    <TabsTrigger value="log" className="flex-1 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Record</TabsTrigger>
                    <TabsTrigger value="insights" className="flex-1 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Insights</TabsTrigger>
                    <TabsTrigger value="goals" className="flex-1 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Goals</TabsTrigger>
                    <TabsTrigger value="chat" className="flex-1 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Advisor</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-10 focus:outline-none">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Activity Pulse</h3>
                        </div>
                        <ActivityCalendar expenses={expenses} />
                    </div>

                    <MonthSummary expenses={expenses} />

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Deep Metrics</h3>
                        </div>
                        <SpendingInsights expenses={expenses} />
                    </div>
                </TabsContent>

                <TabsContent value="goals" className="focus:outline-none">
                    <GoalTracker balance={balance} />
                </TabsContent>

                <TabsContent value="log" className="space-y-10 focus:outline-none">
                    <ExpenseEntryForm onExpenseAdded={handleAddExpense} />

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                                <h3 className="text-lg font-black tracking-tight text-slate-900">Operation History</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{filteredExpenses.length} Logs</p>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                            {[
                                { id: 'all', label: 'Infinity' },
                                { id: 'today', label: 'Today' },
                                { id: 'week', label: 'Week' },
                                { id: 'month', label: 'Month' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                        filter === f.id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600 shadow-sm"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <Card className="rounded-[2.5rem] border-none bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <CardContent className="p-2">
                                {filteredExpenses.length === 0 ? (
                                    <div className="text-center py-24 bg-slate-50/50 rounded-[2rem]">
                                        <HistoryIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Operational Data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredExpenses.slice(0, 50).map((expense) => (
                                            <div key={expense.id} className="flex justify-between items-center p-6 rounded-[2rem] hover:bg-slate-50 transition-all group">
                                                <div className="flex gap-5 items-center">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                                        expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    )}>
                                                        {expense.type === 'income' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-base text-slate-900 mb-1">{expense.category}</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80">
                                                            {expense.date} • {expense.subcategory || 'General'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <p className={cn(
                                                            "font-black text-lg",
                                                            expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                        )}>
                                                            {expense.type === 'income' ? '+' : '-'} ₹{Number(expense.amount).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold italic truncate max-w-[150px]">
                                                            {expense.advice}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm">
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <EditDialog expense={expense} onSave={(updated) => updateExpense(expense.id, updated)} />
                                                        </Dialog>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 shadow-sm"
                                                            onClick={() => deleteExpense(expense.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="chat" className="focus:outline-none">
                    <ChatSection history={expenses} />
                </TabsContent>
            </Tabs>
        </main>
    );
}
