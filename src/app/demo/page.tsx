'use client';

import { useDemo } from '@/lib/demo-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@/lib/demo-store';
import { User, Stethoscope, Building2, ArrowRight, Database, Trash2, CheckCircle2, Info } from 'lucide-react';
import Header from '@/components/header';

const roles: { role: UserRole; title: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    role: 'patient',
    title: 'Patiënt',
    description: 'Start als patiënt om de triage en zorgtrajecten te doorlopen',
    icon: <User className="h-8 w-8" />,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    role: 'coordinator',
    title: 'Regiehouder',
    description: 'Bekijk patiëntoverzichten, maak behandelplannen en coördineer zorg',
    icon: <Stethoscope className="h-8 w-8" />,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    role: 'provider',
    title: 'Zorgverlener',
    description: 'Ontvang zorgaanvragen, accepteer of wijs af, en behandel patiënten',
    icon: <Building2 className="h-8 w-8" />,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
];

export default function DemoPage() {
  const { loginAs, patients, seedDemoData, clearDemoData } = useDemo();
  const router = useRouter();

  const handleSelectRole = (role: UserRole) => {
    loginAs(role);

    switch (role) {
      case 'patient':
        router.push('/demo/register');
        break;
      case 'coordinator':
        router.push('/demo/coordinator');
        break;
      case 'provider':
        router.push('/demo/provider');
        break;
    }
  };

  const handleSeedData = () => {
    seedDemoData();
  };

  const handleClearData = () => {
    clearDemoData();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="secondary">Demo Platform</Badge>
            <h1 className="text-4xl font-bold tracking-tight font-headline mb-4">
              Oscar Zorgcoördinatie Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Digitale triage, zorgcoördinatie en efficiënte routing van zorg tussen patiënten, coördinatoren en zorgverleners.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button variant="outline" size="sm" onClick={handleSeedData}>
              <Database className="mr-2 h-4 w-4" />
              Laad Demo Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Wis Alle Data
            </Button>
            {patients.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {patients.length} patiënt(en) in systeem
              </Badge>
            )}
          </div>

          {patients.length > 0 && (
            <Alert className="mb-8">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Er zijn {patients.length} patiënt(en) in het systeem. Ga naar <strong>Regiehouder</strong> om behandelplannen te maken, of <strong>Zorgverlener</strong> om aanvragen te bekijken.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {roles.map(({ role, title, description, icon, color }) => (
              <Card
                key={role}
                className={`cursor-pointer transition-all ${color} border-2`}
                onClick={() => handleSelectRole(role)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-white shadow-sm">
                    {icon}
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm mb-4">
                    {description}
                  </CardDescription>
                  <Button variant="outline" className="w-full">
                    Start als {title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-secondary/50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Platform Overzicht</h2>
            <div className="grid gap-6 md:grid-cols-3 text-sm">
              <div>
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Patiënt Journey
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Registratie met BSN & verzekering</li>
                  <li>Toestemmingsbeheer (AVG)</li>
                  <li>Slimme triage met rode vlag detectie</li>
                  <li>Zorgtraject selectie met uitleg</li>
                  <li>Discipline-specifieke intake</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                  Regiehouder
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Overzicht van patiëntgegevens</li>
                  <li>Intake samenvatting bekijken</li>
                  <li>Behandelplan opstellen</li>
                  <li>Multi-provider routing</li>
                  <li>Declarabele zorg controle</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Zorgverlener
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Zorgaanvragen ontvangen</li>
                  <li>Patiëntcontext bekijken</li>
                  <li>Accepteren binnen 3 dagen</li>
                  <li>Uber-model (eerste wint)</li>
                  <li>Afspraak inplannen</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-medium mb-2">Aanbevolen Demo Flow</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Klik op <strong>"Laad Demo Data"</strong> om een voorbeeld patiënt te laden</li>
              <li>Ga naar <strong>Regiehouder</strong> → selecteer patiënt → maak behandelplan → stuur naar zorgverleners</li>
              <li>Ga naar <strong>Zorgverlener</strong> → accepteer de aanvraag → plan afspraak</li>
              <li>Of start als <strong>Patiënt</strong> om de volledige registratie-flow te doorlopen</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
