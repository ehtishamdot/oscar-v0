'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/header';
import UniversalIntakeForm from '@/components/universal-intake-form';

type Pathway = 'fysio' | 'ergo' | 'diet' | 'smoking' | 'gli';

function IntakeContent() {
  const searchParams = useSearchParams();

  // Get selected pathways from query params
  const pathways: Pathway[] = [];
  if (searchParams.get('physio') === 'true' || searchParams.get('fysio') === 'true') pathways.push('fysio');
  if (searchParams.get('ergo') === 'true') pathways.push('ergo');
  if (searchParams.get('diet') === 'true') pathways.push('diet');
  if (searchParams.get('smoking') === 'true') pathways.push('smoking');
  if (searchParams.get('gli') === 'true') pathways.push('gli');

  // Default to fysio if no pathways selected
  if (pathways.length === 0) {
    pathways.push('fysio');
  }

  // Get initial answers for display
  const initialAnswers = {
    physio: searchParams.get('physio') === 'true' || searchParams.get('fysio') === 'true',
    ergo: searchParams.get('ergo') === 'true',
    diet: searchParams.get('diet') === 'true',
    smoking: searchParams.get('smoking') === 'true',
    gli: searchParams.get('gli') === 'true',
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <UniversalIntakeForm
        pathways={pathways}
        initialAnswers={initialAnswers}
      />
    </div>
  );
}

export default function IntakePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Intakeformulier laden...</div>}>
          <IntakeContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
