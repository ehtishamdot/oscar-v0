import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock, CheckCircle, Stethoscope, MapPin, Calendar, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IntroSection = () => {
  return (
    <section id="intro" className="w-full">
      {/* Hero Section */}
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 mb-16">
        <div className="space-y-6">
          {/* Credibility Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Stethoscope className="h-4 w-4" />
            <span>Ontwikkeld door artsen en specialisten</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline leading-tight">
            Neem zelf de regie over uw heup- of knieklachten
          </h1>

          <p className="max-w-[600px] text-muted-foreground text-lg leading-relaxed">
            Geen wachttijden bij de huisarts. Geen eindeloos zoeken naar de juiste zorgverlener.
            Met onze wetenschappelijk onderbouwde vragenlijst krijgt u direct persoonlijk advies
            en verbinden wij u met gespecialiseerde zorgverleners bij u in de buurt.
          </p>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Persoonlijk advies</p>
                <p className="text-xs text-muted-foreground">Op basis van uw situatie</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Zorgverlener bij u in de buurt</p>
                <p className="text-xs text-muted-foreground">Direct beschikbaar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Afspraak inplannen</p>
                <p className="text-xs text-muted-foreground">Of online consult</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Privacy gewaarborgd</p>
                <p className="text-xs text-muted-foreground">Uw gegevens zijn veilig</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild size="lg" className="h-14 px-8 text-lg">
              <Link href="/questionnaire">
                Start de vragenlijst
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
                Volledig vrijblijvend
              </span>
            </div>
          </div>
        </div>

        {/* Medical Image */}
        <div className="flex justify-center">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <Image
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8ZG9jdG9yJTIwcGF0aWVudCUyMGNvbnN1bHRhdGlvbnxlbnwwfHx8fDE3MTU2MjQyMDB8MA&ixlib=rb-4.0.3&q=80&w=1080"
                alt="Arts in gesprek met patiënt over behandelplan"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Oscar Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 mb-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
            Waarom deze vragenlijst?
          </h2>
          <p className="text-muted-foreground text-lg">
            Bij de huisarts krijgt u vaak te horen: &quot;Vroege gewrichtsklachten? Minder belasten,
            trainen en naar huis.&quot; Wij gaan verder. Wij brengen al uw opties in kaart,
            stemmen ze af op uw situatie en zorgen dat u zelf de regie houdt.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Beantwoord de vragen</h3>
            <p className="text-muted-foreground text-sm">
              Vul onze korte vragenlijst in over uw klachten en situatie. Dit duurt slechts 2 minuten.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Ontvang persoonlijk advies</h3>
            <p className="text-muted-foreground text-sm">
              Op basis van uw antwoorden krijgt u een op maat gemaakt advies met alle relevante zorgopties.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Direct in contact</h3>
            <p className="text-muted-foreground text-sm">
              Wij verbinden u direct met de juiste zorgverlener bij u in de buurt. Inclusief afspraak of online consult.
            </p>
          </div>
        </div>
      </div>

      {/* Credibility Section */}
      <div className="border-t pt-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            <span>Over ons</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
            Ontwikkeld door zorgprofessionals
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Dit platform is niet gebouwd door ondernemers, maar door artsen en specialisten.
            Wij zien dagelijks dat zorg slimmer, sneller en beter kan. Daarom hebben wij dit
            platform ontwikkeld: om u direct te verbinden met de juiste zorg.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span>Medisch onderbouwd</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Evidence-based</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
