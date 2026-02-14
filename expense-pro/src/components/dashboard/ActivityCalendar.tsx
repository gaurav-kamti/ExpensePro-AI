'use client'
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    CalendarDays
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ActivityCalendar({ expenses }: { expenses: any[] }) {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const handleMonthChange = (month: string) => {
        const monthIndex = months.indexOf(month);
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    };

    const handleYearChange = (year: string) => {
        setViewDate(new Date(parseInt(year), viewDate.getMonth(), 1));
    };

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    const monthData = useMemo(() => {
        const data: Record<string, { income: number, expense: number, count: number, items: any[] }> = {};
        expenses.forEach(e => {
            const dateStr = e.date;
            if (!data[dateStr]) data[dateStr] = { income: 0, expense: 0, count: 0, items: [] };
            if (e.type === 'income') data[dateStr].income += Number(e.amount);
            else data[dateStr].expense += Number(e.amount);
            data[dateStr].count += 1;
            data[dateStr].items.push(e);
        });
        return data;
    }, [expenses]);

    const monthTotals = useMemo(() => {
        let income = 0;
        let expense = 0;
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                if (e.type === 'income') income += Number(e.amount);
                else expense += Number(e.amount);
            }
        });
        return { income, expense };
    }, [expenses, viewDate]);

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    return (
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white group overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-[1.25rem] text-blue-600 transition-transform group-hover:scale-110 shadow-sm border border-blue-100/50">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={months[viewDate.getMonth()]} onValueChange={handleMonthChange}>
                                    <SelectTrigger className="h-8 w-fit bg-transparent border-none font-black text-lg p-0 focus:ring-0 text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {months.map(m => <SelectItem key={m} value={m} className="font-bold">{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={viewDate.getFullYear().toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className="h-8 w-fit bg-transparent border-none font-black text-lg p-0 text-slate-300 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {years.map(y => <SelectItem key={y} value={y.toString()} className="font-bold">{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-4 p-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Inflow</span>
                                <span className="text-sm font-black text-green-600">₹{monthTotals.income.toLocaleString()}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 mx-1" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Outflow</span>
                                <span className="text-sm font-black text-red-600">₹{monthTotals.expense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50 shadow-sm">
                        <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
                <div className="grid grid-cols-7 gap-px mb-4 opacity-50">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={`${d}-${i}`} className="text-[10px] font-black text-center text-slate-400 py-2 uppercase tracking-widest">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {daysInMonth.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="h-16 md:h-20" />;

                        const dateKey = day.toISOString().split('T')[0];
                        const stats = monthData[dateKey];
                        const isToday = new Date().toISOString().split('T')[0] === dateKey;

                        return (
                            <Dialog key={dateKey}>
                                <DialogTrigger asChild>
                                    <button
                                        className={cn(
                                            "h-16 md:h-20 rounded-2xl border p-2 flex flex-col justify-between transition-all group cursor-pointer text-left focus:outline-none",
                                            isToday ? "border-blue-600 bg-blue-50 ring-4 ring-blue-500/10" : "border-slate-50 bg-slate-50/20 hover:bg-slate-50 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100"
                                        )}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={cn(
                                                "text-xs font-black",
                                                isToday ? "text-blue-600 shadow-sm" : "text-slate-900"
                                            )}>
                                                {day.getDate()}
                                            </span>
                                            {stats && stats.count > 0 && (
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                            )}
                                        </div>

                                        {stats ? (
                                            <div className="space-y-1 overflow-hidden w-full">
                                                {stats.income > 0 && (
                                                    <div className="h-1.5 w-full bg-green-500/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 w-[60%]" />
                                                    </div>
                                                )}
                                                {stats.expense > 0 && (
                                                    <div className="h-1.5 w-full bg-red-500/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-500 w-[80%]" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-4" />
                                        )}
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300">
                                    <DialogHeader className="p-8 bg-blue-600 border-b border-blue-500/20 text-white relative">
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                        <DialogTitle className="flex items-center gap-4 relative z-10">
                                            <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-xl shadow-blue-900/20">
                                                <CalendarIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black tracking-tight">{day.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-100">
                                                        <ArrowUpRight className="h-3 w-3 mr-1" /> ₹{(stats?.income || 0).toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-100">
                                                        <ArrowDownRight className="h-3 w-3 mr-1" /> ₹{(stats?.expense || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogTitle>
                                        <p className="sr-only">Detailed breakdown of financial activities for this date.</p>
                                    </DialogHeader>
                                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white no-scrollbar">
                                        {(!stats || stats.items.length === 0) ? (
                                            <div className="py-24 text-center space-y-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                                                    <Info className="h-8 w-8 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">System Idle<br />No logs detected.</p>
                                            </div>
                                        ) : (
                                            stats.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:border-blue-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg",
                                                            item.type === 'income' ? "bg-green-100 text-green-600 shadow-green-100/50" : "bg-red-100 text-red-600 shadow-red-100/50"
                                                        )}>
                                                            {item.type === 'income' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900 leading-tight mb-1">{item.subcategory || item.category}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={cn(
                                                            "text-lg font-black",
                                                            item.type === 'income' ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {item.type === 'income' ? '+' : '-'} ₹{Number(item.amount).toLocaleString()}
                                                        </p>
                                                        {item.advice && (
                                                            <p className="text-[10px] text-slate-400 font-bold italic max-w-[150px] truncate mt-1">{item.advice}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        );
                    })}
                </div>
            </CardContent>
        </Card >
    );
}
