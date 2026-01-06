"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import Header from '@/components/header';
import {
  Stethoscope,
  Salad,
  CigaretteOff,
  ShieldCheck,
  Activity,
  HeartPulse,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PathwayOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'online' | 'hybrid';
  typeLabel: string;
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

    const [selectedPathways, setSelectedPathways] = useState<string[]>([]);
    const [step, setStep] = useState<'results' | 'consent'>('results');

    const availablePathways: PathwayOption[] = [];

    if (careNeeds.physio || careNeeds.physioNetwork) {
        availablePathways.push({
            id: 'fysio',
            title: 'Fysiotherapie',
            description: 'Een fysiotherapeut helpt u met oefeningen en behandelingen om uw gewrichtsklachten te verminderen. Na een online intake wordt u gekoppeld aan een fysiotherapeut bij u in de buurt.',
            icon: <HeartPulse className="h-8 w-8 text-blue-500" />,
            type: 'hybrid',
            typeLabel: 'Online intake + behandeling bij u in de buurt',
        });
    }

    if (careNeeds.ergo) {
        availablePathways.push({
            id: 'ergo',
            title: 'Ergotherapie',
            description: 'Een ergotherapeut helpt u met praktische oplossingen voor dagelijkse activiteiten. Na een online intake wordt u gekoppeld aan een ergotherapeut bij u in de buurt.',
            icon: <Stethoscope className="h-8 w-8 text-green-500" />,
            type: 'hybrid',
            typeLabel: 'Online intake + behandeling bij u in de buurt',
        });
    }

    if (careNeeds.diet) {
        availablePathways.push({
            id: 'diet',
            title: 'Diëtist',
            description: 'Een diëtist helpt u met een persoonlijk voedingsplan om ontstekingen te verminderen en een gezond gewicht te bereiken. De volledige begeleiding vindt online plaats.',
            icon: <Salad className="h-8 w-8 text-orange-500" />,
            type: 'online',
            typeLabel: 'Volledig online behandeling',
        });
    }

    if (careNeeds.smoking) {
        availablePathways.push({
            id: 'smoking',
            title: 'Stoppen met Roken',
            description: 'Professionele begeleiding om te stoppen met roken. Dit heeft een direct positief effect op uw herstel. De volledige begeleiding vindt online plaats.',
            icon: <CigaretteOff className="h-8 w-8 text-red-500" />,
            type: 'online',
            typeLabel: 'Volledig online behandeling',
        });
    }

    if (careNeeds.gli) {
        availablePathways.push({
            id: 'gli',
            title: 'GLI Programma',
            description: 'Het Gecombineerde Leefstijl Interventie programma helpt u met het aanpassen van uw leefstijl door middel van begeleide beweging en voedingsadvies. De volledige begeleiding vindt online plaats.',
            icon: <Activity className="h-8 w-8 text-purple-500" />,
            type: 'online',
            typeLabel: 'Volledig online behandeling',
        });
    }

    const hasNeeds = availablePathways.length > 0;

    const togglePathway = (pathwayId: string) => {
        setSelectedPathways(prev =>
            prev.includes(pathwayId)
                ? prev.filter(id => id !== pathwayId)
                : [...prev, pathwayId]
        );
    };

    const handleContinue = () => {
        if (selectedPathways.length > 0) {
            // Navigate to intake with selected pathways
            const params = new URLSearchParams();
            selectedPathways.forEach(p => params.append('pathway', p));
            router.push(`/intake/patient?${params.toString()}`);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
            <div className="grid gap-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Uw Persoonlijke Zorgadvies
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Op basis van uw antwoorden hebben wij de volgende zorgpaden voor u geselecteerd.
                        Kies de paden waarin u geïnteresseerd bent om door te gaan.
                    </p>
                </div>

                {hasNeeds ? (
                    <>
                        {/* Info Card */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Info className="h-6 w-6 text-blue-600" />
                                <div>
                                    <CardTitle className="text-lg text-blue-900">Hoe werkt het?</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="text-blue-800 text-sm space-y-2">
                                <p><strong>Online behandelingen:</strong> Voor diëtist, stoppen met roken en GLI programma - de complete begeleiding vindt online plaats via onze partners.</p>
                                <p><strong>Hybride behandelingen:</strong> Voor fysiotherapie en ergotherapie - eerst een online intake en behandelplan, daarna wordt u gekoppeld aan een therapeut bij u in de buurt.</p>
                            </CardContent>
                        </Card>

                        {/* Pathway Selection */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Selecteer uw zorgpaden</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {availablePathways.map((pathway) => (
                                    <Card
                                        key={pathway.id}
                                        className={`cursor-pointer transition-all ${
                                            selectedPathways.includes(pathway.id)
                                                ? 'ring-2 ring-primary border-primary bg-primary/5'
                                                : 'hover:border-primary/50'
                                        }`}
                                        onClick={() => togglePathway(pathway.id)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    {pathway.icon}
                                                    <div>
                                                        <CardTitle className="text-lg">{pathway.title}</CardTitle>
                                                        <Badge
                                                            variant={pathway.type === 'online' ? 'secondary' : 'outline'}
                                                            className="mt-1"
                                                        >
                                                            {pathway.type === 'online' ? 'Online' : 'Hybride'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    checked={selectedPathways.includes(pathway.id)}
                                                    onCheckedChange={() => togglePathway(pathway.id)}
                                                    className="h-6 w-6"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <CardDescription className="text-sm">
                                                {pathway.description}
                                            </CardDescription>
                                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {pathway.typeLabel}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Insurance Info */}
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg text-green-900">Vergoeding</CardTitle>
                                    <CardDescription className="text-green-700">
                                        De meeste behandelingen worden vergoed vanuit de basisverzekering.
                                        Houd er rekening mee dat dit ten koste kan gaan van uw eigen risico.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={handleContinue}
                                disabled={selectedPathways.length === 0}
                                className="min-w-[200px]"
                            >
                                Doorgaan met {selectedPathways.length} zorgpad{selectedPathways.length !== 1 ? 'en' : ''}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="lg" asChild>
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
