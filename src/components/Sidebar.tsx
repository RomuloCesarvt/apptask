"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const projects = ["Website Redesign", "Mobile App MVP", "Q3 Marketing"];
  const router = useRouter();
  const [userLabel, setUserLabel] = useState("Conta conectada");
  const [userInitial, setUserInitial] = useState("T");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const profileName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name;
      const label = profileName || data.user?.email || "Conta conectada";
      setUserLabel(label);
      setUserInitial(label.charAt(0).toUpperCase());
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };
  
  return (
    <div className="w-64 h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col hidden md:flex">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h1 className="font-bold text-white tracking-wide">TaskFlow Pro</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspaces</h3>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Acme Corp
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Startup Inc
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Projetos</h3>
          <div className="space-y-1">
            {projects.map((proj, i) => (
              <button key={i} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${i === 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                {proj}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">{userInitial}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userLabel}</p>
            <p className="text-xs text-gray-500 truncate">Admin</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
