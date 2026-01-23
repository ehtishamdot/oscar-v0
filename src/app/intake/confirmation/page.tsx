"use client";

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
              Aanmelding Succesvol!
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Bedankt voor uw aanmelding. Uw gegevens zijn veilig ontvangen en worden verwerkt.
            </p>
          </div>

          {/* What Happens Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Wat gebeurt er nu?</CardTitle>
              <CardDescription>
                Dit zijn de volgende stappen in uw zorgtraject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">1. Uw dossier wordt aangemaakt</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Wij maken een beveiligd dossier aan met uw gegevens en geselecteerde zorgpaden.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">2. Partners worden geïnformeerd</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Onze zorgpartners ontvangen een beveiligde e-mail met uw dossier.
                      De toegangscode wordt apart via SMS verstuurd voor extra veiligheid.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">3. Online intake of behandeling</h3>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p><strong>Online behandelingen</strong> (diëtist, stoppen met roken, GLI): U wordt direct uitgenodigd voor online sessies.</p>
                      <p><strong>Hybride behandelingen</strong> (fysio, ergo): Eerst een online intake, daarna koppeling met een therapeut bij u in de buurt.</p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">4. Start behandeling</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Na de intake ontvangt u een behandelplan en kunt u starten met uw persoonlijke zorgtraject.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Verwachte tijdlijn
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 text-sm">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Binnen 24 uur:</span>
                  <span>Bevestigingsmail met uw aanmelding</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Binnen 48 uur:</span>
                  <span>Contact van onze zorgpartners</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Binnen 1 week:</span>
                  <span>Start van uw eerste intake of behandeling</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Vragen?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Heeft u vragen over uw aanmelding of het verdere proces?
                Neem gerust contact met ons op via <strong>info@oscar-zorg.nl</strong> of
                bel <strong>088-123 4567</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                Terug naar home
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ZorgRoute Nederland. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
