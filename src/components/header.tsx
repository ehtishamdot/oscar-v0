'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/questionnaire', label: 'Vragenlijst' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Hide Start button on questionnaire, results, and intake pages
  const hideStartButton = pathname.startsWith('/questionnaire') ||
                          pathname.startsWith('/results') ||
                          pathname.startsWith('/intake');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-9 w-9 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            Oscar
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
          {!hideStartButton && (
            <div className="ml-2 pl-2 border-l">
              <Button asChild size="sm">
                <Link href="/questionnaire" className="gap-2">
                  Start Nu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile: Just show Start button (hidden on questionnaire pages) */}
        {!hideStartButton && (
          <div className="md:hidden">
            <Button asChild size="sm">
              <Link href="/questionnaire" className="gap-2">
                Start
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
