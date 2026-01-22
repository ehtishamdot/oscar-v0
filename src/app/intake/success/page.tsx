'use client';

import Link from 'next/link';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Phone, Clock, Home } from 'lucide-react';

export default function IntakeSuccessPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-headline">Aanvraag Verzonden!</CardTitle>
            <CardDescription className="text-base">
              Uw zorgaanvraag is succesvol ontvangen en wordt verwerkt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Wat gebeurt er nu?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Bevestiging per e-mail</p>
                    <p className="text-sm text-blue-700">U ontvangt binnen enkele minuten een bevestiging.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Zorgverleners worden ge&iuml;nformeerd</p>
                    <p className="text-sm text-blue-700">Zorgverleners bij u in de buurt ontvangen uw aanvraag.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Contact opnemen</p>
                    <p className="text-sm text-blue-700">Een zorgverlener neemt binnenkort contact met u op.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button variant="default" className="w-full" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Terug naar Home
                </Button>
              </Link>
            </div>

            {/* Contact info */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>Heeft u vragen? Neem contact met ons op via</p>
              <p className="font-medium">info@oscar-zorg.nl</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slimme ArtroseZorg. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
