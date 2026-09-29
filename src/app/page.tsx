"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthRedirectUrl, supabase } from '@/lib/supabase';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('auth_error') || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  const validateCredentials = () => {
    if (!email.trim() || !password.trim()) {
      setError('Informe email e senha para continuar.');
      return false;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return false;
    }

    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Login realizado com sucesso! Redirecionando...');
      router.push('/dashboard');
    }

    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!validateCredentials()) return;

    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      setMessage('Conta criada com sucesso! Redirecionando...');
      router.push('/dashboard');
    } else {
      setMessage('Conta criada! Verifique seu email para confirmar.');
    }

    setLoading(false);
  };

  const handleProviderLogin = async (provider: 'google' | 'azure') => {
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden bg-[linear-gradient(135deg,rgba(59,130,246,0.16),transparent_35%),linear-gradient(225deg,rgba(16,185,129,0.10),transparent_42%)]">
      <div className="max-w-md w-full z-10 animate-fade-in opacity-0">
        <div className="glass rounded-lg p-8 shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">TaskFlow <span className="text-blue-500">Pro</span></h1>
            <p className="text-gray-400 text-sm">O gerenciador de tarefas hiper-rápido com Actionable Chat.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}
            {message && <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg text-sm">{message}</div>}

            <div className="space-y-2 animate-fade-in opacity-0 delay-100">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@suaempresa.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2 animate-fade-in opacity-0 delay-100">
              <label className="text-sm font-medium text-gray-300" htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div className="grid gap-2 pt-2 animate-fade-in opacity-0 delay-200 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Aguarde...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Criar Conta
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between animate-fade-in opacity-0 delay-200">
            <span className="w-1/5 border-b border-white/10"></span>
            <span className="text-xs text-center text-gray-500 uppercase">ou continue com</span>
            <span className="w-1/5 border-b border-white/10"></span>
          </div>

          <button
            type="button"
            onClick={() => handleProviderLogin('google')}
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded-lg bg-white text-black hover:bg-gray-200 font-medium transition-all transform hover:-translate-y-0.5 animate-fade-in opacity-0 delay-300 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleProviderLogin('azure')}
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-lg bg-[#2f2f2f] text-white hover:bg-[#3c3c3c] font-medium transition-all transform hover:-translate-y-0.5 animate-fade-in opacity-0 delay-300 flex items-center justify-center gap-2 border border-white/10"
          >
            <span className="grid h-5 w-5 grid-cols-2 gap-0.5">
              <span className="bg-[#f25022]" />
              <span className="bg-[#7fba00]" />
              <span className="bg-[#00a4ef]" />
              <span className="bg-[#ffb900]" />
            </span>
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
