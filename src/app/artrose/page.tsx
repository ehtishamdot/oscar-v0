"use client";

import Link from 'next/link';
import { ArrowRight, Heart, Activity, Moon, Apple, Scale, Bone, AlertCircle, ChevronLeft, Sparkles } from 'lucide-react';
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

export default function ArtrosePage() {
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
            <Link href="/leefstijl" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Leefstijl
            </Link>
            <Link href="/artrose" className="text-primary font-semibold">
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
          <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px] text-terracotta-light/40 animate-float pointer-events-none" />

          <div className="container-wide relative">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ChevronLeft className="h-4 w-4" />
              Terug naar home
            </Link>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-light text-terracotta text-sm font-semibold mb-6">
                <Bone className="h-4 w-4" />
                Informatief
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-[1.1] tracking-tight mb-6">
                Artrose: wat is het en wat kun je eraan doen?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Artrose is een veelvoorkomende aandoening van de gewrichten. Het komt vooral voor
                in de knie en heup en kan pijn, stijfheid en beperkingen in het dagelijks leven
                veroorzaken. Hoewel artrose niet te genezen is, zijn er wél veel manieren om
                klachten te verminderen en beter te blijven bewegen.
              </p>
            </div>
          </div>
        </section>

        {/* What is artrose */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Wat is artrose?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Bij artrose verandert de kwaliteit van het kraakbeen in een gewricht. Kraakbeen
                zorgt normaal gesproken voor een soepele beweging en werkt als schokdemper.
                Bij artrose wordt dit kraakbeen dunner en minder veerkrachtig. Ook het bot,
                de spieren en het gewrichtskapsel rondom het gewricht kunnen veranderen.
              </p>
              <div className="bg-cream rounded-2xl p-6 border-l-4 border-terracotta">
                <p className="text-muted-foreground italic">
                  Artrose wordt vaak &quot;slijtage&quot; genoemd, maar het is geen simpel gevolg van ouder worden.
                  Meerdere factoren spelen een rol.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common complaints */}
        <section className="py-20 bg-cream relative overflow-hidden">
          <OrganicBlob className="absolute -bottom-40 -left-40 w-[400px] h-[400px] text-sage-light/50 pointer-events-none" />

          <div className="container-wide relative">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Veelvoorkomende klachten bij artrose
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Mensen met artrose kunnen last hebben van:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  'Pijn tijdens of na bewegen',
                  'Stijfheid, vooral na rust of \'s ochtends',
                  'Een verminderde bewegingsvrijheid',
                  'Krachtsverlies of instabiliteit',
                  'Moeite met lopen, traplopen of opstaan',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm">
                    <AlertCircle className="h-5 w-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">
                De ernst van de klachten verschilt per persoon en kan per dag wisselen.
              </p>
            </div>
          </div>
        </section>

        {/* How does artrose develop */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline leading-tight mb-6">
                  Hoe ontstaat artrose?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Artrose ontstaat meestal door een combinatie van factoren. Leefstijl heeft
                  hierbij een duidelijke invloed, zowel op het ontstaan als op het verloop van artrose.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: '⚡', text: 'Overbelasting of verkeerd gebruik van het gewricht' },
                  { icon: '🩹', text: 'Eerdere blessures of operaties' },
                  { icon: '🧬', text: 'Erfelijke aanleg' },
                  { icon: '⚖️', text: 'Overgewicht' },
                  { icon: '🏃', text: 'Te weinig of juist eenzijdige beweging' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-cream rounded-2xl p-5">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Artrose and lifestyle */}
        <section className="py-20 bg-gradient-to-br from-sage-light to-cream">
          <div className="container-wide">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sage-dark text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4" />
                Leefstijl maakt verschil
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Artrose en leefstijl
              </h2>
              <p className="text-lg text-muted-foreground">
                Een gezonde leefstijl kan artrose niet wegnemen, maar wél helpen om klachten
                te verminderen en achteruitgang te vertragen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Activity className="h-8 w-8" />,
                  title: 'Bewegen',
                  description: 'Regelmatig en op de juiste manier bewegen houdt het gewricht soepel en versterkt de spieren eromheen. Dit zorgt voor meer stabiliteit en minder pijn.',
                  color: 'bg-sage text-white',
                },
                {
                  icon: <Scale className="h-8 w-8" />,
                  title: 'Gewicht',
                  description: 'Minder lichaamsgewicht betekent minder belasting van de heupen en knieën. Zelfs een kleine afname kan al een positief effect hebben.',
                  color: 'bg-terracotta text-white',
                },
                {
                  icon: <Moon className="h-8 w-8" />,
                  title: 'Voeding, slaap en stress',
                  description: 'Een gezond eetpatroon, voldoende slaap en het verminderen van stress ondersteunen het herstel en beïnvloeden hoe pijn wordt ervaren.',
                  color: 'bg-sage-dark text-white',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-lg card-hover">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What can you do */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-cream rounded-3xl p-8">
                  <h3 className="text-xl font-bold font-headline mb-6">Een actieve aanpak werkt het best:</h3>
                  <div className="space-y-4">
                    {[
                      'Gerichte oefeningen en begeleiding',
                      'Tips voor verantwoord bewegen',
                      'Ondersteuning bij leefstijlverandering',
                      'Online of fysieke begeleiding, passend bij jouw situatie',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-muted-foreground italic">
                    Door klachten én leefstijl samen aan te pakken, kun je vaak meer dan je denkt.
                  </p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-light text-terracotta text-sm font-semibold mb-6">
                  <Activity className="h-4 w-4" />
                  Actief aan de slag
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline leading-tight mb-6">
                  Wat kun je doen bij artrose?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Iedereen ervaart artrose anders. Daarom starten wij met een korte vragenlijst
                  om jouw klachten, belastbaarheid en leefstijl in kaart te brengen. Op basis
                  daarvan krijg je passende hulp aangeboden — bij jou in de buurt of online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-terracotta to-orange-700 relative overflow-hidden">
          <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px] text-white/10 pointer-events-none" />

          <div className="container-narrow relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-white">
              Persoonlijke hulp bij artrose
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Wil je weten welke ondersteuning het beste past bij jouw artroseklachten?
              Zet vandaag de eerste stap en start met de vragenlijst.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full h-16 px-10 text-lg font-semibold shadow-2xl hover:scale-105 transition-all bg-white text-terracotta hover:bg-white/90">
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
