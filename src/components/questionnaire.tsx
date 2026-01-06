'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Home,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Stethoscope,
  HeartPulse,
  Activity,
  Salad,
  CigaretteOff,
  ClipboardCheck,
  Scale,
  User
} from 'lucide-react';
import LocalServices from './local-services';
import Link from 'next/link';

// Care needs / advice flags
export type CareNeeds = {
  physio: boolean;
  physioNetwork: boolean;
  ergo: boolean;
  gli: boolean;
  diet: boolean;
  smoking: boolean;
};

// Question IDs based on documentation
type QuestionId =
  | 'Q_COMPLAINT'
  | 'Q_DIAGNOSIS'
  | 'Q_AGE'
  | 'Q_RED_FLAGS'
  | 'Q_RECENT_FYSIO'
  | 'Q_NETWORK_FYSIO'
  | 'Q_ADL'
  | 'Q_BMI_CALC'
  | 'Q_NUTRI_SCREEN'
  | 'Q_SMOKING'
  | 'HARD_STOP_NO_COMPLAINT'
  | 'HARD_STOP_AGE'
  | 'HARD_STOP_RED_FLAGS'
  | 'END';

type QuestionType = 'radio' | 'checkbox' | 'bmi';

interface BaseQuestion {
  id: QuestionId;
  text: string;
  subtext?: string;
  type: QuestionType;
  stepNumber: number;
  totalSteps: number;
  category: string;
}

interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: { text: string; value: string }[];
  next: (answer: string) => QuestionId;
}

interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: { id: string; text: string; exclusive?: boolean; hasTextField?: boolean }[];
  next: (selectedIds: string[]) => QuestionId;
}

interface BMIQuestion extends BaseQuestion {
  type: 'bmi';
  next: (bmi: number) => QuestionId;
}

type Question = RadioQuestion | CheckboxQuestion | BMIQuestion;

const TOTAL_STEPS = 6;

// Step information for visual progress
const stepInfo = [
  { number: 1, label: 'Intake', icon: ClipboardCheck, color: 'text-blue-500' },
  { number: 2, label: 'Screening', icon: Stethoscope, color: 'text-green-500' },
  { number: 3, label: 'Fysiotherapie', icon: HeartPulse, color: 'text-purple-500' },
  { number: 4, label: 'Dagelijks leven', icon: Activity, color: 'text-orange-500' },
  { number: 5, label: 'Leefstijl', icon: Scale, color: 'text-pink-500' },
  { number: 6, label: 'Roken', icon: CigaretteOff, color: 'text-red-500' },
];

