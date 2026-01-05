'use client';

import Header from '@/components/header';
import AboutArtrose from '@/components/about-artrose';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <AboutArtrose />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
