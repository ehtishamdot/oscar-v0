'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  Home,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  UserRound,
  UserRoundCheck,
  Footprints,
  Dumbbell,
  PersonStanding,
  Shirt,
  HelpCircle,
  Ban,
  Scale,
  Apple,
  Cigarette,
  CircleOff,
  Bike,
  ShoppingBag,
  House,
  Salad,
  Wine,
  Battery,
  Info,
  Utensils,
  Heart,
  X,
} from 'lucide-react';
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
  questionNumber: number;
}

interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: { text: string; value: string; icon?: React.ElementType }[];
  next: (answer: string) => QuestionId;
}

interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: { id: string; text: string; icon?: React.ElementType; exclusive?: boolean; hasTextField?: boolean }[];
  next: (selectedIds: string[]) => QuestionId;
}

interface BMIQuestion extends BaseQuestion {
  type: 'bmi';
  next: (bmi: number) => QuestionId;
}

type Question = RadioQuestion | CheckboxQuestion | BMIQuestion;

const TOTAL_QUESTIONS = 10;

const questions: Record<string, Question> = {
  Q_COMPLAINT: {
    id: 'Q_COMPLAINT',
    text: 'Heeft u klachten aan uw heup of knie?',
    type: 'radio',
    questionNumber: 1,
    options: [
      { text: 'Ja', value: 'ja', icon: ThumbsUp },
      { text: 'Nee', value: 'nee', icon: ThumbsDown },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_DIAGNOSIS' : 'HARD_STOP_NO_COMPLAINT'),
  },
  Q_DIAGNOSIS: {
    id: 'Q_DIAGNOSIS',
    text: 'Is de diagnose artrose bij u vastgesteld door een arts?',
    type: 'radio',
    questionNumber: 2,
    options: [
      { text: 'Ja', value: 'ja', icon: ThumbsUp },
      { text: 'Nee', value: 'nee', icon: ThumbsDown },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_RECENT_FYSIO' : 'Q_AGE'),
  },
  Q_AGE: {
    id: 'Q_AGE',
    text: 'Bent u ouder dan 50 jaar?',
    type: 'radio',
    questionNumber: 3,
    options: [
      { text: 'Ja, 50 jaar of ouder', value: 'ja', icon: UserRoundCheck },
      { text: 'Nee, jonger dan 50', value: 'nee', icon: UserRound },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_RED_FLAGS' : 'HARD_STOP_AGE'),
  },
  Q_RED_FLAGS: {
    id: 'Q_RED_FLAGS',
    text: 'Heeft u last van één of meer van de volgende symptomen?',
    subtext: '• Plotselinge roodheid rond het gewricht\n• Hoge koorts\n• Extreme acute pijn',
    type: 'radio',
    questionNumber: 4,
    options: [
      { text: 'Ja, ik heb een of meer van deze symptomen', value: 'ja', icon: AlertTriangle },
      { text: 'Nee, geen van deze symptomen', value: 'nee', icon: Check },
    ],
    next: (answer) => (answer === 'ja' ? 'HARD_STOP_RED_FLAGS' : 'Q_RECENT_FYSIO'),
  },
  Q_RECENT_FYSIO: {
    id: 'Q_RECENT_FYSIO',
    text: 'Heeft u recent fysiotherapie gehad voor deze klacht?',
    type: 'radio',
    questionNumber: 5,
    options: [
      { text: 'Ja', value: 'ja', icon: ThumbsUp },
      { text: 'Nee', value: 'nee', icon: ThumbsDown },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_NETWORK_FYSIO' : 'Q_ADL'),
  },
  Q_NETWORK_FYSIO: {
    id: 'Q_NETWORK_FYSIO',
    text: 'Wilt u begeleiding van een gespecialiseerde fysiotherapeut?',
    subtext: 'Onze fysiotherapeuten richten zich specifiek op heup- en knieklachten. We bespreken graag online met u wat de mogelijkheden zijn. Daarna helpen we u aan een passende therapeut bij u in de buurt.',
    type: 'radio',
    questionNumber: 6,
    options: [
      { text: 'Ja, graag', value: 'ja', icon: ThumbsUp },
      { text: 'Nee, bedankt', value: 'nee', icon: ThumbsDown },
    ],
    next: () => 'Q_ADL',
  },
  Q_ADL: {
    id: 'Q_ADL',
    text: 'Ervaart u klachten of beperkingen bij het dagelijks functioneren?',
    subtext: 'Selecteer momenten waarbij u klachten heeft.',
    type: 'checkbox',
    questionNumber: 7,
    options: [
      { id: 'traplopen', text: 'Traplopen', icon: Footprints },
      { id: 'wandelen', text: 'Wandelen', icon: PersonStanding },
      { id: 'fietsen', text: 'Fietsen', icon: Bike },
      { id: 'sporten', text: 'Sporten', icon: Dumbbell },
      { id: 'huishouden', text: 'Huishouden', icon: House },
      { id: 'boodschappen', text: 'Boodschappen doen', icon: ShoppingBag },
      { id: 'sokken', text: 'Sokken/schoenen aantrekken', icon: Shirt },
      { id: 'anders', text: 'Anders, namelijk...', icon: HelpCircle, hasTextField: true },
      { id: 'geen', text: 'Nee, geen beperkingen', icon: Ban, exclusive: true },
    ],
    next: () => 'Q_BMI_CALC',
  },
  Q_BMI_CALC: {
    id: 'Q_BMI_CALC',
    text: 'Wat is uw lengte en gewicht?',
    subtext: 'Dit helpt ons om passend leefstijladvies te geven.',
    type: 'bmi',
    questionNumber: 8,
    next: (bmi) => (bmi > 25 ? 'Q_SMOKING' : 'Q_NUTRI_SCREEN'),
  },
  Q_NUTRI_SCREEN: {
    id: 'Q_NUTRI_SCREEN',
    text: 'Welke van de volgende stellingen zijn op u van toepassing?',
    subtext: 'Selecteer alle opties die van toepassing zijn.',
    type: 'checkbox',
    questionNumber: 9,
    options: [
      { id: 'groente', text: 'Ik eet weinig groente of fruit', icon: Salad },
      { id: 'gewicht', text: 'Ik ben niet tevreden met mijn gewicht', icon: Scale },
      { id: 'alcohol', text: 'Ik drink teveel alcohol', icon: Wine },
      { id: 'energie', text: 'Ik heb weinig energie of ben snel moe', icon: Battery },
      { id: 'voeding_info', text: 'Ik wil informatie over gezondere voeding', icon: Info },
      { id: 'eetlust', text: 'Ik heb een verminderde eetlust', icon: Utensils },
      { id: 'geen', text: 'Geen van bovenstaande', icon: Ban, exclusive: true },
    ],
    next: () => 'Q_SMOKING',
  },
  Q_SMOKING: {
    id: 'Q_SMOKING',
    text: 'Rookt u?',
    type: 'radio',
    questionNumber: 10,
    options: [
      { text: 'Ja', value: 'ja', icon: Cigarette },
      { text: 'Nee', value: 'nee', icon: CircleOff },
    ],
    next: () => 'END',
  },
};

// Circular Progress Ring Component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Hard Stop Screens - Updated per feedback
const HardStopNoComplaint = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-6">
          <Heart className="h-12 w-12 text-orange-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">
          Voor uw klachten is een andere route beter
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Wij willen u graag de allerbeste hulp bieden. Onze huidige programma's zijn echter specifiek
          gemaakt voor mensen met heup- en knieklachten. Wij kunnen u momenteel niet goed helpen.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
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
    </div>
  </div>
);

const HardStopAge = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-6">
          <UserRound className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">
          Voor uw klachten is een andere route beter
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Wij willen u graag de allerbeste hulp bieden. Onze huidige programma's zijn echter specifiek
          gemaakt voor mensen met heup- en knieklachten boven de 50 jaar. Wij raden u aan contact op te
          nemen met uw huisarts voor passend advies.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
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
    </div>
  </div>
);

const HardStopRedFlags = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 mb-6">
          <AlertTriangle className="h-12 w-12 text-amber-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">
          Uw symptomen kunnen wijzen op een situatie die medische aandacht vraagt.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Onze programma's zijn hier niet op ingericht. Neem daarom geen risico en bespreek dit met uw huisarts.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
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
    </div>
  </div>
);

// Option Card Component for Radio buttons
const OptionCard = ({
  option,
  isSelected,
  onClick,
}: {
  option: { text: string; value: string; icon?: React.ElementType };
  isSelected: boolean;
  onClick: () => void;
}) => {
  const Icon = option.icon;
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-6 rounded-2xl border-2 transition-all duration-300 transform
        ${isSelected
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
          : 'border-muted bg-card hover:border-primary/50 hover:shadow-md hover:scale-[1.01]'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`
            flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300
            ${isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }
          `}>
            <Icon className="h-7 w-7" />
          </div>
        )}
        <span className={`text-xl font-medium flex-1 text-left ${isSelected ? 'text-primary' : ''}`}>
          {option.text}
        </span>
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
          ${isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/30 group-hover:border-primary/50'
          }
        `}>
          {isSelected && <Check className="h-5 w-5" />}
        </div>
      </div>
    </button>
  );
};

// Checkbox Card Component
const CheckboxCard = ({
  option,
  isSelected,
  onClick,
  children,
}: {
  option: { id: string; text: string; icon?: React.ElementType; exclusive?: boolean };
  isSelected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  const Icon = option.icon;
  return (
    <div>
      <button
        onClick={onClick}
        className={`
          group relative w-full p-5 rounded-2xl border-2 transition-all duration-300 transform text-left
          ${isSelected
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-md shadow-primary/10'
            : 'border-muted bg-card hover:border-primary/50 hover:shadow-sm'
          }
          ${option.exclusive ? 'mt-4 border-dashed' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all duration-300 flex-shrink-0
            ${isSelected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 group-hover:border-primary/50'
            }
          `}>
            {isSelected && <Check className="h-4 w-4" />}
          </div>
          {Icon && (
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 flex-shrink-0
              ${isSelected
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground group-hover:text-primary'
              }
            `}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <span className={`text-base font-medium ${isSelected ? 'text-primary' : ''}`}>
            {option.text}
          </span>
        </div>
      </button>
      {children}
    </div>
  );
};

