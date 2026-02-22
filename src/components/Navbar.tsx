import React from 'react';
import { Zap, LayoutDashboard, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  user: any;
  profile: any;
  view: string;
  setView: (view: 'browse' | 'dashboard' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, profile, view, setView }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0f1a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('browse')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">Campus Plug</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <button 
                onClick={() => setView('dashboard')} 
                className={`p-2 rounded-lg transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                title="My Gear Hub"
              >
                <LayoutDashboard className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setView('profile')} 
                className={`p-2 rounded-lg transition-all ${view === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                title="Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-rose-500 transition-all"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold border-2 border-white/10 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-white">{profile?.full_name?.substring(0, 2).toUpperCase() || 'U'}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
