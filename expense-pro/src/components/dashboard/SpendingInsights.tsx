'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { Sparkles, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#4b5563', '#94a3b8'];

export default function SpendingInsights({ expenses }: { expenses: any[] }) {
    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        expenses.filter(e => e.type === 'expense').forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const weeklyData = useMemo(() => {
        const days: Record<string, number> = {};
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(day => days[day] = 0);

        expenses.filter(e => e.type === 'expense').forEach(e => {
            if (days[e.date] !== undefined) {
                days[e.date] += Number(e.amount);
            }
        });

        return Object.entries(days).map(([name, amount]) => ({
            name: new Date(name).toLocaleDateString('en-IN', { weekday: 'short' }),
            amount
        }));
    }, [expenses]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest text-slate-400">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 transition-transform group-hover:scale-110">
                                <PieChartIcon className="h-4 w-4" />
                            </div>
                            Allocations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-4">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={48}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <PieChartIcon className="h-10 w-10 text-slate-100" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Data Pending</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest text-slate-400">
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 transition-transform group-hover:scale-110">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-4">
                        {expenses.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 12 }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <BarChart3 className="h-10 w-10 text-slate-100" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Trend Inactive</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none bg-slate-900 shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform" />
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                        <Sparkles className="h-4 w-4" />
                        Neural Audit
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <p className="text-lg font-bold leading-relaxed text-white italic">
                        {categoryData.length > 0
                            ? `Structural analysis indicates high resource drain on "${categoryData.sort((a, b) => b.value - a.value)[0].name}". A 15% reduction would stabilize your quarterly projection.`
                            : "Awaiting behavioral data to initiate the auditing sequence. Proceed with recordings."
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
