import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import './workspace.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
