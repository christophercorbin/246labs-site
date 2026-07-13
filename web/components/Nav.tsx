"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="246Labs home"
          className="shrink-0"
          onClick={() => setOpen(false)}
        >
          <Logo variant="dark" showIcon className="text-xl" />
        </Link>

        {/* Desktop links — hidden below the sm breakpoint. */}
        <ul className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-xs uppercase tracking-label text-white/80 hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle — only shown below sm. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="text-white/80 hover:text-gold sm:hidden"
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
      </nav>

      {/* Mobile dropdown — rendered only when open, hidden at sm and up. */}
      {open && (
        <ul
          id="mobile-menu"
          className="border-t border-white/10 px-6 pb-4 pt-1 sm:hidden"
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 font-mono text-sm uppercase tracking-label text-white/80 hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
