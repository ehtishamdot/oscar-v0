'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const codeId = searchParams.get('codeId');
  const method = searchParams.get('method');
  const expiresAt = searchParams.get('expires');
  const maskedRecipient = searchParams.get('masked');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (expiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          setError('De verificatiecode is verlopen. Vraag een nieuwe aan.');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Voer de volledige 6-cijferige code in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/provider/code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, code: fullCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Verificatie mislukt');
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Redirect to content view
      router.push(`/provider/view/${data.sessionId}`);

    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!codeId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ongeldige Sessie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Geen verificatie sessie gevonden.</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/provider/access">Terug naar Toegang</Link>
            </Button>
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
          <CardTitle className="text-2xl">Verificatiecode Invoeren</CardTitle>
          <CardDescription>
            We hebben een 6-cijferige code verzonden naar{' '}
            <span className="font-medium">{maskedRecipient || (method === 'sms' ? 'uw telefoon' : 'uw e-mail')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className={`flex items-center justify-center gap-2 text-sm ${timeLeft < 60 ? 'text-red-600' : 'text-muted-foreground'}`}>
            <Clock className="h-4 w-4" />
            <span className={timeLeft < 60 ? 'font-medium' : ''}>
              Code geldig voor: {formatTime(timeLeft)}
            </span>
          </div>

          {/* Code input */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold"
                disabled={loading || timeLeft === 0}
              />
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <span className="block mt-1 font-medium">
                    Nog {remainingAttempts} poging{remainingAttempts !== 1 ? 'en' : ''} over.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full h-12"
            size="lg"
            onClick={handleVerify}
            disabled={loading || timeLeft === 0 || code.join('').length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifiëren...
              </>
            ) : (
              'Verifiëren'
            )}
          </Button>

          <div className="text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/access" className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Code niet ontvangen? Controleer uw spam folder of ga terug om een nieuwe code aan te vragen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProviderVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
