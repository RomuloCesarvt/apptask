import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full z-10 animate-fade-in opacity-0">
        <div className="glass rounded-2xl p-8 shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">TaskFlow <span className="text-blue-500">Pro</span></h1>
            <p className="text-gray-400 text-sm">O gerenciador de tarefas hiper-rápido com Actionable Chat.</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2 animate-fade-in opacity-0 delay-100">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">Email corporativo</label>
              <input 
                type="email" 
                id="email"
                placeholder="nome@suaempresa.com" 
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            
            <button 
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 animate-fade-in opacity-0 delay-200"
            >
              Entrar no Workspace
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center animate-fade-in opacity-0 delay-300">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Integração nativa com Supabase Realtime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
