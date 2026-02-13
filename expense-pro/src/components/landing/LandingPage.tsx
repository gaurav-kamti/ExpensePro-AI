'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Sparkles,
    BrainCircuit,
    ShieldCheck,
    Zap,
    Loader2,
    PieChart,
    Lock,
    ChevronRight,
    Globe,
    Fingerprint
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LandingPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                setError("Verification email sent! Check your inbox.")
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 overflow-x-hidden font-sans">
            {/* Soft Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 blur-[120px] rounded-full opacity-60" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full opacity-60" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-12 md:py-20">
                {/* Navigation */}
                <nav className="flex justify-between items-center mb-16 md:mb-24">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">ExpensePro <span className="text-blue-600">AI</span></h1>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Features</a>
                        <a href="#security" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Security</a>
                        <Button
                            variant="default"
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-11 font-bold shadow-xl shadow-slate-200 transition-all active:scale-95"
                            onClick={() => {
                                setMode('login');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Sign In
                        </Button>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Hero Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">v2.0 Neural Engine</span>
                        </div>

                        <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.85] text-slate-900">
                            MASTERING <br />
                            <span className="text-blue-600">MONEY</span> IS <br />
                            NOW <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">AUTOMATIC.</span>
                        </h2>

                        <p className="text-xl text-slate-500 max-w-lg font-medium leading-relaxed">
                            Stop manual entry. Our AI reads your habits to predict your future wealth. Private, secure, and purely intelligent.
                        </p>

                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-green-50 rounded-xl">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Active Encryption</span>
                            </div>
                            <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-orange-50 rounded-xl">
                                    <Globe className="h-5 w-5 text-orange-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Global Sync</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Auth Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Card className="bg-white/80 backdrop-blur-3xl border-slate-100 shadow-2xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-10 md:p-14">
                                <form className="space-y-8" onSubmit={handleAuth}>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                        </h3>
                                        <p className="text-slate-500 font-medium">
                                            {mode === 'login' ? 'Let\'s manage your growth today.' : 'Join the most advanced AI tracker.'}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Input
                                                type="email"
                                                placeholder="Email Address"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-slate-50/50 border-slate-200 h-14 rounded-2xl focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                type="password"
                                                placeholder="Secret Password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-slate-50/50 border-slate-200 h-14 rounded-2xl focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                            mode === 'login' ? 'Identify Me' : 'Start My Journey'
                                        )}
                                    </Button>

                                    <div className="relative pt-4">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-slate-300">or change flow</span></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        className="w-full text-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors py-2"
                                    >
                                        {mode === 'login' ? "New here? Setup a Neural Account" : "Registered? Identify yourself"}
                                    </button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Modern Feature Grid */}
                <div id="features" className="mt-32 md:mt-48 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: <BrainCircuit className="h-7 w-7 text-blue-600" />,
                            title: "AI Time Traveler",
                            desc: "Predicts zero-balance dates based on your weekly momentum. The future of math."
                        },
                        {
                            icon: <PieChart className="h-7 w-7 text-indigo-600" />,
                            title: "Rich Analytics",
                            desc: "Beautifully rendered charts that expose where your money is actually escaping."
                        },
                        {
                            id: "security",
                            icon: <Fingerprint className="h-7 w-7 text-slate-900" />,
                            title: "Biometric Grade",
                            desc: "Encryption that never sleeps. Your data is isolated from the rest of the world."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            id={(feature as any).id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="p-10 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200 transition-all group"
                        >
                            <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-blue-50 transition-colors">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-black mb-3 tracking-tight text-slate-900">{feature.title}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <footer className="mt-40 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-900 rounded-xl">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">&copy; 2026 ExpensePro AI</p>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-600 transition-colors">Privacy</button>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-600 transition-colors">Terms</button>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-600 transition-colors">Network</button>
                    </div>
                </footer>
            </main>
        </div>
    )
}
