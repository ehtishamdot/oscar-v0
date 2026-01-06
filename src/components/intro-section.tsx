import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Activity, Stethoscope, Salad, CigaretteOff, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const IntroSection = () => {
  const introImage = PlaceHolderImages.find(img => img.id === 'intro-image');

  const pathways = [
    { icon: HeartPulse, label: 'Fysiotherapie', color: 'text-blue-500' },
    { icon: Stethoscope, label: 'Ergotherapie', color: 'text-green-500' },
    { icon: Salad, label: 'Diëtist', color: 'text-orange-500' },
    { icon: CigaretteOff, label: 'Stoppen met roken', color: 'text-red-500' },
    { icon: Activity, label: 'GLI Programma', color: 'text-purple-500' },
  ];

  return (
    <section id="intro" className="w-full">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Speciaal voor heup- en knieklachten
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
            Leef beter, met artrose.
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Heeft u klachten aan uw <strong>heup of knie</strong>? Wij helpen u de juiste zorg te vinden.
            Op basis van een korte vragenlijst koppelen wij u aan de beste zorgverleners voor uw situatie.
          </p>

          <div className="flex flex-wrap gap-2 py-2">
            {pathways.map((pathway) => (
              <div key={pathway.label} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
                <pathway.icon className={`h-4 w-4 ${pathway.color}`} />
                <span>{pathway.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold">Hoe werkt het?</p>
              <p>1. Beantwoord een korte vragenlijst</p>
              <p>2. Ontdek welke zorgpaden bij u passen</p>
              <p>3. Wij verbinden u met gespecialiseerde partners</p>
              <p>4. Start uw behandeling (online of bij u in de buurt)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
                <Link href="/questionnaire">
                    Start de vragenlijst
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/about">
                    Lees meer over artrose
                </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          {introImage && (
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <Image
                  src={introImage.imageUrl}
                  alt={introImage.description}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                  data-ai-hint={introImage.imageHint}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
