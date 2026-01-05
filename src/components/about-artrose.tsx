'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bone, Stethoscope, CigaretteOff, Salad } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutArtrose = () => {

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Alles over Artrose</h1>
        <p className="mt-4 text-xl text-muted-foreground">Een heldere uitleg over wat artrose is, wat de klachten zijn en wat u zelf kunt doen.</p>
        <Button asChild size="lg">
            <Link href="/questionnaire">
                Ontdek direct welke zorg bij u past
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </Button>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Wat is artrose precies?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-4">
                <p>
                    In elk gewricht komen twee botten samen. Op de uiteinden van die botten zit een laagje kraakbeen. Dit kraakbeen is normaal heel glad en zorgt ervoor dat het gewricht soepel kan bewegen.
                </p>
                <p>
                    Bij artrose wordt dit kraakbeen langzaam dunner en minder glad. Daardoor bewegen de botten minder soepel over elkaar. Het gewricht kan stijver en pijnlijker worden. Na verloop van tijd verandert ook het bot onder het kraakbeen. Aan de randen kan extra bot groeien, waardoor het gewricht breder en dikker wordt.
                </p>
            </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Welke klachten passen bij artrose?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Pijn & Stijfheid:</strong> Vooral bij bewegen, of 's ochtends bij het opstaan.</li>
            <li><strong>Minder soepel bewegen:</strong> Buigen of strekken kan moeilijker gaan.</li>
            <li><strong>Krakende of dikkere gewrichten:</strong> Soms is een krakend gevoel hoorbaar en kan het gewricht wat dikker worden.</li>
          </ul>
           <p>De klachten kunnen wisselen: soms zijn ze weken erger, en dan gaat het weer een periode beter.</p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>In welke gewrichten komt artrose vaak voor?</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
            <p>Artrose kan in ieder gewricht ontstaan, maar het komt het meest voor in:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Knieën en heupen</li>
                <li>De duimbasis en vingergewrichten</li>
                <li>De schouder</li>
                <li>De rug en de nek</li>
            </ul>
        </CardContent>
      </Card>
      
      <Card className="border-accent/20 bg-accent/5 shadow-sm">
        <CardHeader>
          <CardTitle>Wat kunt u zelf doen?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Artrose gaat niet over, maar u kunt zelf veel doen om minder last te hebben. Een actieve aanpak helpt echt. Onze vragenlijst laat zien welke zorg u hierbij kan helpen.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <Bone className="h-6 w-6 text-accent-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Fysiotherapie</h3>
                <p className="text-sm">Helpt met gerichte oefeningen om spieren te versterken en de gewrichten soepel te houden.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Stethoscope className="h-6 w-6 text-accent-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Ergotherapie</h3>
                <p className="text-sm">Biedt praktische oplossingen en hulpmiddelen voor dagelijkse activiteiten.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Salad className="h-6 w-6 text-accent-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Diëtetiek</h3>
                <p className="text-sm">Geeft voedingsadvies om ontstekingen te remmen en een gezond gewicht te bereiken.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CigaretteOff className="h-6 w-6 text-accent-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Stoppen met roken</h3>
                <p className="text-sm">Roken verergert klachten; stoppen verbetert uw algehele gezondheid en kan pijn verminderen.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">Klaar voor de volgende stap?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Benieuwd welke zorg u kan helpen? Doe de korte vragenlijst en zie direct welke zorgopties bij uw situatie passen.</p>
        <Button asChild size="lg">
            <Link href="/questionnaire">
                Start de vragenlijst
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </Button>
      </div>
    </div>
  );
};

export default AboutArtrose;
