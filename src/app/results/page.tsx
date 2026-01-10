"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Header from '@/components/header';
import {
  Stethoscope,
  Salad,
  CigaretteOff,
  ShieldCheck,
  Activity,
  HeartPulse,
  ArrowRight,
  Euro
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PathwayOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const careNeeds = {
        physio: searchParams.get('physio') === 'true',
        physioNetwork: searchParams.get('physioNetwork') === 'true',
        ergo: searchParams.get('ergo') === 'true',
        gli: searchParams.get('gli') === 'true',
        diet: searchParams.get('diet') === 'true',
        smoking: searchParams.get('smoking') === 'true',
    };

    const availablePathways: PathwayOption[] = [];

    if (careNeeds.physio || careNeeds.physioNetwork) {
        availablePathways.push({
            id: 'fysio',
            title: 'Fysiotherapie: Pijn verminderen & Soepel bewegen',
            description: 'Een gespecialiseerde fysiotherapeut kijkt eerst online met u mee. Samen maakt u een duidelijk plan om uw klachten aan te pakken. Zodra dit plan er is, zoeken wij direct een fysiotherapeut bij u in de buurt die snel plek heeft. Zo kunt u meteen aan de slag.',
            icon: <HeartPulse className="h-8 w-8 text-blue-500" />,
        });
    }

    if (careNeeds.ergo) {
        availablePathways.push({
            id: 'ergo',
            title: 'Ergotherapie: Makkelijker dagelijks leven',
            description: 'Praktische oplossingen voor thuis en werk. Heeft u moeite met dagelijkse dingen, zoals werk, huishouden of hobby\'s? De ergotherapeut leert u slimme manieren om dit makkelijker te doen. U leert hoe u uw activiteiten zo aanpakt dat u minder last heeft van uw klachten. We starten online en regelen daarna hulp bij u in de buurt.',
            icon: <Stethoscope className="h-8 w-8 text-green-500" />,
        });
    }

    if (careNeeds.diet) {
        availablePathways.push({
            id: 'diet',
            title: 'Voedingsbegeleiding: Afvallen & Herstellen',
            description: 'Wist u dat voeding veel invloed heeft op uw klachten? De diëtist helpt u niet alleen met gezond afvallen, maar zorgt ook voor voeding die uw herstel versnelt en ontstekingen remt. U krijgt een makkelijk plan dat bij u past. Gewoon vanuit huis te volgen.',
            icon: <Salad className="h-8 w-8 text-orange-500" />,
        });
    }

    if (careNeeds.gli) {
        availablePathways.push({
            id: 'gli',
            title: 'GLI Programma: Fitter worden & Blijven',
            description: 'Wilt u lekkerder in uw vel zitten? Uw coach helpt u met bewegen en eten op een manier die u wél volhoudt. Geen streng dieet, maar stapsgewijs werken aan een gezond gewicht en meer energie. Volledig online begeleid.',
            icon: <Activity className="h-8 w-8 text-purple-500" />,
        });
    }

    if (careNeeds.smoking) {
        availablePathways.push({
            id: 'smoking',
            title: 'Rookvrij: Geef uw herstel een boost',
            description: 'Stoppen met roken zorgt direct voor een betere doorbloeding, waardoor uw lichaam sneller geneest. Met onze online aanpak staat u er niet alleen voor en is de kans dat het lukt veel groter.',
            icon: <CigaretteOff className="h-8 w-8 text-red-500" />,
        });
    }

    const hasNeeds = availablePathways.length > 0;

    // Multi-select: all pathways ON by default (patient deselects to opt-out)
    const [selectedPathways, setSelectedPathways] = useState<string[]>([]);

    useEffect(() => {
        // Pre-select ALL available pathways by default
        setSelectedPathways(availablePathways.map(p => p.id));
    }, []);

    const togglePathway = (pathwayId: string) => {
        setSelectedPathways(prev =>
            prev.includes(pathwayId)
                ? prev.filter(id => id !== pathwayId)
                : [...prev, pathwayId]
        );
    };

    const handleContinue = () => {
        if (selectedPathways.length > 0) {
            const params = new URLSearchParams();
            selectedPathways.forEach(p => params.append('pathway', p));
            router.push(`/intake/questions?${params.toString()}`);
        }
    };

    // Dynamic button text
    const getButtonText = () => {
        const count = selectedPathways.length;
        if (count === 0) return 'Selecteer minimaal één traject';
        if (count === 1) return 'Zet dit traject voor mij in gang';
        return `Zet deze ${count} trajecten voor mij in gang`;
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
            <div className="grid gap-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
                        Uw Persoonlijke Zorgvoorstel
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Goed dat u de eerste stap heeft gezet! Voor een zo spoedig mogelijk herstel hebben
                        wij direct de trajecten voor u klaargezet die precies bij uw situatie passen.
                    </p>
                </div>

                {hasNeeds ? (
                    <>
                        {/* Pathway Selection */}
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-semibold">Uw Samengestelde Herstelplan</h2>
                                <p className="text-muted-foreground">
                                    Wij hebben alle trajecten die bij uw situatie passen alvast aangevinkt.
                                    Deselecteer wat u niet wilt.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                {availablePathways.map((pathway) => (
                                    <Card
                                        key={pathway.id}
                                        className={`cursor-pointer transition-all ${
                                            selectedPathways.includes(pathway.id)
                                                ? 'ring-2 ring-primary border-primary bg-primary/5'
                                                : 'hover:border-primary/50 opacity-60'
                                        }`}
                                        onClick={() => togglePathway(pathway.id)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-6 h-6 mt-1 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                                    selectedPathways.includes(pathway.id)
                                                        ? 'border-primary bg-primary'
                                                        : 'border-muted-foreground/30'
                                                }`}>
                                                    {selectedPathways.includes(pathway.id) && (
                                                        <Check className="h-4 w-4 text-primary-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {pathway.icon}
                                                        <CardTitle className="text-lg">{pathway.title}</CardTitle>
                                                    </div>
                                                    <CardDescription className="text-sm leading-relaxed">
                                                        {pathway.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Cost Info */}
                        <Card className="bg-muted/50 border-muted">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <Euro className="h-8 w-8 text-muted-foreground mt-1" />
                                <div>
                                    <CardTitle className="text-lg">Over de kosten</CardTitle>
                                    <CardDescription className="text-sm leading-relaxed mt-2">
                                        U bent hiervoor verzekerd via uw basispakket. Dat betekent dat de verzekeraar
                                        de kosten dekt. Heeft u uw eigen risico voor dit jaar nog niet verbruikt?
                                        Dan wordt dat eerst aangesproken, net als bij een bezoek aan het ziekenhuis.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Action Button */}
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <Button
                                size="lg"
                                onClick={handleContinue}
                                disabled={selectedPathways.length === 0}
                                className="w-full sm:w-auto min-w-[320px] h-14 text-lg"
                            >
                                {getButtonText()}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/">Terug naar home</Link>
                            </Button>
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
                        <div className="mt-6">
                            <Button asChild>
                                <Link href="/">Terug naar home</Link>
                            </Button>
                        </div>
                    </div>
                )}
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
        © {new Date().getFullYear()} Oscar. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
