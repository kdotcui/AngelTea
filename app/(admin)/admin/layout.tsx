'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  onAuthChange,
  signInWithGooglePopup,
  signOutUser,
} from '@/lib/firebase';
import { isAdmin } from '@/services/admins';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        const allowed = await isAdmin(u.uid);
        if (!allowed) {
          setUser(null);
          setReady(true);
          return;
        }
      }
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <main className="grid min-h-[80vh] place-items-center p-6">Loading…</main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[80vh] place-items-center p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="text-muted-foreground">
            Sign in with a permitted Google account.
          </p>
          <Button onClick={() => signInWithGooglePopup()}>
            Sign in with Google
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100vh] bg-muted">
      <div className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-primary">
              Angel Tea
            </span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:text-secondary" href="/admin">
              Dashboard
            </Link>
            <Link className="hover:text-secondary" href="/admin/plinko-redemption">
              🎁 Plinko Prizes
            </Link>
            <Link className="hover:text-secondary" href="/">
              View site
            </Link>
            <div className="ml-2 flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">
                {(() => {
                  const base = (user.displayName || user.email || 'A').trim();
                  const parts = base.includes(' ')
                    ? base.split(/\s+/)
                    : base.split('@')[0].split(/[._-]+/);
                  const letters = parts
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]);
                  return letters.join('').toUpperCase() || 'A';
                })()}
              </span>
              <Button size="sm" variant="outline" onClick={() => signOutUser()}>
                Log out
              </Button>
            </div>
          </nav>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
