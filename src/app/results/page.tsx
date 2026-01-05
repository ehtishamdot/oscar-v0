"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/header';
import CtaSection from '@/components/cta-section';
import LocalServices from '@/components/local-services';
import {
  Stethoscope,
  Salad,
  CigaretteOff,
  ShieldCheck,
  Activity,
  HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ResultsContent() {
    const searchParams = useSearchParams();

    const careNeeds = {
        physio: searchParams.get('physio') === 'true',
        physioNetwork: searchParams.get('physioNetwork') === 'true',
        ergo: searchParams.get('ergo') === 'true',
        gli: searchParams.get('gli') === 'true',
        diet: searchParams.get('diet') === 'true',
        smoking: searchParams.get('smoking') === 'true',
    };

    const hasNeeds = Object.values(careNeeds).some(need => need);

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
            <div className="grid gap-12 md:gap-16">
                <div className="grid gap-8">
                    <h1 className="text-3xl font-bold tracking-tight text-center font-headline">
                        Uw Persoonlijke Advies
                    </h1>
                    {hasNeeds ? (
                        <>
                            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                                Op basis van uw antwoorden hebben wij de volgende adviezen voor u samengesteld.
                                Deze aanbevelingen kunnen u helpen uw klachten te verminderen en uw kwaliteit van leven te verbeteren.
                            </p>
                            <Card className="bg-secondary/50">
                              <CardHeader className="flex flex-row items-center gap-4">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                                <CardTitle className="text-lg font-semibold">Goed om te weten</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground">
                                  De meeste van de hieronder genoemde behandelingen, zoals fysiotherapie, ergotherapie en dieetadvies,
                                  worden doorgaans vergoed vanuit de basisverzekering. Houd er wel rekening mee dat dit ten koste kan
                                  gaan van uw eigen risico.
                                </p>
                              </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                                {/* Fysiotherapie Advies */}
                                {careNeeds.physio && (
                                    <CtaSection
                                        icon={<HeartPulse className="h-10 w-10 text-primary" />}
                                        title="Fysiotherapie Aanbevolen"
                                        description="Op basis van uw antwoorden lijkt fysiotherapie raadzaam. Een fysiotherapeut kan u helpen met oefeningen en behandelingen om uw gewrichtsklachten te verminderen en uw mobiliteit te verbeteren."
                                        buttonText="Zoek een fysiotherapeut"
                                        buttonLink="/intake?service=fysiotherapie"
                                    >
                                        <LocalServices />
                                    </CtaSection>
                                )}

                                {/* Fysiotherapie Netwerk Advies */}
                                {careNeeds.physioNetwork && !careNeeds.physio && (
                                    <CtaSection
                                        icon={<HeartPulse className="h-10 w-10 text-primary" />}
                                        title="Fysiotherapeut uit ons Netwerk"
                                        description="U heeft aangegeven interesse te hebben in een fysiotherapeut uit ons specifieke netwerk. Onze netwerkpartners zijn gespecialiseerd in artrose behandeling en kunnen u optimaal begeleiden."
                                        buttonText="Bekijk netwerkpartners"
                                        buttonLink="/intake?service=fysiotherapie&network=true"
                                    >
                                        <LocalServices />
                                    </CtaSection>
                                )}

                                {/* Ergotherapie Advies */}
                                {careNeeds.ergo && (
                                    <CtaSection
                                        icon={<Stethoscope className="h-10 w-10 text-primary" />}
                                        title="Ergotherapie voor Dagelijkse Hulp"
                                        description="U geeft aan moeite te hebben met dagelijkse handelingen. Een ergotherapeut kan u helpen om deze activiteiten makkelijker te maken. Ontdek hulpmiddelen en nieuwe manieren om dagelijkse taken uit te voeren."
                                        buttonText="Plan online consult"
                                        buttonLink="/intake?service=ergotherapie"
                                    />
                                )}

                                {/* GLI Advies */}
                                {careNeeds.gli && (
                                    <CtaSection
                                        icon={<Activity className="h-10 w-10 text-primary" />}
                                        title="Gecombineerde Leefstijl Interventie (GLI)"
                                        description="Uw BMI suggereert dat u baat kunt hebben bij het Gecombineerde Leefstijl Interventie (GLI) programma. Dit programma helpt u met het aanpassen van uw leefstijl door middel van begeleide beweging en voedingsadvies."
                                        buttonText="Meer informatie over GLI"
                                        buttonLink="/intake?service=gli"
                                    />
                                )}

                                {/* Diëtist Advies */}
                                {careNeeds.diet && (
                                    <CtaSection
                                        icon={<Salad className="h-10 w-10 text-primary" />}
                                        title="Voedingsadvies van een Diëtist"
                                        description="Advies om een afspraak te maken met een diëtist voor optimalisatie van uw voeding. Een persoonlijk voedingsplan kan helpen bij gewichtsbeheer en kan ontstekingen verminderen die artroseklachten verergeren."
                                        buttonText="Plan online consult"
                                        buttonLink="/intake?service=dietetiek"
                                    />
                                )}

                                {/* Stoppen met Roken Advies */}
                                {careNeeds.smoking && (
                                    <CtaSection
                                        icon={<CigaretteOff className="h-10 w-10 text-primary" />}
                                        title="Hulp bij Stoppen met Roken"
                                        description="Stoppen met roken heeft een direct positief effect op uw herstel. Roken kan artroseklachten verergeren en het genezingsproces vertragen. Wij kunnen u aanmelden voor het stoppen-met-roken programma."
                                        buttonText="Vind begeleiding"
                                        buttonLink="/intake?service=stoppen-met-roken"
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                         <div className="text-center p-8 bg-card rounded-lg border max-w-3xl mx-auto">
                            <div className="mb-4">
                                <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />
                            </div>
                            <p className="text-xl font-semibold mb-4">Goed bezig!</p>
                            <p className="text-muted-foreground">
                                Dank u voor het invullen. Op basis van uw antwoorden lijken er op dit moment geen
                                specifieke aanvullende zorgstappen nodig te zijn. Blijf goed voor uzelf zorgen en
                                let op eventuele veranderingen in uw klachten.
                            </p>
                            <p className="text-muted-foreground mt-4">
                                Mocht u in de toekomst toch klachten ervaren, kunt u altijd opnieuw de vragenlijst
                                invullen of contact opnemen met uw huisarts.
                            </p>
                        </div>
                    )}
                     <div className="text-center mt-8">
                        <Button asChild>
                            <Link href="/">Terug naar home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function ResultsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Resultaten laden...</div>}>
            <ResultsContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
