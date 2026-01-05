"use client";

import Header from '@/components/header';
import IntroSection from '@/components/intro-section';

export default function Home() {

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="grid gap-12 md:gap-16">
            <IntroSection />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
