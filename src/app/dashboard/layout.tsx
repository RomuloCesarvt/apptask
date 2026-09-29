import React from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#09090b]">
        <div className="z-10 flex h-full w-full bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_35%),linear-gradient(225deg,rgba(16,185,129,0.06),transparent_40%)]">
          <Sidebar />
          <main className="flex h-full flex-1">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
