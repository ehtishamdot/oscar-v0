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
import { ArrowLeft, Home, AlertTriangle } from 'lucide-react';
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
  },
  Q_AGE: {
    id: 'Q_AGE',
    text: 'Bent u ouder dan 50 jaar?',
    subtext: 'Of vul hieronder uw leeftijd in.',
    type: 'radio',
    options: [
      { text: 'Ja, 50 jaar of ouder', value: 'ja' },
      { text: 'Nee, jonger dan 50', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'Q_RED_FLAGS' : 'HARD_STOP_AGE'),
    stepNumber: 2,
    totalSteps: TOTAL_STEPS,
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
  },
  Q_ADL: {
    id: 'Q_ADL',
    text: 'Ervaart u klachten of beperkingen bij het dagelijks functioneren?',
    subtext: 'Meerdere antwoorden mogelijk',
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
  },
  Q_BMI_CALC: {
    id: 'Q_BMI_CALC',
    text: 'Wat is uw lengte en gewicht?',
    subtext: 'Dit helpt ons om passend leefstijladvies te geven.',
    type: 'bmi',
    next: (bmi) => (bmi > 25 ? 'Q_SMOKING' : 'Q_NUTRI_SCREEN'),
    stepNumber: 5,
    totalSteps: TOTAL_STEPS,
  },
  Q_NUTRI_SCREEN: {
    id: 'Q_NUTRI_SCREEN',
    text: 'Om uw voedingspatroon beter in te schatten, welke van de volgende stellingen zijn op u van toepassing?',
    subtext: 'Meerdere antwoorden mogelijk',
    type: 'checkbox',
    options: [
      { id: 'afgevallen', text: 'Ik ben de afgelopen 6 maanden onbedoeld afgevallen' },
      { id: 'eetlust', text: 'Ik heb een verminderde eetlust' },
      { id: 'energie', text: 'Ik ervaar een laag energieniveau of snelle vermoeidheid gedurende de dag' },
      { id: 'groente', text: 'Ik eet weinig groente/fruit (minder dan 2 stuks/200gram per dag)' },
      { id: 'geen', text: 'Geen van bovenstaande', exclusive: true },
    ],
    next: () => 'Q_SMOKING',
    stepNumber: 5,
    totalSteps: TOTAL_STEPS,
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
  },
};

const motivationalTexts: Record<number, string> = {
  1: 'Laten we beginnen!',
  2: 'Goed bezig!',
  3: 'U bent op de goede weg!',
  4: 'Bijna halverwege!',
  5: 'Nog even volhouden!',
  6: 'Laatste vraag!',
};

// Hard Stop Screens
const HardStopNoComplaint = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto">
    <Card className="shadow-lg border-2 border-yellow-400/50 bg-yellow-50/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
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
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
);

const HardStopAge = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto">
    <Card className="shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl md:text-3xl">
          Advies: Raadpleeg uw huisarts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Gezien uw leeftijd (&lt;50) adviseren wij u contact op te nemen met uw huisarts voor nader onderzoek alvorens een traject te starten.
        </p>
        <p className="text-muted-foreground">
          Artrose komt vaker voor bij mensen boven de 50 jaar. Bij jongere mensen kunnen gewrichtsklachten andere oorzaken hebben die eerst onderzocht moeten worden.
        </p>
        <div className="pt-4">
          <LocalServices />
        </div>
      </CardContent>
    </Card>
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
);

