'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

function PatientDashboardContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';

  const {
    getPatientById,
    getTriageSessionByPatientId,
    getIntakeSummariesByPatientId,
    getTreatmentPlansByPatientId,
    careRequests,
  } = useDemo();

  const patient = getPatientById(patientId);
  const session = getTriageSessionByPatientId(patientId);
  const intakes = getIntakeSummariesByPatientId(patientId);
  const plans = getTreatmentPlansByPatientId(patientId);
  const patientRequests = careRequests.filter(r => r.patientId === patientId);
  const acceptedRequest = patientRequests.find(r => r.status === 'accepted');

  if (!patient) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Patiënt niet gevonden.</p>
              <Button asChild>
                <Link href="/demo">Terug naar Demo</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Calculate progress
  const steps = [
    { label: 'Registratie', completed: true },
    { label: 'Triage', completed: !!session },
    { label: 'Zorgtrajecten', completed: session?.carePathways.some(p => p.accepted) || false },
    { label: 'Intake', completed: intakes.length > 0 },
    { label: 'Behandelplan', completed: plans.length > 0 },
    { label: 'Zorgverlener', completed: !!acceptedRequest },
  ];
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  const getStatusBadge = () => {
    if (acceptedRequest) {
      return <Badge className="bg-green-600">Afspraak gepland</Badge>;
    }
    if (patientRequests.some(r => r.status === 'pending')) {
      return <Badge variant="secondary">Wacht op zorgverlener</Badge>;
    }
    if (plans.length > 0) {
      return <Badge variant="secondary">Behandelplan klaar</Badge>;
    }
    if (intakes.length > 0) {
      return <Badge variant="outline">Intake afgerond</Badge>;
    }
    if (session) {
      return <Badge variant="outline">Triage afgerond</Badge>;
    }
    return <Badge variant="outline">Geregistreerd</Badge>;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Mijn Zorgtraject
              </h1>
              <p className="text-muted-foreground">Welkom, {patient.name}</p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Voortgang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{completedSteps} van {steps.length} stappen voltooid</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} />
              </div>
              <div className="flex flex-wrap gap-2">
                {steps.map((step, idx) => (
                  <Badge
                    key={idx}
                    variant={step.completed ? 'default' : 'outline'}
                    className={step.completed ? 'bg-green-600' : ''}
                  >
                    {step.completed && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {step.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointment info if scheduled */}
          {acceptedRequest && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <Calendar className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Afspraak bevestigd!</strong> U heeft een afspraak op{' '}
                <strong>{acceptedRequest.appointmentDate}</strong> bij{' '}
                <strong>{acceptedRequest.providerName}</strong>.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mijn Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Naam</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefoon</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verzekeraar</p>
                  <p className="font-medium">{patient.insurer}</p>
                </div>
              </CardContent>
            </Card>

            {/* Care Pathways */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mijn Zorgtrajecten
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session?.carePathways.filter(p => p.accepted).length ? (
                  <div className="space-y-3">
                    {session.carePathways
                      .filter(p => p.accepted)
                      .map(pathway => (
                        <div key={pathway.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="font-medium">{pathway.name}</p>
                            <p className="text-sm text-muted-foreground">{pathway.discipline}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nog geen zorgtrajecten geselecteerd</p>
                )}
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Behandelplan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plans.length > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge>{plans[0].status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Doelen</p>
                      <ul className="list-disc list-inside text-sm">
                        {plans[0].goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Geschatte sessies</p>
                      <p className="font-medium">{plans[0].estimatedSessions}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Wacht op behandelplan van zorgcoördinator</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Zorgverlener
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acceptedRequest ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Praktijk</p>
                      <p className="font-medium">{acceptedRequest.providerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Discipline</p>
                      <p className="font-medium capitalize">{acceptedRequest.discipline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Afspraak</p>
                      <p className="font-medium">{acceptedRequest.appointmentDate}</p>
                    </div>
                  </div>
                ) : patientRequests.some(r => r.status === 'pending') ? (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-muted-foreground">Wacht op reactie van zorgverleners</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patientRequests.filter(r => r.status === 'pending').length} aanvragen verstuurd
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nog geen zorgverlener gekoppeld</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Consents */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mijn Toestemmingen
              </CardTitle>
              <CardDescription>
                Overzicht van uw gegeven toestemmingen voor gegevensverwerking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.consents.map(consent => (
                  <div key={consent.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium">{consent.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(consent.timestamp).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <Badge variant={consent.granted ? 'default' : 'destructive'}>
                      {consent.granted ? 'Toegestaan' : 'Geweigerd'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/demo">Terug naar Demo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/demo/coordinator">
                Bekijk als Coördinator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
      <PatientDashboardContent />
    </Suspense>
  );
}