const questions: Record<string, Question> = {
  Q_COMPLAINT: {
    id: 'Q_COMPLAINT',
    text: 'Heeft u klachten aan uw heup of knie?',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_DIAGNOSIS' : 'HARD_STOP_NO_COMPLAINT'),
    stepNumber: 1,
    totalSteps: TOTAL_STEPS,
    category: 'Intake',
  },
  Q_DIAGNOSIS: {
    id: 'Q_DIAGNOSIS',
    text: 'Is de diagnose artrose bij u vastgesteld door een arts?',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_RECENT_FYSIO' : 'Q_AGE'),
    stepNumber: 1,
    totalSteps: TOTAL_STEPS,
    category: 'Intake',
  },
  Q_AGE: {
    id: 'Q_AGE',
    text: 'Bent u ouder dan 50 jaar?',
    type: 'radio',
    options: [
      { text: 'Ja, 50 jaar of ouder', value: 'ja' },
      { text: 'Nee, jonger dan 50', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_RED_FLAGS' : 'HARD_STOP_AGE'),
    stepNumber: 2,
    totalSteps: TOTAL_STEPS,
    category: 'Screening',
  },
  Q_RED_FLAGS: {
    id: 'Q_RED_FLAGS',
    text: 'Heeft u last van één of meer van de volgende symptomen?',
    subtext: 'Plotselinge roodheid rond het gewricht, hoge koorts, of extreme acute pijn?',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'HARD_STOP_RED_FLAGS' : 'Q_RECENT_FYSIO'),
    stepNumber: 2,
    totalSteps: TOTAL_STEPS,
    category: 'Screening',
  },
  Q_RECENT_FYSIO: {
    id: 'Q_RECENT_FYSIO',
    text: 'Heeft u recent fysiotherapie gehad voor deze klacht?',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_NETWORK_FYSIO' : 'Q_ADL'),
    stepNumber: 3,
    totalSteps: TOTAL_STEPS,
    category: 'Fysiotherapie',
  },
  Q_NETWORK_FYSIO: {
    id: 'Q_NETWORK_FYSIO',
    text: 'Wilt u een fysiotherapeut uit ons specifieke netwerk?',
    subtext: 'Onze netwerkpartners zijn gespecialiseerd in artrose behandeling.',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'Q_ADL',
    stepNumber: 3,
    totalSteps: TOTAL_STEPS,
    category: 'Fysiotherapie',
  },
  Q_ADL: {
    id: 'Q_ADL',
    text: 'Ervaart u klachten of beperkingen bij het dagelijks functioneren?',
    subtext: 'Selecteer alle opties die van toepassing zijn',
    type: 'checkbox',
    options: [
      { id: 'traplopen', text: 'Traplopen' },
      { id: 'sporten', text: 'Sporten / Bewegen' },
      { id: 'wandelen', text: 'Wandelen' },
      { id: 'sokken', text: 'Sokken/schoenen aantrekken' },
      { id: 'anders', text: 'Anders, namelijk...', hasTextField: true },
      { id: 'geen', text: 'Nee, geen beperkingen', exclusive: true },
    ],
    next: () => 'Q_BMI_CALC',
    stepNumber: 4,
    totalSteps: TOTAL_STEPS,
    category: 'Dagelijks leven',
  },
  Q_BMI_CALC: {
    id: 'Q_BMI_CALC',
    text: 'Wat is uw lengte en gewicht?',
    subtext: 'Dit helpt ons om passend leefstijladvies te geven.',
    type: 'bmi',
    next: (bmi) => (bmi > 25 ? 'Q_SMOKING' : 'Q_NUTRI_SCREEN'),
    stepNumber: 5,
    totalSteps: TOTAL_STEPS,
    category: 'Leefstijl',
  },
  Q_NUTRI_SCREEN: {
    id: 'Q_NUTRI_SCREEN',
    text: 'Welke van de volgende stellingen zijn op u van toepassing?',
    subtext: 'Dit helpt ons uw voedingspatroon beter in te schatten',
    type: 'checkbox',
    options: [
      { id: 'afgevallen', text: 'Ik ben de afgelopen 6 maanden onbedoeld afgevallen' },
      { id: 'eetlust', text: 'Ik heb een verminderde eetlust' },
      { id: 'energie', text: 'Ik ervaar een laag energieniveau of snelle vermoeidheid' },
      { id: 'groente', text: 'Ik eet weinig groente/fruit (minder dan 200g per dag)' },
      { id: 'geen', text: 'Geen van bovenstaande', exclusive: true },
    ],
    next: () => 'Q_SMOKING',
    stepNumber: 5,
    totalSteps: TOTAL_STEPS,
    category: 'Leefstijl',
  },
  Q_SMOKING: {
    id: 'Q_SMOKING',
    text: 'Rookt u?',
    type: 'radio',
    options: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'END',
    stepNumber: 6,
    totalSteps: TOTAL_STEPS,
    category: 'Roken',
  },
};

// Hard Stop Screens
const HardStopNoComplaint = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Card className="shadow-xl border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-yellow-100">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="font-headline text-2xl md:text-3xl">
            Deze tool is niet geschikt voor u
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Helaas bieden wij momenteel alleen ondersteuning voor heup- of knieklachten via deze tool.
        </p>
        <p className="text-muted-foreground">
          Als u andere klachten heeft, raden wij u aan contact op te nemen met uw huisarts voor passend advies.
        </p>
      </CardContent>
    </Card>
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/" className="gap-2">
          <Home className="h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
);

const HardStopAge = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-100">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="font-headline text-2xl md:text-3xl">
            Advies: Raadpleeg uw huisarts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Gezien uw leeftijd (&lt;50) adviseren wij u contact op te nemen met uw huisarts voor nader onderzoek.
        </p>
        <p className="text-muted-foreground">
          Artrose komt vaker voor bij mensen boven de 50 jaar. Bij jongere mensen kunnen gewrichtsklachten andere oorzaken hebben.
        </p>
        <div className="pt-4">
          <LocalServices />
        </div>
      </CardContent>
    </Card>
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/" className="gap-2">
          <Home className="h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
);

const HardStopRedFlags = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Card className="shadow-xl border-2 border-red-400/50 bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-red-100 animate-pulse">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="font-headline text-2xl md:text-3xl text-red-800">
            Neem direct contact op met uw huisarts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Op basis van deze symptomen adviseren wij u <strong>direct</strong> contact op te nemen met uw huisarts.
        </p>
        <div className="bg-red-100 p-4 rounded-lg border border-red-200">
          <p className="font-semibold text-red-800">
            Bel uw huisarts vandaag nog, of de huisartsenpost buiten kantoortijden.
          </p>
        </div>
      </CardContent>
    </Card>
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/" className="gap-2">
          <Home className="h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
);

