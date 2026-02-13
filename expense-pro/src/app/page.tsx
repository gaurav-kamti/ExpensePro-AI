'use client'
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardPage from "@/components/dashboard/DashboardPage";
import LandingPage from "@/components/landing/LandingPage";
import { Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 animate-pulse">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
          <Loader2 className="h-3 w-3 animate-spin" /> Initializing AI Engine...
        </div>
      </div>
    );
  }

  return user ? (
    <DashboardPage user={user} onLogout={handleLogout} />
  ) : (
    <LandingPage />
  );
}