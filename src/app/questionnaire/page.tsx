'use client';

import Header from '@/components/header';
import Questionnaire from '@/components/questionnaire';

export default function QuestionnairePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Questionnaire />
        </div>
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Oscar. Uw gegevens worden veilig verwerkt.
      </footer>
    </div>
  );
}
