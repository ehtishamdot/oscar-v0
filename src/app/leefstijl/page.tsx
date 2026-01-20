"use client";

import Link from 'next/link';
import { ArrowRight, Heart, Activity, Moon, Apple, Scale, Sparkles, ChevronLeft } from 'lucide-react';
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

export default function LeefstijlPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container-wide flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-headline text-foreground">
              Oscar
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/leefstijl" className="text-primary font-semibold">
              Leefstijl
            </Link>
            <Link href="/artrose" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Artrose
            </Link>
            <Link href="/beperkingen" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
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
                <Activity className="h-4 w-4" />
                Informatief
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-[1.1] tracking-tight mb-6">
                Leefstijl en klachten: hoe hangen ze samen?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Gewrichtsklachten, zoals pijn of stijfheid in de heup of knie, komen veel voor.
                Vaak ontstaan ze niet door één enkele oorzaak, maar door een combinatie van factoren.
                Leefstijl speelt daarbij een belangrijke rol.
              </p>
            </div>
          </div>
        </section>

        {/* What are joint complaints */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Wat zijn gewrichtsklachten?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Gewrichten zorgen ervoor dat je kunt bewegen. Wanneer een gewricht geïrriteerd,
                overbelast of beschadigd raakt, kan dit leiden tot:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Pijn of stijfheid',
                  'Moeite met lopen, traplopen of opstaan',
                  'Een verminderd uithoudingsvermogen',
                  'Onzekerheid of angst om te bewegen',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-cream rounded-2xl">
                    <div className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{i + 1}</span>
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">
                Klachten kunnen tijdelijk zijn, maar ook langdurig aanhouden of steeds terugkomen.
              </p>
            </div>
          </div>
        </section>

        {/* Lifestyle influence */}
        <section className="py-20 bg-cream relative overflow-hidden">
          <OrganicBlob className="absolute -bottom-40 -left-40 w-[400px] h-[400px] text-sage-light/50 pointer-events-none" />

          <div className="container-wide relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                De invloed van leefstijl op je gewrichten
              </h2>
              <p className="text-lg text-muted-foreground">
                Hoe je beweegt, eet, slaapt en met stress omgaat, heeft directe invloed op je gewrichten
                en op hoe je klachten ervaart.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: <Activity className="h-8 w-8" />,
                  title: 'Bewegen',
                  description: 'Regelmatig en passend bewegen is essentieel voor gezonde gewrichten. Te weinig beweging kan leiden tot stijve spieren en verminderde belastbaarheid, terwijl een verkeerde of te zware belasting klachten juist kan verergeren. De juiste balans is belangrijk.',
                  color: 'bg-sage-light text-sage-dark',
                },
                {
                  icon: <Scale className="h-8 w-8" />,
                  title: 'Gewicht',
                  description: 'Overgewicht zorgt voor extra belasting van met name de heup- en kniegewrichten. Zelfs een kleine gewichtsafname kan al merkbaar verschil maken in pijn en functioneren.',
                  color: 'bg-terracotta-light text-terracotta',
                },
                {
                  icon: <Apple className="h-8 w-8" />,
                  title: 'Voeding',
                  description: 'Voeding heeft invloed op je lichaamsgewicht, je energieniveau en op ontstekingsprocessen in het lichaam. Een gezond en gevarieerd eetpatroon kan bijdragen aan gewichtsverlies, herstel ondersteunen, ontstekingsgevoeligheid verminderen en je fitter laten voelen.',
                  color: 'bg-sage-light text-sage-dark',
                },
                {
                  icon: <Moon className="h-8 w-8" />,
                  title: 'Slaap en stress',
                  description: 'Slechte slaap en langdurige stress kunnen pijn versterken en het herstel vertragen. Ontspanning en voldoende rust zijn daarom een belangrijk onderdeel van het omgaan met gewrichtsklachten.',
                  color: 'bg-terracotta-light text-terracotta',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-lg card-hover">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why combined approach works */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-sage-dark text-sm font-semibold mb-6">
                  <Sparkles className="h-4 w-4" />
                  Gecombineerde aanpak
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline leading-tight mb-6">
                  Waarom een gecombineerde aanpak werkt
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Alleen focussen op het gewricht zelf is vaak niet voldoende. Door ook aandacht te besteden
                  aan leefstijl, wordt niet alleen de klacht aangepakt, maar ook de oorzaak en het
                  herstelvermogen van het lichaam.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Het draait niet om strenge diëten, maar om haalbare, duurzame keuzes die passen bij jouw leven.
                </p>
              </div>

              <div className="bg-gradient-to-br from-sage-light to-cream rounded-3xl p-8">
                <h3 className="text-xl font-bold font-headline mb-6">Dit vergroot de kans op:</h3>
                <div className="space-y-4">
                  {[
                    'Minder pijn',
                    'Beter bewegen in het dagelijks leven',
                    'Meer energie en vertrouwen in je lichaam',
                    'Langdurig resultaat',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-semibold text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personal help section */}
        <section className="py-20 bg-cream">
          <div className="container-narrow text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
              Passende hulp, afgestemd op jou
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Iedereen is anders. Daarom kijken wij niet alleen naar je klachten, maar ook naar jouw
              leefstijl en persoonlijke situatie. Met een korte vragenlijst brengen we dit in kaart
              en krijg je hulp die past bij jou — in de buurt of online.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sage to-sage-dark relative overflow-hidden">
          <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px] text-white/10 pointer-events-none" />

          <div className="container-narrow relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-white">
              Wil je weten welke stappen jij kunt zetten?
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Start dan met de vragenlijst en ontdek welke ondersteuning het beste bij jou past.
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
              <span className="text-xl font-bold font-headline text-white">Oscar</span>
            </div>
            <nav className="flex items-center gap-8 text-sm">
              <Link href="/leefstijl" className="hover:text-white transition-colors">Leefstijl</Link>
              <Link href="/artrose" className="hover:text-white transition-colors">Artrose</Link>
              <Link href="/beperkingen" className="hover:text-white transition-colors">Dagelijks leven</Link>
            </nav>
            <p className="text-sm">
              © {new Date().getFullYear()} Oscar Zorgcoördinatie
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
