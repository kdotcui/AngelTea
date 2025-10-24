"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CupSoda, ShoppingBag, Info, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mobile bottom navigation with 5 icons
// Shown on small screens only; hidden on md and above
export default function BottomNav() {
  const pathname = usePathname();

  const items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#menu", label: "Popular", icon: CupSoda },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/#about", label: "About", icon: Info },
    { href: "/#visit", label: "Visit", icon: MapPin },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // Treat hash links as active when on home page
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-5 items-center gap-1 p-1.5">
        {items.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex justify-center">
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "flex h-10 w-full flex-col items-center justify-center gap-0.5 rounded-md text-xs text-muted-foreground hover:text-foreground",
                isActive(href) && "text-foreground bg-accent/50"
              )}
              aria-label={label}
            >
              <Icon className="size-5" />
              <span className="leading-none">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
