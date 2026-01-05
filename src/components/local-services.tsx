'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { findNearestTherapistsFlow, Therapist } from '@/ai/flows/find-places-flow';
import Link from 'next/link';

const LocalServices = () => {
    const { toast } = useToast();

    const [postcode, setPostcode] = useState('');
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!postcode) {
            toast({
                variant: 'destructive',
                title: 'Postcode is verplicht',
                description: 'Voer een postcode in om te zoeken.',
            });
            return;
        }
        setLoading(true);
        setSearched(true);
        setTherapists([]);
        try {
            const results = await findNearestTherapistsFlow({ postcode });
            
            // Filter for general physios and limit to 5 results
            const generalPhysios = results
                .filter(therapist => therapist.hasGeneralPhysio)
                .slice(0, 5);

            if (generalPhysios.length === 0) {
                 toast({
                    variant: 'default',
                    title: 'Geen algemene fysiotherapeuten gevonden',
                    description: 'Kon geen algemene fysiotherapeuten vinden voor de ingevoerde postcode. Probeer een andere postcode.',
                });
            }
            setTherapists(generalPhysios);
        } catch (error: any) {
            console.error('Error finding places:', error);
            toast({
                variant: 'destructive',
                title: 'Er is iets misgegaan',
                description: error.message || 'Kon geen fysiotherapeuten vinden. Probeer het later opnieuw.',
            });
        }
        setLoading(false);
    };

    return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Fysiotherapeut bij u in de buurt
        </CardTitle>
        <CardDescription>
          Een fysiotherapeut kan u helpen met gerichte oefeningen om de spieren rondom uw gewrichten te versterken, wat de pijn kan verlichten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
                type="text" 
                placeholder="Voer uw postcode in (bv. 1234AB)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Zoeken...' : 'Zoek'}
            </Button>
        </div>
        <div className="space-y-4">
            {searched && !loading && therapists.length > 0 && <h3 className="font-semibold">Resultaten in uw buurt:</h3>}
            
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}

            {!loading && therapists.length > 0 && therapists.map((therapist) => (
                <Card key={therapist.practiceId} className="flex flex-col sm:flex-row items-start p-4 gap-4">
                    <div className="flex-1">
                        <p className="font-bold text-lg">{therapist.practiceName}</p>
                        <p className="text-sm text-muted-foreground">{therapist.address}, {therapist.postcode} {therapist.cityName}</p>
                        {therapist.distance !== undefined && (
                            <p className="text-sm font-semibold text-primary mt-2">Afstand: ca. {therapist.distance.toFixed(1)} km</p>
                        )}
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto">
                        <Link href={`/intake?service=fysiotherapie&therapistId=${therapist.practiceId}&therapistName=${encodeURIComponent(therapist.practiceName)}`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Maak een afspraak
                        </Link>
                    </Button>
                </Card>
            ))}

            {searched && !loading && therapists.length === 0 && (
                 <p className="text-muted-foreground text-center py-8">Geen resultaten gevonden voor de ingevoerde postcode. Controleer de postcode en probeer het opnieuw.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalServices;
