'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/header';
import PhysioIntakeForm from '@/components/physio-intake-form';

function IntakeContent() {
    const searchParams = useSearchParams();
    const service = searchParams.get('service');
    const therapistId = searchParams.get('therapistId');
    const therapistName = searchParams.get('therapistName');

    // Get initial answers from query params
    const initialAnswers = {
      physio: searchParams.get('physio') === 'true',
      ergo: searchParams.get('ergo') === 'true',
      diet: searchParams.get('diet') === 'true',
      smoking: searchParams.get('smoking') === 'true',
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
           {service === 'fysiotherapie' && therapistId && therapistName && (
                <PhysioIntakeForm 
                    therapistId={therapistId} 
                    therapistName={therapistName} 
                    initialAnswers={initialAnswers} 
                />
            )}
            {/* You can add other services here later if needed */}
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