const Questionnaire = () => {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId>('Q_COMPLAINT');
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [history, setHistory] = useState<QuestionId[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null);

  // BMI state
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Checkbox state
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  // "Anders" text field state
  const [andersText, setAndersText] = useState<string>('');

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // Calculate progress
  const answeredCount = Object.keys(answers).filter(k => !k.includes('_anders_text') && !['height', 'weight'].includes(k)).length;
  const progress = (answeredCount / TOTAL_QUESTIONS) * 100;

  // Reset selected radio when question changes
  useEffect(() => {
    setSelectedRadio(null);
  }, [currentQuestionId]);

  const animateTransition = (direction: 'left' | 'right', callback: () => void) => {
    setSlideDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 300);
  };

  const handleRadioSelect = (answerValue: string) => {
    setSelectedRadio(answerValue);

    setTimeout(() => {
      const currentQuestion = questions[currentQuestionId] as RadioQuestion;
      if (!currentQuestion) return;

      const newAnswers = { ...answers, [currentQuestionId]: answerValue };
      setAnswers(newAnswers);
      setHistory([...history, currentQuestionId]);

      const nextQuestionId = currentQuestion.next(answerValue);

      animateTransition('left', () => {
        if (nextQuestionId === 'END') {
          navigateToResults(newAnswers);
        } else {
          setCurrentQuestionId(nextQuestionId);
        }
      });
    }, 400);
  };

  const handleCheckboxSubmit = () => {
    const currentQuestion = questions[currentQuestionId] as CheckboxQuestion;
    if (!currentQuestion) return;

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

    animateTransition('left', () => {
      setSelectedCheckboxes([]);
      setAndersText('');
      if (nextQuestionId === 'END') {
        navigateToResults(newAnswers);
      } else {
        setCurrentQuestionId(nextQuestionId);
      }
    });
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

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);

    const currentQuestion = questions[currentQuestionId] as BMIQuestion;
    const newAnswers = { ...answers, [currentQuestionId]: bmi, height: heightNum, weight: weightNum };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(bmi);

    animateTransition('left', () => {
      if (nextQuestionId === 'END') {
        navigateToResults(newAnswers);
      } else {
        setCurrentQuestionId(nextQuestionId);
      }
    });
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

    // Updated logic: any nutrition option (except 'geen') triggers diet pathway
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
      animateTransition('right', () => {
        setHistory(history.slice(0, -1));
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestionId];
        setAnswers(newAnswers);
        setCurrentQuestionId(previousQuestionId);
        setSelectedCheckboxes([]);
        setHeight('');
        setWeight('');
      });
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

  // Get BMI value for display
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Ondergewicht', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (bmi < 25) return { label: 'Gezond gewicht', color: 'text-green-600', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Overgewicht', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Obesitas', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const calculatedBMI = height && weight && parseFloat(height) > 0 && parseFloat(weight) > 0
    ? parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)
    : null;

  // Format subtext with bullet points
  const formatSubtext = (text: string) => {
    if (text.includes('•')) {
      const lines = text.split('\n');
      return (
        <ul className="text-left inline-block text-lg text-muted-foreground space-y-1">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              {line.startsWith('•') ? (
                <>
                  <span className="text-primary mt-1">•</span>
                  <span>{line.substring(1).trim()}</span>
                </>
              ) : (
                <span>{line}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-lg text-muted-foreground">{text}</p>;
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Vorige</span>
        </Button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Vraag {currentQuestion.questionNumber} van {TOTAL_QUESTIONS}</span>
          </div>
          <ProgressRing progress={progress} size={60} strokeWidth={5} />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`
            w-full max-w-xl px-4 transition-all duration-300 ease-out
            ${isAnimating
              ? slideDirection === 'left'
                ? 'opacity-0 -translate-x-8'
                : 'opacity-0 translate-x-8'
              : 'opacity-100 translate-x-0'
            }
          `}
        >
          {/* Question Text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span>Vraag {currentQuestion.questionNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3 leading-tight">
              {currentQuestion.text}
            </h1>
            {currentQuestion.subtext && (
              <div className="mt-4">
                {formatSubtext(currentQuestion.subtext)}
              </div>
            )}
          </div>

          {/* Radio Options */}
          {currentQuestion.type === 'radio' && (
            <div className="space-y-4">
              {(currentQuestion as RadioQuestion).options.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  isSelected={selectedRadio === option.value}
                  onClick={() => handleRadioSelect(option.value)}
                />
              ))}
            </div>
          )}

          {/* Checkbox Options */}
          {currentQuestion.type === 'checkbox' && (
            <div className="space-y-3">
              {(currentQuestion as CheckboxQuestion).options.map((option) => (
                <CheckboxCard
                  key={option.id}
                  option={option}
                  isSelected={selectedCheckboxes.includes(option.id)}
                  onClick={() => handleCheckboxChange(option.id, option.exclusive)}
                >
                  {option.hasTextField && selectedCheckboxes.includes(option.id) && (
                    <div className="mt-3 ml-10">
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
                </CheckboxCard>
              ))}
              <div className="pt-4">
                <Button
                  onClick={handleCheckboxSubmit}
                  className="w-full h-14 text-lg gap-2"
                  size="lg"
                  disabled={selectedCheckboxes.length === 0}
                >
                  Volgende
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* BMI Input */}
          {currentQuestion.type === 'bmi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-base font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    Lengte
                  </Label>
                  <div className="relative">
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="text-2xl h-16 text-center font-semibold pr-12"
                      min="100"
                      max="250"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      cm
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-base font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    Gewicht
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="text-2xl h-16 text-center font-semibold pr-12"
                      min="30"
                      max="300"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* BMI Display */}
              {calculatedBMI && (
                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${getBMICategory(calculatedBMI).bg} border-transparent`}>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Uw BMI</p>
                    <p className={`text-5xl font-bold ${getBMICategory(calculatedBMI).color}`}>
                      {calculatedBMI.toFixed(1)}
                    </p>
                    <p className={`text-lg font-semibold mt-2 ${getBMICategory(calculatedBMI).color}`}>
                      {getBMICategory(calculatedBMI).label}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBMISubmit}
                className="w-full h-14 text-lg gap-2"
                size="lg"
                disabled={!calculatedBMI}
              >
                Volgende
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Question Counter */}
      <div className="sm:hidden text-center py-4">
        <p className="text-sm text-muted-foreground">
          Vraag {currentQuestion.questionNumber} van {TOTAL_QUESTIONS}
        </p>
      </div>
    </div>
  );
};

export default Questionnaire;
