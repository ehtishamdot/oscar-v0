'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  HeartPulse,
  Stethoscope,
  Salad,
  CigaretteOff,
  Activity,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';

// Pathway configuration for display
const pathwayInfo: Record<string, { title: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  fysio: {
    title: 'Fysiotherapie',
    icon: <HeartPulse className="h-6 w-6" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  ergo: {
    title: 'Ergotherapie',
    icon: <Stethoscope className="h-6 w-6" />,
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200'
  },
  diet: {
    title: 'Voedingsbegeleiding',
    icon: <Salad className="h-6 w-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  smoking: {
    title: 'Stoppen met Roken',
    icon: <CigaretteOff className="h-6 w-6" />,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200'
  },
  gli: {
    title: 'GLI Programma',
    icon: <Activity className="h-6 w-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 border-purple-200'
  },
};

// Question labels for display (simplified versions)
const questionLabels: Record<string, string> = {
  // Fysiotherapie
  fysio_location: 'Locatie klachten',
  fysio_duration: 'Duur klachten',
  fysio_pain_level: 'Pijnniveau',
  fysio_pain_triggers: 'Pijn triggers',
  fysio_surgery: 'Eerdere operaties',
  fysio_aids: 'Hulpmiddelen',
  fysio_goals: 'Doelen',
  // Ergotherapie
  ergo_activities: 'Probleem activiteiten',
  ergo_housing: 'Woonsituatie',
  ergo_current_aids: 'Huidige hulpmiddelen',
  ergo_work_status: 'Werksituatie',
  ergo_living_situation: 'Thuissituatie',
  ergo_goals: 'Doelen',
  // Diëtist
  diet_allergies: 'Allergieën',
  diet_current: 'Huidig dieet',
  diet_goals: 'Doelen',
  diet_meals: 'Aantal maaltijden',
  diet_cooking: 'Kookgewoonten',
  diet_conditions: 'Medische aandoeningen',
  // Stoppen met roken
  smoking_amount: 'Sigaretten per dag',
  smoking_years: 'Jaren gerookt',
  smoking_attempts: 'Stoppoging',
  smoking_triggers: 'Triggers',
  smoking_motivation: 'Motivatie',
  smoking_nicotine: 'Nicotinevervangers',
  // GLI
  gli_activity: 'Huidige activiteit',
  gli_activities_enjoyed: 'Favoriete activiteiten',
  gli_goals: 'Doelen',
  gli_barriers: 'Obstakels',
  gli_experience: 'Eerdere ervaring',
  gli_support: 'Ondersteuning thuis',
};

// Option labels for readable display
const optionLabels: Record<string, string> = {
  // Fysio locations
  heup_links: 'Linkerheup',
  heup_rechts: 'Rechterheup',
  knie_links: 'Linkerknie',
  knie_rechts: 'Rechterknie',
  // Fysio duration
  weeks: 'Minder dan 6 weken',
  months: '6 weken tot 3 maanden',
  half_year: '3 tot 6 maanden',
  year: '6 maanden tot 1 jaar',
  years: 'Langer dan 1 jaar',
  // Pain triggers
  walking: 'Wandelen',
  stairs: 'Traplopen',
  sitting: 'Lang zitten',
  standing: 'Lang staan',
  night: "'s Nachts / in rust",
  weather: 'Weersveranderingen',
  sports: 'Sporten / bewegen',
  // Surgery
  no: 'Nee',
  yes_same: 'Ja, aan hetzelfde gewricht',
  yes_other: 'Ja, aan een ander gewricht',
  // Aids
  none: 'Geen',
  cane: 'Wandelstok',
  walker: 'Rollator',
  crutches: 'Krukken',
  brace: 'Brace / bandage',
  other: 'Anders',
  // Ergo activities
  dressing: 'Aan- en uitkleden',
  bathing: 'Douchen / baden',
  cooking: 'Koken',
  cleaning: 'Huishouden',
  shopping: 'Boodschappen doen',
  gardening: 'Tuinieren',
  work: 'Werk',
  hobbies: "Hobby's",
  // Housing
  apartment_ground: 'Appartement (begane grond)',
  apartment_elevator: 'Appartement (met lift)',
  apartment_stairs: 'Appartement (zonder lift)',
  house_one_floor: 'Woning (gelijkvloers)',
  house_stairs: 'Woning (met trap)',
  // Current aids
  grab_bars: 'Handgrepen (badkamer)',
  shower_chair: 'Douchestoel',
  raised_toilet: 'Verhoogd toilet',
  reacher: 'Grijper / reacher',
  sock_aid: 'Sokaantrekker',
  // Work status
  employed: 'Werkend',
  part_time: 'Parttime werkend',
  sick_leave: 'Ziek thuis',
  retired: 'Gepensioneerd',
  unemployed: 'Niet werkend',
  // Living situation
  alone: 'Ik woon alleen',
  partner: 'Ik woon met partner',
  family: 'Ik woon met familie',
  care_home: 'Ik woon in een zorginstelling',
  // Diet allergies
  gluten: 'Gluten',
  lactose: 'Lactose',
  nuts: 'Noten',
  shellfish: 'Schaaldieren',
  soy: 'Soja',
  // Diet types
  vegetarian: 'Vegetarisch',
  vegan: 'Veganistisch',
  low_carb: 'Koolhydraatarm',
  medical: 'Medisch dieet',
  // Diet goals
  weight_loss: 'Afvallen',
  healthier: 'Gezonder eten',
  energy: 'Meer energie',
  inflammation: 'Ontstekingen verminderen',
  muscle: 'Spiermassa behouden/opbouwen',
  // Meals
  '1-2': '1-2 maaltijden',
  '3': '3 maaltijden',
  '4-5': '4-5 maaltijden',
  '6+': 'Meer dan 5 maaltijden',
  // Cooking
  self: 'Ik kook zelf',
  together: 'We koken samen',
  delivery: 'Maaltijden worden bezorgd',
  eating_out: 'Ik eet vaak buitenshuis',
  // Conditions
  diabetes: 'Diabetes',
  heart: 'Hart- en vaatziekten',
  kidney: 'Nierproblemen',
  stomach: 'Maag-/darmproblemen',
  // Smoking amount
  '1-5': '1-5 sigaretten',
  '6-10': '6-10 sigaretten',
  '11-20': '11-20 sigaretten',
  '21-40': '21-40 sigaretten',
  '40+': 'Meer dan 40 sigaretten',
  // Smoking years
  '<1': 'Minder dan 1 jaar',
  '1-5': '1-5 jaar',
  '5-10': '5-10 jaar',
  '10-20': '10-20 jaar',
  '20+': 'Meer dan 20 jaar',
  // Smoking attempts
  never: 'Nee, dit is mijn eerste poging',
  once: 'Ja, één keer',
  few: 'Ja, een paar keer',
  many: 'Ja, vaak geprobeerd',
  // Smoking triggers
  stress: 'Stress',
  social: 'Sociale situaties',
  coffee: 'Bij koffie/thee',
  alcohol: 'Bij alcohol',
  boredom: 'Verveling',
  habit: 'Gewoonte',
  emotions: 'Emoties',
  // Nicotine
  patches: 'Nicotinepleisters',
  gum: 'Nicotinekauwgom',
  vape: 'E-sigaret',
  // GLI activity
  monthly: 'Enkele keren per maand',
  weekly: '1-2 keer per week',
  regular: '3-4 keer per week',
  daily: 'Dagelijks',
  // GLI activities enjoyed
  cycling: 'Fietsen',
  swimming: 'Zwemmen',
  gym: 'Fitness',
  group: 'Groepslessen',
  yoga: 'Yoga / Pilates',
  dancing: 'Dansen',
  // GLI goals
  weight: 'Afvallen',
  fitness: 'Fitter worden',
  pain: 'Minder pijn',
  health: 'Gezonder leven',
  mobility: 'Beter kunnen bewegen',
  // GLI barriers
  time: 'Geen tijd',
  motivation: 'Geen motivatie',
  tired: 'Te moe',
  cost: 'Kosten',
  knowledge: 'Weet niet hoe te beginnen',
  // GLI experience
  diet: "Ja, afvalprogramma's",
  both: 'Ja, beide',
  // GLI support
  yes_active: 'Ja, partner/familie doet actief mee',
  yes_support: 'Ja, ik krijg steun maar ze doen niet mee',
  no_support: 'Nee, maar dat is geen probleem',
  no_barrier: 'Nee, en dat maakt het moeilijker',
};

function formatAnswer(questionId: string, answer: any): string {
  if (answer === undefined || answer === null) return '-';

  // Handle arrays (checkbox answers)
  if (Array.isArray(answer)) {
    return answer.map(a => optionLabels[a] || a).join(', ');
  }

  // Handle objects (rating_with_note answers)
  if (typeof answer === 'object' && answer !== null) {
    if ('rating' in answer) {
      const rating = answer.rating;
      const note = answer.note;
      if (note) {
        return `${rating}/10 - ${note}`;
      }
      return `${rating}/10`;
    }
    // Fallback for other objects
    return JSON.stringify(answer);
  }

  // Handle slider values (numbers)
  if (typeof answer === 'number') {
    if (questionId.includes('pain') || questionId.includes('motivation')) {
      return `${answer}/10`;
    }
    return String(answer);
  }

  // Handle string values (radio/text)
  return optionLabels[answer] || String(answer);
}

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathways = searchParams.getAll('pathway');
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get answers from sessionStorage
    const storedAnswers = sessionStorage.getItem('intakeAnswers');
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }
    setLoading(false);
  }, []);

  const handleContinue = () => {
    // Pass pathway to patient registration
    const pathway = pathways[0];
    if (pathway) {
      router.push(`/intake/patient?pathway=${pathway}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
        <p>Samenvatting laden...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
          Uw Antwoorden Samenvatting
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Hieronder vindt u een overzicht van uw antwoorden. Controleer of alles klopt voordat u doorgaat naar de registratie.
        </p>
      </div>

      {/* Pathway Summaries */}
      <div className="space-y-6">
        {pathways.map((pathwayId) => {
          const info = pathwayInfo[pathwayId];
          const pathwayAnswers = answers[pathwayId] || {};

          if (!info) return null;

          return (
            <Card key={pathwayId} className={`overflow-hidden ${info.bgColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white ${info.color}`}>
                    {info.icon}
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  {Object.entries(pathwayAnswers).length > 0 ? (
                    Object.entries(pathwayAnswers).map(([questionId, answer]) => (
                      <div key={questionId} className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b last:border-0">
                        <span className="text-sm font-medium text-muted-foreground">
                          {questionLabels[questionId] || questionId}
                        </span>
                        <span className="text-sm font-medium text-right max-w-[60%]">
                          {formatAnswer(questionId, answer)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Geen antwoorden ingevuld</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Step Info */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader className="flex flex-row items-start gap-4">
          <User className="h-8 w-8 text-blue-500 mt-1" />
          <div>
            <CardTitle className="text-lg">Volgende stap: Uw gegevens</CardTitle>
            <CardDescription className="text-blue-700 mt-2">
              Om uw trajecten in gang te zetten hebben we nog enkele persoonlijke gegevens nodig.
              Na registratie ontvangt u een bevestiging en worden de zorgverleners direct op de hoogte gesteld.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Antwoorden aanpassen
        </Button>
        <Button onClick={handleContinue} size="lg">
          Doorgaan naar registratie
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default function IntakeSummaryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Samenvatting laden...</div>}>
          <SummaryContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ZorgRoute Nederland. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
