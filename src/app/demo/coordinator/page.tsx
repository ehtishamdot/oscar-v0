'use client';

import { useState, useEffect } from 'react';
import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const {
    currentUser,
    loginAs,
    patients,
    triageSessions,
    intakeSummaries,
    treatmentPlans,
    careRequests,
    providers,
    createTreatmentPlan,
    sendCareRequests,
    getProvidersByInsurer,
  } = useDemo();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [treatmentPlanDialog, setTreatmentPlanDialog] = useState(false);
  const [routingDialog, setRoutingDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    goals: [''],
    estimatedSessions: 6,
  });
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  // Login as coordinator if not already
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      loginAs('coordinator');
    }
  }, [currentUser, loginAs]);

  // Get patients with completed intakes
  const patientsWithIntakes = patients.filter(p =>
    intakeSummaries.some(i => i.patientId === p.id)
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const selectedPatientSession = triageSessions.find(s => s.patientId === selectedPatient);
  const selectedPatientIntakes = intakeSummaries.filter(i => i.patientId === selectedPatient);
  const selectedPatientPlans = treatmentPlans.filter(p => p.patientId === selectedPatient);
  const eligibleProviders = selectedPatientData
    ? getProvidersByInsurer(selectedPatientData.insurer)
    : [];

  const handleCreatePlan = () => {
    if (!selectedPatient || !currentUser) return;

    const intakeId = selectedPatientIntakes[0]?.id || '';
    const disciplines = selectedPatientSession?.carePathways
      .filter(p => p.accepted)
      .map(p => p.discipline) || [];

    createTreatmentPlan({
      patientId: selectedPatient,
      coordinatorId: currentUser.id,
      intakeSummaryId: intakeId,
      goals: newPlan.goals.filter(g => g.trim()),
      disciplines,
      estimatedSessions: newPlan.estimatedSessions,
      insurerApproved: true,
      declarable: true,
    });

    setTreatmentPlanDialog(false);
    setNewPlan({ goals: [''], estimatedSessions: 6 });
  };

  const handleSendRequests = () => {
    if (!selectedPatientPlans.length || !selectedProviders.length) return;

    const plan = selectedPatientPlans[0];
    const discipline = plan.disciplines[0] || 'fysiotherapie';

    sendCareRequests(plan.id, selectedProviders, discipline);
    setRoutingDialog(false);
    setSelectedProviders([]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Zorgcoördinator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welkom, {currentUser?.name}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Users className="mr-2 h-4 w-4" />
              {patientsWithIntakes.length} patiënten
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Patient List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patiënten
                </CardTitle>
                <CardDescription>
                  Patiënten met afgeronde intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patientsWithIntakes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nog geen patiënten.</p>
                    <p className="text-sm mt-2">
                      Doorloop eerst de patiënt-flow om data te genereren.
                    </p>
                    <Button variant="link" className="mt-4" asChild>
                      <a href="/demo">Naar Demo Start</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientsWithIntakes.map(patient => {
                      const hasPlans = treatmentPlans.some(p => p.patientId === patient.id);
                      const hasRequests = careRequests.some(r => r.patientId === patient.id);

                      return (
                        <div
                          key={patient.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedPatient === patient.id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-secondary/50 hover:bg-secondary'
                          }`}
                          onClick={() => setSelectedPatient(patient.id)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{patient.name}</p>
                            {hasRequests ? (
                              <Badge className="bg-green-600">Verzonden</Badge>
                            ) : hasPlans ? (
                              <Badge variant="secondary">Plan klaar</Badge>
                            ) : (
                              <Badge variant="outline">Nieuw</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{patient.insurer}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Details */}
            <Card className="md:col-span-2">
              {selectedPatient && selectedPatientData ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedPatientData.name}</CardTitle>
                        <CardDescription>
                          BSN: {selectedPatientData.bsn} | {selectedPatientData.insurer}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {!selectedPatientPlans.length && (
                          <Dialog open={treatmentPlanDialog} onOpenChange={setTreatmentPlanDialog}>
                            <DialogTrigger asChild>
                              <Button>
                                <FileText className="mr-2 h-4 w-4" />
                                Behandelplan
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Behandelplan Opstellen</DialogTitle>
                                <DialogDescription>
                                  Stel een behandelplan op voor {selectedPatientData.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Behandeldoelen</Label>
                                  {newPlan.goals.map((goal, idx) => (
                                    <Input
                                      key={idx}
                                      placeholder={`Doel ${idx + 1}`}
                                      value={goal}
                                      onChange={(e) => {
                                        const goals = [...newPlan.goals];
                                        goals[idx] = e.target.value;
                                        setNewPlan({ ...newPlan, goals });
                                      }}
                                    />
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setNewPlan({ ...newPlan, goals: [...newPlan.goals, ''] })}
                                  >
                                    + Doel toevoegen
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label>Geschat aantal sessies</Label>
                                  <Input
                                    type="number"
                                    value={newPlan.estimatedSessions}
                                    onChange={(e) => setNewPlan({ ...newPlan, estimatedSessions: parseInt(e.target.value) })}
                                  />
                                </div>

                                <Alert>
                                  <ShieldCheck className="h-4 w-4" />
                                  <AlertDescription>
                                    Declarabel bij {selectedPatientData.insurer} - {eligibleProviders.length} zorgverleners beschikbaar
                                  </AlertDescription>
                                </Alert>

                                <Button className="w-full" onClick={handleCreatePlan}>
                                  Plan Opslaan
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {selectedPatientPlans.length > 0 && !careRequests.some(r => r.patientId === selectedPatient) && (
                          <Dialog open={routingDialog} onOpenChange={setRoutingDialog}>
                            <DialogTrigger asChild>
                              <Button className="bg-accent hover:bg-accent/90">
                                <Send className="mr-2 h-4 w-4" />
                                Naar Zorgverleners
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Zorgaanvraag Versturen</DialogTitle>
                                <DialogDescription>
                                  Selecteer zorgverleners om de aanvraag naar te versturen (Uber-model: eerste acceptatie wint)
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                  Beschikbare zorgverleners voor {selectedPatientData.insurer}:
                                </p>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {eligibleProviders.map(provider => (
                                    <div
                                      key={provider.id}
                                      className="flex items-center space-x-3 p-3 border rounded-lg"
                                    >
                                      <Checkbox
                                        id={provider.id}
                                        checked={selectedProviders.includes(provider.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedProviders([...selectedProviders, provider.id]);
                                          } else {
                                            setSelectedProviders(selectedProviders.filter(id => id !== provider.id));
                                          }
                                        }}
                                      />
                                      <div className="flex-1">
                                        <Label htmlFor={provider.id} className="font-medium cursor-pointer">
                                          {provider.name}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          {provider.city} - {provider.discipline}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <Alert>
                                  <AlertDescription>
                                    De eerste zorgverlener die accepteert krijgt de patiënt. Andere aanvragen worden automatisch ingetrokken.
                                  </AlertDescription>
                                </Alert>

                                <Button
                                  className="w-full"
                                  onClick={handleSendRequests}
                                  disabled={selectedProviders.length === 0}
                                >
                                  Verstuur naar {selectedProviders.length} zorgverlener(s)
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="intake">
                      <TabsList>
                        <TabsTrigger value="intake">Intake</TabsTrigger>
                        <TabsTrigger value="triage">Triage</TabsTrigger>
                        <TabsTrigger value="plan">Behandelplan</TabsTrigger>
                        <TabsTrigger value="status">Status</TabsTrigger>
                      </TabsList>

                      <TabsContent value="intake" className="space-y-4 mt-4">
                        {selectedPatientIntakes.map(intake => (
                          <div key={intake.id} className="p-4 bg-secondary/50 rounded-lg">
                            <p className="font-medium mb-2 capitalize">{intake.discipline}</p>
                            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                              {intake.summary}
                            </pre>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="triage" className="space-y-4 mt-4">
                        {selectedPatientSession ? (
                          <>
                            {selectedPatientSession.hasRedFlags && (
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Red flags gedetecteerd - {selectedPatientSession.redFlags.length} waarschuwingen
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-2">
                              <p className="font-medium">Geaccepteerde zorgtrajecten:</p>
                              {selectedPatientSession.carePathways
                                .filter(p => p.accepted)
                                .map(p => (
                                  <Badge key={p.id} variant="secondary" className="mr-2">
                                    {p.name}
                                  </Badge>
                                ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground">Geen triage data beschikbaar</p>
                        )}
                      </TabsContent>

                      <TabsContent value="plan" className="space-y-4 mt-4">
                        {selectedPatientPlans.length > 0 ? (
                          selectedPatientPlans.map(plan => (
                            <div key={plan.id} className="p-4 bg-secondary/50 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">Behandelplan</p>
                                <Badge>{plan.status}</Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Doelen:</p>
                                <ul className="list-disc list-inside">
                                  {plan.goals.map((goal, idx) => (
                                    <li key={idx}>{goal}</li>
                                  ))}
                                </ul>
                              </div>
                              <p className="text-sm">
                                Geschatte sessies: {plan.estimatedSessions}
                              </p>
                              {plan.declarable && (
                                <Badge variant="outline" className="bg-green-50">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Declarabel
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Nog geen behandelplan opgesteld</p>
                        )}
                      </TabsContent>

                      <TabsContent value="status" className="space-y-4 mt-4">
                        {careRequests.filter(r => r.patientId === selectedPatient).length > 0 ? (
                          careRequests
                            .filter(r => r.patientId === selectedPatient)
                            .map(request => (
                              <div key={request.id} className="p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{request.providerName}</p>
                                  <p className="text-sm text-muted-foreground">{request.discipline}</p>
                                </div>
                                <Badge
                                  variant={
                                    request.status === 'accepted'
                                      ? 'default'
                                      : request.status === 'declined'
                                      ? 'destructive'
                                      : request.status === 'withdrawn'
                                      ? 'outline'
                                      : 'secondary'
                                  }
                                  className={request.status === 'accepted' ? 'bg-green-600' : ''}
                                >
                                  {request.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                                  {request.status === 'accepted' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                  {request.status}
                                </Badge>
                              </div>
                            ))
                        ) : (
                          <p className="text-muted-foreground">Nog geen zorgaanvragen verstuurd</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Selecteer een patiënt om details te bekijken</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
