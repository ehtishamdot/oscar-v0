"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Activity,
  HeartPulse,
  Stethoscope,
  Salad,
  CigaretteOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const pathwayInfo: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
  fysio: { title: 'Fysiotherapie', icon: <HeartPulse className="h-5 w-5" />, color: 'text-blue-500' },
  ergo: { title: 'Ergotherapie', icon: <Stethoscope className="h-5 w-5" />, color: 'text-green-500' },
  diet: { title: 'Diëtist', icon: <Salad className="h-5 w-5" />, color: 'text-orange-500' },
  smoking: { title: 'Stoppen met Roken', icon: <CigaretteOff className="h-5 w-5" />, color: 'text-red-500' },
  gli: { title: 'GLI Programma', icon: <Activity className="h-5 w-5" />, color: 'text-purple-500' },
};

function PatientIntakeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathways = searchParams.getAll('pathway');

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    // Contact Info
    email: '',
    phone: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    // Medical Info
    currentComplaints: '',
    complaintsLocation: [] as string[],
    complaintsDuration: '',
    previousTreatments: '',
    medications: '',
    otherConditions: '',
    // Consent
    consentPrivacy: false,
    consentTreatment: false,
    consentDataSharing: false,
  });

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationToggle = (location: string) => {
    const current = formData.complaintsLocation;
    if (current.includes(location)) {
      updateFormData('complaintsLocation', current.filter(l => l !== location));
    } else {
      updateFormData('complaintsLocation', [...current, location]);
    }
  };

  const handleSubmit = () => {
    // In production, this would save to database and trigger partner notifications
    console.log('Form submitted:', formData);
    console.log('Selected pathways:', pathways);

    // Navigate to confirmation page
    router.push('/intake/confirmation');
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.dateOfBirth && formData.email && formData.phone;
    }
    if (step === 2) {
      return formData.currentComplaints && formData.complaintsLocation.length > 0;
    }
    if (step === 3) {
      return formData.consentPrivacy && formData.consentTreatment && formData.consentDataSharing;
    }
    return false;
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
          Patiënt Registratie
        </h1>
        <p className="text-muted-foreground">
          Vul uw gegevens in om door te gaan met uw geselecteerde zorgpaden.
        </p>

        {/* Selected Pathways */}
        <div className="flex flex-wrap gap-2 mt-4">
          {pathways.map(p => {
            const info = pathwayInfo[p];
            if (!info) return null;
            return (
              <Badge key={p} variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                <span className={info.color}>{info.icon}</span>
                {info.title}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Stap {step} van {totalSteps}</span>
          <span className="text-muted-foreground">
            {step === 1 && 'Persoonlijke gegevens'}
            {step === 2 && 'Medische informatie'}
            {step === 3 && 'Toestemming'}
          </span>
        </div>
        <Progress value={(step / totalSteps) * 100} />
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persoonlijke Gegevens
            </CardTitle>
            <CardDescription>
              Vul uw persoonlijke en contactgegevens in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Voornaam *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Jan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Achternaam *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Jansen"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Geboortedatum *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Geslacht</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.gender}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                >
                  <option value="">Selecteer...</option>
                  <option value="male">Man</option>
                  <option value="female">Vrouw</option>
                  <option value="other">Anders</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="jan@voorbeeld.nl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="06 12345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Straat</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => updateFormData('street', e.target.value)}
                  placeholder="Hoofdstraat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Huisnr.</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => updateFormData('houseNumber', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postcode</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateFormData('postalCode', e.target.value)}
                  placeholder="1234 AB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Plaats</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Amsterdam"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Medical Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medische Informatie
            </CardTitle>
            <CardDescription>
              Beschrijf uw klachten en medische achtergrond.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Waar heeft u klachten? *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {['Linker heup', 'Rechter heup', 'Linker knie', 'Rechter knie'].map((location) => (
                  <div
                    key={location}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.complaintsLocation.includes(location)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleLocationToggle(location)}
                  >
                    <Checkbox
                      checked={formData.complaintsLocation.includes(location)}
                      onCheckedChange={() => handleLocationToggle(location)}
                    />
                    <Label className="cursor-pointer">{location}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentComplaints">Beschrijf uw huidige klachten *</Label>
              <Textarea
                id="currentComplaints"
                value={formData.currentComplaints}
                onChange={(e) => updateFormData('currentComplaints', e.target.value)}
                placeholder="Beschrijf uw klachten zo volledig mogelijk..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintsDuration">Hoe lang heeft u deze klachten?</Label>
              <select
                id="complaintsDuration"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.complaintsDuration}
                onChange={(e) => updateFormData('complaintsDuration', e.target.value)}
              >
                <option value="">Selecteer...</option>
                <option value="< 1 month">Minder dan 1 maand</option>
                <option value="1-3 months">1 - 3 maanden</option>
                <option value="3-6 months">3 - 6 maanden</option>
                <option value="6-12 months">6 - 12 maanden</option>
                <option value="> 1 year">Meer dan 1 jaar</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousTreatments">Eerdere behandelingen voor deze klachten</Label>
              <Textarea
                id="previousTreatments"
                value={formData.previousTreatments}
                onChange={(e) => updateFormData('previousTreatments', e.target.value)}
                placeholder="Bijv. fysiotherapie, medicatie, operatie..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Huidige medicatie</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => updateFormData('medications', e.target.value)}
                placeholder="Welke medicijnen gebruikt u momenteel?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherConditions">Overige aandoeningen of bijzonderheden</Label>
              <Textarea
                id="otherConditions"
                value={formData.otherConditions}
                onChange={(e) => updateFormData('otherConditions', e.target.value)}
                placeholder="Bijv. diabetes, hartproblemen, allergieën..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Consent */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Toestemming
            </CardTitle>
            <CardDescription>
              Lees en accepteer de onderstaande voorwaarden om door te gaan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.consentPrivacy ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => updateFormData('consentPrivacy', !formData.consentPrivacy)}
            >
              <Checkbox
                checked={formData.consentPrivacy}
                onCheckedChange={(checked) => updateFormData('consentPrivacy', !!checked)}
                className="mt-1"
              />
              <div>
                <Label className="cursor-pointer font-medium">Privacyverklaring *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de AVG en het privacybeleid van Oscar.
                </p>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.consentTreatment ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => updateFormData('consentTreatment', !formData.consentTreatment)}
            >
              <Checkbox
                checked={formData.consentTreatment}
                onCheckedChange={(checked) => updateFormData('consentTreatment', !!checked)}
                className="mt-1"
              />
              <div>
                <Label className="cursor-pointer font-medium">Behandelovereenkomst *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ik stem in met de voorgestelde behandelingen via de geselecteerde zorgpaden en begrijp dat ik altijd kan stoppen.
                </p>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.consentDataSharing ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => updateFormData('consentDataSharing', !formData.consentDataSharing)}
            >
              <Checkbox
                checked={formData.consentDataSharing}
                onCheckedChange={(checked) => updateFormData('consentDataSharing', !!checked)}
                className="mt-1"
              />
              <div>
                <Label className="cursor-pointer font-medium">Gegevensdeling met zorgverleners *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ik geef toestemming om mijn medische gegevens te delen met de betrokken zorgverleners (fysiotherapeut, ergotherapeut, diëtist, etc.) voor mijn behandeling.
                </p>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-800">
                  <strong>Beveiligde gegevensdeling:</strong> Uw medische gegevens worden via een beveiligde verbinding gedeeld met onze partners. Zij ontvangen een versleuteld PDF-bestand via e-mail en de toegangscode via SMS.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? 'Terug' : 'Vorige'}
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Volgende
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed()}>
            Aanmelden
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PatientIntakePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Laden...</div>}>
          <PatientIntakeContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Oscar. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
