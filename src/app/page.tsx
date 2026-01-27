"use client";

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, ClipboardList, BarChart3, UserCheck, ChevronRight, ChevronDown, Check, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">ZorgRoute Nederland</span>
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
                  className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/questionnaire">
              <button className="btn-pill text-sm flex items-center gap-2">
                Start nu
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-calm">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-slate-800">
                  Direct de{' '}
                  <span className="text-emerald-600">juiste hulp</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mb-10">
                  Heeft u last van uw heup of knie? Wij helpen u snel en eenvoudig
                  op weg naar de goede zorg die bij u past.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Link href="/questionnaire">
                    <button className="btn-pill h-14 px-8 text-base flex items-center gap-3">
                      Start de vragenlijst
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </Link>
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      Veilig &amp; vertrouwd
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Image - moon/blob shape */}
              <div className="hidden lg:flex justify-center">
                <div className="relative w-[480px] h-[480px]">
                  <div className="rounded-blob w-full h-full overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1447005497901-b3e9ee359928?w=800&h=800&fit=crop&crop=faces"
                      alt="Blij ouder echtpaar wandelend in het park"
                      width={480}
                      height={480}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - 3 stats */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { value: '2 min', label: 'Vragenlijst invullen' },
                { value: 'Privacy', label: 'Uw gegevens zijn veilig' },
                { value: 'Kosteloos', label: 'Geen kosten voor u' },
              ].map((stat, i) => (
                <div key={i} className="card-calm p-8 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-calm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                Persoonlijke hulp in
                <span className="text-emerald-600"> 3 stappen</span>
              </h2>
              <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
                Iedere klacht is anders. Daarom brengen we uw situatie eerst in kaart.
              </p>
            </div>

            {/* Desktop: 5-column grid (step - arrow - step - arrow - step) */}
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
              {[
                {
                  icon: ClipboardList,
                  title: 'Vragenlijst invullen',
                  description: 'Beantwoord een paar korte vragen over uw klachten en situatie. Dit duurt slechts 2 minuten.',
                },
                {
                  icon: BarChart3,
                  title: 'Analyse op maat',
                  description: 'We analyseren uw antwoorden en brengen uw klachten en leefstijl in kaart.',
                },
                {
                  icon: UserCheck,
                  title: 'Hulp ontvangen',
                  description: 'U krijgt persoonlijke begeleiding en wordt gekoppeld aan de juiste zorgverlener.',
                },
              ].map((item, i) => (
                <Fragment key={i}>
                  <div className="card-calm p-8 text-center h-full">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center pt-16">
                      <ChevronRight className="h-8 w-8 text-emerald-300" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* Mobile: Vertical layout with downward connectors */}
            <div className="md:hidden space-y-3">
              {[
                {
                  icon: ClipboardList,
                  title: 'Vragenlijst invullen',
                  description: 'Beantwoord een paar korte vragen over uw klachten en situatie. Dit duurt slechts 2 minuten.',
                },
                {
                  icon: BarChart3,
                  title: 'Analyse op maat',
                  description: 'We analyseren uw antwoorden en brengen uw klachten en leefstijl in kaart.',
                },
                {
                  icon: UserCheck,
                  title: 'Hulp ontvangen',
                  description: 'U krijgt persoonlijke begeleiding en wordt gekoppeld aan de juiste zorgverlener.',
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="card-calm p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex justify-center py-1">
                      <ChevronDown className="h-6 w-6 text-emerald-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image grid */}
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=400&h=500&fit=crop&crop=faces"
                        alt="Oudere dame doet lichte oefeningen"
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop&crop=faces"
                        alt="Zorgverlener in gesprek met oudere patiënt"
                        width={300}
                        height={250}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1573496799515-eebbb63814f2?w=400&h=300&fit=crop&crop=faces"
                        alt="Fysiotherapie met oudere patiënt"
                        width={300}
                        height={250}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=500&fit=crop&crop=faces"
                        alt="Oudere man wandelt buiten"
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                  Zorg bij u in de buurt
                  <span className="text-emerald-600"> of online</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Na het invullen van de vragenlijst koppelen we u direct aan de juiste hulp.
                  Geen lange wachttijden, geen onnodige stappen.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Deskundige zorgverleners bij u in de buurt',
                    'Online begeleiding en ondersteuning',
                    'Hulp bij zowel klachten als leefstijlverbetering',
                    'Geen verwijzing van huisarts nodig',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 card-calm">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/questionnaire">
                  <button className="btn-pill flex items-center gap-2">
                    Ontdek uw mogelijkheden
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="py-20 md:py-28 bg-calm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Ontdek hoe wij u kunnen
                <span className="text-emerald-600"> helpen</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  href: '/leefstijl',
                  title: 'Leefstijl en klachten',
                  description: 'Ontdek hoe bewegen, voeding en slaap invloed hebben op uw gewrichten',
                  image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop&crop=faces',
                },
                {
                  href: '/artrose',
                  title: 'Artrose',
                  description: 'Wat is artrose en wat kunt u eraan doen? Lees het hier',
                  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop&crop=faces',
                },
                {
                  href: '/beperkingen',
                  title: 'Dagelijks leven',
                  description: 'Hoe gewrichtsklachten uw dagelijks leven beïnvloeden',
                  image: 'https://images.unsplash.com/photo-1556889882-733f43ff4326?w=600&h=400&fit=crop&crop=faces',
                },
              ].map((card, i) => (
                <Link key={i} href={card.href} className="group">
                  <div className="card-calm overflow-hidden h-full">
                    <div className="relative h-52 overflow-hidden rounded-t-2xl">
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
                      <p className="text-slate-600 text-sm mb-4">{card.description}</p>
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
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
        <section className="py-24 bg-emerald-600">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Zet vandaag de
              <br />
              eerste stap
            </h2>

            <p className="text-lg text-emerald-50/90 leading-relaxed mb-10 max-w-2xl mx-auto">
              Vul de korte vragenlijst in en ontdek welke hulp het beste bij u past.
              Binnen 2 minuten heeft u inzicht in uw mogelijkheden.
            </p>

            <Link href="/questionnaire">
              <button className="inline-flex items-center gap-3 h-14 px-10 rounded-full bg-white text-emerald-700 font-bold text-lg hover:-translate-y-1 transition-all duration-300 group">
                Start nu met de vragenlijst
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ZorgRoute Nederland</span>
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
