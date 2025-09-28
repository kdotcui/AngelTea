import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
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
            <Link className="hover:text-secondary" href="/">
              View site
            </Link>
          </nav>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
