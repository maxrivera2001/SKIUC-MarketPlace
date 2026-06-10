'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handlePublicar = () => {
    if (!user) {
      handleSignIn();
    } else {
      router.push('/publicar');
    }
  };

  return (
    <nav className="bg-navy-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-md px-2 py-1">
              <span className="text-navy-700 font-black text-lg tracking-tight">SKIUC</span>
            </div>
            <span className="hidden sm:block text-white font-semibold text-sm opacity-90">
              Marketplace
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                onBlur={() => setTimeout(() => setCatMenuOpen(false), 150)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-600 transition-colors"
              >
                Categorías
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categoria/${cat.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-600 transition-colors"
            >
              Inicio
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublicar}
              className="bg-white text-navy-700 hover:bg-gray-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              + Publicar
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                  className="flex items-center gap-2 bg-navy-600 hover:bg-navy-500 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-24 truncate text-xs">
                    {user.email}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100">
                    <Link
                      href={`/perfil/${user.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Mi perfil
                    </Link>
                    <Link
                      href="/publicar"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Publicar artículo
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Ingresar
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-navy-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-navy-600">
            <div className="grid grid-cols-2 gap-1 pb-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.id}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-navy-600 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