// Step Progress Component
const StepProgress = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="mb-8">
      {/* Mobile: Simple progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">
            Stap {currentStep} van {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepInfo[currentStep - 1]?.label}
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Desktop: Visual step indicators */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-4">
          {stepInfo.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Connector line before */}
                  {index > 0 && (
                    <div
                      className={`flex-1 h-1 transition-colors duration-300 ${
                        isCompleted || isActive ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}

                  {/* Step circle */}
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-lg'
                        : isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                    {isActive && (
                      <div className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
                    )}
                  </div>

                  {/* Connector line after */}
                  {index < stepInfo.length - 1 && (
                    <div
                      className={`flex-1 h-1 transition-colors duration-300 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Question Counter Component
const QuestionCounter = ({ answered, total }: { answered: number; total: number }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
    <div className="flex items-center gap-1">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span>{answered} beantwoord</span>
    </div>
    <span>•</span>
    <span>{total - answered} te gaan</span>
  </div>
);

const Questionnaire = () => {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId>('Q_COMPLAINT');
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [history, setHistory] = useState<QuestionId[]>([]);

  // BMI state
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Checkbox state
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  // "Anders" text field state
  const [andersText, setAndersText] = useState<string>('');

  // Animation state
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleRadioAnswer = (answerValue: string) => {
    const currentQuestion = questions[currentQuestionId] as RadioQuestion;
    if (!currentQuestion) return;

    setIsTransitioning(true);

    const newAnswers = { ...answers, [currentQuestionId]: answerValue };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(answerValue);

    setTimeout(() => {
      if (nextQuestionId === 'END') {
        navigateToResults(newAnswers);
      } else {
        setCurrentQuestionId(nextQuestionId);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const handleCheckboxSubmit = () => {
    const currentQuestion = questions[currentQuestionId] as CheckboxQuestion;
    if (!currentQuestion) return;

    setIsTransitioning(true);

    const newAnswers: Record<string, string | string[] | number> = {
      ...answers,
      [currentQuestionId]: selectedCheckboxes,
    };
    if (andersText && selectedCheckboxes.includes('anders')) {
      newAnswers[`${currentQuestionId}_anders_text`] = andersText;
    }

    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(selectedCheckboxes);
    setSelectedCheckboxes([]);
    setAndersText('');

    setTimeout(() => {
      if (nextQuestionId === 'END') {
        navigateToResults(newAnswers);
      } else {
        setCurrentQuestionId(nextQuestionId);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const handleCheckboxChange = (optionId: string, exclusive?: boolean) => {
    if (exclusive) {
      setSelectedCheckboxes(
        selectedCheckboxes.includes(optionId) ? [] : [optionId]
      );
    } else {
      const currentQuestion = questions[currentQuestionId] as CheckboxQuestion;
      const exclusiveOptionId = currentQuestion.options.find(o => o.exclusive)?.id;

      if (selectedCheckboxes.includes(optionId)) {
        setSelectedCheckboxes(selectedCheckboxes.filter(id => id !== optionId));
      } else {
        setSelectedCheckboxes([
          ...selectedCheckboxes.filter(id => id !== exclusiveOptionId),
          optionId,
        ]);
      }
    }
  };

  const handleBMISubmit = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!heightNum || !weightNum || heightNum <= 0 || weightNum <= 0) return;

    setIsTransitioning(true);

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);

    const currentQuestion = questions[currentQuestionId] as BMIQuestion;
    const newAnswers = { ...answers, [currentQuestionId]: bmi, height: heightNum, weight: weightNum };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(bmi);

    setTimeout(() => {
      if (nextQuestionId === 'END') {
        navigateToResults(newAnswers);
      } else {
        setCurrentQuestionId(nextQuestionId);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const navigateToResults = (finalAnswers: Record<string, string | string[] | number>) => {
    const careNeeds: CareNeeds = {
      physio: false,
      physioNetwork: false,
      ergo: false,
      gli: false,
      diet: false,
      smoking: false,
    };

    if (finalAnswers.Q_RECENT_FYSIO === 'nee') {
      careNeeds.physio = true;
    }
    if (finalAnswers.Q_RECENT_FYSIO === 'ja' && finalAnswers.Q_NETWORK_FYSIO === 'ja') {
      careNeeds.physioNetwork = true;
    }

    const adlAnswers = finalAnswers.Q_ADL as string[] | undefined;
    if (adlAnswers && adlAnswers.length > 0 && !adlAnswers.includes('geen')) {
      careNeeds.ergo = true;
    }

    const bmi = finalAnswers.Q_BMI_CALC as number | undefined;
    if (bmi && bmi > 25) {
      careNeeds.gli = true;
      careNeeds.diet = true;
    }

    const nutriAnswers = finalAnswers.Q_NUTRI_SCREEN as string[] | undefined;
    if (nutriAnswers && nutriAnswers.length > 0 && !nutriAnswers.includes('geen')) {
      careNeeds.diet = true;
    }

    if (finalAnswers.Q_SMOKING === 'ja') {
      careNeeds.smoking = true;
    }

    const query = new URLSearchParams({
      physio: String(careNeeds.physio),
      physioNetwork: String(careNeeds.physioNetwork),
      ergo: String(careNeeds.ergo),
      gli: String(careNeeds.gli),
      diet: String(careNeeds.diet),
      smoking: String(careNeeds.smoking),
    }).toString();

    router.push(`/results?${query}`);
  };

  const handleBack = () => {
    const previousQuestionId = history[history.length - 1];
    if (previousQuestionId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setHistory(history.slice(0, -1));
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestionId];
        setAnswers(newAnswers);
        setCurrentQuestionId(previousQuestionId);
        setSelectedCheckboxes([]);
        setHeight('');
        setWeight('');
        setIsTransitioning(false);
      }, 150);
    } else {
      router.back();
    }
  };

  // Render hard stop screens
  if (currentQuestionId === 'HARD_STOP_NO_COMPLAINT') {
    return <HardStopNoComplaint onBack={handleBack} />;
  }

  if (currentQuestionId === 'HARD_STOP_AGE') {
    return <HardStopAge onBack={handleBack} />;
  }

  if (currentQuestionId === 'HARD_STOP_RED_FLAGS') {
    return <HardStopRedFlags onBack={handleBack} />;
  }

  const currentQuestion = questions[currentQuestionId];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).filter(k => !k.includes('_anders_text') && !['height', 'weight'].includes(k)).length;

  // Get BMI value for display
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Ondergewicht', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Gezond gewicht', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overgewicht', color: 'text-orange-600' };
    return { label: 'Obesitas', color: 'text-red-600' };
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      {/* Step Progress */}
      <StepProgress currentStep={currentQuestion.stepNumber} totalSteps={currentQuestion.totalSteps} />

      {/* Question Counter */}
      <QuestionCounter answered={answeredCount} total={10} />

      {/* Question Card */}
      <div
        className={`transition-all duration-200 ${
          isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-4">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {currentQuestion.category}
              </span>
            </div>

            <CardTitle className="font-headline text-2xl md:text-3xl leading-tight">
              {currentQuestion.text}
            </CardTitle>
            {currentQuestion.subtext && (
              <CardDescription className="pt-2 text-base">
                {currentQuestion.subtext}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pt-2">
            {/* Radio Options */}
            {currentQuestion.type === 'radio' && (
              <div className="grid gap-3">
                {(currentQuestion as RadioQuestion).options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRadioAnswer(option.value)}
                    className="w-full p-4 text-left rounded-xl border-2 border-muted bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary flex items-center justify-center transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-primary/30 transition-colors" />
                      </div>
                      <span className="text-lg font-medium">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Checkbox Options */}
            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  {(currentQuestion as CheckboxQuestion).options.map((option) => (
                    <div key={option.id}>
                      <button
                        onClick={() => handleCheckboxChange(option.id, option.exclusive)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          selectedCheckboxes.includes(option.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted bg-background hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedCheckboxes.includes(option.id)}
                            onCheckedChange={() => handleCheckboxChange(option.id, option.exclusive)}
                            className="h-5 w-5"
                          />
                          <span className="text-base">{option.text}</span>
                        </div>
                      </button>
                      {option.hasTextField && selectedCheckboxes.includes(option.id) && (
                        <div className="mt-2 ml-4">
                          <Input
                            placeholder="Beschrijf uw andere beperking..."
                            value={andersText}
                            onChange={(e) => setAndersText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleCheckboxSubmit}
                  className="w-full h-12 text-base"
                  size="lg"
                  disabled={selectedCheckboxes.length === 0}
                >
                  Volgende
                </Button>
              </div>
            )}

            {/* BMI Input */}
            {currentQuestion.type === 'bmi' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-base font-medium">
                      Lengte (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="bijv. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="text-lg h-14 text-center"
                      min="100"
                      max="250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-base font-medium">
                      Gewicht (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="bijv. 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="text-lg h-14 text-center"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                {/* BMI Display */}
                {height && weight && parseFloat(height) > 0 && parseFloat(weight) > 0 && (
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Uw BMI</p>
                      <p className="text-4xl font-bold text-primary">
                        {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                      </p>
                      <p className={`text-sm font-medium mt-1 ${
                        getBMICategory(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).color
                      }`}>
                        {getBMICategory(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).label}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBMISubmit}
                  className="w-full h-12 text-base"
                  size="lg"
                  disabled={!height || !weight || parseFloat(height) <= 0 || parseFloat(weight) <= 0}
                >
                  Volgende
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Vorige vraag
        </Button>
      </div>
    </section>
  );
};

export default Questionnaire;
