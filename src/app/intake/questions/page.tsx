'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartPulse,
  Stethoscope,
  Salad,
  CigaretteOff,
  Activity,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Clock,
} from 'lucide-react';

// Question types
type QuestionType = 'radio' | 'checkbox' | 'slider' | 'text' | 'textarea' | 'rating_with_note' | 'grid';

interface QuestionOption {
  id: string;
  label: string;
  showTextField?: boolean;
}

interface GridItem {
  id: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  gridItems?: GridItem[];
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  conditionalOn?: { questionId: string; value: string };
}

interface PathwayConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  questions: Question[];
}

// Helper to get joint description from sessionStorage
const getJointDescription = (): string => {
  if (typeof window === 'undefined') return 'uw gewricht';
  const stored = sessionStorage.getItem('jointSelection');
  if (!stored) return 'uw gewricht';
  const joints = JSON.parse(stored) as string[];
  if (joints.length === 0) return 'uw gewricht';

  const labels: Record<string, string> = {
    heup_links: 'linkerheup',
    heup_rechts: 'rechterheup',
    knie_links: 'linkerknie',
    knie_rechts: 'rechterknie',
  };

  return joints.map(j => labels[j] || j).join(' en ');
};

// Check if patient has knee complaints
const hasKneeComplaints = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem('jointSelection');
  if (!stored) return false;
  const joints = JSON.parse(stored) as string[];
  return joints.some(j => j.includes('knie'));
};

// Check if patient has hip complaints
const hasHipComplaints = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem('jointSelection');
  if (!stored) return false;
  const joints = JSON.parse(stored) as string[];
  return joints.some(j => j.includes('heup'));
};

// FYSIO Questionnaire
const fysioQuestions: Question[] = [
  {
    id: 'fysio_since',
    text: 'Sinds wanneer heeft u deze klachten?',
    type: 'text',
    placeholder: 'Bijv. 3 maanden, sinds vorige zomer',
    required: true,
  },
  {
    id: 'fysio_cause',
    text: 'Hoe zijn de klachten ontstaan?',
    subtext: 'Bijv. geleidelijk, na een ongeval, na sporten',
    type: 'text',
    placeholder: 'Beschrijf hoe de klachten zijn begonnen',
    required: true,
  },
  {
    id: 'fysio_pain_score',
    text: 'Kunt u de pijnscore aangeven op een schaal van 0 tot 10?',
    subtext: '0 = geen pijn, 10 = ergst denkbare pijn',
    type: 'slider',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'fysio_worse',
    text: 'Wat maakt de klachten erger?',
    type: 'textarea',
    placeholder: 'Beschrijf situaties of activiteiten',
    required: true,
  },
  {
    id: 'fysio_better',
    text: 'Wat maakt de klachten minder?',
    type: 'textarea',
    placeholder: 'Beschrijf wat helpt',
    required: true,
  },
  {
    id: 'fysio_goal',
    text: 'Wat is uw belangrijkste doel dat u wilt bereiken met fysiotherapie?',
    type: 'textarea',
    placeholder: 'Bijv. weer kunnen wandelen, sporten hervatten',
    required: true,
  },
];

// KOOS-PS for knee patients
const koosQuestions: Question[] = [
  {
    id: 'koos_intro',
    text: 'KOOS-PS Vragenlijst',
    subtext: 'Geef aan hoeveel moeite u de afgelopen week heeft ervaren vanwege uw knie bij de volgende activiteiten.',
    type: 'grid',
    gridItems: [
      { id: 'koos_bed', label: 'Opstaan vanuit bed' },
      { id: 'koos_socks', label: 'Sokken / kousen aantrekken' },
      { id: 'koos_chair', label: 'Opstaan vanuit een stoel' },
      { id: 'koos_floor', label: 'Bukken naar de grond / iets oppakken' },
      { id: 'koos_turn', label: 'Draaien op een belaste knie' },
      { id: 'koos_kneel', label: 'Knielen' },
      { id: 'koos_squat', label: 'Op uw hurken zitten' },
    ],
  },
];

// HOOS-PS for hip patients
const hoosQuestions: Question[] = [
  {
    id: 'hoos_intro',
    text: 'HOOS-PS Vragenlijst',
    subtext: 'Geef aan hoeveel moeite u de afgelopen week heeft ervaren vanwege uw heup bij de volgende activiteiten.',
    type: 'grid',
    gridItems: [
      { id: 'hoos_stairs', label: 'Trap aflopen' },
      { id: 'hoos_bath', label: 'In / uit bad of douche gaan' },
      { id: 'hoos_sit', label: 'Zitten' },
      { id: 'hoos_run', label: 'Hardlopen' },
      { id: 'hoos_turn', label: 'Draaien op een belast been' },
    ],
  },
];

