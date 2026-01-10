'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  LogOut,
  AlertCircle,
  Shield,
  Calendar,
  Activity,
} from 'lucide-react';

interface PatientData {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: string;
    email: string;
    phone: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
  medical: {
    currentComplaints: string;
    complaintsLocation: string[];
    complaintsDuration?: string;
    previousTreatments?: string;
    medications?: string;
    otherConditions?: string;
  };
  questionnaireAnswers?: Record<string, Record<string, unknown>>;
  pathways: string[];
  accessedAt: string;
}

interface SessionInfo {
  expiresAt: string;
  remainingMinutes: number;
}

const pathwayNames: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Voedingsbegeleiding',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

const pathwayColors: Record<string, string> = {
  fysio: 'bg-blue-100 text-blue-800',
  ergo: 'bg-green-100 text-green-800',
  diet: 'bg-orange-100 text-orange-800',
  smoking: 'bg-red-100 text-red-800',
  gli: 'bg-purple-100 text-purple-800',
};

export default function ProviderViewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PatientData | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/provider/content/${sessionId}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Kon gegevens niet ophalen');
        return;
      }

      setData(result.data);
      setSession(result.session);

    } catch (err) {
      setError('Er is een fout opgetreden bij het ophalen van de gegevens.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchContent();

    // Refresh session status every minute
    const interval = setInterval(() => {
      if (session && session.remainingMinutes > 0) {
        fetchContent();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchContent, session]);

  const handleEndSession = async () => {
    try {
      await fetch('/api/provider/session/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      // Ignore errors on logout
    }
    router.push('/provider/access');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Gegevens worden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Toegang Geweigerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4 w-full" onClick={() => router.push('/provider/access')}>
              Terug naar Toegang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Oscar Provider Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                session.remainingMinutes <= 5
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-muted-foreground'
              }`}>
                <Clock className="h-4 w-4" />
                <span>Sessie verloopt over {session.remainingMinutes} min</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleEndSession}>
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Pathways */}
        <div className="flex flex-wrap gap-2 mb-6">
          {data.pathways.map(pathway => (
            <Badge
              key={pathway}
              variant="secondary"
              className={pathwayColors[pathway] || 'bg-gray-100'}
            >
              {pathwayNames[pathway] || pathway}
            </Badge>
          ))}
        </div>

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patiënt Gegevens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Naam</label>
                  <p className="font-medium text-lg">{data.patient.firstName} {data.patient.lastName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm text-muted-foreground">Geboortedatum</label>
                    <p className="font-medium">{data.patient.dateOfBirth}</p>
                  </div>
                </div>
                {data.patient.gender && (
                  <div>
                    <label className="text-sm text-muted-foreground">Geslacht</label>
                    <p className="font-medium">{data.patient.gender}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{data.patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{data.patient.phone}</span>
                </div>
                {(data.patient.street || data.patient.city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {data.patient.street && (
                        <p>{data.patient.street} {data.patient.houseNumber}</p>
                      )}
                      {data.patient.postalCode && (
                        <p>{data.patient.postalCode} {data.patient.city}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medische Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.medical.complaintsLocation && data.medical.complaintsLocation.length > 0 && (
              <div>
                <label className="text-sm text-muted-foreground">Locatie klachten</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.medical.complaintsLocation.map(loc => (
                    <Badge key={loc} variant="outline">{loc}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground">Huidige klachten</label>
              <p className="mt-1 whitespace-pre-wrap">{data.medical.currentComplaints}</p>
            </div>

            {data.medical.complaintsDuration && (
              <div>
                <label className="text-sm text-muted-foreground">Duur klachten</label>
                <p className="mt-1">{data.medical.complaintsDuration}</p>
              </div>
            )}

            {data.medical.previousTreatments && (
              <div>
                <label className="text-sm text-muted-foreground">Eerdere behandelingen</label>
                <p className="mt-1 whitespace-pre-wrap">{data.medical.previousTreatments}</p>
              </div>
            )}

            {data.medical.medications && (
              <div>
                <label className="text-sm text-muted-foreground">Medicatie</label>
                <p className="mt-1 whitespace-pre-wrap">{data.medical.medications}</p>
              </div>
            )}

            {data.medical.otherConditions && (
              <div>
                <label className="text-sm text-muted-foreground">Overige aandoeningen</label>
                <p className="mt-1 whitespace-pre-wrap">{data.medical.otherConditions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questionnaire Answers */}
        {data.questionnaireAnswers && Object.keys(data.questionnaireAnswers).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vragenlijst Antwoorden
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(data.questionnaireAnswers).map(([pathway, answers]) => (
                <div key={pathway} className="mb-6 last:mb-0">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Badge className={pathwayColors[pathway] || 'bg-gray-100'}>
                      {pathwayNames[pathway] || pathway}
                    </Badge>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(answers).map(([questionId, answer]) => (
                      <div key={questionId} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <p className="text-sm text-muted-foreground">{questionId}</p>
                        <p className="font-medium">
                          {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Deze gegevens zijn versleuteld opgeslagen en worden alleen tijdens uw sessie getoond.
            Uw toegang wordt geregistreerd conform NEN 7510.
          </AlertDescription>
        </Alert>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Oscar Zorgcoordinatie. Beveiligd met NEN 7510 standaarden.
        </div>
      </footer>
    </div>
  );
}
