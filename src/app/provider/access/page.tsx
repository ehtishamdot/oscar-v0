'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Lock, AlertCircle, Mail, Smartphone } from 'lucide-react';

function AccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms'>('email');

  const handleVerify = async () => {
    if (!token) {
      setError('Geen geldige toegangslink. Controleer uw e-mail.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/provider/token/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, deliveryMethod }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Token validatie mislukt');
        return;
      }

      // Redirect to verification page
      router.push(`/provider/verify?codeId=${data.codeId}&method=${data.deliveryMethod}&expires=${data.expiresAt}&masked=${encodeURIComponent(data.maskedRecipient)}`);

    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ongeldige Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Deze toegangslink is ongeldig of verlopen.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Controleer uw e-mail voor een geldige toegangslink.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Beveiligde Toegang</CardTitle>
          <CardDescription>
            Oscar Zorgcoordinatie - Provider Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>U staat op het punt om een patiënt intake te bekijken.</p>
            <p className="mt-2">Voor uw veiligheid ontvangt u een eenmalige verificatiecode.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Ontvang code via:</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={deliveryMethod === 'email' ? 'default' : 'outline'}
                className="h-16 flex-col gap-1"
                onClick={() => setDeliveryMethod('email')}
              >
                <Mail className="h-5 w-5" />
                <span className="text-sm">E-mail</span>
              </Button>
              <Button
                variant={deliveryMethod === 'sms' ? 'default' : 'outline'}
                className="h-16 flex-col gap-1"
                onClick={() => setDeliveryMethod('sms')}
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-sm">SMS</span>
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full h-12"
            size="lg"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificatiecode wordt verzonden...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Verificatiecode Aanvragen
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Door verder te gaan gaat u akkoord met de NEN 7510 beveiligingsrichtlijnen
            voor het verwerken van medische gegevens.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProviderAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AccessContent />
    </Suspense>
  );
}
