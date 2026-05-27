'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

type UserRole = 'sponsor' | 'publisher' | null;

interface NavLink {
  href: string;
  label: string;
}

export function Nav() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fetch the user's role; role-gated links are always guarded by `user`,
  // so a stale role is never rendered after logout.
  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setRole(data.role);
      })
      .catch(() => {
        if (active) setRole(null);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const links: NavLink[] = [{ href: '/marketplace', label: 'Marketplace' }];
  if (user && role === 'sponsor') links.push({ href: '/dashboard/sponsor', label: 'My Campaigns' });
  if (user && role === 'publisher')
    links.push({ href: '/dashboard/publisher', label: 'My Ad Slots' });

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        },
      },
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-[var(--color-foreground)]"
          style={{ fontWeight: 500 }}
        >
          Anvara
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors hover:text-[var(--color-foreground)] ${
                isActive(l.href)
                  ? 'text-[var(--color-foreground)]'
                  : 'text-[var(--color-muted)]'
              }`}
            >
              <span className="relative">
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-1.5 left-0 h-px w-full bg-[var(--color-secondary)]" />
                )}
              </span>
            </Link>
          ))}

          {isPending ? (
            <span className="text-sm text-[var(--color-muted)]">···</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-muted)]">
                {user.name}
                {role && <span className="text-[var(--color-muted)]/70"> · {role}</span>}
              </span>
              <button
                onClick={signOut}
                className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-primary-soft)]"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded border border-[var(--color-border)] md:hidden"
        >
          <span className="text-lg leading-none">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fade border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded px-3 py-2.5 text-sm ${
                  isActive(l.href)
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-foreground)]'
                    : 'text-[var(--color-muted)]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[var(--color-border)] pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-muted)]">{user.name}</span>
                  <button
                    onClick={signOut}
                    className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block rounded bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm text-[var(--color-on-primary)]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
