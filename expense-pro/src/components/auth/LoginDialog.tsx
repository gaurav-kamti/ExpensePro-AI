'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { LogIn, UserPlus, Loader2, Cloud, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginDialog() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    const supabase = createClient()

    const handleAuth = async () => {
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
        <DialogContent className="max-w-md bg-white border-none rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
                <DialogHeader className="relative z-10 text-left">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/10 shadow-xl">
                        <Cloud className="h-7 w-7 text-blue-400" />
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tight mb-2">
                        {mode === 'login' ? 'Nexus Login' : 'Create Vault'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm font-medium leading-relaxed">
                        Access your decentralized financial records from any terminal. Fully encrypted.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-10 space-y-6 bg-white">
                {error && (
                    <div className={cn(
                        "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-2",
                        error.includes('sent') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    )}>
                        <Sparkles className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Identity (Email)</label>
                        <Input
                            placeholder="user@nexus.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-blue-500/10 font-bold placeholder:text-slate-300 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Key Phrase (Password)</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-blue-500/10 font-bold placeholder:text-slate-300 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleAuth}
                        disabled={loading || !email || !password}
                        className="w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-30"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            mode === 'login' ? <><LogIn className="mr-2 h-5 w-5" /> Authenticate</> : <><UserPlus className="mr-2 h-5 w-5" /> Initialize Account</>
                        )}
                    </Button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-blue-600 transition-colors"
                    >
                        {mode === 'login' ? "Need a new identity? Sign Up" : "Have an existing key? Login"}
                    </button>
                    <p className="text-[9px] text-slate-300 mt-6 font-bold uppercase tracking-widest">End-to-End Encryption Enabled</p>
                </div>
            </div>
        </DialogContent>
    )
}
