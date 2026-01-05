'use client';

import { useState, useEffect } from 'react';
import { useDemo } from '@/lib/demo-context';
import { DEMO_PROVIDERS } from '@/lib/demo-store';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Inbox,
} from 'lucide-react';

export default function ProviderDashboard() {
  const {
    currentUser,
    loginAs,
    patients,
    careRequests,
    treatmentPlans,
    triageSessions,
    intakeSummaries,
    respondToCareRequest,
  } = useDemo();

  const [selectedProvider, setSelectedProvider] = useState(DEMO_PROVIDERS[0].id);
  const [acceptDialog, setAcceptDialog] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  // Login as provider if not already
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'provider') {
      loginAs('provider', DEMO_PROVIDERS[0].name);
    }
  }, [currentUser, loginAs]);

  const provider = DEMO_PROVIDERS.find(p => p.id === selectedProvider);

  // Get requests for this provider
  const providerRequests = careRequests.filter(r => r.providerId === selectedProvider);
  const pendingRequests = providerRequests.filter(r => r.status === 'pending');
  const acceptedRequests = providerRequests.filter(r => r.status === 'accepted');
  const otherRequests = providerRequests.filter(r => r.status === 'declined' || r.status === 'withdrawn');

  const handleAccept = (requestId: string) => {
    if (!appointmentDate) return;

    const dateTime = `${appointmentDate} ${appointmentTime}`;
    respondToCareRequest(requestId, true, dateTime);
    setAcceptDialog(null);
    setAppointmentDate('');
  };

  const handleDecline = (requestId: string) => {
    respondToCareRequest(requestId, false);
  };

  const getPatientData = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    const session = triageSessions.find(s => s.patientId === patientId);
    const intakes = intakeSummaries.filter(i => i.patientId === patientId);
    return { patient, session, intakes };
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3); // Within 3 days
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Zorgverlener Portal
              </h1>
              <p className="text-muted-foreground">
                {provider?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_PROVIDERS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pendingRequests.length > 0 && (
                <Badge className="bg-amber-500">
                  {pendingRequests.length} nieuwe aanvra{pendingRequests.length === 1 ? 'ag' : 'gen'}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Inbox className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Nieuwe aanvragen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{acceptedRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Geaccepteerd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{otherRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Afgewezen/Ingetrokken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{provider?.insurers.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Verzekeraars</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Nieuwe Aanvragen
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="accepted">Mijn Patiënten</TabsTrigger>
              <TabsTrigger value="history">Geschiedenis</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Geen nieuwe aanvragen</p>
                    <p className="text-muted-foreground">
                      Nieuwe zorgaanvragen verschijnen hier
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => {
                    const { patient, session, intakes } = getPatientData(request.patientId);
                    const plan = treatmentPlans.find(p => p.id === request.treatmentPlanId);

                    return (
                      <Card key={request.id} className="border-2 border-amber-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {patient?.name || 'Onbekende patiënt'}
                              </CardTitle>
                              <CardDescription>
                                {request.discipline} | {patient?.insurer}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-amber-50">
                              <Clock className="mr-1 h-3 w-3" />
                              Wacht op reactie
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {session?.hasRedFlags && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Let op</AlertTitle>
                              <AlertDescription>
                                Deze patiënt heeft red flags in de triage. Zie intake voor details.
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-secondary/50 rounded-lg">
                              <p className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Behandelplan
                              </p>
                              {plan && (
                                <>
                                  <p className="text-sm text-muted-foreground mb-1">Doelen:</p>
                                  <ul className="text-sm list-disc list-inside">
                                    {plan.goals.map((goal, idx) => (
                                      <li key={idx}>{goal}</li>
                                    ))}
                                  </ul>
                                  <p className="text-sm mt-2">
                                    Geschatte sessies: {plan.estimatedSessions}
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="p-4 bg-secondary/50 rounded-lg">
                              <p className="font-medium mb-2">Patiënt Info</p>
                              <div className="text-sm space-y-1">
                                <p>BSN: {patient?.bsn}</p>
                                <p>Verzekeraar: {patient?.insurer}</p>
                                <p>Polisnr: {patient?.insurerNumber}</p>
                              </div>
                            </div>
                          </div>

                          {intakes.length > 0 && (
                            <details className="p-4 bg-secondary/30 rounded-lg">
                              <summary className="font-medium cursor-pointer">
                                Bekijk Intake Details
                              </summary>
                              <div className="mt-3 text-sm">
                                <pre className="whitespace-pre-wrap text-muted-foreground">
                                  {intakes[0].summary}
                                </pre>
                              </div>
                            </details>
                          )}

                          <Alert>
                            <Calendar className="h-4 w-4" />
                            <AlertDescription>
                              Bij acceptatie dient u binnen 3 werkdagen een afspraak in te plannen.
                            </AlertDescription>
                          </Alert>

                          <div className="flex gap-3">
                            <Dialog open={acceptDialog === request.id} onOpenChange={(open) => setAcceptDialog(open ? request.id : null)}>
                              <DialogTrigger asChild>
                                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Accepteren
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Afspraak Inplannen</DialogTitle>
                                  <DialogDescription>
                                    Plan een afspraak in binnen 3 werkdagen voor {patient?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Datum</Label>
                                    <Input
                                      type="date"
                                      min={getMinDate()}
                                      max={getMaxDate()}
                                      value={appointmentDate}
                                      onChange={(e) => setAppointmentDate(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Tijd</Label>
                                    <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map(time => (
                                          <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={() => handleAccept(request.id)}
                                    disabled={!appointmentDate}
                                  >
                                    Bevestig & Accepteer
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleDecline(request.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Afwijzen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="mt-6">
              {acceptedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Geen actieve patiënten</p>
                    <p className="text-muted-foreground">
                      Geaccepteerde patiënten verschijnen hier
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests.map(request => {
                    const { patient } = getPatientData(request.patientId);

                    return (
                      <Card key={request.id}>
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{patient?.name}</p>
                              <p className="text-sm text-muted-foreground">{request.discipline}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-600">
                              <Calendar className="mr-1 h-3 w-3" />
                              {request.appointmentDate}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {otherRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Geen geschiedenis</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {otherRequests.map(request => {
                    const { patient } = getPatientData(request.patientId);

                    return (
                      <Card key={request.id}>
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{patient?.name}</p>
                              <p className="text-sm text-muted-foreground">{request.discipline}</p>
                            </div>
                          </div>
                          <Badge variant={request.status === 'declined' ? 'destructive' : 'outline'}>
                            {request.status === 'declined' ? 'Afgewezen' : 'Ingetrokken'}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
