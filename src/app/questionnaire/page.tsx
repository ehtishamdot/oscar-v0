'use client';

import Header from '@/components/header';
import Questionnaire from '@/components/questionnaire';

export default function QuestionnairePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <Questionnaire />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
