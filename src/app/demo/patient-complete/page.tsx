'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, FileText, ArrowRight, Users } from 'lucide-react';

function PatientCompleteContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const sessionId = searchParams.get('sessionId') || '';

  const { getPatientById, triageSessions, intakeSummaries } = useDemo();

  const patient = getPatientById(patientId);
  const session = triageSessions.find(s => s.id === sessionId);
  const patientIntakes = intakeSummaries.filter(i => i.patientId === patientId);
  const acceptedPathways = session?.carePathways.filter(p => p.accepted) || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
              Intake Voltooid!
            </h1>
            <p className="text-muted-foreground">
              Bedankt, {patient?.name}. Uw gegevens zijn succesvol ontvangen.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uw Aanvraag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Geaccepteerde zorgtrajecten:</p>
                <ul className="mt-2 space-y-1">
                  {acceptedPathways.map(p => (
                    <li key={p.id} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {p.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Ingevulde intakes:</p>
                <ul className="mt-2 space-y-1">
                  {patientIntakes.map(i => (
                    <li key={i.id} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {i.discipline}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Wat Gebeurt Er Nu?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium">Beoordeling door Zorgcoördinator</p>
                    <p className="text-sm text-muted-foreground">Uw intake wordt binnen 24 uur beoordeeld door een zorgcoördinator.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium">Behandelplan Opstellen</p>
                    <p className="text-sm text-muted-foreground">Er wordt een behandelplan opgesteld op basis van uw situatie en verzekering.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium">Koppeling aan Zorgverlener</p>
                    <p className="text-sm text-muted-foreground">U wordt gekoppeld aan een geschikte zorgverlener in uw regio.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium">Afspraak Binnen 3 Dagen</p>
                    <p className="text-sm text-muted-foreground">U krijgt een afspraak aangeboden binnen 3 werkdagen.</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Alert className="mb-6">
            <AlertDescription>
              U ontvangt een e-mail op <strong>{patient?.email}</strong> zodra er nieuws is over uw behandelplan.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/demo/patient?patientId=${patientId}`}>
                Bekijk Mijn Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/demo/coordinator">
                  <Users className="mr-2 h-4 w-4" />
                  Regiehouder
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/demo">
                  Demo Start
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PatientCompletePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <PatientCompleteContent />
    </Suspense>
  );
}
