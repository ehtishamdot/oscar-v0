'use client';

import { useState } from 'react';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';

interface Provider {
  providerId: string;
  providerEmail: string;
  providerName: string;
  providerType: 'fysio' | 'ergo' | 'diet' | 'other';
}

export default function TestReferralPage() {
  const [providers, setProviders] = useState<Provider[]>([
    { providerId: 'provider-1', providerEmail: '', providerName: 'Zorgverlener 1', providerType: 'fysio' },
  ]);
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: unknown } | null>(null);

  const addProvider = () => {
    if (providers.length < 5) {
      setProviders([
        ...providers,
        {
          providerId: `provider-${providers.length + 1}`,
          providerEmail: '',
          providerName: `Zorgverlener ${providers.length + 1}`,
          providerType: 'fysio',
        },
      ]);
    }
  };

  const removeProvider = (index: number) => {
    if (providers.length > 1) {
      setProviders(providers.filter((_, i) => i !== index));
    }
  };

  const updateProvider = (index: number, field: keyof Provider, value: string) => {
    const updated = [...providers];
    updated[index] = { ...updated[index], [field]: value };
    setProviders(updated);
  };

  const sendReferral = async () => {
    // Validate emails
    const emptyEmails = providers.filter(p => !p.providerEmail);
    if (emptyEmails.length > 0) {
      setResult({ success: false, message: 'Vul alle e-mailadressen in' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/referral/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: `test-patient-${Date.now()}`,
          patientInitials: 'T.P.',
          patientCity: 'Amsterdam',
          pathways: ['fysio'],
          urgency: urgency,
          notes: 'Dit is een test verwijzing',
          createdBy: 'test-coordinator',
          intakeData: {
            patient: {
              firstName: 'Test',
              lastName: 'Patiënt',
              dateOfBirth: '1985-06-15',
              email: 'test@example.com',
              phone: '+31612345678',
            },
            medical: {
              currentComplaints: 'Kniepijn aan de rechterkant',
              complaintsLocation: ['knee_right'],
            },
          },
          providers: providers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Verwijzing verstuurd naar ${data.invitesSent} zorgverlener(s)!`,
          data: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Fout bij versturen',
          data: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Referral System</h1>
          <p className="text-gray-600 mb-6">
            Test het &quot;Uber-style&quot; verwijssysteem. Stuur een verwijzing naar meerdere zorgverleners.
            De eerste die accepteert krijgt de patiënt.
          </p>

          {/* Urgency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioriteit</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  urgency === 'normal'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Normaal
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  urgency === 'urgent'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Spoed
              </button>
            </div>
          </div>

          {/* Providers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Zorgverleners ({providers.length}/5)
              </label>
              {providers.length < 5 && (
                <button
                  type="button"
                  onClick={addProvider}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Toevoegen
                </button>
              )}
            </div>

            <div className="space-y-4">
              {providers.map((provider, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Zorgverlener {index + 1}</span>
                    {providers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProvider(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <input
                      type="text"
                      value={provider.providerName}
                      onChange={(e) => updateProvider(index, 'providerName', e.target.value)}
                      placeholder="Naam"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={provider.providerEmail}
                      onChange={(e) => updateProvider(index, 'providerEmail', e.target.value)}
                      placeholder="E-mailadres"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={provider.providerType}
                      onChange={(e) => updateProvider(index, 'providerType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fysio">Fysiotherapeut</option>
                      <option value="ergo">Ergotherapeut</option>
                      <option value="diet">Diëtist</option>
                      <option value="other">Anders</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={sendReferral}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Versturen...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Verstuur Verwijzing
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✓ Success' : '✗ Error'}
              </p>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.data && (
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Expected Flow */}
          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">Verwachte Flow:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Klik &quot;Verstuur Verwijzing&quot; → Alle zorgverleners ontvangen een e-mail</li>
              <li>E-mail bevat dynamische status badge (Beschikbaar/Bezet)</li>
              <li>Eerste zorgverlener die klikt kan details bekijken</li>
              <li>Klik op &quot;Accepteer Patiënt&quot; om de patiënt te claimen</li>
              <li>Andere zorgverleners zien &quot;Al geaccepteerd&quot; als ze klikken</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