const HardStopRedFlags = ({ onBack }: { onBack: () => void }) => (
  <section className="w-full max-w-3xl mx-auto">
    <Card className="shadow-lg border-2 border-red-400/50 bg-red-50/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <CardTitle className="font-headline text-2xl md:text-3xl text-red-800">
            Neem direct contact op met uw huisarts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Op basis van deze symptomen adviseren wij u <strong>direct</strong> contact op te nemen met uw huisarts.
        </p>
        <p className="text-muted-foreground">
          De combinatie van plotselinge roodheid, koorts en/of extreme pijn kan wijzen op septische artritis of een acute ontsteking. Dit vereist spoedige medische beoordeling.
        </p>
        <div className="bg-red-100 p-4 rounded-lg mt-4">
          <p className="font-semibold text-red-800">
            Bel uw huisarts vandaag nog, of de huisartsenpost buiten kantoortijden.
          </p>
        </div>
      </CardContent>
    </Card>
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Vorige
      </Button>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Terug naar home
        </Link>
      </Button>
    </div>
  </section>
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

  const handleRadioAnswer = (answerValue: string) => {
    const currentQuestion = questions[currentQuestionId] as RadioQuestion;
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestionId]: answerValue };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(answerValue);

    if (nextQuestionId === 'END') {
      navigateToResults(newAnswers);
    } else {
      setCurrentQuestionId(nextQuestionId);
    }
  };

  const handleCheckboxSubmit = () => {
    const currentQuestion = questions[currentQuestionId] as CheckboxQuestion;
    if (!currentQuestion) return;

    // Store anders text if provided
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

    if (nextQuestionId === 'END') {
      navigateToResults(newAnswers);
    } else {
      setCurrentQuestionId(nextQuestionId);
    }
  };

  const handleCheckboxChange = (optionId: string, exclusive?: boolean) => {
    if (exclusive) {
      // If exclusive option is selected, clear all others
      setSelectedCheckboxes(
        selectedCheckboxes.includes(optionId) ? [] : [optionId]
      );
    } else {
      // Remove exclusive option if selecting non-exclusive
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

    // Convert height from cm to meters
    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);

    const currentQuestion = questions[currentQuestionId] as BMIQuestion;
    const newAnswers = { ...answers, [currentQuestionId]: bmi, height: heightNum, weight: weightNum };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(bmi);

    if (nextQuestionId === 'END') {
      navigateToResults(newAnswers);
    } else {
      setCurrentQuestionId(nextQuestionId);
    }
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

    // Physio logic: if no recent physio, recommend physio
    if (finalAnswers.Q_RECENT_FYSIO === 'nee') {
      careNeeds.physio = true;
    }
    // If had recent physio and wants network physio
    if (finalAnswers.Q_RECENT_FYSIO === 'ja' && finalAnswers.Q_NETWORK_FYSIO === 'ja') {
      careNeeds.physioNetwork = true;
    }

    // Ergo logic: if any ADL limitations (except 'geen')
    const adlAnswers = finalAnswers.Q_ADL as string[] | undefined;
    if (adlAnswers && adlAnswers.length > 0 && !adlAnswers.includes('geen')) {
      careNeeds.ergo = true;
    }

    // BMI & nutrition logic
    const bmi = finalAnswers.Q_BMI_CALC as number | undefined;
    if (bmi && bmi > 25) {
      careNeeds.gli = true;
      careNeeds.diet = true;
    }

    // Nutrition screening (only if BMI <= 25)
    const nutriAnswers = finalAnswers.Q_NUTRI_SCREEN as string[] | undefined;
    if (nutriAnswers && nutriAnswers.length > 0 && !nutriAnswers.includes('geen')) {
      careNeeds.diet = true;
    }

    // Smoking logic
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
      setHistory(history.slice(0, -1));
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestionId];
      setAnswers(newAnswers);
      setCurrentQuestionId(previousQuestionId);
      setSelectedCheckboxes([]);
      setHeight('');
      setWeight('');
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

  const progress = (currentQuestion.stepNumber / currentQuestion.totalSteps) * 100;

  return (
    <section id="questionnaire" className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">
            Stap {currentQuestion.stepNumber} van {currentQuestion.totalSteps}
          </p>
          <p className="text-sm font-semibold text-primary">
            {motivationalTexts[currentQuestion.stepNumber]}
          </p>
        </div>
        <Progress value={progress} />
      </div>

      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl">
            {currentQuestion.text}
          </CardTitle>
          {currentQuestion.subtext && (
            <CardDescription className="pt-2 text-lg">
              {currentQuestion.subtext}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'radio' && (
            <div className="flex flex-col sm:flex-row gap-4">
              {(currentQuestion as RadioQuestion).options.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleRadioAnswer(option.value)}
                  className="w-full text-lg py-6"
                  size="lg"
                  variant="outline"
                >
                  {option.text}
                </Button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'checkbox' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(currentQuestion as CheckboxQuestion).options.map((option) => (
                  <div key={option.id}>
                    <div
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCheckboxes.includes(option.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleCheckboxChange(option.id, option.exclusive)}
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedCheckboxes.includes(option.id)}
                        onCheckedChange={() => handleCheckboxChange(option.id, option.exclusive)}
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer text-base"
                      >
                        {option.text}
                      </Label>
                    </div>
                    {/* Show text field for "Anders" option when selected */}
                    {option.hasTextField && selectedCheckboxes.includes(option.id) && (
                      <div className="mt-2 ml-8">
                        <Input
                          placeholder="Beschrijf uw andere beperking..."
                          value={andersText}
                          onChange={(e) => setAndersText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleCheckboxSubmit}
                className="w-full mt-4"
                size="lg"
                disabled={selectedCheckboxes.length === 0}
              >
                Volgende
              </Button>
            </div>
          )}

          {currentQuestion.type === 'bmi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-base">
                    Lengte (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="bijv. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="text-lg h-12"
                    min="100"
                    max="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-base">
                    Gewicht (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="bijv. 75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-lg h-12"
                    min="30"
                    max="300"
                  />
                </div>
              </div>
              {height && weight && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Uw BMI:</p>
                  <p className="text-2xl font-bold text-primary">
                    {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                  </p>
                </div>
              )}
              <Button
                onClick={handleBMISubmit}
                className="w-full"
                size="lg"
                disabled={!height || !weight || parseFloat(height) <= 0 || parseFloat(weight) <= 0}
              >
                Volgende
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Vorige
        </Button>
      </div>
    </section>
  );
};

export default Questionnaire;
