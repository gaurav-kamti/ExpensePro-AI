'use client'
import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Calendar, AlertTriangle, Zap, CheckCircle2, Waves } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ForecasterWidget({ expenses, balance }: { expenses: any[], balance: number }) {
    const forecast = useMemo(() => {
        if (expenses.length < 3) return null;

        const today = new Date();
        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return e.type === 'expense' && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });

        if (currentMonthExpenses.length === 0) return null;

        const totalSpentThisMonth = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const dayOfMonth = today.getDate();
        const dailyBurnRate = totalSpentThisMonth / dayOfMonth;

        const runwayDays = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : 999;

        return {
            dailyBurnRate: Math.round(dailyBurnRate),
            runwayDays,
            isEmergency: runwayDays < 7
        };
    }, [expenses, balance]);

    if (!forecast) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-black tracking-tight text-slate-900">Projection Engine</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
                <Card className={cn(
                    "border-none shadow-xl shadow-slate-200/50 transition-all rounded-[2rem] overflow-hidden group",
                    forecast.isEmergency ? "bg-red-50" : "bg-white"
                )}>
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className={cn(
                            "p-4 rounded-[1.25rem] shadow-sm transform group-hover:scale-110 transition-transform",
                            forecast.isEmergency ? "bg-red-100 text-red-600 shadow-red-200/50" : "bg-blue-50 text-blue-600 shadow-blue-100/50"
                        )}>
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">Momentum (Daily)</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{forecast.dailyBurnRate.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none shadow-2xl transition-all rounded-[2rem] text-white relative overflow-hidden group",
                    forecast.isEmergency ? "bg-red-600 shadow-red-200" : "bg-slate-900 shadow-slate-200"
                )}>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <CardContent className="p-8 flex items-center gap-6 relative z-10">
                        <div className={cn(
                            "p-4 rounded-[1.25rem] shadow-sm backdrop-blur-md transition-transform group-hover:rotate-12",
                            forecast.isEmergency ? "bg-white/20" : "bg-white/10"
                        )}>
                            {forecast.isEmergency ? <Waves className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60 mb-1">
                                Runway Projection
                            </p>
                            <p className="text-2xl font-black tracking-tight">
                                {forecast.runwayDays > 100 ? "Infinity" : `${forecast.runwayDays} Days`}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {forecast.isEmergency && (
                    <div className="md:col-span-2 p-6 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] flex items-center gap-4 animate-pulse shadow-sm">
                        <div className="p-2 bg-red-600 text-white rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                            Liquidity Warning: Current burn rate will exhaust total balance in {forecast.runwayDays} cycles.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
