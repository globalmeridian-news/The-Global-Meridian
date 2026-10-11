import React from 'react';
import { Shield, Eye, PlusCircle, LogOut, ExternalLink, ArrowRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';

export const AdminFloatingBar: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    activeView,
    setActiveView,
    logoutUser,
    currentLanguage,
  } = useNews();

  // Only show when authenticated and browsing public visitor pages (not already in CMS)
  if (!isAuthenticated || activeView === 'cms') return null;

  const isBn = currentLanguage === 'bn';

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 z-40 animate-in slide-in-from-bottom-3 duration-300">
      <div className="bg-slate-950/95 backdrop-blur-md text-white border border-slate-700/80 rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between sm:justify-start gap-3 text-xs">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-bold text-[11px] leading-tight text-amber-400 capitalize">
              {isBn ? `দর্শক মোড (${currentRole})` : `Reader Mode (${currentRole})`}
            </span>
            <span className="text-[9px] text-slate-400 hidden sm:inline">
              {isBn ? 'সাধারণ পাঠকের মতো দেখছেন' : 'Simulating Public Experience'}
            </span>
          </div>
        </div>

        {/* Quick action: Return to Admin Panel */}
        <button
          onClick={() => setActiveView('cms')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title={isBn ? 'এডমিন প্যানেলে প্রবেশ করুন' : 'Return to Admin CMS'}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isBn ? 'এডমিন প্যানেল' : 'Admin Panel'}</span>
        </button>

        {/* Quick action: Create News from Phone */}
        <button
          onClick={() => {
            setActiveView('cms');
          }}
          className="hidden md:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          title={isBn ? 'সরাসরি নতুন খবর তৈরি' : 'Create News'}
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{isBn ? '+ নতুন খবর' : '+ New Article'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={logoutUser}
          className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          title={isBn ? 'লগআউট' : 'Logout'}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
