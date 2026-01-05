'use client';

import { useState, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

type IntakeStep = 'goals' | 'details' | 'availability' | 'confirm';

const DISCIPLINE_CONFIG: Record<string, { title: string; questions: { id: string; label: string; type: 'text' | 'textarea' | 'radio'; options?: string[] }[] }> = {
  fysiotherapie: {
    title: 'Fysiotherapie Intake',
    questions: [
      { id: 'mainGoal', label: 'Wat is uw belangrijkste doel met fysiotherapie?', type: 'textarea' },
      { id: 'limitations', label: 'Welke bewegingen of activiteiten zijn beperkt?', type: 'textarea' },
      { id: 'painMoment', label: 'Wanneer heeft u het meeste last?', type: 'radio', options: ['s Ochtends', 'Overdag', 's Avonds', 'Bij inspanning', 'In rust'] },
      { id: 'previousTreatment', label: 'Wat heeft u al geprobeerd om uw klachten te verminderen?', type: 'textarea' },
    ],
  },
  ergotherapie: {
    title: 'Ergotherapie Intake',
    questions: [
      { id: 'dailyActivities', label: 'Welke dagelijkse activiteiten kosten u de meeste moeite?', type: 'textarea' },
      { id: 'workSituation', label: 'Kunt u uw werksituatie beschrijven?', type: 'textarea' },
      { id: 'homeAdjustments', label: 'Heeft u al aanpassingen in huis?', type: 'radio', options: ['Ja, enkele', 'Ja, meerdere', 'Nee, nog niet', 'Weet ik niet'] },
      { id: 'helpNeeded', label: 'Bij welke activiteiten zou u het meest geholpen zijn?', type: 'textarea' },
    ],
  },
  dietetiek: {
    title: 'Dietetiek Intake',
    questions: [
      { id: 'currentDiet', label: 'Hoe zou u uw huidige eetpatroon beschrijven?', type: 'textarea' },
      { id: 'allergies', label: 'Heeft u voedselallergieën of intoleranties?', type: 'textarea' },
      { id: 'weightGoal', label: 'Heeft u een gewichtsdoel?', type: 'radio', options: ['Afvallen', 'Aankomen', 'Op gewicht blijven', 'Geen specifiek doel'] },
      { id: 'mealPattern', label: 'Hoeveel maaltijden eet u gemiddeld per dag?', type: 'radio', options: ['1-2 maaltijden', '3 maaltijden', '3+ maaltijden met tussendoortjes'] },
    ],
  },
  stoppen_met_roken: {
    title: 'Stoppen met Roken Intake',
    questions: [
      { id: 'smokingHistory', label: 'Hoeveel sigaretten rookt u gemiddeld per dag?', type: 'radio', options: ['1-5', '6-10', '11-20', 'Meer dan 20'] },
      { id: 'smokingYears', label: 'Hoe lang rookt u al?', type: 'radio', options: ['Minder dan 5 jaar', '5-10 jaar', '10-20 jaar', 'Meer dan 20 jaar'] },
      { id: 'quitAttempts', label: 'Heeft u eerder geprobeerd te stoppen?', type: 'textarea' },
      { id: 'motivation', label: 'Wat is uw belangrijkste motivatie om te stoppen?', type: 'textarea' },
    ],
  },
};

function IntakeContent({ params }: { params: Promise<{ discipline: string }> }) {
  const { discipline } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const sessionId = searchParams.get('sessionId') || '';

  const { saveIntakeSummary, triageSessions, addConsent } = useDemo();

  const [step, setStep] = useState<IntakeStep>('goals');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<string[]>([]);
  const [preferredContact, setPreferredContact] = useState('email');

  const config = DISCIPLINE_CONFIG[discipline];
  const session = triageSessions.find(s => s.id === sessionId);

  if (!config) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Onbekend zorgtraject: {discipline}</p>
        </main>
      </div>
    );
  }

  const steps: { id: IntakeStep; label: string }[] = [
    { id: 'goals', label: 'Doelen' },
    { id: 'details', label: 'Details' },
    { id: 'availability', label: 'Beschikbaarheid' },
    { id: 'confirm', label: 'Bevestigen' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const availabilityOptions = [
    'Maandagochtend',
    'Maandagmiddag',
    'Dinsdagochtend',
    'Dinsdagmiddag',
    'Woensdagochtend',
    'Woensdagmiddag',
    'Donderdagochtend',
    'Donderdagmiddag',
    'Vrijdagochtend',
    'Vrijdagmiddag',
  ];

  const handleSubmit = () => {
    // Generate summary from answers
    const summaryParts = Object.entries(answers).map(([key, value]) => {
      const question = config.questions.find(q => q.id === key);
      return question ? `${question.label}: ${value}` : '';
    }).filter(Boolean);

    const summary = `
${config.title}

${summaryParts.join('\n\n')}

Beschikbaarheid: ${availability.join(', ')}
Voorkeur contact: ${preferredContact}
    `.trim();

    saveIntakeSummary({
      patientId,
      triageSessionId: sessionId,
      discipline,
      answers,
      summary,
    });

    // Add consent for sharing with coordinator
    addConsent(patientId, {
      type: 'share_intake',
      granted: true,
      description: `Toestemming voor delen ${discipline} intake met zorgcoördinator`,
    });

    // Check if there are more pathways to complete
    const acceptedPathways = session?.carePathways.filter(p => p.accepted) || [];
    const currentIndex = acceptedPathways.findIndex(p => p.discipline === discipline);

    if (currentIndex < acceptedPathways.length - 1) {
      // Go to next pathway intake
      const nextPathway = acceptedPathways[currentIndex + 1];
      router.push(`/demo/intake/${nextPathway.discipline}?patientId=${patientId}&sessionId=${sessionId}`);
    } else {
      // All intakes complete, go to patient summary
      router.push(`/demo/patient-complete?patientId=${patientId}&sessionId=${sessionId}`);
    }
  };

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

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{config.title}</CardTitle>
              <CardDescription>
                {step === 'goals' && 'Vertel ons over uw doelen voor dit zorgtraject'}
                {step === 'details' && 'Meer details over uw situatie'}
                {step === 'availability' && 'Wanneer bent u beschikbaar voor afspraken?'}
                {step === 'confirm' && 'Controleer uw gegevens en verstuur'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'goals' && (
                <>
                  {config.questions.slice(0, 2).map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label htmlFor={q.id}>{q.label}</Label>
                      {q.type === 'textarea' ? (
                        <Textarea
                          id={q.id}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          rows={3}
                        />
                      ) : q.type === 'radio' && q.options ? (
                        <RadioGroup
                          value={answers[q.id] || ''}
                          onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
                        >
                          {q.options.map((opt) => (
                            <div key={opt} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                              <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Input
                          id={q.id}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </>
              )}

              {step === 'details' && (
                <>
                  {config.questions.slice(2).map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label htmlFor={q.id}>{q.label}</Label>
                      {q.type === 'textarea' ? (
                        <Textarea
                          id={q.id}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          rows={3}
                        />
                      ) : q.type === 'radio' && q.options ? (
                        <RadioGroup
                          value={answers[q.id] || ''}
                          onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
                        >
                          {q.options.map((opt) => (
                            <div key={opt} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                              <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Input
                          id={q.id}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </>
              )}

              {step === 'availability' && (
                <>
                  <div className="space-y-3">
                    <Label>Selecteer uw beschikbare momenten</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availabilityOptions.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            id={opt}
                            checked={availability.includes(opt)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAvailability([...availability, opt]);
                              } else {
                                setAvailability(availability.filter(a => a !== opt));
                              }
                            }}
                          />
                          <Label htmlFor={opt} className="text-sm">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Voorkeur voor contact</Label>
                    <RadioGroup value={preferredContact} onValueChange={setPreferredContact}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="contact-email" />
                        <Label htmlFor="contact-email">E-mail</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="contact-phone" />
                        <Label htmlFor="contact-phone">Telefoon</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="contact-both" />
                        <Label htmlFor="contact-both">Beide</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                    <p className="font-medium">Uw antwoorden:</p>
                    {Object.entries(answers).map(([key, value]) => {
                      const question = config.questions.find(q => q.id === key);
                      return (
                        <div key={key}>
                          <p className="text-sm text-muted-foreground">{question?.label}</p>
                          <p className="text-sm">{value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium mb-2">Beschikbaarheid:</p>
                    <p className="text-sm">{availability.length > 0 ? availability.join(', ') : 'Niet opgegeven'}</p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Toestemming</p>
                      <p className="text-sm text-muted-foreground">
                        Door te versturen geeft u toestemming om deze gegevens te delen met de zorgcoördinator voor het opstellen van uw behandelplan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                {step !== 'goals' ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const stepOrder: IntakeStep[] = ['goals', 'details', 'availability', 'confirm'];
                      const currentIdx = stepOrder.indexOf(step);
                      if (currentIdx > 0) setStep(stepOrder[currentIdx - 1]);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                ) : (
                  <div />
                )}

                {step !== 'confirm' ? (
                  <Button
                    onClick={() => {
                      const stepOrder: IntakeStep[] = ['goals', 'details', 'availability', 'confirm'];
                      const currentIdx = stepOrder.indexOf(step);
                      if (currentIdx < stepOrder.length - 1) setStep(stepOrder[currentIdx + 1]);
                    }}
                  >
                    Volgende
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90">
                    Versturen
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function IntakeClient({ params }: { params: Promise<{ discipline: string }> }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <IntakeContent params={params} />
    </Suspense>
  );
}
