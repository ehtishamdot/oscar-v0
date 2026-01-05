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
import { ArrowLeft, Home } from 'lucide-react';
import LocalServices from './local-services';
import Link from 'next/link';

export type CareNeeds = {
  physio: boolean;
  ergo: boolean;
  diet: boolean;
  smoking: boolean;
};

type QuestionId =
  | 'start'
  | 'ageCheck'
  | 'dietCheck'
  | 'exerciseCheck'
  | 'hadPhysio'
  | 'wantsPhysio'
  | 'smokingCheck'
  | 'complaintsDuration'
  | 'dailyHindrance'
  | 'endNoArtrose'
  | 'end';

type Question = {
  id: QuestionId;
  text: string;
  subtext?: string;
  answers: { text: string; value: 'ja' | 'nee' }[];
  next: (answer: 'ja' | 'nee') => QuestionId;
  totalSteps: number;
  currentStep: number;
};

const questions: Record<Exclude<QuestionId, 'end' | 'endNoArtrose'>, Question> = {
  start: {
    id: 'start',
    text: '1. Heeft een arts bij u de diagnose artrose vastgesteld?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'dietCheck' : 'ageCheck'),
    totalSteps: 5,
    currentStep: 1,
  },
  ageCheck: {
    id: 'ageCheck',
    text: '2. Bent u ouder dan 50 jaar?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'dietCheck' : 'endNoArtrose'),
    totalSteps: 5,
    currentStep: 2,
  },
  dietCheck: {
    id: 'dietCheck',
    text: '3. Volgt u al een voedingspatroon dat helpt bij artrose?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'exerciseCheck',
    totalSteps: 5,
    currentStep: 2,
  },
  exerciseCheck: {
    id: 'exerciseCheck',
    text: '4. Doet u specifieke oefeningen om uw artroseklachten te verminderen?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'hadPhysio' : 'smokingCheck'),
    totalSteps: 5,
    currentStep: 3,
  },
  hadPhysio: {
    id: 'hadPhysio',
    text: '5. Heeft u al fysiotherapie gehad voor uw huidige klachten?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'wantsPhysio' : 'smokingCheck'),
    totalSteps: 5,
    currentStep: 4,
  },
  wantsPhysio: {
    id: 'wantsPhysio',
    text: '6. Wilt u (opnieuw) fysiotherapie om uw klachten te verminderen?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'smokingCheck',
    totalSteps: 5,
    currentStep: 5,
  },
  smokingCheck: {
    id: 'smokingCheck',
    text: '7. Rookt u?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'complaintsDuration',
    totalSteps: 5,
    currentStep: 4,
  },
  complaintsDuration: {
    id: 'complaintsDuration',
    text: '8. Heeft u langer dan 3 maanden last van uw klachten?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: (answer) => (answer === 'ja' ? 'dailyHindrance' : 'end'),
    totalSteps: 5,
    currentStep: 5,
  },
  dailyHindrance: {
    id: 'dailyHindrance',
    text: '9. Wordt u in het dagelijks leven (zoals in huis, op werk of in uw vrije tijd) belemmerd door uw klachten?',
    answers: [
      { text: 'Ja', value: 'ja' },
      { text: 'Nee', value: 'nee' },
    ],
    next: () => 'end',
    totalSteps: 5,
    currentStep: 5,
  },
};

const motivationalTexts = [
    "U bent goed op weg!",
    "Bijna klaar, nog even volhouden!",
    "Nog maar een paar vragen te gaan!",
    "Bedankt! U bent er bijna.",
    "Laatste vraag! Bedankt voor het invullen."
];