// ERGO Questionnaire - 11 rating questions
const ergoQuestions: Question[] = [
  {
    id: 'ergo_other_conditions',
    text: 'Speelt er naast uw knie- of heupklachten nog een andere aandoening of klacht die uw dagelijks leven beïnvloedt?',
    type: 'radio',
    options: [
      { id: 'no', label: 'Nee, alleen mijn gewrichtsklachten' },
      { id: 'yes', label: 'Ja, namelijk:', showTextField: true },
    ],
    required: true,
  },
  {
    id: 'ergo_daily_activities',
    text: 'Kunt u uw dagelijkse activiteiten uitvoeren zoals u dat wilt?',
    subtext: 'Geef een cijfer van 0 (helemaal niet) tot 10 (volledig wel)',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_indoor_satisfaction',
    text: 'Bent u tevreden over de uitvoer van uw dagelijkse activiteiten binnenshuis, al dan niet met hulp of hulpmiddelen?',
    subtext: 'Denk aan: wassen, aankleden, koken, poetsen, hobby\'s',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_outdoor_satisfaction',
    text: 'Bent u tevreden over uw deelname aan activiteiten buitenshuis, al dan niet met hulp of hulpmiddelen?',
    subtext: 'Denk aan: boodschappen doen, uitstapjes, werk, school, afspraken',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_understanding',
    text: 'Heeft u inzicht in de mogelijkheden en beperkingen als gevolg van uw gewrichtsklachten?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_ask_help',
    text: 'Vraagt u hulp als u dit nodig heeft (bijvoorbeeld bij het doen van de dagelijkse dingen)?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_boundaries',
    text: 'Kunt u uw grenzen aangeven?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_energy',
    text: 'Bent u tevreden over de manier waarop u uw energie verdeelt zodat u uw dagelijkse activiteiten kunt uitvoeren?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_accept',
    text: 'Accepteert u de gevolgen van uw gewrichtsklachten?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_cope',
    text: 'Kunt u (praktisch) omgaan met de gevolgen van uw gewrichtsklachten?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_environment_accept',
    text: 'Accepteert uw omgeving (partner/naasten) de gevolgen van uw gewrichtsklachten?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
  {
    id: 'ergo_environment_cope',
    text: 'Kan uw omgeving (partner/naasten) (praktisch) omgaan met de gevolgen van uw gewrichtsklachten?',
    type: 'rating_with_note',
    min: 0,
    max: 10,
    required: true,
  },
];

// DIETIST Questionnaire - 8 sections
const dietQuestions: Question[] = [
  // Section 1: Goals
  {
    id: 'diet_goals',
    text: 'Wat vind je belangrijk om hulp bij te krijgen?',
    type: 'checkbox',
    options: [
      { id: 'weight_loss', label: 'Gewichtsverlies' },
      { id: 'healthy_eating', label: 'Gezond(er) eten' },
      { id: 'energy', label: 'Verbeteren energie / fitheid' },
      { id: 'strength', label: 'Voor opbouwen kracht' },
      { id: 'other', label: 'Anders:', showTextField: true },
    ],
    required: true,
  },
  // Section 2: Eating patterns
  {
    id: 'diet_meals_per_day',
    text: 'Hoeveel maaltijden eet je gemiddeld per dag?',
    type: 'radio',
    options: [
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
      { id: 'more', label: 'Meer' },
      { id: 'varies', label: 'Wisselend' },
    ],
    required: true,
  },
  {
    id: 'diet_snacks',
    text: 'Hoe vaak per week eet je snacks tussen maaltijden?',
    type: 'radio',
    options: [
      { id: 'never', label: 'Nooit' },
      { id: '1-3', label: '1–3 keer' },
      { id: '4-6', label: '4–6 keer' },
      { id: 'daily', label: 'Dagelijks' },
    ],
    required: true,
  },
  {
    id: 'diet_eating_out',
    text: 'Hoe vaak eet je buiten de deur (restaurants/afhaal)?',
    type: 'radio',
    options: [
      { id: 'rarely', label: 'Zelden' },
      { id: '1-2', label: '1–2× per week' },
      { id: '3-4', label: '3–4× per week' },
      { id: '5+', label: '5× of meer' },
    ],
    required: true,
  },
  {
    id: 'diet_meal_replacements',
    text: 'Gebruik je maaltijdvervangers of dieetproducten?',
    type: 'radio',
    options: [
      { id: 'yes', label: 'Ja', showTextField: true },
      { id: 'no', label: 'Nee' },
      { id: 'sometimes', label: 'Soms' },
    ],
    required: true,
  },
  // Section 3: Preferences & intolerances
  {
    id: 'diet_allergies',
    text: 'Heb je voedselallergieën of intoleranties?',
    type: 'checkbox',
    options: [
      { id: 'none', label: 'Geen' },
      { id: 'lactose', label: 'Lactose' },
      { id: 'gluten', label: 'Gluten' },
      { id: 'nuts', label: 'Noten' },
      { id: 'other', label: 'Andere:', showTextField: true },
    ],
    required: true,
  },
  {
    id: 'diet_avoid',
    text: 'Zijn er voedingsmiddelen die je bewust vermijdt?',
    type: 'checkbox',
    options: [
      { id: 'meat', label: 'Vlees' },
      { id: 'dairy', label: 'Zuivel' },
      { id: 'sugar', label: 'Suiker' },
      { id: 'fat', label: 'Vette voeding' },
      { id: 'other', label: 'Anders:', showTextField: true },
    ],
  },
  // Section 4: Medical background
  {
    id: 'diet_conditions',
    text: 'Heb je (één of meerdere) van de volgende aandoeningen?',
    type: 'checkbox',
    options: [
      { id: 'diabetes', label: 'Diabetes / bloedsuikerproblemen' },
      { id: 'cholesterol', label: 'Verhoogd cholesterol' },
      { id: 'thyroid', label: 'Schildklierproblemen' },
      { id: 'gastro', label: 'Gastro-intestinale klachten (zoals reflux, opgeblazen gevoel)' },
      { id: 'liver_kidney', label: 'Lever-/nierproblemen' },
      { id: 'none', label: 'Geen' },
      { id: 'other', label: 'Anders:', showTextField: true },
    ],
    required: true,
  },
  {
    id: 'diet_medication',
    text: 'Gebruik je medicatie of voedingssupplementen?',
    type: 'radio',
    options: [
      { id: 'yes', label: 'Ja', showTextField: true },
      { id: 'no', label: 'Nee' },
    ],
    required: true,
  },
  // Section 5: Lifestyle
  {
    id: 'diet_activity',
    text: 'Hoe zou je jouw fysieke activiteit omschrijven?',
    type: 'radio',
    options: [
      { id: 'none', label: 'Weinig/geen beweging' },
      { id: 'light', label: 'Lichte beweging' },
      { id: 'moderate', label: 'Matig actief' },
      { id: 'very', label: 'Zeer actief' },
    ],
    required: true,
  },
  {
    id: 'diet_water',
    text: 'Hoeveel glazen water drink je per dag?',
    type: 'radio',
    options: [
      { id: '0-1', label: '0–1 glazen' },
      { id: '2-3', label: '2–3 glazen' },
      { id: '4-5', label: '4–5 glazen' },
      { id: '5+', label: 'Meer dan 5 glazen' },
    ],
    required: true,
  },
  {
    id: 'diet_coffee',
    text: 'Hoeveel koppen koffie/thee drink je per dag?',
    type: 'radio',
    options: [
      { id: '0-1', label: '0–1 koppen' },
      { id: '2-3', label: '2–3 koppen' },
      { id: '4-5', label: '4–5 koppen' },
      { id: '5+', label: 'Meer dan 5 koppen' },
    ],
    required: true,
  },
  {
    id: 'diet_alcohol',
    text: 'Hoe vaak drink je alcohol?',
    type: 'radio',
    options: [
      { id: 'none', label: 'Geen' },
      { id: '1-2', label: '1–2× per week' },
      { id: '3-5', label: '3–5× per week' },
      { id: 'daily', label: 'Dagelijks' },
    ],
    required: true,
  },
  // Section 6: Relationship with food
  {
    id: 'diet_relationship',
    text: 'Hoe ervaar je je relatie met eten?',
    type: 'radio',
    options: [
      { id: 'no_problems', label: 'Geen problemen' },
      { id: 'binge', label: 'Eetbuien' },
      { id: 'stress', label: 'Stresseten' },
      { id: 'too_little', label: 'Te weinig eten' },
      { id: 'other', label: 'Anders:', showTextField: true },
    ],
    required: true,
  },
  {
    id: 'diet_current_diet',
    text: 'Ben je momenteel bezig met een dieet?',
    type: 'radio',
    options: [
      { id: 'yes', label: 'Ja', showTextField: true },
      { id: 'no', label: 'Nee' },
    ],
    required: true,
  },
  // Section 7: Food diary
  {
    id: 'diet_breakfast',
    text: 'Wat at je gisteren bij het ontbijt?',
    type: 'textarea',
    placeholder: 'Beschrijf je ontbijt',
  },
  {
    id: 'diet_lunch',
    text: 'Wat at je gisteren bij de lunch?',
    type: 'textarea',
    placeholder: 'Beschrijf je lunch',
  },
  {
    id: 'diet_dinner',
    text: 'Wat at je gisteren bij het diner?',
    type: 'textarea',
    placeholder: 'Beschrijf je diner',
  },
  {
    id: 'diet_snacks_yesterday',
    text: 'Welke tussendoortjes had je gisteren?',
    type: 'textarea',
    placeholder: 'Beschrijf je tussendoortjes',
  },
  {
    id: 'diet_drinks_yesterday',
    text: 'Wat dronk je gisteren?',
    type: 'textarea',
    placeholder: 'Beschrijf je dranken',
  },
  // Section 8: Extra info
  {
    id: 'diet_extra',
    text: 'Is er nog iets dat belangrijk is voor je diëtist om te weten?',
    type: 'textarea',
    placeholder: 'Eventuele extra informatie',
  },
];

// SMOKING Questionnaire - 3 parts (11 questions)
const smokingQuestions: Question[] = [
  // Part 1: Smoking behavior
  {
    id: 'smoking_what',
    text: 'Wat rook je meestal?',
    type: 'radio',
    options: [
      { id: 'cigarettes', label: 'Sigaretten' },
      { id: 'rolling', label: 'Shag' },
      { id: 'cigars', label: 'Sigaren' },
      { id: 'vape', label: 'E-sigaret (vape)' },
    ],
    required: true,
  },
  {
    id: 'smoking_amount',
    text: 'Hoeveel rook je per dag?',
    type: 'radio',
    options: [
      { id: '10-', label: '10 of minder' },
      { id: '11-20', label: '11 tot 20' },
      { id: '21-30', label: '21 tot 30' },
      { id: '30+', label: 'Meer dan 30' },
    ],
    required: true,
  },
  {
    id: 'smoking_first',
    text: 'Hoe snel na het wakker worden steek je de eerste op?',
    type: 'radio',
    options: [
      { id: '5min', label: 'Binnen 5 minuten' },
      { id: '30min', label: 'Binnen een half uur' },
      { id: '1hour', label: 'Binnen een uur' },
      { id: 'later', label: 'Pas later op de dag' },
    ],
    required: true,
  },
  {
    id: 'smoking_years',
    text: 'Hoeveel jaar rook je al?',
    type: 'radio',
    options: [
      { id: '<10', label: 'Korter dan 10 jaar' },
      { id: '10-20', label: '10 tot 20 jaar' },
      { id: '20-30', label: '20 tot 30 jaar' },
      { id: '30+', label: 'Langer dan 30 jaar' },
    ],
    required: true,
  },
  {
    id: 'smoking_others',
    text: 'Roken er andere mensen bij jou thuis?',
    type: 'radio',
    options: [
      { id: 'no', label: 'Nee' },
      { id: 'partner_kids', label: 'Ja, mijn partner of kinderen' },
      { id: 'others', label: 'Ja, andere huisgenoten of familie' },
    ],
    required: true,
  },
  // Part 2: Previous attempts
  {
    id: 'smoking_tried',
    text: 'Heb je al eerder geprobeerd om te stoppen?',
    type: 'radio',
    options: [
      { id: 'no', label: 'Nee' },
      { id: 'once', label: 'Ja, 1 keer' },
      { id: 'multiple', label: 'Ja, vaker dan 1 keer' },
    ],
    required: true,
  },
  {
    id: 'smoking_aids_used',
    text: 'Heb je toen hulpmiddelen gebruikt?',
    subtext: 'Alleen invullen als je eerder hebt geprobeerd te stoppen',
    type: 'radio',
    options: [
      { id: 'cold_turkey', label: 'Nee, ik stopte zonder hulp (cold turkey)' },
      { id: 'nicotine', label: 'Ja, nicotinevervangers (pleisters, kauwgom)' },
      { id: 'medication', label: 'Ja, medicijnen via de huisarts' },
      { id: 'vape', label: 'Ja, e-sigaret' },
      { id: 'coaching', label: 'Ja, begeleiding of coaching' },
    ],
    conditionalOn: { questionId: 'smoking_tried', value: 'once' },
  },
  // Part 3: Ready to quit
  {
    id: 'smoking_when',
    text: 'Wanneer wil je stoppen?',
    type: 'radio',
    options: [
      { id: '2weeks', label: 'Binnen 2 weken' },
      { id: '1month', label: 'Binnen 1 maand' },
      { id: '6months', label: 'Binnen 6 maanden' },
      { id: 'unsure', label: 'Ik weet het nog niet (ik twijfel nog)' },
    ],
    required: true,
  },
  {
    id: 'smoking_want',
    text: 'Hoe graag wil je stoppen?',
    type: 'radio',
    options: [
      { id: 'very', label: 'Heel graag' },
      { id: 'quite', label: 'Graag' },
      { id: 'bit', label: 'Een beetje' },
      { id: 'not', label: 'Niet zo graag' },
    ],
    required: true,
  },
  {
    id: 'smoking_confidence',
    text: 'Denk je dat het gaat lukken om te stoppen?',
    type: 'radio',
    options: [
      { id: 'yes', label: 'Ja, zeker weten' },
      { id: 'think_so', label: 'Ik denk het wel' },
      { id: 'doubt', label: 'Ik twijfel' },
      { id: 'afraid_not', label: 'Ik ben bang van niet' },
    ],
    required: true,
  },
  {
    id: 'smoking_support',
    text: 'Heb je mensen in je omgeving die jou steunen?',
    type: 'radio',
    options: [
      { id: 'much', label: 'Ja, veel steun' },
      { id: 'some', label: 'Ja, een beetje steun' },
      { id: 'little', label: 'Nee, weinig tot geen steun' },
    ],
    required: true,
  },
];

// Transition screen messages
interface TransitionContent {
  title: string;
  message: string;
  encouragement: string;
  estimatedTime: string;
}

const getIntroContent = (pathwayId: string, isFirst: boolean): TransitionContent => {
  const contents: Record<string, TransitionContent> = {
    fysio: {
      title: isFirst ? 'Laten we beginnen!' : 'Fysiotherapie Vragenlijst',
      message: isFirst
        ? 'U gaat nu een aantal korte vragenlijsten invullen. Hiermee kan uw zorgverlener u beter helpen. We beginnen met vragen over uw fysieke klachten.'
        : 'Nu volgen er vragen over uw fysieke klachten en bewegingsmogelijkheden. Dit helpt de fysiotherapeut om een gericht behandelplan te maken.',
      encouragement: 'Neem rustig de tijd om de vragen te beantwoorden.',
      estimatedTime: '± 3 minuten',
    },
    ergo: {
      title: 'Ergotherapie Vragenlijst',
      message: 'De volgende vragen gaan over uw dagelijkse activiteiten. Dit helpt de ergotherapeut te begrijpen hoe uw klachten uw dagelijks leven beïnvloeden.',
      encouragement: 'Er zijn geen goede of foute antwoorden - het gaat om uw persoonlijke ervaring.',
      estimatedTime: '± 4 minuten',
    },
    diet: {
      title: 'Voedingsvragenlijst',
      message: 'We stellen nu vragen over uw eetpatroon en voeding. Goede voeding kan een belangrijke rol spelen bij uw herstel.',
      encouragement: 'Beantwoord de vragen zo eerlijk mogelijk - dit helpt de diëtist u beter te adviseren.',
      estimatedTime: '± 5 minuten',
    },
    smoking: {
      title: 'Vragenlijst Stoppen met Roken',
      message: 'De laatste vragen gaan over uw rookgedrag. Stoppen met roken kan uw herstel aanzienlijk versnellen.',
      encouragement: 'We begrijpen dat dit een gevoelig onderwerp kan zijn. Uw antwoorden helpen ons de beste ondersteuning te bieden.',
      estimatedTime: '± 3 minuten',
    },
    gli: {
      title: 'GLI Programma',
      message: 'Vragen over leefstijl en beweging.',
      encouragement: 'Bijna klaar!',
      estimatedTime: '± 2 minuten',
    },
  };
  return contents[pathwayId] || contents.fysio;
};

const getCompletionContent = (completedPathway: string, nextPathway: string): TransitionContent => {
  const completedNames: Record<string, string> = {
    fysio: 'fysiotherapie',
    ergo: 'ergotherapie',
    diet: 'voeding',
    smoking: 'roken',
    gli: 'leefstijl',
  };

  return {
    title: 'Goed gedaan!',
    message: `U heeft de vragen over ${completedNames[completedPathway] || completedPathway} afgerond. Dit helpt uw zorgverlener enorm.`,
    encouragement: 'U bent goed op weg! Nog even doorzetten.',
    estimatedTime: '',
  };
};

// Build pathway configs dynamically
const getPathwayConfigs = (): Record<string, PathwayConfig> => {
  // Get KOOS or HOOS based on joint selection
  const hasKnee = hasKneeComplaints();
  const hasHip = hasHipComplaints();

  let fysioAllQuestions = [...fysioQuestions];
  if (hasKnee) {
    fysioAllQuestions = [...fysioAllQuestions, ...koosQuestions];
  }
  if (hasHip) {
    fysioAllQuestions = [...fysioAllQuestions, ...hoosQuestions];
  }

  return {
    fysio: {
      id: 'fysio',
      title: 'Fysiotherapie',
      icon: <HeartPulse className="h-6 w-6" />,
      color: 'text-blue-500',
      questions: fysioAllQuestions,
    },
    ergo: {
      id: 'ergo',
      title: 'Ergotherapie',
      icon: <Stethoscope className="h-6 w-6" />,
      color: 'text-green-500',
      questions: ergoQuestions,
    },
    diet: {
      id: 'diet',
      title: 'Voedingsbegeleiding',
      icon: <Salad className="h-6 w-6" />,
      color: 'text-orange-500',
      questions: dietQuestions,
    },
    smoking: {
      id: 'smoking',
      title: 'Stoppen met Roken',
      icon: <CigaretteOff className="h-6 w-6" />,
      color: 'text-red-500',
      questions: smokingQuestions,
    },
    gli: {
      id: 'gli',
      title: 'GLI Programma',
      icon: <Activity className="h-6 w-6" />,
      color: 'text-purple-500',
      questions: [], // GLI uses diet + fysio, no separate questions for now
    },
  };
};

function IntakeQuestionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get selected pathways from URL
  const pathways = searchParams.getAll('pathway').filter(p => p !== 'gli'); // GLI doesn't have own questions

  const [pathwayConfigs, setPathwayConfigs] = useState<Record<string, PathwayConfig>>({});
  const [currentPathwayIndex, setCurrentPathwayIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>({});
  const [textFieldValues, setTextFieldValues] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Transition screen states
  const [showTransition, setShowTransition] = useState(true); // Start with intro screen
  const [transitionType, setTransitionType] = useState<'intro' | 'completion'>('intro');
  const [completedPathwayId, setCompletedPathwayId] = useState<string | null>(null);

  // Initialize pathway configs on mount
  useEffect(() => {
    setPathwayConfigs(getPathwayConfigs());
  }, []);

  // Get current pathway config
  const currentPathwayId = pathways[currentPathwayIndex];
  const currentPathway = pathwayConfigs[currentPathwayId];

  // Get current question
  const currentQuestion = currentPathway?.questions[currentQuestionIndex];

  // Initialize answers for current pathway if not exists
  useEffect(() => {
    if (currentPathwayId && !answers[currentPathwayId]) {
      setAnswers(prev => ({
        ...prev,
        [currentPathwayId]: {},
      }));
    }
  }, [currentPathwayId, answers]);

  // Get current answer value
  const currentAnswer = answers[currentPathwayId]?.[currentQuestion?.id];

  // Calculate progress
  const totalQuestions = pathways.reduce((acc, p) => acc + (pathwayConfigs[p]?.questions.length || 0), 0);
  const answeredQuestions = Object.values(answers).reduce(
    (acc, pathwayAnswers) => acc + Object.keys(pathwayAnswers).length,
    0
  );
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Handle answer change
  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentPathwayId]: {
        ...prev[currentPathwayId],
        [currentQuestion.id]: value,
      },
    }));
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (optionId: string) => {
    const currentValue = (currentAnswer as string[]) || [];
    // Handle exclusive "none" option
    if (optionId === 'none') {
      handleAnswerChange(['none']);
    } else {
      const newValue = currentValue.includes(optionId)
        ? currentValue.filter(id => id !== optionId)
        : [...currentValue.filter(id => id !== 'none'), optionId];
      handleAnswerChange(newValue);
    }
  };

  // Handle grid answer (KOOS/HOOS)
  const handleGridAnswer = (itemId: string, value: number) => {
    const currentGridAnswers = currentAnswer || {};
    handleAnswerChange({
      ...currentGridAnswers,
      [itemId]: value,
    });
  };

  // Handle text field for options with showTextField
  const handleTextFieldChange = (questionId: string, optionId: string, value: string) => {
    setTextFieldValues(prev => ({
      ...prev,
      [`${questionId}_${optionId}`]: value,
    }));
  };

  // Check if current question is answered
  const isCurrentAnswered = () => {
    if (!currentQuestion) return false;

    if (currentQuestion.type === 'checkbox') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    if (currentQuestion.type === 'slider' || currentQuestion.type === 'rating_with_note') {
      return currentAnswer !== undefined && currentAnswer !== null;
    }
    if (currentQuestion.type === 'textarea' || currentQuestion.type === 'text') {
      return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
    }
    if (currentQuestion.type === 'grid') {
      // Check if all grid items are answered
      const gridAnswers = currentAnswer || {};
      return currentQuestion.gridItems?.every(item => gridAnswers[item.id] !== undefined) || false;
    }
    return currentAnswer !== undefined && currentAnswer !== '';
  };

  // Handle next
  const handleNext = () => {
    if (!isCurrentAnswered() && currentQuestion?.required) return;

    // Store text field values with the answer
    if (currentQuestion) {
      const textFieldData: Record<string, string> = {};
      currentQuestion.options?.forEach(opt => {
        if (opt.showTextField) {
          const key = `${currentQuestion.id}_${opt.id}`;
          if (textFieldValues[key]) {
            textFieldData[opt.id] = textFieldValues[key];
          }
        }
      });
      if (Object.keys(textFieldData).length > 0) {
        setAnswers(prev => ({
          ...prev,
          [currentPathwayId]: {
            ...prev[currentPathwayId],
            [`${currentQuestion.id}_text`]: textFieldData,
          },
        }));
      }
    }

    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestionIndex < (currentPathway?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentPathwayIndex < pathways.length - 1) {
        // Show completion + intro transition before moving to next pathway
        setCompletedPathwayId(currentPathwayId);
        setTransitionType('completion');
        setShowTransition(true);
        setCurrentPathwayIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        // All done - go to summary
        const params = new URLSearchParams();
        searchParams.getAll('pathway').forEach(p => params.append('pathway', p));
        sessionStorage.setItem('intakeAnswers', JSON.stringify(answers));
        router.push(`/intake/summary?${params.toString()}`);
      }
      setIsAnimating(false);
    }, 300);
  };

  // Handle transition screen continue
  const handleTransitionContinue = () => {
    setShowTransition(false);
    setCompletedPathwayId(null);
  };

  // Handle back
  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else if (currentPathwayIndex > 0) {
        const prevPathwayId = pathways[currentPathwayIndex - 1];
        const prevPathway = pathwayConfigs[prevPathwayId];
        setCurrentPathwayIndex(prev => prev - 1);
        setCurrentQuestionIndex((prevPathway?.questions.length || 1) - 1);
      } else {
        router.back();
      }
      setIsAnimating(false);
    }, 200);
  };

  // Handle no pathways or loading state
  if (pathways.length === 0 || Object.keys(pathwayConfigs).length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <p>Vragenlijsten laden...</p>
      </div>
    );
  }

  if (!currentPathway || !currentQuestion) {
    // If GLI only was selected, skip to summary
    if (searchParams.getAll('pathway').includes('gli') && pathways.length === 0) {
      const params = new URLSearchParams();
      searchParams.getAll('pathway').forEach(p => params.append('pathway', p));
      router.push(`/intake/summary?${params.toString()}`);
      return null;
    }
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <p>Geen vragenlijsten gevonden. Ga terug naar de resultaten pagina.</p>
        <Button className="mt-4" onClick={() => router.push('/questionnaire')}>
          Opnieuw beginnen
        </Button>
      </div>
    );
  }

  const gridOptions = [
    { value: 0, label: 'Geen' },
    { value: 1, label: 'Gering' },
    { value: 2, label: 'Matig' },
    { value: 3, label: 'Veel' },
    { value: 4, label: 'Erg veel' },
  ];

  // Transition Screen Content
  const transitionContent = showTransition
    ? transitionType === 'completion' && completedPathwayId
      ? getCompletionContent(completedPathwayId, currentPathwayId)
      : getIntroContent(currentPathwayId, currentPathwayIndex === 0)
    : null;

  // Show transition screen
  if (showTransition && transitionContent && currentPathway) {
    const nextPathwayIntro = transitionType === 'completion'
      ? getIntroContent(currentPathwayId, false)
      : null;

    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress Bar - still visible */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Voortgang</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Transition Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="text-center pb-4">
            {transitionType === 'completion' ? (
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <ThumbsUp className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            )}
            <CardTitle className="text-2xl font-bold">{transitionContent.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {transitionContent.message}
            </p>

            {/* If completion, show next pathway intro */}
            {transitionType === 'completion' && nextPathwayIntro && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-background ${currentPathway.color}`}>
                    {currentPathway.icon}
                  </div>
                  <h3 className="font-semibold">{nextPathwayIntro.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nextPathwayIntro.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {transitionType === 'completion' && nextPathwayIntro
                  ? nextPathwayIntro.estimatedTime
                  : transitionContent.estimatedTime}
              </span>
            </div>

            <p className="text-primary font-medium italic">
              {transitionType === 'completion' && nextPathwayIntro
                ? nextPathwayIntro.encouragement
                : transitionContent.encouragement}
            </p>

            <Button
              size="lg"
              onClick={handleTransitionContinue}
              className="mt-6 min-w-[200px]"
            >
              {transitionType === 'intro' && currentPathwayIndex === 0
                ? 'Start vragenlijst'
                : 'Doorgaan'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Pathway Progress Dots */}
        {pathways.length > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {pathways.map((p, i) => {
              const config = pathwayConfigs[p];
              const isComplete = i < currentPathwayIndex;
              const isCurrent = i === currentPathwayIndex;
              return (
                <div
                  key={p}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                    isComplete
                      ? 'bg-green-100 text-green-700'
                      : isCurrent
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-3 w-3" /> : null}
                  <span>{config?.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Voortgang</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pathway Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-muted ${currentPathway.color}`}>
          {currentPathway.icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Vragenlijst</p>
          <p className="font-semibold">{currentPathway.title}</p>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          Vraag {currentQuestionIndex + 1} van {currentPathway.questions.length}
        </div>
      </div>

      {/* Question Card */}
      <Card className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          {currentQuestion.subtext && (
            <CardDescription>{currentQuestion.subtext}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radio Options */}
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map(option => (
                <div key={option.id}>
                  <button
                    onClick={() => handleAnswerChange(option.id)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      currentAnswer === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer === option.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {currentAnswer === option.id && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                  {option.showTextField && currentAnswer === option.id && (
                    <div className="mt-2 ml-8">
                      <Input
                        placeholder="Specificeer..."
                        value={textFieldValues[`${currentQuestion.id}_${option.id}`] || ''}
                        onChange={(e) => handleTextFieldChange(currentQuestion.id, option.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox Options */}
          {currentQuestion.type === 'checkbox' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map(option => {
                const isSelected = (currentAnswer as string[] || []).includes(option.id);
                return (
                  <div key={option.id}>
                    <button
                      onClick={() => handleCheckboxToggle(option.id)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                    {option.showTextField && isSelected && (
                      <div className="mt-2 ml-8">
                        <Input
                          placeholder="Specificeer..."
                          value={textFieldValues[`${currentQuestion.id}_${option.id}`] || ''}
                          onChange={(e) => handleTextFieldChange(currentQuestion.id, option.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {currentQuestion.type === 'slider' && (
            <div className="space-y-6 py-4">
              <Slider
                value={[currentAnswer ?? currentQuestion.min ?? 0]}
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={1}
                onValueChange={([value]) => handleAnswerChange(value)}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{currentQuestion.min}</span>
                <span className="text-4xl font-bold text-primary">{currentAnswer ?? currentQuestion.min}</span>
                <span className="text-sm text-muted-foreground">{currentQuestion.max}</span>
              </div>
            </div>
          )}

          {/* Rating with Note */}
          {currentQuestion.type === 'rating_with_note' && (
            <div className="space-y-4">
              <div className="space-y-6 py-4">
                <Slider
                  value={[typeof currentAnswer === 'object' ? currentAnswer?.rating ?? 0 : currentAnswer ?? 0]}
                  min={currentQuestion.min ?? 0}
                  max={currentQuestion.max ?? 10}
                  step={1}
                  onValueChange={([value]) => handleAnswerChange({
                    ...(typeof currentAnswer === 'object' ? currentAnswer : {}),
                    rating: value
                  })}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{currentQuestion.min ?? 0}</span>
                  <span className="text-4xl font-bold text-primary">
                    {typeof currentAnswer === 'object' ? currentAnswer?.rating ?? 0 : currentAnswer ?? 0}
                  </span>
                  <span className="text-sm text-muted-foreground">{currentQuestion.max ?? 10}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Toelichting (optioneel)</Label>
                <Textarea
                  value={typeof currentAnswer === 'object' ? currentAnswer?.note ?? '' : ''}
                  onChange={(e) => handleAnswerChange({
                    ...(typeof currentAnswer === 'object' ? currentAnswer : { rating: 0 }),
                    note: e.target.value
                  })}
                  placeholder="Eventuele toelichting..."
                />
              </div>
            </div>
          )}

          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <Input
              value={currentAnswer || ''}
              onChange={e => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="h-12"
            />
          )}

          {/* Textarea */}
          {currentQuestion.type === 'textarea' && (
            <Textarea
              value={currentAnswer || ''}
              onChange={e => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="min-h-[120px]"
            />
          )}

          {/* Grid (KOOS/HOOS) */}
          {currentQuestion.type === 'grid' && currentQuestion.gridItems && (
            <div className="space-y-4">
              <div className="hidden sm:grid grid-cols-6 gap-2 text-sm text-center text-muted-foreground mb-2">
                <div></div>
                {gridOptions.map(opt => (
                  <div key={opt.value}>{opt.label}</div>
                ))}
              </div>
              {currentQuestion.gridItems.map(item => {
                const gridAnswers = currentAnswer || {};
                return (
                  <div key={item.id} className="space-y-2">
                    <p className="font-medium text-sm">{item.label}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {gridOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleGridAnswer(item.id, opt.value)}
                          className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm transition-all ${
                            gridAnswers[item.id] === opt.value
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <span className="sm:hidden">{opt.value}</span>
                          <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Vorige
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestion.required && !isCurrentAnswered()}
        >
          {currentPathwayIndex === pathways.length - 1 &&
           currentQuestionIndex === (currentPathway?.questions.length || 0) - 1
            ? 'Afronden'
            : 'Volgende'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Pathway Progress Dots */}
      {pathways.length > 1 && (
        <div className="flex justify-center gap-2 mt-8 flex-wrap">
          {pathways.map((p, i) => {
            const config = pathwayConfigs[p];
            const isComplete = i < currentPathwayIndex;
            const isCurrent = i === currentPathwayIndex;
            return (
              <div
                key={p}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                  isComplete
                    ? 'bg-green-100 text-green-700'
                    : isCurrent
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-3 w-3" /> : null}
                <span>{config?.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function IntakeQuestionsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Vragen laden...</div>}>
          <IntakeQuestionsContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Oscar. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
