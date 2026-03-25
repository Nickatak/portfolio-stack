'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
interface NavigationProps {
  displayName: string;
}

export default function Navigation({ displayName }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          <span className="text-accent-500 dark:text-accent-400">{displayName}</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 w-6 h-6 relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-full h-0.5 bg-zinc-900 dark:bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
          <div className={`w-full h-0.5 bg-zinc-900 dark:bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`w-full h-0.5 bg-zinc-900 dark:bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/projects', label: 'Work' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
                  : 'text-zinc-900 dark:text-white hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
            <div className="flex flex-col gap-2 p-6">
              {[
                { href: '/', label: 'Home' },
                { href: '/projects', label: 'Work' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
                      : 'text-zinc-900 dark:text-white hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
