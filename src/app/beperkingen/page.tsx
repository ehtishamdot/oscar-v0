"use client";

import Link from 'next/link';
import { ArrowRight, Heart, Home, AlertTriangle, TrendingDown, Lightbulb, Users, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Organic blob SVG component
const OrganicBlob = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.2C64.8,55.2,53.8,66.6,40.4,74.4C27,82.2,11.2,86.4,-4.1,83.7C-19.4,81,-38.8,71.4,-54.3,58.8C-69.8,46.2,-81.4,30.6,-85.7,13.4C-90,-3.8,-87,-22.6,-78.8,-38.4C-70.6,-54.2,-57.2,-67,-42.3,-73.9C-27.4,-80.8,-11,-81.8,2.7,-80.5C16.4,-79.2,30.6,-83.6,44.7,-76.4Z"
      transform="translate(100 100)"
    />
  </svg>
);

export default function BeperkingenPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container-wide flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-headline text-foreground">
              ZorgRoute Nederland
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/leefstijl" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Leefstijl
            </Link>
            <Link href="/artrose" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Artrose
            </Link>
            <Link href="/beperkingen" className="text-primary font-semibold">
              Dagelijks leven
            </Link>
          </nav>

          <Button asChild className="rounded-full px-6 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Link href="/questionnaire" className="gap-2">
              Start vragenlijst
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-mesh pointer-events-none" />
          <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px] text-sage-light/40 animate-float pointer-events-none" />

          <div className="container-wide relative">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ChevronLeft className="h-4 w-4" />
              Terug naar home
            </Link>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-sage-dark text-sm font-semibold mb-6">
                <Home className="h-4 w-4" />
                Dagelijks leven
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-[1.1] tracking-tight mb-6">
                Beperkingen in het dagelijks leven
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Gewrichtsklachten aan de heup of knie hebben vaak meer invloed dan alleen pijn.
                Ze kunnen dagelijkse handelingen lastiger maken en je zelfstandigheid beperken.
                Dingen die eerst vanzelfsprekend waren, kosten ineens meer moeite of energie.
              </p>
            </div>
          </div>
        </section>

        {/* How do complaints affect daily life */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Hoe beïnvloeden gewrichtsklachten het dagelijks leven?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Mensen met gewrichtsklachten kunnen problemen ervaren bij:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🚶', text: 'Lopen, traplopen of opstaan uit een stoel' },
                  { icon: '🏠', text: 'Huishoudelijke taken zoals stofzuigen of koken' },
                  { icon: '💼', text: 'Werken of langere tijd staan en zitten' },
                  { icon: '🚿', text: 'Aankleden, douchen of boodschappen doen' },
                  { icon: '👥', text: 'Sociale activiteiten en ontspanning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-cream rounded-2xl">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">
                Deze beperkingen kunnen leiden tot frustratie, verminderde zelfredzaamheid en soms
                ook tot het vermijden van activiteiten.
              </p>
            </div>
          </div>
        </section>

        {/* Why complaints increase */}
        <section className="py-20 bg-cream relative overflow-hidden">
          <OrganicBlob className="absolute -bottom-40 -right-40 w-[400px] h-[400px] text-terracotta-light/30 pointer-events-none" />

          <div className="container-wide relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-terracotta text-sm font-semibold mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  Belangrijk om te weten
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline leading-tight mb-6">
                  Waarom klachten soms toenemen
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Wanneer bewegen lastig wordt, gaan mensen zich vaak aanpassen of activiteiten
                  vermijden. Hoewel dit begrijpelijk is, kan het op de lange termijn juist zorgen voor problemen.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Daarom is het belangrijk om niet alleen naar de pijn te kijken, maar ook naar
                  hoe je je dag indeelt en belast.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <TrendingDown className="h-6 w-6" />, text: 'Afname van spierkracht en conditie' },
                  { icon: <AlertTriangle className="h-6 w-6" />, text: 'Meer stijfheid en pijn' },
                  { icon: <TrendingDown className="h-6 w-6" />, text: 'Minder vertrouwen in bewegen' },
                  { icon: <Home className="h-6 w-6" />, text: 'Een kleinere actieradius in het dagelijks leven' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Role of practical support */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-sage-dark text-sm font-semibold mb-6">
                <Lightbulb className="h-4 w-4" />
                Praktische ondersteuning
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                De rol van praktische ondersteuning
              </h2>
              <p className="text-lg text-muted-foreground">
                Praktische begeleiding kan helpen om dagelijkse activiteiten anders, slimmer of
                met minder belasting uit te voeren.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Handelingen aanpassen',
                  description: 'Leren hoe je dagelijkse taken anders kunt uitvoeren',
                },
                {
                  icon: '🧘',
                  title: 'Houding en beweging',
                  description: 'Tips voor de juiste houding en bewegingspatronen',
                },
                {
                  icon: '⚡',
                  title: 'Energie verdelen',
                  description: 'Je energie slim verdelen over de dag',
                },
                {
                  icon: '🛠️',
                  title: 'Hulpmiddelen',
                  description: 'Het gebruik van hulpmiddelen waar nodig',
                },
              ].map((item, i) => (
                <div key={i} className="bg-cream rounded-3xl p-6 text-center card-hover">
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <h3 className="text-lg font-bold font-headline mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Het doel is niet om alles te vermijden, maar om actief te blijven op een manier
                die past bij jouw mogelijkheden.
              </p>
            </div>
          </div>
        </section>

        {/* Help that fits */}
        <section className="py-20 bg-gradient-to-br from-sage-light to-cream">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sage-dark text-sm font-semibold mb-6">
                  <Users className="h-4 w-4" />
                  Op maat gemaakt
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline leading-tight mb-6">
                  Hulp die past bij jouw situatie
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Iedereen ervaart gewrichtsklachten anders. Daarom kijken wij niet alleen naar
                  de klacht, maar ook naar hoe deze jouw dagelijks leven beïnvloedt.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Met een korte vragenlijst brengen we dit in kaart en krijg je passende hulp
                  aangeboden — zoals begeleiding door een ergotherapeut, fysiotherapeut of diëtist.
                  Online of op locatie bij u in de buurt.
                </p>
                <p className="text-lg font-medium text-foreground">
                  Zo sta je er niet alleen voor en kun je blijven doen wat voor jou belangrijk is,
                  op een manier die haalbaar en verantwoord is.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold font-headline mb-6">Mogelijke begeleiding:</h3>
                <div className="space-y-4">
                  {[
                    { role: 'Fysiotherapeut', desc: 'Voor beweging en oefeningen' },
                    { role: 'Ergotherapeut', desc: 'Voor dagelijkse activiteiten' },
                    { role: 'Diëtist', desc: 'Voor voeding en gewicht' },
                    { role: 'Online coaching', desc: 'Flexibele begeleiding op afstand' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-cream rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold block">{item.role}</span>
                        <span className="text-muted-foreground text-sm">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sage to-sage-dark relative overflow-hidden">
          <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px] text-white/10 pointer-events-none" />

          <div className="container-narrow relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-white">
              Ontdek welke hulp bij jou past
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Tijdige en passende ondersteuning kan helpen om met beperkingen om te gaan
              en klachten beheersbaar te houden. Zet vandaag de eerste stap.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full h-16 px-10 text-lg font-semibold shadow-2xl hover:scale-105 transition-all bg-white text-sage-dark hover:bg-white/90">
              <Link href="/questionnaire" className="gap-3">
                Start de vragenlijst
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white/60 py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-headline text-white">ZorgRoute Nederland</span>
            </div>
            <nav className="flex items-center gap-8 text-sm">
              <Link href="/leefstijl" className="hover:text-white transition-colors">Leefstijl</Link>
              <Link href="/artrose" className="hover:text-white transition-colors">Artrose</Link>
              <Link href="/beperkingen" className="hover:text-white transition-colors">Dagelijks leven</Link>
            </nav>
            <p className="text-sm">
              © {new Date().getFullYear()} ZorgRoute Nederland
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
