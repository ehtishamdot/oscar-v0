"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/header';
import CtaSection from '@/components/cta-section';
import LocalServices from '@/components/local-services';
import { Stethoscope, Salad, CigaretteOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ResultsContent() {
    const searchParams = useSearchParams();

    const careNeeds = {
        physio: searchParams.get('physio') === 'true',
        ergo: searchParams.get('ergo') === 'true',
        diet: searchParams.get('diet') === 'true',
        smoking: searchParams.get('smoking') === 'true',
    };
    
    const hasNeeds = Object.values(careNeeds).some(need => need);

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
            <div className="grid gap-12 md:gap-16">
                <div className="grid gap-8">
                    <h1 className="text-3xl font-bold tracking-tight text-center font-headline">Uw Persoonlijke Inzichten</h1>
                    {hasNeeds ? (
                        <>
                            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                                Op basis van uw antwoorden, zijn hier enkele aanbevelingen die u kunnen helpen uw klachten te verminderen. Bespreek deze inzichten met uw huisarts of een specialist om te bepalen wat de beste volgende stappen voor u zijn.
                            </p>
                            <Card className="bg-secondary/50">
                              <CardHeader className="flex flex-row items-center gap-4">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                                <CardTitle className="text-lg font-semibold">Goed om te weten</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground">
                                  De meeste van de hieronder genoemde behandelingen, zoals fysiotherapie, ergotherapie en dieetadvies, worden doorgaans vergoed vanuit de basisverzekering. Houd er wel rekening mee dat dit ten koste kan gaan van uw eigen risico.
                                </p>
                              </CardContent>
                            </Card>
                            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                                {careNeeds.physio && (
                                    <LocalServices />
                                )}
                                {careNeeds.ergo && (
                                    <CtaSection
                                        icon={<Stethoscope className="h-10 w-10 text-primary" />}
                                        title="Ergotherapie voor Dagelijkse Hulp"
                                        description="Een ergotherapeut kan u helpen met praktische oplossingen, zodat dagelijkse activiteiten zoals aankleden, koken of hobby's makkelijker worden. Ontdek hulpmiddelen en nieuwe manieren om dingen te doen."
                                        buttonText="Plan online consult"
                                        buttonLink="/intake?service=ergotherapie"
                                    />
                                )}
                                {careNeeds.diet && (
                                    <CtaSection
                                        icon={<Salad className="h-10 w-10 text-primary" />}
                                        title="Voedingsadvies van een Diëtist"
                                        description="Wist u dat voeding een rol speelt bij artrose? Een diëtist kan u helpen met een persoonlijk voedingsplan om ontstekingen te verminderen en een gezond gewicht te bereiken of behouden."
                                        buttonText="Plan online consult"
                                        buttonLink="/intake?service=dietetiek"
                                    />
                                )}
                                {careNeeds.smoking && (
                                    <CtaSection
                                        icon={<CigaretteOff className="h-10 w-10 text-primary" />}
                                        title="Hulp bij Stoppen met Roken"
                                        description="Roken kan artroseklachten verergeren. Stoppen is een van de beste dingen die u voor uw gezondheid kunt doen. Er is professionele begeleiding beschikbaar om u hierbij te helpen."
                                        buttonText="Vind begeleiding"
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                         <div className="text-center p-8 bg-card rounded-lg border max-w-3xl mx-auto">
                            <p className="text-xl font-semibold mb-4">Goed bezig!</p>
                            <p className="text-muted-foreground">Dank u voor het invullen. Op basis van uw antwoorden lijken er op dit moment geen specifieke aanvullende zorgstappen nodig te zijn. Blijf goed voor uzelf zorgen en let op eventuele veranderingen in uw klachten.</p>
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
