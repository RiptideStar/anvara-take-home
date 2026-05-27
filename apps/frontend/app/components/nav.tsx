'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

type UserRole = 'sponsor' | 'publisher' | null;

export function Nav() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);

  // Fetch user role from backend when user is logged in. Role-gated UI below is
  // always guarded by a truthy `user`, so a stale role is never rendered after
  // logout — no synchronous reset needed.
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

  // TODO: Add active link styling using usePathname() from next/navigation
  // The current page's link should be highlighted differently

  return (
    <header className="border-b border-[--color-border]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-[--color-primary]">
          Anvara
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/marketplace"
            className="text-[--color-muted] hover:text-[--color-foreground]"
          >
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
              My Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
              My Ad Slots
            </Link>
          )}

          {isPending ? (
            <span className="text-[--color-muted]">...</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[--color-muted]">
                {user.name} {role && `(${role})`}
              </span>
              <button
                onClick={async () => {
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = '/';
                      },
                    },
                  });
                }}
                className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:bg-[--color-primary-hover]"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
