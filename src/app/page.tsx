"use client";

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Clock, Shield, Coins, ClipboardList, BarChart3, UserCheck, ChevronRight, ChevronDown, Check } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden" style={{ color: '#1D1B1B' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E2DA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
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
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-[2.5rem] sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.02em] mb-6">
                  Direct de{' '}
                  <span className="text-emerald-600">juiste zorg</span>
                  {' '}voor u
                </h1>

                <p className="text-lg md:text-xl text-[#5B5857] leading-[1.6] max-w-[480px] mx-auto lg:mx-0 mb-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Heeft u last van uw heup of knie? Wij helpen u snel en eenvoudig
                  op weg naar de goede zorg die bij u past.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-12">
                  <Link href="/questionnaire">
                    <button className="btn-pill h-[52px] px-8 text-[0.95rem] flex items-center gap-3">
                      Start de vragenlijst
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link href="#hoe-het-werkt">
                    <button className="btn-pill-outline h-[52px] px-8 text-[0.95rem] flex items-center gap-2">
                      Hoe werkt het?
                    </button>
                  </Link>
                </div>

                {/* Trust line */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[0.82rem] text-[#8A8885]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Veilig &amp; vertrouwd
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    2 minuten
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5" />
                    Kosteloos
                  </span>
                </div>
              </div>

              {/* Hero Image */}
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/5] lg:aspect-[3/4] rounded-[2rem] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1447005497901-b3e9ee359928?w=900&h=1200&fit=crop&crop=faces&q=85"
                    alt="Blij ouder echtpaar wandelend in de natuur"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 420px, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {[
                { icon: Clock, value: '2 min', label: 'Vragenlijst invullen' },
                { icon: Shield, value: 'Privacy', label: 'Uw gegevens zijn veilig' },
                { icon: Coins, value: 'Kosteloos', label: 'Geen kosten voor u' },
              ].map((stat, i) => (
                <div key={i} className="text-center py-6">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-lg md:text-xl font-bold mb-0.5">
                    {stat.value}
                  </div>
                  <p className="text-[#8A8885] text-xs md:text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="hoe-het-werkt" className="py-20 md:py-28 lg:py-32 bg-calm scroll-mt-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-[-0.02em]">
                Persoonlijke hulp in
                <br className="hidden sm:block" />
                <span className="text-emerald-600"> 3 stappen</span>
              </h2>
              <p className="text-[#5B5857] text-lg mt-5 max-w-lg mx-auto leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Iedere klacht is anders. Daarom brengen we uw situatie eerst in kaart.
              </p>
            </div>

            {/* Desktop: steps with arrows */}
            <div className="hidden md:grid grid-cols-[1fr_48px_1fr_48px_1fr] gap-2 items-stretch">
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
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                      <item.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Stap {item.num}</div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-[#5B5857] leading-relaxed text-[0.9rem]" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center">
                      <ChevronRight className="h-6 w-6 text-[#CECCC4]" />
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
                  <div className="card-calm p-6 flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-bold text-emerald-600 tracking-widest uppercase mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Stap {item.num}</div>
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-[#5B5857] text-sm leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.description}</p>
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
            <div className="text-center mt-12 md:mt-16">
              <Link href="/questionnaire">
                <button className="btn-pill-green h-[52px] px-8 text-[0.95rem] flex items-center gap-3 mx-auto">
                  Begin direct
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image grid */}
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-3 md:space-y-4">
                    <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                      <Image
                        src="https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=500&h=660&fit=crop&crop=faces&q=80"
                        alt="Oudere dame doet lichte oefeningen"
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
                        alt="Oudere man wandelt buiten"
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
                <div className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Zorg op maat</div>
                <h2 className="text-3xl md:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.02em] mb-5">
                  Zorg bij u in de buurt of online
                </h2>
                <p className="text-lg text-[#5B5857] leading-[1.6] mb-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Na het invullen van de vragenlijst koppelen we u direct aan de juiste hulp.
                  Geen lange wachttijden, geen onnodige stappen.
                </p>

                <div className="space-y-3 mb-10">
                  {[
                    'Deskundige zorgverleners bij u in de buurt',
                    'Online begeleiding en ondersteuning',
                    'Hulp bij zowel klachten als leefstijlverbetering',
                    'Geen verwijzing van huisarts nodig',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[#3D3B3A] text-[0.95rem]" style={{ fontFamily: 'Outfit, sans-serif' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/questionnaire">
                  <button className="btn-pill flex items-center gap-2.5 text-[0.95rem]">
                    Ontdek uw mogelijkheden
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="py-20 md:py-28 lg:py-32 bg-calm">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
              <h2 className="text-3xl md:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.02em] mb-4">
                Meer weten over uw klachten?
              </h2>
              <p className="text-[#5B5857] text-lg leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Lees meer over hoe wij u kunnen helpen.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                {
                  href: '/leefstijl',
                  title: 'Leefstijl en klachten',
                  description: 'Ontdek hoe bewegen, voeding en slaap invloed hebben op uw gewrichten.',
                  image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop&crop=faces&q=80',
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
                  image: 'https://images.unsplash.com/photo-1556889882-733f43ff4326?w=600&h=400&fit=crop&crop=faces&q=80',
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
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                      <p className="text-[#5B5857] text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-sm group-hover:gap-2.5 transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
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

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-[#1D1B1B] relative overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 120%, rgba(5,150,105,0.4), transparent)' }} />

          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-[2.75rem] lg:text-[3.25rem] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-6">
              Zet vandaag de
              <br />
              eerste stap
            </h2>

            <p className="text-lg text-[#A8A6A3] leading-[1.6] mb-10 max-w-lg mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Vul de korte vragenlijst in en ontdek welke hulp het beste bij u past.
              Binnen 2 minuten heeft u inzicht in uw mogelijkheden.
            </p>

            <Link href="/questionnaire">
              <button className="btn-pill-green h-[56px] px-10 text-base flex items-center gap-3 mx-auto">
                Start nu met de vragenlijst
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1D1B1B] text-white py-12 border-t border-[#333]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>ZorgRoute Nederland</span>
            </div>

            <nav className="flex items-center gap-6">
              {[
                { href: '/leefstijl', label: 'Leefstijl' },
                { href: '/artrose', label: 'Artrose' },
                { href: '/beperkingen', label: 'Dagelijks leven' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#8A8885] hover:text-white transition-colors text-sm"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-[#5B5857] text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              &copy; {new Date().getFullYear()} ZorgRoute Nederland
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