const Questionnaire = () => {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId>('start');
  const [answers, setAnswers] = useState<Record<string, 'ja' | 'nee'>>({});
  const [history, setHistory] = useState<QuestionId[]>([]);

  const handleAnswer = (answerValue: 'ja' | 'nee') => {
    const currentQuestion = questions[currentQuestionId as keyof typeof questions];
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestionId]: answerValue };
    setAnswers(newAnswers);
    setHistory([...history, currentQuestionId]);

    const nextQuestionId = currentQuestion.next(answerValue);
    
    if (nextQuestionId === 'end') {
        navigateToResults(newAnswers);
    } else if (nextQuestionId) {
        setCurrentQuestionId(nextQuestionId);
    }
  };

  const navigateToResults = (finalAnswers: Record<string, 'ja' | 'nee'>) => {
     const careNeeds: CareNeeds = {
        physio: false,
        ergo: false,
        diet: false,
        smoking: false,
    };

    if (finalAnswers.dietCheck === 'nee') careNeeds.diet = true;
    if (finalAnswers.smokingCheck === 'ja') careNeeds.smoking = true;

    // Physio logic
    if (finalAnswers.exerciseCheck === 'nee') {
        careNeeds.physio = true;
    } else { // exerciseCheck === 'ja'
        if (finalAnswers.hadPhysio === 'nee') {
            careNeeds.physio = true;
        } else { // hadPhysio === 'ja'
            if (finalAnswers.wantsPhysio === 'ja') {
                careNeeds.physio = true;
            }
        }
    }

    // Ergo logic
    if (finalAnswers.complaintsDuration === 'ja' && finalAnswers.dailyHindrance === 'ja') {
        careNeeds.ergo = true;
    }

    const query = new URLSearchParams({
        physio: String(careNeeds.physio),
        ergo: String(careNeeds.ergo),
        diet: String(careNeeds.diet),
        smoking: String(careNeeds.smoking),
    }).toString();
    router.push(`/results?${query}`);
  }

  const handleBack = () => {
    const previousQuestionId = history[history.length - 1];
    if (previousQuestionId) {
      setHistory(history.slice(0, -1));
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestionId];
      setAnswers(newAnswers);
      setCurrentQuestionId(previousQuestionId);
    } else {
      router.back();
    }
  };

  if (currentQuestionId === 'endNoArtrose') {
    return (
        <section id="questionnaire" className="w-full max-w-3xl mx-auto">
            <Card className="shadow-lg border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl md:text-3xl">Bedankt voor het invullen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Op basis van uw leeftijd is de kans op artrose relatief klein, maar het is niet uitgesloten. Voor een zekere diagnose is het belangrijk om een arts of fysiotherapeut te raadplegen.
                    </p>
                    <p className="text-muted-foreground">
                        U kunt een afspraak maken bij uw huisarts. Als de arts vaststelt dat er sprake is van artrose, kunt u altijd bij ons terugkomen voor de juiste ondersteuning.
                    </p>
                    <p className="text-muted-foreground">
                        Als u direct uw klachten wilt laten beoordelen, kunt u hieronder een fysiotherapeut in uw buurt zoeken. Houd er rekening mee dat een eerste consult zonder verwijzing van de huisarts mogelijk niet door uw basisverzekering wordt vergoed.
                    </p>
                    <div className="pt-4">
                      <LocalServices />
                    </div>
                </CardContent>
            </Card>
             <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
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
  }

  const currentQuestion = questions[currentQuestionId as keyof typeof questions];
  if (!currentQuestion) return null; // Should not happen

  const progress = (currentQuestion.currentStep / currentQuestion.totalSteps) * 100;

  return (
    <section id="questionnaire" className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-end items-center mb-2">
          <p className="text-sm font-semibold text-primary">{motivationalTexts[currentQuestion.currentStep-1]}</p>
        </div>
        <Progress value={progress} />
      </div>

      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl">
            {currentQuestion.text}
          </CardTitle>
          {currentQuestion.id === 'dietCheck' ? (
            <div className="pt-2 text-xl text-muted-foreground">
                <p>Bijvoorbeeld om...</p>
                <ul className="list-disc list-inside mt-1">
                    <li>...gewrichtsontsteking te remmen</li>
                    <li>...spieren te versterken</li>
                    <li>...af te vallen</li>
                </ul>
            </div>
          ) : currentQuestion.subtext && (
            <CardDescription className="pt-2 text-lg">
              {currentQuestion.subtext}
            </CardDescription>
          )}
          <CardDescription>
            Kies het antwoord dat het beste bij uw situatie past.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          {currentQuestion.answers.map((answer) => (
            <Button
              key={answer.text}
              onClick={() => handleAnswer(answer.value)}
              className="w-full text-lg py-6"
              size="lg"
              variant="outline"
            >
              {answer.text}
            </Button>
          ))}
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
