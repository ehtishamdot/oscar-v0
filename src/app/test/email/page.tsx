'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [providerEmail, setProviderEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: unknown } | null>(null);

  const testEmailFlow = async () => {
    if (!providerEmail) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/provider/message/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: `test-patient-${Date.now()}`,
          providerId: 'test-provider-001',
          providerEmail: providerEmail,
          pathways: ['fysio', 'ergo'],
          intakeData: {
            patient: {
              firstName: 'Test',
              lastName: 'Patient',
              dateOfBirth: '1985-06-15',
              email: 'testpatient@example.com',
              phone: '+31698765432',
              street: 'Teststraat',
              houseNumber: '123',
              postalCode: '1234 AB',
              city: 'Amsterdam',
            },
            medical: {
              currentComplaints: 'Kniepijn aan de rechterkant na het sporten',
              complaintsLocation: ['knee_right'],
              complaintsDuration: '3 maanden',
              previousTreatments: 'Fysiotherapie (6 sessies)',
              medications: 'Ibuprofen indien nodig',
              otherConditions: 'Geen',
            },
            consents: {
              privacy: true,
              treatment: true,
              dataSharing: true,
            },
            questionnaireAnswers: {
              q1: { answer: 'joint', timestamp: new Date().toISOString() },
              q2: { answer: 'knees', timestamp: new Date().toISOString() },
            },
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Email sent successfully! Check ${providerEmail} for the access link.`,
          data: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send email',
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Email Flow</h1>
          <p className="text-gray-600 mb-6">
            This page tests the complete secure message flow. Enter your email to receive a test access link.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Email (where to send the access link)
              </label>
              <input
                type="email"
                value={providerEmail}
                onChange={(e) => setProviderEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={testEmailFlow}
              disabled={loading || !providerEmail}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

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

          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">Expected Flow:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click &quot;Send Test Email&quot; → Creates encrypted message & sends email</li>
              <li>Check your email for &quot;Oscar - Nieuwe intake beschikbaar&quot;</li>
              <li>Click the &quot;Intake Bekijken&quot; button in the email</li>
              <li>You&apos;ll be redirected to /provider/access with a token</li>
              <li>A 6-digit verification code will be sent to your email</li>
              <li>Enter the code to access the decrypted patient data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
