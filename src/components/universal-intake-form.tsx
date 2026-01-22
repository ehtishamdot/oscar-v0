'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Calendar, Shield, MessageSquare, Check, Mail, MapPin, Activity, Utensils, Cigarette, Heart } from 'lucide-react';

// Pathway type
type Pathway = 'fysio' | 'ergo' | 'diet' | 'smoking' | 'gli';

// Props
interface UniversalIntakeFormProps {
  pathways: Pathway[];
  initialAnswers?: Record<string, boolean>;
}

// Pathway-specific questions
const pathwayQuestions: Record<Pathway, Array<{
  id: string;
  label: string;
  sublabel?: string;
  options?: string[];
  multiple?: boolean;
  type?: 'number' | 'text';
}>> = {
  fysio: [
    { id: 'fysio_complaintLocation', label: 'In welke gewrichten ervaart u de meeste klachten?', options: ['Knie', 'Heup', 'Handen/Polsen', 'Schouder', 'Rug/Nek', 'Anders'] },
    { id: 'fysio_painScale', label: 'Hoe zou u uw pijn gemiddeld beoordelen op een schaal van 1 tot 10?', sublabel: '1 is geen pijn, 10 is de ergst denkbare pijn', type: 'number' },
    { id: 'fysio_worseningActivities', label: 'Welke activiteiten maken de pijn erger?', options: ['Lopen / Rennen', 'Traplopen', 'Langdurig staan', 'Opstaan uit een stoel', 'Sporten', 'Anders'], multiple: true },
    { id: 'fysio_triedSolutions', label: 'Wat heeft u zelf al geprobeerd om de klachten te verminderen?', options: ['Pijnstillers', 'Rust', 'Oefeningen', 'Fysiotherapie (eerder)', 'Nog niets', 'Anders'], multiple: true },
    { id: 'fysio_primaryGoal', label: 'Wat is uw belangrijkste doel met fysiotherapie?', options: ['Pijn verminderen', 'Beter bewegen in huis', 'Langer kunnen lopen', 'Weer kunnen sporten', 'Advies over oefeningen', 'Anders'], multiple: true },
  ],
  ergo: [
    { id: 'ergo_dailyActivities', label: 'Welke dagelijkse activiteiten vindt u het moeilijkst?', options: ['Aankleden', 'Koken / Eten bereiden', 'Huishouden', 'Boodschappen doen', 'Persoonlijke verzorging', 'Anders'], multiple: true },
    { id: 'ergo_homeAdjustments', label: 'Heeft u al aanpassingen in huis?', options: ['Traplift', 'Douchestoel', 'Verhoogd toilet', 'Geen aanpassingen', 'Anders'] },
    { id: 'ergo_primaryGoal', label: 'Wat wilt u graag bereiken met ergotherapie?', options: ['Zelfstandiger worden', 'Veiliger bewegen in huis', 'Energie besparen', 'Hulpmiddelen leren gebruiken', 'Anders'], multiple: true },
  ],
  diet: [
    { id: 'diet_currentDiet', label: 'Hoe zou u uw huidige eetpatroon omschrijven?', options: ['Gezond en gevarieerd', 'Onregelmatig', 'Te weinig groenten/fruit', 'Te veel snacks', 'Anders'] },
    { id: 'diet_weightGoal', label: 'Wat is uw doel met voedingsbegeleiding?', options: ['Afvallen', 'Gezonder eten', 'Meer energie', 'Klachten verminderen', 'Anders'], multiple: true },
    { id: 'diet_allergies', label: 'Heeft u voedselallergieën of intoleranties?', options: ['Geen', 'Lactose', 'Gluten', 'Noten', 'Anders'] },
  ],
  smoking: [
    { id: 'smoking_yearsSmoked', label: 'Hoeveel jaar rookt u al?', type: 'text' },
    { id: 'smoking_perDay', label: 'Hoeveel sigaretten rookt u per dag?', type: 'text' },
    { id: 'smoking_previousAttempts', label: 'Heeft u eerder geprobeerd te stoppen?', options: ['Nooit', '1-2 keer', '3-5 keer', 'Meer dan 5 keer'] },
    { id: 'smoking_motivation', label: 'Wat is uw belangrijkste motivatie om te stoppen?', options: ['Gezondheid', 'Kosten', 'Familie', 'Conditie', 'Anders'], multiple: true },
  ],
  gli: [
    { id: 'gli_currentExercise', label: 'Hoe vaak sport of beweegt u per week?', options: ['Nooit', '1-2 keer', '3-4 keer', 'Dagelijks'] },
    { id: 'gli_healthGoals', label: 'Wat zijn uw gezondheidsdoelen?', options: ['Afvallen', 'Fitter worden', 'Meer energie', 'Beter slapen', 'Stress verminderen', 'Anders'], multiple: true },
    { id: 'gli_barriers', label: 'Wat weerhoudt u van een gezondere leefstijl?', options: ['Geen tijd', 'Geen motivatie', 'Lichamelijke beperkingen', 'Weet niet hoe', 'Anders'], multiple: true },
  ],
};

