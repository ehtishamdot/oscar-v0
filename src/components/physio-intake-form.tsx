'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CareNeeds } from '@/components/questionnaire';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Calendar, Shield, MessageSquare, Check, Mail } from 'lucide-react';
import { sendEmailFlow } from '@/ai/flows/send-email-flow';

// --- PROPS AND DATA STRUCTURES ---
interface PhysioIntakeFormProps {
  therapistId: string;
  therapistName: string;
  initialAnswers: CareNeeds;
}

const physioQuestions = [
    { id: 'complaintLocation', label: 'In welke gewrichten ervaart u de meeste klachten?', options: ['Knie', 'Heup', 'Handen/Polsen', 'Schouder', 'Rug/Nek', 'Anders'] },
    { id: 'painScale', label: 'Hoe zou u uw pijn gemiddeld beoordelen op een schaal van 1 tot 10?', sublabel: '1 is geen pijn, 10 is de ergst denkbare pijn', type: 'number' },
    { id: 'worseningActivities', label: 'Welke activiteiten maken de pijn erger?', options: ['Lopen / Rennen', 'Traplopen', 'Langdurig staan', 'Opstaan uit een stoel', 'Sporten', 'Anders'], multiple: true },
    { id: 'triedSolutions', label: 'Wat heeft u zelf al geprobeerd om de klachten te verminderen?', options: ['Pijnstillers', 'Rust', 'Oefeningen', 'Fysiotherapie (eerder)', 'Nog niets', 'Anders'], multiple: true },
    { id: 'primaryGoal', label: 'Wat is uw belangrijkste doel met fysiotherapie?', options: ['Pijn verminderen', 'Beter bewegen in huis', 'Langer kunnen lopen', 'Weer kunnen sporten', 'Advies over oefeningen', 'Anders'], multiple: true },
];

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

const timeSlots = ['Ochtend', 'Middag'];

const generateMailBody = (formData: Record<string, any>, therapistName: string, initialAnswers: CareNeeds) => {
        const availabilityText = getNextTwoWeeks().map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const slots = formData.availability[dateKey];
            if (slots && slots.length > 0) {
                const formattedDate = date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
                return `${formattedDate}: ${slots.join(', ')}`;
            }
            return null;
        }).filter(Boolean).join('\n') || 'Geen voorkeur opgegeven';

        const questionnaireSummary = physioQuestions.map((q, index) => {
            let answer = formData[q.id];
            if (q.multiple) {
                if (Array.isArray(answer) && answer.length > 0) {
                    const otherIndex = answer.indexOf('Anders');
                    if (otherIndex > -1) {
                        answer[otherIndex] = `Anders: ${formData[q.id + '-anders'] || ''}`;
                    }
                    answer = '\n - ' + answer.join('\n - ');
                } else {
                    answer = 'Niet beantwoord';
                }
            } else if (answer === 'Anders') {
                 answer += `: ${formData[q.id + '-anders'] || ''}`;
            }
            return `${index + 1}. ${q.label}\n   ${answer || 'Niet beantwoord'}`;
        }).join('\n\n');

        return `
Beste ${therapistName},

Graag zou ik een afspraak willen maken voor een fysiotherapeutische behandeling.

--- PATIËNTGEGEVENS ---
Naam: ${formData.name || 'Niet ingevuld'}
Geboortedatum: ${formData.birthDate || 'Niet ingevuld'}

--- INTAKE VRAGENLIJST ---
${questionnaireSummary}

--- BESCHIKBAARHEID ---
${availabilityText}

--- OPMERKINGEN ---
${formData.remarks || 'Geen opmerkingen'}

--- VERZEKERING (OPTIONEEL) ---
Verzekeraar: ${formData.insurer || 'Niet ingevuld'}
BSN: ${formData.bsn || 'Niet ingevuld'}

--- UITKOMSTEN EERSTE VRAGENLIJST ---
*   Dieetadvies nodig: ${initialAnswers.diet ? 'Ja' : 'Nee'}
*   Hulp bij stoppen met roken nodig: ${initialAnswers.smoking ? 'Ja' : 'Nee'}
*   Hulp van ergotherapeut nodig: ${initialAnswers.ergo ? 'Ja' : 'Nee'}
*   Indicatie voor fysiotherapie: ${initialAnswers.physio ? 'Ja' : 'Nee'}

---------------------------

Met vriendelijke groet,
${formData.name || '[Anonieme Gebruiker]'}
`;
}


