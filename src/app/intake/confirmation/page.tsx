"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const invitesSent = searchParams.get('invites');

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-3">
          Aanmelding Succesvol!
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Bedankt voor uw aanmelding. Uw gegevens zijn veilig ontvangen.
        </p>
      </div>

      {/* Key message */}
      <div className="card-calm p-6 mb-6 text-center">
        <p className="text-slate-700 text-lg font-medium">
          Uw zorgverlener is op de hoogte gebracht en zal contact met u opnemen.
        </p>
        {invitesSent && (
          <p className="text-emerald-600 text-sm mt-2">
            {invitesSent} zorgverlener{Number(invitesSent) !== 1 ? 's' : ''} in uw regio {Number(invitesSent) !== 1 ? 'zijn' : 'is'} geïnformeerd.
          </p>
        )}
        <p className="text-muted-foreground text-sm mt-3">
          U kunt binnen 48 uur contact verwachten.
        </p>
      </div>

      {/* Contact Info */}
      <div className="card-calm p-5 mb-8">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Vragen?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Neem gerust contact met ons op via <strong>info@zorgroute.nl</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/">
            Terug naar home
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-12">Laden...</div>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ZorgRoute Nederland. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
