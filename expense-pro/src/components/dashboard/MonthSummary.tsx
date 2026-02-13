'use client'
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PieChart as PieChartIcon, Calendar, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MonthSummary({ expenses }: { expenses: any[] }) {
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = monthExpenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const spent = monthExpenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const balance = income - spent;
        const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;

        const categories: Record<string, number> = {};
        monthExpenses.filter(e => e.type === 'expense').forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
        });

        const topCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, value]) => ({ name, value }));

        return { income, spent, balance, savingsRate, topCategories, monthName: now.toLocaleString('default', { month: 'long' }) };
    }, [expenses]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 font-sans">
            <div className="grid grid-cols-2 gap-6">
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-relaxed">Monthly Burn</p>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900">₹{stats.spent.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm border border-red-100/50 group-hover:scale-110 transition-transform">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute right-0 bottom-0 p-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">
                        <TrendingUp className="w-12 h-12 text-slate-900" />
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-relaxed">Safety Margin</p>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900">{stats.savingsRate}%</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100/50 group-hover:scale-110 transition-transform">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute right-0 bottom-0 p-2 opacity-5 scale-150 -rotate-12 transition-transform group-hover:rotate-0">
                        <Calendar className="w-12 h-12 text-slate-900" />
                    </div>
                </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                        <PieChartIcon className="h-4 w-4 text-blue-600" /> High-Density Sectors
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    {stats.topCategories.length > 0 ? (
                        stats.topCategories.map((cat, i) => (
                            <div key={cat.name} className="group">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm border transition-all group-hover:scale-110",
                                            i === 0 ? "bg-slate-900 text-white border-slate-900" :
                                                i === 1 ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            0{i + 1}
                                        </div>
                                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">₹{cat.value.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 shadow-lg",
                                            i === 0 ? "bg-slate-900" : i === 1 ? "bg-blue-600 shadow-blue-200" : "bg-slate-300"
                                        )}
                                        style={{ width: `${(cat.value / stats.spent) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Awaiting Monthly Operational Data</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
