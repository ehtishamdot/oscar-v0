'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDemo } from '@/lib/demo-context';
import { RED_FLAG_QUESTIONS, CARE_PATHWAY_DEFINITIONS, CarePathway, RedFlag, generateId } from '@/lib/demo-store';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, AlertTriangle, Phone, CheckCircle2, XCircle } from 'lucide-react';

type TriageStep = 'redflags' | 'complaint' | 'lifestyle' | 'history' | 'summary';

type TriageAnswers = {
  // Red flags
  redFlagAnswers: Record<string, boolean>;
  // Complaint details
  complaintType: string;
  complaintLocation: string;
  complaintDuration: string;
  painLevel: number;
  // Lifestyle
  smokes: boolean;
  followsDiet: boolean;
  exercisesRegularly: boolean;
  // History
  hasHadPhysio: boolean;
  hasChronicCondition: boolean;
  hindersDaily: boolean;
};

const COMPLAINT_TYPES = [
  { value: 'artrose', label: 'Artrose / gewrichtsslijtage' },
  { value: 'rugpijn', label: 'Rugpijn / lage rugklachten' },
  { value: 'schouderpijn', label: 'Schouderklachten' },
  { value: 'kniepijn', label: 'Knieklachten' },
  { value: 'nekpijn', label: 'Nekpijn' },
  { value: 'overig', label: 'Overige klachten' },
];

