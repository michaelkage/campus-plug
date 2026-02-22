import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { MyGearHub } from './components/MyGearHub';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [view, setView] = useState<'browse' | 'dashboard' | 'profile'>('browse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
    } else {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ id: userId, is_verified: false })
        .select()
        .single();
      if (!createError) setProfile(newProfile);
    }
  };

  const handleLogin = async (provider: 'google' | 'microsoft') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) toast.error(`Login failed: ${error.message}`);
  };

  const handleVerify = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', user.id);

    if (error) {
      toast.error('Verification failed');
    } else {
      toast.success('Student ID Verified!');
      setProfile({ ...profile, is_verified: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
        <Toaster position="top-right" theme="dark" />
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl text-center">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4">Campus Plug</h1>
          <p className="text-slate-400 mb-8 font-medium">Borrow gear. Save money. Build your rep.</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('google')}
              className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all uppercase text-sm hover:shadow-lg"
            >
              <Globe className="w-5 h-5"/> Continue with Google
            </button>
            <button 
              onClick={() => handleLogin('microsoft')}
              className="w-full bg-[#2f2f2f] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all uppercase text-sm hover:bg-[#3f3f3f]"
            >
              <ShieldCheck className="w-5 h-5"/> Continue with Microsoft
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" theme="dark" />
      <Navbar user={user} profile={profile} view={view} setView={setView} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {profile && !profile.is_verified && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">Your student status is not verified. Verify now to build trust.</p>
            </div>
            <button 
              onClick={handleVerify}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-black uppercase rounded-xl hover:bg-amber-400 transition-all"
            >
              Verify Student ID
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={view} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'browse' && <MarketplaceFeed user={user} setView={setView} />}
            {view === 'dashboard' && <MyGearHub user={user} />}
            {view === 'profile' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/5 border border-white/5 p-12 rounded-[48px] shadow-3xl text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-indigo-500 flex items-center justify-center text-4xl font-black border-4 border-white/10 mb-6 overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile?.full_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{profile?.full_name || 'Aura User'}</h2>
                  <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-8">{profile?.department || 'Unverified Department'}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-white font-bold flex items-center justify-center gap-2">
                        {profile?.is_verified ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified</> : 'Unverified'}
                      </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Member Since</p>
                      <p className="text-white font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