// --- MAIN COMPONENT ---
const PhysioIntakeForm = ({ therapistId, therapistName, initialAnswers }: PhysioIntakeFormProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [view, setView] = useState('questionnaire'); // questionnaire, details, preview
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({
        availability: {},
    });
    const [loading, setLoading] = useState(false);

    const handleAnswer = (questionId: string, value: string, isMultiple: boolean) => {
        const newFormData = { ...formData };
        if (isMultiple) {
            const currentAnswers = formData[questionId] || [];
            newFormData[questionId] = currentAnswers.includes(value) ? currentAnswers.filter((a: string) => a !== value) : [...currentAnswers, value];
            if (!newFormData[questionId].includes('Anders')) delete newFormData[`${questionId}-anders`];
        } else {
            newFormData[questionId] = value;
            if (value !== 'Anders') delete newFormData[`${questionId}-anders`];
        }
        setFormData(newFormData);
    };
    
    const handleNext = () => {
        if (view === 'questionnaire') {
            if (currentStep < physioQuestions.length - 1) setCurrentStep(currentStep + 1);
            else setView('details');
        } else if (view === 'details') {
            setView('preview');
        }
    };

    const handleBack = () => {
        if (view === 'preview') setView('details');
        else if (view === 'details') setView('questionnaire');
        else if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const mailBody = generateMailBody(formData, therapistName, initialAnswers);

        try {
            const result = await sendEmailFlow({ to: 'o.e.c.vanmaarseveen@outlook.com', subject: `Aanmelding nieuwe patiënt: ${formData.name || 'Onbekend'}`, body: mailBody });
            if (result.success) {
                toast({ title: "Aanvraag succesvol verzonden!", description: `De aanvraag is verstuurd naar ${therapistName}.` });
                setTimeout(() => router.push('/'), 2000);
            } else { throw new Error(result.message); }
        } catch (error) {
            console.error("Email sending failed:", error);
            toast({ variant: 'destructive', title: "Er is iets misgegaan", description: "De aanvraag kon niet worden verzonden." });
        } finally { setLoading(false); }
    };

    // --- RENDER METHODS ---
    const renderQuestionnaireView = () => {
        const question = physioQuestions[currentStep];
        const progress = ((currentStep + 1) / (physioQuestions.length + 2)) * 100; // +2 for details and preview
        const answer = formData[question.id];
        const showAndersInput = question.multiple ? (answer || []).includes('Anders') : answer === 'Anders';

        return (
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <p className="text-sm font-semibold text-primary mb-2">Intake Fysiotherapie ({currentStep + 1}/{physioQuestions.length})</p>
                    <Progress value={progress} className="mb-4"/>
                    <CardTitle className="font-headline text-xl md:text-2xl">{question.label}</CardTitle>
                    {question.sublabel && <CardDescription className="pt-1 text-base">{question.sublabel}</CardDescription>}
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col gap-3">
                    {question.type === 'number' ? (
                        <div className='flex gap-2 items-center'>
                           <Input type="range" min="1" max="10" className="text-lg w-full" value={answer || '5'} onChange={(e) => handleAnswer(question.id, e.target.value, false)} />
                           <span className='font-bold text-xl p-3 bg-primary/10 rounded-md'>{answer || '5'}</span>
                        </div>
                    ) : (
                        question.options?.map(option => {
                            const isSelected = question.multiple ? (answer || []).includes(option) : answer === option;
                            return (<Button key={option} type="button" variant={isSelected ? 'default' : 'outline'} className="justify-start py-6 text-base relative" onClick={() => handleAnswer(question.id, option, !!question.multiple)}>{option}{isSelected && question.multiple && <Check className="h-5 w-5 absolute right-4"/>}</Button>)
                        })
                    )}
                    {showAndersInput && (<Input placeholder="Vul hier uw antwoord in" className="mt-2 text-base" value={formData[`${question.id}-anders`] || ''} onChange={e => setFormData({...formData, [`${question.id}-anders`]: e.target.value})} />)}
                </CardContent>
            </Card>
        );
    };

    const renderDetailsView = () => (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <Progress value={((physioQuestions.length + 1) / (physioQuestions.length + 2)) * 100} className="mb-4"/>
                <CardTitle className="font-headline text-xl md:text-2xl">Uw Gegevens</CardTitle>
                <CardDescription>Vul hieronder uw gegevens en beschikbaarheid in om de aanvraag af te ronden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                 <div className="space-y-4"><h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Persoonsgegevens</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="name">Volledige naam</Label><Input id="name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div className="space-y-1"><Label htmlFor="birthDate">Geboortedatum</Label><Input id="birthDate" type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div></div></div>
                 <div className="space-y-4"><h3 className="font-semibold text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/>Beschikbaarheid</h3><div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center">{getNextTwoWeeks().map(date => { const dateKey = date.toISOString().split('T')[0]; return (<div key={dateKey} className="rounded-lg border bg-card text-card-foreground p-2 flex flex-col justify-between"><div><p className="font-semibold text-sm">{date.toLocaleDateString('nl-NL', { weekday: 'short' })}</p><p className="font-bold text-lg">{date.getDate()}</p></div><div className="space-y-1 mt-2 flex flex-col">{timeSlots.map(slot => (<Button key={slot} type="button" variant={formData.availability[dateKey]?.includes(slot) ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => { const newAvailability = { ...formData.availability }; if (!newAvailability[dateKey]) newAvailability[dateKey] = []; newAvailability[dateKey].includes(slot) ? newAvailability[dateKey] = newAvailability[dateKey].filter(s => s !== slot) : newAvailability[dateKey].push(slot); setFormData({ ...formData, availability: newAvailability }); }}>{slot}</Button>))}</div></div>)})}</div></div>
                 <div className="space-y-4"><h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Opmerkingen (optioneel)</h3><Textarea id="remarks" placeholder="Heeft u nog andere relevante informatie?" value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} /></div>
                 <div className="space-y-4"><h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary"/>Verzekeringsgegevens (Optioneel)</h3><p className="text-sm text-muted-foreground -mt-2">Wel relevant om te kunnen declareren bij uw zorgverzekeraar.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="insurer">Zorgverzekeraar</Label><Input id="insurer" value={formData.insurer || ''} onChange={e => setFormData({...formData, insurer: e.target.value})} /></div><div className="space-y-1"><Label htmlFor="bsn">BSN</Label><Input id="bsn" value={formData.bsn || ''} onChange={e => setFormData({...formData, bsn: e.target.value})} /></div></div></div>
            </CardContent>
        </Card>
    );

    const renderPreviewView = () => (
         <Card className="shadow-lg border-primary/20">
            <CardHeader>
                 <Progress value={100} className="mb-4"/>
                <CardTitle className="font-headline text-xl md:text-2xl">Simulatie: Voorbeeld van de e-mail</CardTitle>
                <CardDescription>Controleer de onderstaande gegevens. Dit is de e-mail die naar {therapistName} wordt verzonden.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {generateMailBody(formData, therapistName, initialAnswers)}
                </div>
            </CardContent>
        </Card>
    )

    const renderView = () => {
        switch (view) {
            case 'questionnaire': return renderQuestionnaireView();
            case 'details': return renderDetailsView();
            case 'preview': return renderPreviewView();
            default: return null;
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {renderView()}
            <div className="mt-6 flex justify-between items-center">
                <Button type="button" variant="ghost" onClick={handleBack} disabled={view === 'questionnaire' && currentStep === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Vorige</Button>
                {view !== 'preview' ? (
                    <Button type="button" onClick={handleNext}>{view === 'details' ? 'Controleer e-mail' : 'Verder'}</Button>
                ) : (
                    <Button type="submit" disabled={loading} size="lg">
                        <Mail className="mr-2 h-4 w-4" />
                        {loading ? 'Aanvraag verzenden...' : 'Verstuur Aanvraag'}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default PhysioIntakeForm;
