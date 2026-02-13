'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, TrendingUp, Sparkles, X, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
    id: string;
    name: string;
    target: number;
    deadline: string;
    current: number;
}

export default function GoalTracker({ balance }: { balance: number }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newDeadline, setNewDeadline] = useState('');

    // Load goals
    useEffect(() => {
        const saved = localStorage.getItem('savings_goals');
        if (saved) setGoals(JSON.parse(saved));
    }, []);

    // Save goals
    useEffect(() => {
        localStorage.setItem('savings_goals', JSON.stringify(goals));
    }, [goals]);

    const addGoal = () => {
        if (!newName || !newTarget) return;
        const goal: Goal = {
            id: Date.now().toString(),
            name: newName,
            target: Number(newTarget),
            deadline: newDeadline,
            current: 0
        };
        setGoals([...goals, goal]);
        setNewName('');
        setNewTarget('');
        setNewDeadline('');
        setShowAdd(false);
    };

    const removeGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Savings Vault</h3>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowAdd(!showAdd)}
                    className={cn(
                        "rounded-xl font-black uppercase tracking-widest text-[10px] h-9 px-4 transition-all",
                        showAdd ? "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                    )}
                >
                    {showAdd ? <X className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                    {showAdd ? "Close" : "Draft Goal"}
                </Button>
            </div>

            {showAdd && (
                <Card className="rounded-[2rem] border-none bg-white shadow-2xl shadow-blue-100/50 overflow-hidden animate-in slide-in-from-top-4">
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset or Objective</Label>
                                <Input
                                    placeholder="e.g. MacBook Pro M4"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-300 font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="120000"
                                        value={newTarget}
                                        onChange={(e) => setNewTarget(e.target.value)}
                                        className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-300 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline Date</Label>
                                    <Input
                                        type="date"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-blue-500/10 text-slate-900 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                            onClick={addGoal}
                        >
                            Establish Goal
                        </Button>
                    </CardContent>
                </Card>
            )}

            {goals.length === 0 && !showAdd && (
                <div className="text-center py-24 bg-white/50 border border-white rounded-[2.5rem] shadow-sm">
                    <div className="p-4 bg-white rounded-[1.5rem] shadow-sm w-fit mx-auto mb-6">
                        <Trophy className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Missions</p>
                    <p className="text-xs text-slate-300 font-bold mt-2 px-10 leading-relaxed italic">Draft your first financial milestone above.</p>
                </div>
            )}

            <div className="grid gap-6">
                {goals.map(goal => {
                    const progress = Math.min(Math.round((balance / goal.target) * 100), 100);
                    const remaining = Math.max(goal.target - balance, 0);

                    return (
                        <Card key={goal.id} className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden group">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{goal.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quota: ₹{goal.target.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0"
                                        onClick={() => removeGoal(goal.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-3xl font-black text-slate-900">{progress}%</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Progress</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            ETA: {goal.deadline || "TBD"}
                                        </p>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                                        Gap: <span className="text-slate-900 tracking-normal text-xs">₹{remaining.toLocaleString()}</span>
                                    </p>
                                </div>

                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-start gap-4">
                                    <div className="mt-1 p-1 bg-white rounded-lg shadow-sm">
                                        <Sparkles className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                                        {progress > 80 ? "Asset acquisition is imminent. Maintain low volatility in your spend flow." :
                                            progress > 50 ? "Neural goal is halfway mapped. Momentum is optimal." :
                                                "Sustained resource accumulation is recommended to hit the target timeline."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
