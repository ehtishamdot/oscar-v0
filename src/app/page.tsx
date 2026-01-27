"use client";

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Clock, Shield, Coins, ClipboardList, BarChart3, UserCheck, ChevronRight, ChevronDown, Check, Search, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden" style={{ color: '#1D1B1B' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E2DA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg icon-gradient flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>ZorgRoute</span>
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {[
                { href: '/leefstijl', label: 'Leefstijl' },
                { href: '/artrose', label: 'Artrose' },
                { href: '/beperkingen', label: 'Dagelijks leven' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#5B5857] hover:text-[#1D1B1B] transition-colors text-[0.95rem]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/questionnaire">
              <button className="btn-pill-green text-sm flex items-center gap-2 py-2.5 px-5">
                Beginnen
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[72px]">
        {/* Hero Section */}
        <section className="bg-calm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 md:py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <p className="text-[0.85rem] text-[#5B5857] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Hulp bij heup- en knieklachten
                </p>
                <h1 className="text-[2.25rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.08] tracking-[-0.025em] mb-6">
                  <span className="text-gradient-emerald">Herstel</span> begint hier
                </h1>

                <p className="text-[1.05rem] md:text-lg text-[#5B5857] leading-[1.65] max-w-[460px] mx-auto lg:mx-0 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Heeft u last van uw heup of knie? Wij helpen u snel en
                  eenvoudig op weg naar de juiste zorg. Zonder wachttijd.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
                  <Link href="/questionnaire">
                    <button className="btn-pill h-[50px] px-7 text-[0.9rem] flex items-center gap-2.5">
                      Start de vragenlijst
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link href="#hoe-het-werkt">
                    <button className="btn-pill-outline h-[50px] px-7 text-[0.9rem] flex items-center gap-2">
                      Hoe werkt het?
                    </button>
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-[400px] lg:max-w-none aspect-[4/5] rounded-[2rem] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1447005497901-b3e9ee359928?w=900&h=1200&fit=crop&crop=faces&q=85"
                    alt="Blij ouder echtpaar wandelend in de natuur"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 400px, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits bar - Mindler style */}
        <section className="py-14 md:py-16 bg-white border-b border-[#E5E2DA]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16">
              {[
                {
                  icon: Search,
                  title: 'U kiest',
                  description: 'Vul de vragenlijst in en ontvang direct een persoonlijk advies. Snel en eenvoudig.',
                },
                {
                  icon: Clock,
                  title: 'Geen wachttijd',
                  description: 'We koppelen u aan een zorgverlener bij u in de buurt. Zonder lange wachttijden.',
                },
                {
                  icon: Zap,
                  title: 'Effectief',
                  description: 'Onze aanpak richt zich op bewezen methoden die aansluiten bij uw persoonlijke situatie.',
                },
              ].map((item, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="w-10 h-10 rounded-full icon-gradient flex items-center justify-center mx-auto sm:mx-0 mb-4">
                    <item.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>
                  <p className="text-[0.85rem] text-[#5B5857] leading-[1.6]" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="hoe-het-werkt" className="py-20 md:py-28 lg:py-32 bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.1] tracking-[-0.02em]">
                Persoonlijke hulp in
                <span className="text-gradient-emerald"> 3 stappen</span>
              </h2>
              <p className="text-[#5B5857] text-[1.05rem] mt-4 max-w-lg mx-auto leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Iedere klacht is anders. Daarom brengen we uw situatie eerst in kaart.
              </p>
            </div>

            {/* Desktop: steps with arrows */}
            <div className="hidden md:grid grid-cols-[1fr_40px_1fr_40px_1fr] gap-3 items-stretch">
              {[
                {
                  num: '1',
                  icon: ClipboardList,
                  title: 'Vragenlijst invullen',
                  description: 'Beantwoord een paar korte vragen over uw klachten en situatie. Dit duurt slechts 2 minuten.',
                },
                {
                  num: '2',
                  icon: BarChart3,
                  title: 'Analyse op maat',
                  description: 'We analyseren uw antwoorden en brengen uw klachten en leefstijl in kaart.',
                },
                {
                  num: '3',
                  icon: UserCheck,
                  title: 'Hulp ontvangen',
                  description: 'U wordt gekoppeld aan de juiste zorgverlener die contact met u opneemt.',
                },
              ].map((item, i) => (
                <Fragment key={i}>
                  <div className="card-calm p-8 lg:p-10 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full icon-gradient flex items-center justify-center mb-5">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Stap {item.num}</div>
                    <h3 className="text-xl lg:text-[1.35rem] font-bold mb-3">{item.title}</h3>
                    <p className="text-[#5B5857] leading-relaxed text-[0.88rem]" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center">
                      <ChevronRight className="h-5 w-5 text-[#D1CEC6]" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* Mobile: vertical */}
            <div className="md:hidden space-y-2">
              {[
                {
                  num: '1',
                  icon: ClipboardList,
                  title: 'Vragenlijst invullen',
                  description: 'Beantwoord een paar korte vragen over uw klachten en situatie. Dit duurt slechts 2 minuten.',
                },
                {
                  num: '2',
                  icon: BarChart3,
                  title: 'Analyse op maat',
                  description: 'We analyseren uw antwoorden en brengen uw klachten en leefstijl in kaart.',
                },
                {
                  num: '3',
                  icon: UserCheck,
                  title: 'Hulp ontvangen',
                  description: 'U wordt gekoppeld aan de juiste zorgverlener die contact met u opneemt.',
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="card-calm p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full icon-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-bold text-emerald-600 tracking-widest uppercase mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>Stap {item.num}</div>
                      <h3 className="text-[1.05rem] font-bold mb-1">{item.title}</h3>
                      <p className="text-[#5B5857] text-[0.85rem] leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.description}</p>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="flex justify-center py-1">
                      <ChevronDown className="h-5 w-5 text-[#D1CEC6]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA under steps */}
            <div className="text-center mt-12 md:mt-14">
              <Link href="/questionnaire">
                <button className="btn-pill-green h-[50px] px-7 text-[0.9rem] flex items-center gap-2.5 mx-auto">
                  Begin direct
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonial Section - Mindler style */}
        <section className="py-16 md:py-24 bg-calm">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <p className="text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] leading-[1.35] tracking-[-0.015em] italic mb-6">
              &ldquo;Het was sneller geregeld dan ik dacht&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2 text-[0.85rem] text-[#8A8885]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span>Maria, 72</span>
              <span className="text-[#D1CEC6]">&mdash;</span>
              <span>Den Haag</span>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              {/* Image grid */}
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-3 md:space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                      <Image
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=660&fit=crop&crop=faces&q=80"
                        alt="Persoon doet oefeningen"
                        width={500}
                        height={660}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                      <Image
                        src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&h=380&fit=crop&crop=faces&q=80"
                        alt="Zorgverlener in gesprek met patiënt"
                        width={500}
                        height={380}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4 pt-8">
                    <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                      <Image
                        src="https://images.unsplash.com/photo-1573496799515-eebbb63814f2?w=500&h=380&fit=crop&crop=faces&q=80"
                        alt="Fysiotherapie sessie"
                        width={500}
                        height={380}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                      <Image
                        src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&h=660&fit=crop&crop=faces&q=80"
                        alt="Wandelen in de natuur"
                        width={500}
                        height={660}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="order-1 lg:order-2">
                <p className="text-[0.8rem] font-bold text-emerald-600 tracking-widest uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Zorg op maat</p>
                <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-bold leading-[1.12] tracking-[-0.02em] mb-5">
                  Zorg bij u in de buurt of online
                </h2>
                <p className="text-[1.05rem] text-[#5B5857] leading-[1.65] mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Na het invullen van de vragenlijst koppelen we u direct aan de juiste hulp.
                  Geen lange wachttijden, geen onnodige stappen.
                </p>

                <div className="space-y-3.5 mb-8">
                  {[
                    'Deskundige zorgverleners bij u in de buurt',
                    'Online begeleiding en ondersteuning',
                    'Hulp bij zowel klachten als leefstijlverbetering',
                    'Geen verwijzing van huisarts nodig',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full icon-gradient flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[#3D3B3A] text-[0.92rem]" style={{ fontFamily: 'Outfit, sans-serif' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/questionnaire">
                  <button className="btn-pill flex items-center gap-2.5 text-[0.9rem]">
                    Ontdek uw mogelijkheden
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Service Cards Section - Mindler 3-column style */}
        <section className="py-20 md:py-28 lg:py-32 bg-calm">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  href: '/leefstijl',
                  title: 'Leefstijl',
                  description: 'Ontdek hoe bewegen, voeding en slaap invloed hebben op uw gewrichten.',
                  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80',
                },
                {
                  href: '/artrose',
                  title: 'Artrose',
                  description: 'Wat is artrose en wat kunt u eraan doen? Lees het hier.',
                  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop&crop=faces&q=80',
                },
                {
                  href: '/beperkingen',
                  title: 'Dagelijks leven',
                  description: 'Hoe gewrichtsklachten uw dagelijks leven beïnvloeden.',
                  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80',
                },
              ].map((card, i) => (
                <Link key={i} href={card.href} className="group">
                  <div className="card-calm overflow-hidden h-full">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-[1.05rem] font-bold mb-1.5">{card.title}</h3>
                      <p className="text-[#5B5857] text-[0.85rem] mb-3 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[0.85rem] group-hover:gap-2.5 transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Lees meer
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Topic Pills Section - Mindler "Informatie over" style */}
        <section className="py-16 md:py-20 bg-white border-t border-[#E5E2DA]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-[1.5rem] md:text-[1.75rem] font-bold tracking-[-0.015em] mb-3">
              Informatie over uw gezondheid
            </h2>
            <p className="text-[#5B5857] text-[0.92rem] mb-8 max-w-md mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Kom meer te weten over verschillende klachten en behandelingen.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { label: 'Artrose', href: '/artrose' },
                { label: 'Heupklachten', href: '/questionnaire' },
                { label: 'Knieklachten', href: '/questionnaire' },
                { label: 'Leefstijl', href: '/leefstijl' },
                { label: 'Bewegen', href: '/leefstijl' },
                { label: 'Dagelijks leven', href: '/beperkingen' },
                { label: 'Fysiotherapie', href: '/questionnaire' },
              ].map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className="px-5 py-2.5 rounded-full border border-[#E5E2DA] text-[0.85rem] text-[#3D3B3A] hover:bg-[#1D1B1B] hover:text-white hover:border-[#1D1B1B] transition-all duration-200"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-green relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.2), transparent)' }} />

          <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center relative z-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold text-white leading-[1.12] tracking-[-0.02em] mb-5">
              Zet vandaag de eerste stap
            </h2>

            <p className="text-[1.05rem] text-emerald-100/80 leading-[1.6] mb-8 max-w-md mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Vul de korte vragenlijst in en ontdek welke hulp het beste bij u past.
              Binnen 2 minuten heeft u inzicht.
            </p>

            <Link href="/questionnaire">
              <button className="inline-flex items-center gap-2.5 h-[52px] px-8 text-[0.95rem] font-semibold rounded-full bg-white text-emerald-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 mx-auto">
                Start nu met de vragenlijst
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1D1B1B] text-white py-10 border-t border-[#333]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg icon-gradient flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-[0.9rem] font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>ZorgRoute Nederland</span>
            </div>

            <nav className="flex items-center gap-5">
              {[
                { href: '/leefstijl', label: 'Leefstijl' },
                { href: '/artrose', label: 'Artrose' },
                { href: '/beperkingen', label: 'Dagelijks leven' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#8A8885] hover:text-white transition-colors text-[0.82rem]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-[#5B5857] text-[0.82rem]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              &copy; {new Date().getFullYear()} ZorgRoute Nederland
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
