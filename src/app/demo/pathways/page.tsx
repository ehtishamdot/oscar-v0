'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  ArrowRight,
  Activity,
  Stethoscope,
  Salad,
  CigaretteOff,
  Brain,
  Info,
  ShieldCheck,
} from 'lucide-react';

const DISCIPLINE_ICONS: Record<string, React.ReactNode> = {
  fysiotherapie: <Activity className="h-6 w-6" />,
  ergotherapie: <Stethoscope className="h-6 w-6" />,
  dietetiek: <Salad className="h-6 w-6" />,
  stoppen_met_roken: <CigaretteOff className="h-6 w-6" />,
  psychologie: <Brain className="h-6 w-6" />,
};

function PathwaysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const sessionId = searchParams.get('sessionId') || '';

  const { getTriageSessionByPatientId, updateCarePathwaySelection, triageSessions } = useDemo();

  // Find the session directly from state
  const session = triageSessions.find(s => s.id === sessionId);
  const [selections, setSelections] = useState<Record<string, boolean | null>>(() => {
    if (!session) return {};
    return session.carePathways.reduce((acc, pathway) => {
      acc[pathway.id] = pathway.accepted;
      return acc;
    }, {} as Record<string, boolean | null>);
  });

  if (!session) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Sessie niet gevonden. Ga terug naar de triage.</p>
        </main>
      </div>
    );
  }

  const handleSelection = (pathwayId: string, accepted: boolean) => {
    setSelections(prev => ({ ...prev, [pathwayId]: accepted }));
    updateCarePathwaySelection(sessionId, pathwayId, accepted);
  };

  const allDecided = session.carePathways.every(p => selections[p.id] !== null && selections[p.id] !== undefined);
  const acceptedPathways = session.carePathways.filter(p => selections[p.id] === true);

  const handleContinue = () => {
    if (acceptedPathways.length > 0) {
      // Go to intake for first accepted pathway
      const firstPathway = acceptedPathways[0];
      router.push(`/demo/intake/${firstPathway.discipline}?patientId=${patientId}&sessionId=${sessionId}`);
    } else {
      // No pathways selected, go to summary
      router.push(`/demo/summary?patientId=${patientId}&sessionId=${sessionId}`);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
              Aanbevolen Zorgtrajecten
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Op basis van uw triage bevelen wij de volgende zorgtrajecten aan. U kunt elk traject accepteren of afwijzen.
            </p>
          </div>

          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              U beslist zelf welke zorg u wilt ontvangen. Door een traject te accepteren geeft u aan gemotiveerd te zijn om deze zorg te volgen.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {session.carePathways.map((pathway) => (
              <Card
                key={pathway.id}
                className={`border-2 transition-all ${
                  selections[pathway.id] === true
                    ? 'border-green-500 bg-green-50'
                    : selections[pathway.id] === false
                    ? 'border-muted bg-muted/30'
                    : 'border-primary/20'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {DISCIPLINE_ICONS[pathway.discipline]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pathway.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">Aanbevolen</Badge>
                      </div>
                    </div>
                    {selections[pathway.id] === true && (
                      <Badge className="bg-green-600">Geaccepteerd</Badge>
                    )}
                    {selections[pathway.id] === false && (
                      <Badge variant="outline">Afgewezen</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{pathway.description}</p>

                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Waarom aanbevolen:</p>
                    <p className="text-sm text-muted-foreground">{pathway.reasonForRecommendation}</p>
                  </div>

                  {selections[pathway.id] === null || selections[pathway.id] === undefined ? (
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleSelection(pathway.id, true)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accepteren
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSelection(pathway.id, false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Afwijzen
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelections(prev => ({ ...prev, [pathway.id]: null }))}
                    >
                      Keuze wijzigen
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          {allDecided && (
            <Card className="mt-6 border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Uw Selectie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {acceptedPathways.length > 0 ? (
                  <>
                    <p className="text-muted-foreground">
                      U heeft {acceptedPathways.length} zorgtraject{acceptedPathways.length > 1 ? 'en' : ''} geaccepteerd:
                    </p>
                    <ul className="space-y-2">
                      {acceptedPathways.map(p => (
                        <li key={p.id} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          {p.name}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      U gaat nu de intake invullen voor elk geaccepteerd traject.
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    U heeft alle zorgtrajecten afgewezen. U kunt altijd later terugkomen als u van gedachten verandert.
                  </p>
                )}

                <Button className="w-full" onClick={handleContinue}>
                  {acceptedPathways.length > 0 ? 'Naar Intake' : 'Afsluiten'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PathwaysPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <PathwaysContent />
    </Suspense>
  );
}
