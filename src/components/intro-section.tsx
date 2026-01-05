import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IntroSection = () => {
  const introImage = PlaceHolderImages.find(img => img.id === 'intro-image');

  return (
    <section id="intro" className="w-full">
      <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
            Leef beter, met artrose.
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Artrose is een veelvoorkomende aandoening van de gewrichten. Hoewel het niet te genezen is, kunt u met de juiste zorg en aanpassingen uw klachten aanzienlijk verminderen. Wij helpen u de juiste, wetenschappelijk bewezen zorg te vinden.
          </p>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Beantwoord hieronder een paar korte vragen. Zo ontdekt u welke zorg het beste bij ú past.
          </p>
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
