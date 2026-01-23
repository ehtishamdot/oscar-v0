"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, Heart, Users, Sparkles, Activity, ChevronRight, Check, Zap, Shield, Star } from 'lucide-react';

// Animated gradient orb
const GradientOrb = ({ className, color = "emerald" }: { className?: string; color?: "emerald" | "violet" | "sky" }) => {
  const colors = {
    emerald: "from-emerald-400/30 to-emerald-600/20",
    violet: "from-violet-400/30 to-violet-600/20",
    sky: "from-sky-400/30 to-sky-600/20",
  };
  return (
    <div className={`absolute rounded-full bg-gradient-to-br ${colors[color]} blur-3xl ${className}`} />
  );
};

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-4 mt-4">
          <div className="glass rounded-2xl px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800">ZorgRoute Nederland</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                {[
                  { href: '/leefstijl', label: 'Leefstijl' },
                  { href: '/artrose', label: 'Artrose' },
                  { href: '/beperkingen', label: 'Dagelijks leven' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-600 hover:text-emerald-600 transition-colors font-medium relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </nav>

              <Link href="/questionnaire">
                <button className="btn-premium h-12 px-8 text-white font-semibold flex items-center gap-2">
                  Start nu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-28">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
          <GradientOrb className="w-[800px] h-[800px] -top-40 -right-40 animate-float-slow" color="emerald" />
          <GradientOrb className="w-[600px] h-[600px] -bottom-20 -left-20 animate-float-delayed" color="violet" />

          <div className="container-wide relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left">
                <div className="animate-fade-up animate-fade-up-1">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-100 text-emerald-700 text-sm font-semibold mb-8 shadow-lg shadow-emerald-500/10">
                    <Sparkles className="h-4 w-4" />
                    Persoonlijke zorg op maat
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8 animate-fade-up animate-fade-up-2">
                  <span className="text-slate-800">Direct de</span>
                  <br />
                  <span className="text-gradient-premium glow-text">juiste hulp</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-xl mb-12 animate-fade-up animate-fade-up-3">
                  Heb je last van je heup of knie? Wij helpen je snel en eenvoudig
                  op weg naar de goede zorg die bij jou past.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 animate-fade-up animate-fade-up-4">
                  <Link href="/questionnaire">
                    <button className="btn-premium h-16 px-10 text-lg text-white font-semibold flex items-center gap-3 animate-pulse-glow">
                      Start de vragenlijst
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </Link>
                  <div className="flex items-center gap-6 text-slate-500">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      2 minuten
                    </span>
                    <span className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      100% privacy
                    </span>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="mt-12 animate-fade-up animate-fade-up-5">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
                          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
                          'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face',
                          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
                        ].map((src, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                            <Image src={src} alt="" width={32} height={32} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span>1000+ mensen geholpen</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-2">4.9/5 beoordeling</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative animate-fade-up animate-fade-up-3 hidden lg:block">
                <div className="relative">
                  {/* Main image */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20">
                    <Image
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=900&fit=crop"
                      alt="Fysiotherapeut helpt patiënt met oefeningen"
                      width={600}
                      height={700}
                      className="w-full h-[600px] object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent" />
                  </div>

                  {/* Floating card 1 */}
                  <div className="absolute -left-8 top-20 glass rounded-2xl p-4 shadow-xl animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Geen wachttijd</p>
                        <p className="text-sm text-slate-500">Direct geholpen</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating card 2 */}
                  <div className="absolute -right-8 bottom-32 glass rounded-2xl p-4 shadow-xl animate-float-delayed">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Experts</p>
                        <p className="text-sm text-slate-500">Bij jou in de buurt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 rounded-full bg-emerald-500" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="container-wide relative">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6">
                <Zap className="h-4 w-4" />
                Hoe het werkt
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
                Persoonlijke hulp in
                <span className="text-gradient-emerald"> 3 stappen</span>
              </h2>
              <p className="text-xl text-slate-600">
                Iedere klacht is anders. Daarom brengen we jouw situatie eerst in kaart.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-32 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-500 via-violet-500 to-emerald-500" />

              {[
                {
                  step: '01',
                  image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
                  title: 'Vragenlijst invullen',
                  description: 'Beantwoord een paar korte vragen over je klachten en situatie. Dit duurt slechts 2 minuten.',
                  color: 'from-emerald-500 to-emerald-600',
                },
                {
                  step: '02',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
                  title: 'Analyse op maat',
                  description: 'We analyseren je antwoorden en brengen je klachten en leefstijl in kaart.',
                  color: 'from-violet-500 to-violet-600',
                },
                {
                  step: '03',
                  image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
                  title: 'Hulp ontvangen',
                  description: 'Je krijgt persoonlijke begeleiding en worden gekoppeld aan de juiste zorgverlener.',
                  color: 'from-emerald-500 to-emerald-600',
                },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="card-glass overflow-hidden h-full">
                    {/* Step number */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold shadow-lg z-10`}>
                      {item.step}
                    </div>

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>

                    <div className="p-8 pt-4">
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section with Image */}
        <section className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
          <GradientOrb className="w-[600px] h-[600px] -top-40 -right-40" color="emerald" />

          <div className="container-wide relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image side */}
              <div className="relative order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop"
                        alt="Persoon doet yoga oefening"
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop"
                        alt="Arts in gesprek met patiënt"
                        width={300}
                        height={250}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=400&h=300&fit=crop"
                        alt="Fysiotherapie sessie"
                        width={300}
                        height={250}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop"
                        alt="Gezonde leefstijl"
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">100+ zorgverleners</span>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold mb-6">
                  <MapPin className="h-4 w-4" />
                  Zorg dichtbij of online
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                  Zorg bij jou in de buurt
                  <span className="text-gradient-premium"> of online</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Na het invullen van de vragenlijst koppelen we je direct aan de juiste hulp.
                  Geen lange wachttijden, geen onnodige stappen.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Deskundige zorgverleners bij jou in de buurt',
                    'Online begeleiding en ondersteuning',
                    'Hulp bij zowel klachten als leefstijlverbetering',
                    'Geen verwijzing van huisarts nodig',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 group hover:border-emerald-200 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/questionnaire">
                  <button className="btn-premium h-14 px-8 text-white font-semibold flex items-center gap-2">
                    Ontdek jouw mogelijkheden
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: '2', unit: 'min', label: 'Vragenlijst invullen', color: 'from-emerald-500 to-emerald-600' },
                { number: '24', unit: 'uur', label: 'Reactietijd', color: 'from-violet-500 to-violet-600' },
                { number: '100', unit: '%', label: 'Privacy gewaarborgd', color: 'from-sky-500 to-sky-600' },
                { number: '0', unit: '€', label: 'Voor de vragenlijst', color: 'from-amber-500 to-amber-600' },
              ].map((stat, i) => (
                <div key={i} className="card-premium p-8 text-center group">
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                    <span className="text-2xl">{stat.unit}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="section-padding bg-slate-50 relative">
          <div className="container-wide">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6">
                <Activity className="h-4 w-4" />
                Meer informatie
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Ontdek hoe wij je kunnen
                <span className="text-gradient-emerald"> helpen</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  href: '/leefstijl',
                  title: 'Leefstijl en klachten',
                  description: 'Ontdek hoe bewegen, voeding en slaap invloed hebben op je gewrichten',
                  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
                },
                {
                  href: '/artrose',
                  title: 'Artrose',
                  description: 'Wat is artrose en wat kun je eraan doen? Lees het hier',
                  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop',
                },
                {
                  href: '/beperkingen',
                  title: 'Dagelijks leven',
                  description: 'Hoe gewrichtsklachten je dagelijks leven beïnvloeden',
                  image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=400&fit=crop',
                },
              ].map((card, i) => (
                <Link key={i} href={card.href} className="group">
                  <div className="card-premium overflow-hidden h-full">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <h3 className="absolute bottom-4 left-6 right-6 text-2xl font-bold text-white">
                        {card.title}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-600 mb-4">{card.description}</p>
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-4 transition-all">
                        Lees meer
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&h=1080&fit=crop"
              alt="Achtergrond"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/90" />
          </div>

          <div className="absolute inset-0 bg-dot-pattern opacity-10" />

          <div className="container-narrow relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Begin vandaag nog
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Zet vandaag de
              <br />
              <span className="text-emerald-300">eerste stap</span>
            </h2>

            <p className="text-xl text-emerald-100/80 leading-relaxed mb-12 max-w-2xl mx-auto">
              Vul de korte vragenlijst in en ontdek welke hulp het beste bij jou past.
              Binnen 2 minuten heb je inzicht in jouw mogelijkheden.
            </p>

            <Link href="/questionnaire">
              <button className="relative h-16 px-12 rounded-full bg-white text-emerald-700 font-bold text-lg shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto group">
                Start nu met de vragenlijst
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold block">ZorgRoute Nederland</span>
              </div>
            </div>

            <nav className="flex items-center gap-8">
              {[
                { href: '/leefstijl', label: 'Leefstijl' },
                { href: '/artrose', label: 'Artrose' },
                { href: '/beperkingen', label: 'Dagelijks leven' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ZorgRoute Nederland
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
