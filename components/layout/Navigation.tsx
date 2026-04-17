'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

function getDisplayName(user: any) {
  if (!user) return '';
  return (
    user?.full_name ||
    user?.username ||
    user?.name ||
    (user?.email ? String(user.email).split('@')[0] : '')
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (prefix: string) => pathname?.startsWith(prefix) ?? false;

  const navLinks = [
    { href: '/modules', label: 'Modules', active: isActive('/modules') },
    { href: '/speaking', label: 'Speaking', active: isActivePrefix('/speaking') },
    { href: '/writing', label: 'Writing', active: isActivePrefix('/writing') },
    { href: '/listening', label: 'Listening', active: isActivePrefix('/listening') },
    { href: '/reading', label: 'Reading', active: isActivePrefix('/reading') },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-14 w-[220px] overflow-hidden sm:w-[240px] lg:w-[260px]">
              <Image
                src="/images/login_signup_img.png"
                alt="IELTS Tutor"
                fill
                priority
                className="object-contain object-left scale-[2.15] origin-left"
              />
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  link.active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    link.active ? 'bg-blue-400' : 'bg-transparent group-hover:bg-blue-400'
                  }`}
                />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="inline-flex max-w-[180px] items-center gap-2 truncate rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold uppercase text-blue-700">
                    {getDisplayName(user).charAt(0)}
                  </span>
                  <span className="truncate">{getDisplayName(user)}</span>
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/login?next=${encodeURIComponent(pathname || '/modules')}`}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link
                  href={`/signup?next=${encodeURIComponent(pathname || '/modules')}`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 shadow-lg md:hidden">
          <div className="space-y-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  link.active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${link.active ? 'bg-blue-500' : 'bg-slate-300'}`} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold uppercase text-blue-700">
                    {getDisplayName(user).charAt(0)}
                  </span>
                  <p className="text-xs font-medium text-slate-500">{getDisplayName(user)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/login?next=${encodeURIComponent(pathname || '/modules')}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link
                  href={`/signup?next=${encodeURIComponent(pathname || '/modules')}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}