const DURATION_OPTIONS = [
  { value: 'week', label: 'Minder dan een week' },
  { value: 'month', label: '1-4 weken' },
  { value: '3months', label: '1-3 maanden' },
  { value: 'longer', label: 'Langer dan 3 maanden' },
];

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const { saveTriageSession, addConsent } = useDemo();

  const [step, setStep] = useState<TriageStep>('redflags');
  const [currentRedFlagIndex, setCurrentRedFlagIndex] = useState(0);
  const [answers, setAnswers] = useState<TriageAnswers>({
    redFlagAnswers: {},
    complaintType: '',
    complaintLocation: '',
    complaintDuration: '',
    painLevel: 5,
    smokes: false,
    followsDiet: false,
    exercisesRegularly: false,
    hasHadPhysio: false,
    hasChronicCondition: false,
    hindersDaily: false,
  });
  const [detectedRedFlags, setDetectedRedFlags] = useState<RedFlag[]>([]);
  const [showRedFlagAlert, setShowRedFlagAlert] = useState(false);

  const steps: { id: TriageStep; label: string }[] = [
    { id: 'redflags', label: 'Veiligheid' },
    { id: 'complaint', label: 'Klacht' },
    { id: 'lifestyle', label: 'Leefstijl' },
    { id: 'history', label: 'Voorgeschiedenis' },
    { id: 'summary', label: 'Overzicht' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleRedFlagAnswer = (answer: boolean) => {
    const currentQuestion = RED_FLAG_QUESTIONS[currentRedFlagIndex];

    setAnswers(prev => ({
      ...prev,
      redFlagAnswers: {
        ...prev.redFlagAnswers,
        [currentQuestion.id]: answer,
      },
    }));

    // Track detected red flags
    if (answer) {
      setDetectedRedFlags(prev => [
        ...prev,
        {
          id: currentQuestion.id,
          question: currentQuestion.question,
          detected: true,
          severity: currentQuestion.severity,
          action: currentQuestion.action,
        },
      ]);
    }

    // Move to next question or next step
    if (currentRedFlagIndex < RED_FLAG_QUESTIONS.length - 1) {
      setCurrentRedFlagIndex(prev => prev + 1);
    } else {
      // Check if any high severity red flags detected
      const hasHighSeverity = detectedRedFlags.some(rf => rf.severity === 'high') ||
        (answer && currentQuestion.severity === 'high');

      if (hasHighSeverity) {
        setShowRedFlagAlert(true);
      } else {
        setStep('complaint');
      }
    }
  };

  const handleComplaintNext = () => {
    if (answers.complaintType && answers.complaintDuration) {
      setStep('lifestyle');
    }
  };

  const handleLifestyleNext = () => {
    setStep('history');
  };

  const handleHistoryNext = () => {
    setStep('summary');
  };

  const determineCarePathways = (): CarePathway[] => {
    const pathways: CarePathway[] = [];

    // Physiotherapy - recommended if not exercising, no prior physio, or chronic
    if (!answers.exercisesRegularly || !answers.hasHadPhysio || answers.complaintDuration === 'longer') {
      const def = CARE_PATHWAY_DEFINITIONS.find(p => p.discipline === 'fysiotherapie')!;
      pathways.push({
        ...def,
        id: generateId(),
        recommended: true,
        accepted: null,
        reasonForRecommendation: 'Op basis van uw klachtenduur en bewegingspatroon kan fysiotherapie helpen bij pijnvermindering en bewegingsverbetering.',
      });
    }

    // Ergotherapy - if daily hindrance and chronic
    if (answers.hindersDaily && answers.complaintDuration === 'longer') {
      const def = CARE_PATHWAY_DEFINITIONS.find(p => p.discipline === 'ergotherapie')!;
      pathways.push({
        ...def,
        id: generateId(),
        recommended: true,
        accepted: null,
        reasonForRecommendation: 'Omdat uw klachten uw dagelijks leven beïnvloeden, kan ergotherapie u helpen met praktische oplossingen.',
      });
    }

    // Diet - if not following diet
    if (!answers.followsDiet) {
      const def = CARE_PATHWAY_DEFINITIONS.find(p => p.discipline === 'dietetiek')!;
      pathways.push({
        ...def,
        id: generateId(),
        recommended: true,
        accepted: null,
        reasonForRecommendation: 'Een anti-inflammatoir dieet kan helpen bij het verminderen van gewrichtsontsteking.',
      });
    }

    // Smoking cessation - if smokes
    if (answers.smokes) {
      const def = CARE_PATHWAY_DEFINITIONS.find(p => p.discipline === 'stoppen_met_roken')!;
      pathways.push({
        ...def,
        id: generateId(),
        recommended: true,
        accepted: null,
        reasonForRecommendation: 'Roken vertraagt herstel en verergert gewrichtsklachten. Stoppen kan uw klachten verminderen.',
      });
    }

    return pathways;
  };

  const handleComplete = () => {
    const carePathways = determineCarePathways();

    const session = saveTriageSession({
      patientId,
      answers: {
        ...answers.redFlagAnswers,
        complaintType: answers.complaintType,
        complaintDuration: answers.complaintDuration,
        painLevel: String(answers.painLevel),
        smokes: String(answers.smokes),
        followsDiet: String(answers.followsDiet),
        exercisesRegularly: String(answers.exercisesRegularly),
        hasHadPhysio: String(answers.hasHadPhysio),
        hindersDaily: String(answers.hindersDaily),
      },
      redFlags: detectedRedFlags,
      hasRedFlags: detectedRedFlags.length > 0,
      carePathways,
    });

    // Add consent for triage data
    addConsent(patientId, {
      type: 'share_intake',
      granted: true,
      description: 'Toestemming voor delen triage resultaten',
    });

    router.push(`/demo/pathways?patientId=${patientId}&sessionId=${session.id}`);
  };

  // Red flag alert screen
  if (showRedFlagAlert) {
    const highSeverityFlags = detectedRedFlags.filter(rf => rf.severity === 'high');

    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-2xl px-4 py-8">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg">Belangrijk: Neem contact op met uw huisarts</AlertTitle>
              <AlertDescription className="mt-2">
                Op basis van uw antwoorden adviseren wij u om eerst contact op te nemen met uw huisarts voordat u
                verdere stappen onderneemt.
              </AlertDescription>
            </Alert>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle>Gedetecteerde waarschuwingssignalen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {highSeverityFlags.map((flag) => (
                  <div key={flag.id} className="p-4 bg-destructive/10 rounded-lg">
                    <p className="font-medium mb-1">{flag.question}</p>
                    <p className="text-sm text-muted-foreground">{flag.action}</p>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center gap-4">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Bel uw huisarts</p>
                    <p className="text-sm text-muted-foreground">Of bel bij spoed: 0900-1515 (huisartsenpost)</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => router.push('/demo')}>
                    Terug naar start
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRedFlagAlert(false);
                      setStep('complaint');
                    }}
                  >
                    Toch doorgaan (na huisartscontact)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              {steps.map((s, i) => (
                <span
                  key={s.id}
                  className={i <= currentStepIndex ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  {s.label}
                </span>
              ))}
            </div>
            <Progress value={progress} />
          </div>

          {/* Red Flags Step */}
          {step === 'redflags' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Veiligheidscheck</CardTitle>
                <CardDescription>
                  Deze vragen helpen ons te bepalen of directe medische hulp nodig is.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Vraag {currentRedFlagIndex + 1} van {RED_FLAG_QUESTIONS.length}
                  </p>
                  <p className="text-lg font-medium">
                    {RED_FLAG_QUESTIONS[currentRedFlagIndex].question}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 text-lg"
                    onClick={() => handleRedFlagAnswer(true)}
                  >
                    Ja
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 py-6 text-lg"
                    onClick={() => handleRedFlagAnswer(false)}
                  >
                    Nee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complaint Step */}
          {step === 'complaint' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Uw Klacht</CardTitle>
                <CardDescription>Vertel ons meer over uw klachten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="font-medium">Wat voor klacht heeft u?</p>
                  <div className="grid gap-2">
                    {COMPLAINT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={answers.complaintType === type.value ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setAnswers({ ...answers, complaintType: type.value })}
                      >
                        {answers.complaintType === type.value ? (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        ) : (
                          <div className="mr-2 h-4 w-4" />
                        )}
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Hoe lang heeft u deze klachten al?</p>
                  <div className="grid gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={answers.complaintDuration === opt.value ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setAnswers({ ...answers, complaintDuration: opt.value })}
                      >
                        {answers.complaintDuration === opt.value ? (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        ) : (
                          <div className="mr-2 h-4 w-4" />
                        )}
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Pijnscore (0 = geen pijn, 10 = ergste pijn)</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">0</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.painLevel}
                      onChange={(e) => setAnswers({ ...answers, painLevel: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm">10</span>
                    <span className="font-bold text-lg w-8">{answers.painLevel}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep('redflags')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleComplaintNext}
                    disabled={!answers.complaintType || !answers.complaintDuration}
                  >
                    Volgende
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lifestyle Step */}
          {step === 'lifestyle' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Leefstijl</CardTitle>
                <CardDescription>Enkele vragen over uw leefstijl</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    question: 'Rookt u?',
                    key: 'smokes',
                    yesLabel: 'Ja, ik rook',
                    noLabel: 'Nee, ik rook niet',
                  },
                  {
                    question: 'Volgt u een anti-inflammatoir of gezond dieet?',
                    key: 'followsDiet',
                    yesLabel: 'Ja',
                    noLabel: 'Nee',
                  },
                  {
                    question: 'Sport of beweegt u regelmatig (minimaal 2x per week)?',
                    key: 'exercisesRegularly',
                    yesLabel: 'Ja',
                    noLabel: 'Nee',
                  },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <p className="font-medium">{item.question}</p>
                    <div className="flex gap-4">
                      <Button
                        variant={answers[item.key as keyof TriageAnswers] === true ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAnswers({ ...answers, [item.key]: true })}
                      >
                        {item.yesLabel}
                      </Button>
                      <Button
                        variant={answers[item.key as keyof TriageAnswers] === false ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAnswers({ ...answers, [item.key]: false })}
                      >
                        {item.noLabel}
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep('complaint')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                  <Button onClick={handleLifestyleNext}>
                    Volgende
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Step */}
          {step === 'history' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Voorgeschiedenis</CardTitle>
                <CardDescription>Enkele vragen over eerdere behandelingen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    question: 'Heeft u eerder fysiotherapie gehad voor deze klacht?',
                    key: 'hasHadPhysio',
                  },
                  {
                    question: 'Heeft u een chronische aandoening (bijv. diabetes, hart- en vaatziekte)?',
                    key: 'hasChronicCondition',
                  },
                  {
                    question: 'Worden uw dagelijkse activiteiten (werk, huishouden, hobby) belemmerd door uw klachten?',
                    key: 'hindersDaily',
                  },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <p className="font-medium">{item.question}</p>
                    <div className="flex gap-4">
                      <Button
                        variant={answers[item.key as keyof TriageAnswers] === true ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAnswers({ ...answers, [item.key]: true })}
                      >
                        Ja
                      </Button>
                      <Button
                        variant={answers[item.key as keyof TriageAnswers] === false ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAnswers({ ...answers, [item.key]: false })}
                      >
                        Nee
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep('lifestyle')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                  <Button onClick={handleHistoryNext}>
                    Volgende
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Step */}
          {step === 'summary' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Samenvatting Triage</CardTitle>
                <CardDescription>Controleer uw antwoorden voordat u verder gaat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {detectedRedFlags.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Let op</AlertTitle>
                    <AlertDescription>
                      Er zijn {detectedRedFlags.length} waarschuwingssignalen gedetecteerd.
                      Overleg met uw huisarts indien u dit nog niet heeft gedaan.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Klacht</p>
                    <p className="font-medium">
                      {COMPLAINT_TYPES.find(t => t.value === answers.complaintType)?.label}
                    </p>
                    <p className="text-sm">
                      Duur: {DURATION_OPTIONS.find(d => d.value === answers.complaintDuration)?.label}
                    </p>
                    <p className="text-sm">Pijnscore: {answers.painLevel}/10</p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Leefstijl</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        {answers.smokes ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {answers.smokes ? 'Rookt' : 'Rookt niet'}
                      </li>
                      <li className="flex items-center gap-2">
                        {answers.followsDiet ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-amber-500" />}
                        {answers.followsDiet ? 'Volgt gezond dieet' : 'Geen specifiek dieet'}
                      </li>
                      <li className="flex items-center gap-2">
                        {answers.exercisesRegularly ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-amber-500" />}
                        {answers.exercisesRegularly ? 'Beweegt regelmatig' : 'Beweegt niet regelmatig'}
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Voorgeschiedenis</p>
                    <ul className="space-y-1">
                      <li>{answers.hasHadPhysio ? 'Eerder fysiotherapie gehad' : 'Geen eerdere fysiotherapie'}</li>
                      <li>{answers.hindersDaily ? 'Dagelijkse activiteiten belemmerd' : 'Geen belemmering dagelijks leven'}</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep('history')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                  <Button onClick={handleComplete} className="bg-accent hover:bg-accent/90">
                    Bekijk Zorgtrajecten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <TriageContent />
    </Suspense>
  );
}
