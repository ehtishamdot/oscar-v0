'use client';

import { useDemo } from '@/lib/demo-context';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import {
  Shield,
  User,
  FileText,
  CheckCircle2,
  Send,
  LogIn,
  ArrowLeft,
} from 'lucide-react';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="h-4 w-4" />,
  REGISTER: <User className="h-4 w-4" />,
  CONSENT_GRANTED: <Shield className="h-4 w-4" />,
  TRIAGE_COMPLETED: <FileText className="h-4 w-4" />,
  INTAKE_COMPLETED: <FileText className="h-4 w-4" />,
  TREATMENT_PLAN_CREATED: <FileText className="h-4 w-4" />,
  CARE_REQUEST_SENT: <Send className="h-4 w-4" />,
  CARE_REQUEST_ACCEPTED: <CheckCircle2 className="h-4 w-4" />,
  CARE_REQUEST_DECLINED: <CheckCircle2 className="h-4 w-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  patient: 'bg-blue-100 text-blue-800',
  coordinator: 'bg-green-100 text-green-800',
  provider: 'bg-purple-100 text-purple-800',
};

export default function AuditLogPage() {
  const { patients, triageSessions, intakeSummaries, treatmentPlans, careRequests } = useDemo();

  // Build audit log from all actions
  const auditEvents: { timestamp: Date; action: string; role: string; details: string; resource: string }[] = [];

  // Add patient registrations
  patients.forEach(p => {
    auditEvents.push({
      timestamp: p.createdAt,
      action: 'REGISTER',
      role: 'patient',
      details: `Patiënt ${p.name} geregistreerd`,
      resource: 'patient',
    });

    p.consents.forEach(c => {
      auditEvents.push({
        timestamp: c.timestamp,
        action: 'CONSENT_GRANTED',
        role: 'patient',
        details: c.description,
        resource: 'consent',
      });
    });
  });

  // Add triage sessions
  triageSessions.forEach(s => {
    const patient = patients.find(p => p.id === s.patientId);
    auditEvents.push({
      timestamp: s.completedAt,
      action: 'TRIAGE_COMPLETED',
      role: 'patient',
      details: `Triage afgerond voor ${patient?.name || 'onbekend'}. Red flags: ${s.hasRedFlags ? 'Ja' : 'Nee'}`,
      resource: 'triage',
    });
  });

  // Add intake summaries
  intakeSummaries.forEach(i => {
    const patient = patients.find(p => p.id === i.patientId);
    auditEvents.push({
      timestamp: i.completedAt,
      action: 'INTAKE_COMPLETED',
      role: 'patient',
      details: `${i.discipline} intake afgerond voor ${patient?.name || 'onbekend'}`,
      resource: 'intake',
    });
  });

  // Add treatment plans
  treatmentPlans.forEach(p => {
    const patient = patients.find(pt => pt.id === p.patientId);
    auditEvents.push({
      timestamp: p.createdAt,
      action: 'TREATMENT_PLAN_CREATED',
      role: 'coordinator',
      details: `Behandelplan aangemaakt voor ${patient?.name || 'onbekend'}`,
      resource: 'treatment_plan',
    });
  });

  // Add care requests
  careRequests.forEach(r => {
    const patient = patients.find(p => p.id === r.patientId);
    auditEvents.push({
      timestamp: r.sentAt,
      action: 'CARE_REQUEST_SENT',
      role: 'coordinator',
      details: `Zorgaanvraag verstuurd naar ${r.providerName} voor ${patient?.name || 'onbekend'}`,
      resource: 'care_request',
    });

    if (r.respondedAt) {
      auditEvents.push({
        timestamp: r.respondedAt,
        action: r.status === 'accepted' ? 'CARE_REQUEST_ACCEPTED' : 'CARE_REQUEST_DECLINED',
        role: 'provider',
        details: `${r.providerName} heeft aanvraag ${r.status === 'accepted' ? 'geaccepteerd' : 'afgewezen'}`,
        resource: 'care_request',
      });
    }
  });

  // Sort by timestamp descending
  auditEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Audit Log
              </h1>
              <p className="text-muted-foreground">
                Overzicht van alle acties in het systeem (AVG/GDPR compliant)
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/demo">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Activiteitenlogboek
              </CardTitle>
              <CardDescription>
                Alle gegevenstoegang en acties worden gelogd voor transparantie en compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nog geen activiteiten geregistreerd</p>
                  <p className="text-sm mt-2">Start de demo om activiteiten te zien</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {auditEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="p-2 rounded-full bg-background">
                          {ACTION_ICONS[event.action] || <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={ROLE_COLORS[event.role]}>
                              {event.role}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {event.resource}
                            </Badge>
                          </div>
                          <p className="text-sm">{event.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.timestamp).toLocaleString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              AVG/GDPR Compliance
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Alle gegevenstoegang wordt gelogd met timestamp</li>
              <li>• Toestemmingen worden expliciet vastgelegd</li>
              <li>• Logs worden bewaard conform wettelijke vereisten</li>
              <li>• Patiënten kunnen hun logboek opvragen</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
