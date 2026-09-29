"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Validando acesso...");

  useEffect(() => {
    const finishLogin = async () => {
      const providerError = searchParams.get("error_description") || searchParams.get("error");

      if (providerError) {
        router.replace(`/?auth_error=${encodeURIComponent(providerError)}`);
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        setStatus("Conectando sua conta...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace(`/?auth_error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      router.replace(data.session ? "/dashboard" : "/");
    };

    finishLogin();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
        <h1 className="text-lg font-semibold">Entrando no TaskFlow Pro</h1>
        <p className="mt-2 text-sm text-gray-400">{status}</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