// Pathway display info
const pathwayInfo: Record<Pathway, { name: string; icon: React.ReactNode; color: string }> = {
  fysio: { name: 'Fysiotherapie', icon: <Activity className="h-5 w-5" />, color: 'text-blue-600' },
  ergo: { name: 'Ergotherapie', icon: <Heart className="h-5 w-5" />, color: 'text-purple-600' },
  diet: { name: 'Voedingsbegeleiding', icon: <Utensils className="h-5 w-5" />, color: 'text-green-600' },
  smoking: { name: 'Stoppen met Roken', icon: <Cigarette className="h-5 w-5" />, color: 'text-orange-600' },
  gli: { name: 'GLI Programma', icon: <Heart className="h-5 w-5" />, color: 'text-red-600' },
};

// Time slots for availability
const timeSlots = ['Ochtend', 'Middag'];

const getNextTwoWeeks = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Main component
export default function UniversalIntakeForm({ pathways, initialAnswers }: UniversalIntakeFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Build all questions for selected pathways
  const allQuestions = pathways.flatMap(pathway => pathwayQuestions[pathway] || []);
  const totalSteps = allQuestions.length + 2; // questions + details + preview

  const [view, setView] = useState<'questions' | 'details' | 'preview'>('questions');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    availability: {},
    pathways: pathways,
  });
  const [loading, setLoading] = useState(false);

  // Handle answer for current question
  const handleAnswer = (questionId: string, value: string, isMultiple: boolean) => {
    const newFormData = { ...formData };
    if (isMultiple) {
      const currentAnswers = formData[questionId] || [];
      newFormData[questionId] = currentAnswers.includes(value)
        ? currentAnswers.filter((a: string) => a !== value)
        : [...currentAnswers, value];
      if (!newFormData[questionId].includes('Anders')) delete newFormData[`${questionId}-anders`];
    } else {
      newFormData[questionId] = value;
      if (value !== 'Anders') delete newFormData[`${questionId}-anders`];
    }
    setFormData(newFormData);
  };

  // Navigation
  const handleNext = () => {
    if (view === 'questions') {
      if (currentStep < allQuestions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setView('details');
      }
    } else if (view === 'details') {
      setView('preview');
    }
  };

  const handleBack = () => {
    if (view === 'preview') {
      setView('details');
    } else if (view === 'details') {
      setView('questions');
      setCurrentStep(allQuestions.length - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone || '',
          patientBirthDate: formData.birthDate || '',
          patientPostcode: formData.postcode,
          patientCity: formData.city || '',
          pathways: pathways,
          intakeAnswers: Object.fromEntries(
            Object.entries(formData).filter(([key]) =>
              key.startsWith('fysio_') ||
              key.startsWith('ergo_') ||
              key.startsWith('diet_') ||
              key.startsWith('smoking_') ||
              key.startsWith('gli_')
            )
          ),
          availability: formData.availability,
          insurer: formData.insurer || '',
          bsn: formData.bsn || '',
          remarks: formData.remarks || '',
          urgency: 'normal',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Aanvraag succesvol verzonden!",
          description: result.message,
        });
        setTimeout(() => router.push('/intake/success'), 2000);
      } else {
        throw new Error(result.error || 'Er is iets misgegaan');
      }
    } catch (error) {
      console.error('Intake submission failed:', error);
      toast({
        variant: 'destructive',
        title: "Er is iets misgegaan",
        description: error instanceof Error ? error.message : 'De aanvraag kon niet worden verzonden.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress
  const getProgress = () => {
    if (view === 'questions') {
      return ((currentStep + 1) / totalSteps) * 100;
    } else if (view === 'details') {
      return ((allQuestions.length + 1) / totalSteps) * 100;
    }
    return 100;
  };

  // Render current question
  const renderQuestion = () => {
    if (allQuestions.length === 0) {
      return null;
    }

    const question = allQuestions[currentStep];
    const answer = formData[question.id];
    const showAndersInput = question.multiple
      ? (answer || []).includes('Anders')
      : answer === 'Anders';

    // Find which pathway this question belongs to
    const pathwayKey = question.id.split('_')[0] as Pathway;
    const pathway = pathwayInfo[pathwayKey];

    return (
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <span className={pathway?.color}>{pathway?.icon}</span>
            <span className={pathway?.color}>{pathway?.name}</span>
            <span className="text-muted-foreground">({currentStep + 1}/{allQuestions.length})</span>
          </div>
          <Progress value={getProgress()} className="mb-4" />
          <CardTitle className="font-headline text-xl md:text-2xl">{question.label}</CardTitle>
          {question.sublabel && <CardDescription className="pt-1 text-base">{question.sublabel}</CardDescription>}
        </CardHeader>
        <CardContent className="min-h-[250px] flex flex-col gap-3">
          {question.type === 'number' ? (
            <div className="flex gap-2 items-center">
              <Input
                type="range"
                min="1"
                max="10"
                className="text-lg w-full"
                value={answer || '5'}
                onChange={(e) => handleAnswer(question.id, e.target.value, false)}
              />
              <span className="font-bold text-xl p-3 bg-primary/10 rounded-md">{answer || '5'}</span>
            </div>
          ) : question.type === 'text' ? (
            <Input
              type="text"
              className="text-lg"
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value, false)}
              placeholder="Vul hier uw antwoord in"
            />
          ) : (
            question.options?.map(option => {
              const isSelected = question.multiple ? (answer || []).includes(option) : answer === option;
              return (
                <Button
                  key={option}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="justify-start py-6 text-base relative"
                  onClick={() => handleAnswer(question.id, option, !!question.multiple)}
                >
                  {option}
                  {isSelected && question.multiple && <Check className="h-5 w-5 absolute right-4" />}
                </Button>
              );
            })
          )}
          {showAndersInput && (
            <Input
              placeholder="Vul hier uw antwoord in"
              className="mt-2 text-base"
              value={formData[`${question.id}-anders`] || ''}
              onChange={e => setFormData({ ...formData, [`${question.id}-anders`]: e.target.value })}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Render details form
  const renderDetails = () => (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <Progress value={getProgress()} className="mb-4" />
        <CardTitle className="font-headline text-xl md:text-2xl">Uw Gegevens</CardTitle>
        <CardDescription>Vul hieronder uw gegevens en beschikbaarheid in om de aanvraag af te ronden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Personal details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Persoonsgegevens
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Volledige naam *</Label>
              <Input
                id="name"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="birthDate">Geboortedatum</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Location - required for provider matching */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Locatie
          </h3>
          <p className="text-sm text-muted-foreground -mt-2">
            We gebruiken uw postcode om zorgverleners bij u in de buurt te vinden.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                required
                placeholder="1234AB"
                value={formData.postcode || ''}
                onChange={e => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">Plaats</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Beschikbaarheid
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center">
            {getNextTwoWeeks().map(date => {
              const dateKey = date.toISOString().split('T')[0];
              return (
                <div key={dateKey} className="rounded-lg border bg-card text-card-foreground p-2 flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-sm">{date.toLocaleDateString('nl-NL', { weekday: 'short' })}</p>
                    <p className="font-bold text-lg">{date.getDate()}</p>
                  </div>
                  <div className="space-y-1 mt-2 flex flex-col">
                    {timeSlots.map(slot => (
                      <Button
                        key={slot}
                        type="button"
                        variant={formData.availability[dateKey]?.includes(slot) ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          const newAvailability = { ...formData.availability };
                          if (!newAvailability[dateKey]) newAvailability[dateKey] = [];
                          newAvailability[dateKey].includes(slot)
                            ? (newAvailability[dateKey] = newAvailability[dateKey].filter((s: string) => s !== slot))
                            : newAvailability[dateKey].push(slot);
                          setFormData({ ...formData, availability: newAvailability });
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Opmerkingen (optioneel)
          </h3>
          <Textarea
            id="remarks"
            placeholder="Heeft u nog andere relevante informatie?"
            value={formData.remarks || ''}
            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>

        {/* Insurance */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verzekeringsgegevens (Optioneel)
          </h3>
          <p className="text-sm text-muted-foreground -mt-2">
            Wel relevant om te kunnen declareren bij uw zorgverzekeraar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="insurer">Zorgverzekeraar</Label>
              <Input
                id="insurer"
                value={formData.insurer || ''}
                onChange={e => setFormData({ ...formData, insurer: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bsn">BSN</Label>
              <Input
                id="bsn"
                value={formData.bsn || ''}
                onChange={e => setFormData({ ...formData, bsn: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render preview
  const renderPreview = () => {
    const selectedPathways = pathways.map(p => pathwayInfo[p]?.name).join(', ');

    return (
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <Progress value={100} className="mb-4" />
          <CardTitle className="font-headline text-xl md:text-2xl">Controleer uw aanvraag</CardTitle>
          <CardDescription>Controleer de onderstaande gegevens voordat u de aanvraag verstuurt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected pathways */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Gekozen zorgpaden</h4>
            <div className="flex flex-wrap gap-2">
              {pathways.map(pathway => (
                <span key={pathway} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border ${pathwayInfo[pathway]?.color}`}>
                  {pathwayInfo[pathway]?.icon}
                  {pathwayInfo[pathway]?.name}
                </span>
              ))}
            </div>
          </div>

          {/* Personal info summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Persoonsgegevens</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Naam:</span>
              <span>{formData.name || '-'}</span>
              <span className="text-muted-foreground">E-mail:</span>
              <span>{formData.email || '-'}</span>
              <span className="text-muted-foreground">Telefoon:</span>
              <span>{formData.phone || '-'}</span>
              <span className="text-muted-foreground">Postcode:</span>
              <span>{formData.postcode || '-'}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Wat gebeurt er na verzenden?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Wij zoeken automatisch zorgverleners bij u in de buurt</li>
              <li>2. Zij ontvangen uw aanvraag per e-mail</li>
              <li>3. U ontvangt een bevestiging per e-mail</li>
              <li>4. De zorgverlener neemt contact met u op</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main render
  return (
    <form onSubmit={handleSubmit}>
      {view === 'questions' && allQuestions.length > 0 && renderQuestion()}
      {view === 'questions' && allQuestions.length === 0 && (
        <>{setView('details')}</>
      )}
      {view === 'details' && renderDetails()}
      {view === 'preview' && renderPreview()}

      <div className="mt-6 flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={view === 'questions' && currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Vorige
        </Button>

        {view !== 'preview' ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={view === 'details' && (!formData.name || !formData.email || !formData.postcode)}
          >
            {view === 'details' ? 'Controleer aanvraag' : 'Verder'}
          </Button>
        ) : (
          <Button type="submit" disabled={loading} size="lg">
            <Mail className="mr-2 h-4 w-4" />
            {loading ? 'Aanvraag verzenden...' : 'Verstuur Aanvraag'}
          </Button>
        )}
      </div>
    </form>
  );
}
