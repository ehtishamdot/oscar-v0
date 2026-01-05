'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Info, Home } from 'lucide-react';

function SummaryContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';

  const { getPatientById, triageSessions } = useDemo();

  const patient = getPatientById(patientId);
  const session = triageSessions.find(s => s.patientId === patientId);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
              Bedankt voor het Invullen
            </h1>
            <p className="text-muted-foreground">
              {patient?.name}, uw antwoorden zijn opgeslagen.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Uw Situatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Op basis van uw antwoorden lijkt er op dit moment geen directe behoefte aan aanvullende zorg. Dit is goed nieuws!
              </p>

              <Alert>
                <AlertDescription>
                  Blijf goed voor uzelf zorgen en let op veranderingen in uw klachten. Mochten uw klachten toenemen of veranderen, kunt u altijd opnieuw de vragenlijst invullen.
                </AlertDescription>
              </Alert>

              {session?.hasRedFlags && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Er zijn waarschuwingssignalen gedetecteerd. Neem contact op met uw huisarts als u dit nog niet heeft gedaan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/demo">
                <Home className="mr-2 h-4 w-4" />
                Terug naar Start
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <SummaryContent />
    </Suspense>
  );
}
