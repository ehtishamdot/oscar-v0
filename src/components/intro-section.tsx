import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IntroSection = () => {
  const introImage = PlaceHolderImages.find(img => img.id === 'intro-image');

  return (
    <section id="intro" className="w-full">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline leading-tight">
            De juiste zorg voor uw heup en knie, wij helpen u snel op weg.
          </h1>
          <p className="max-w-[600px] text-muted-foreground text-lg leading-relaxed">
            Heeft u klachten aan uw heup of knie? Wij helpen u snel op weg naar herstel.
            Geen eindeloze zoektochten naar zorgverleners of wachtlijsten. Op basis van
            uw situatie zoeken wij direct zorgverleners die het beste bij u passen.
            Zo kunt u weer vooruit.
          </p>

          <div className="pt-2">
            <Button asChild size="lg" className="h-14 px-8 text-lg">
              <Link href="/questionnaire">
                Bekijk mijn mogelijkheden
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Duurt slechts 2 minuten
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Vrijblijvend
              </span>
            </div>
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
