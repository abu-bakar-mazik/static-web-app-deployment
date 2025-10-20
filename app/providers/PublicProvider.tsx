'use client';
import { ReactNode } from 'react';
import { AuthGuard } from '@/components/AuthGuard';

export function PublicProvider({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
}