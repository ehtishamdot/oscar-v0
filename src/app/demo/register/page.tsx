'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/demo-context';
import { INSURERS } from '@/lib/demo-store';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ArrowRight, ArrowLeft, Lock } from 'lucide-react';

type Step = 'personal' | 'insurance' | 'consent';

export default function RegisterPage() {
  const router = useRouter();
  const { registerPatient, addConsent, loginAs } = useDemo();

  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bsn: '',
    insurer: '',
    insurerNumber: '',
  });
  const [consents, setConsents] = useState({
    dataProcessing: false,
    privacyPolicy: false,
    shareWithCoordinator: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: { id: Step; label: string; progress: number }[] = [
    { id: 'personal', label: 'Persoonlijke Gegevens', progress: 33 },
    { id: 'insurance', label: 'Verzekering', progress: 66 },
    { id: 'consent', label: 'Toestemming', progress: 100 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const validatePersonal = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Naam is verplicht';
    if (!formData.email.trim()) newErrors.email = 'E-mail is verplicht';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ongeldig e-mailadres';
    if (!formData.phone.trim()) newErrors.phone = 'Telefoonnummer is verplicht';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Geboortedatum is verplicht';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInsurance = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.bsn.trim()) newErrors.bsn = 'BSN is verplicht';
    else if (!/^\d{9}$/.test(formData.bsn.replace(/\s/g, ''))) newErrors.bsn = 'BSN moet 9 cijfers bevatten';
    if (!formData.insurer) newErrors.insurer = 'Verzekeraar is verplicht';
    if (!formData.insurerNumber.trim()) newErrors.insurerNumber = 'Polisnummer is verplicht';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConsent = () => {
    const newErrors: Record<string, string> = {};
    if (!consents.dataProcessing) newErrors.dataProcessing = 'Toestemming voor gegevensverwerking is verplicht';
    if (!consents.privacyPolicy) newErrors.privacyPolicy = 'Akkoord met privacybeleid is verplicht';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'personal' && validatePersonal()) {
      setStep('insurance');
    } else if (step === 'insurance' && validateInsurance()) {
      setStep('consent');
    }
  };

  const handleBack = () => {
    if (step === 'insurance') setStep('personal');
    else if (step === 'consent') setStep('insurance');
  };

  const handleSubmit = () => {
    if (!validateConsent()) return;

    // Register patient
    const patient = registerPatient({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      bsn: formData.bsn.replace(/\s/g, ''),
      insurer: formData.insurer,
      insurerNumber: formData.insurerNumber,
    });

    // Add consents
    addConsent(patient.id, {
      type: 'data_processing',
      granted: true,
      description: 'Toestemming voor verwerking van persoonsgegevens volgens AVG',
    });

    if (consents.shareWithCoordinator) {
      addConsent(patient.id, {
        type: 'share_intake',
        granted: true,
        description: 'Toestemming om intake gegevens te delen met zorgcoördinator',
      });
    }

    // Login as this patient
    loginAs('patient', patient.name);

    // Navigate to triage
    router.push(`/demo/triage?patientId=${patient.id}`);
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
            <Progress value={steps[currentStepIndex].progress} />
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                {step === 'personal' && 'Persoonlijke Gegevens'}
                {step === 'insurance' && 'Verzekeringsinformatie'}
                {step === 'consent' && 'Toestemming & Privacy'}
              </CardTitle>
              <CardDescription>
                {step === 'personal' && 'Vul uw basisgegevens in om te beginnen'}
                {step === 'insurance' && 'Uw verzekeringsinformatie voor declarabele zorg'}
                {step === 'consent' && 'Geef toestemming voor veilige gegevensverwerking'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'personal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Volledige naam *</Label>
                    <Input
                      id="name"
                      placeholder="Jan de Vries"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jan@voorbeeld.nl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06-12345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Geboortedatum *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                    {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                  </div>
                </>
              )}

              {step === 'insurance' && (
                <>
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Uw BSN wordt alleen gebruikt voor declaratie bij uw zorgverzekeraar en wordt versleuteld opgeslagen.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="bsn">BSN (Burgerservicenummer) *</Label>
                    <Input
                      id="bsn"
                      placeholder="123456789"
                      value={formData.bsn}
                      onChange={(e) => setFormData({ ...formData, bsn: e.target.value })}
                      maxLength={11}
                    />
                    {errors.bsn && <p className="text-sm text-destructive">{errors.bsn}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurer">Zorgverzekeraar *</Label>
                    <Select
                      value={formData.insurer}
                      onValueChange={(value) => setFormData({ ...formData, insurer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer uw verzekeraar" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSURERS.map((insurer) => (
                          <SelectItem key={insurer} value={insurer}>
                            {insurer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.insurer && <p className="text-sm text-destructive">{errors.insurer}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurerNumber">Polisnummer *</Label>
                    <Input
                      id="insurerNumber"
                      placeholder="AB123456"
                      value={formData.insurerNumber}
                      onChange={(e) => setFormData({ ...formData, insurerNumber: e.target.value })}
                    />
                    {errors.insurerNumber && <p className="text-sm text-destructive">{errors.insurerNumber}</p>}
                  </div>
                </>
              )}

              {step === 'consent' && (
                <>
                  <Alert className="bg-primary/10 border-primary/20">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Uw gegevens worden verwerkt volgens de AVG/GDPR en worden alleen in de EU opgeslagen.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="dataProcessing"
                        checked={consents.dataProcessing}
                        onCheckedChange={(checked) =>
                          setConsents({ ...consents, dataProcessing: checked as boolean })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="dataProcessing" className="font-medium cursor-pointer">
                          Toestemming voor gegevensverwerking *
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ik geef toestemming voor het verwerken van mijn persoonsgegevens voor het bieden van zorg en
                          het afhandelen van declaraties.
                        </p>
                      </div>
                    </div>
                    {errors.dataProcessing && <p className="text-sm text-destructive">{errors.dataProcessing}</p>}

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="privacyPolicy"
                        checked={consents.privacyPolicy}
                        onCheckedChange={(checked) =>
                          setConsents({ ...consents, privacyPolicy: checked as boolean })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="privacyPolicy" className="font-medium cursor-pointer">
                          Akkoord met privacybeleid *
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ik heb het privacybeleid gelezen en ga hiermee akkoord.
                        </p>
                      </div>
                    </div>
                    {errors.privacyPolicy && <p className="text-sm text-destructive">{errors.privacyPolicy}</p>}

                    <div className="flex items-start space-x-3 p-4 border rounded-lg bg-secondary/30">
                      <Checkbox
                        id="shareWithCoordinator"
                        checked={consents.shareWithCoordinator}
                        onCheckedChange={(checked) =>
                          setConsents({ ...consents, shareWithCoordinator: checked as boolean })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="shareWithCoordinator" className="font-medium cursor-pointer">
                          Delen met zorgcoördinator (aanbevolen)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ik geef toestemming om mijn intake gegevens te delen met de zorgcoördinator voor het
                          opstellen van een passend behandelplan.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4">
                {step !== 'personal' ? (
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vorige
                  </Button>
                ) : (
                  <div />
                )}

                {step !== 'consent' ? (
                  <Button onClick={handleNext}>
                    Volgende
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Registreren & Starten
                    <ArrowRight className="ml-2 h-4 w-4" />
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
