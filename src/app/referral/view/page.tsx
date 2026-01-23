'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Clock, AlertCircle, CheckCircle, XCircle, Loader2, User } from 'lucide-react';

interface ReferralData {
  referral: {
    id: string;
    patientInitials: string;
    patientCity: string;
    pathways: string[];
    urgency: 'normal' | 'urgent';
    notes?: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  };
  invite: {
    id: string;
    providerName: string;
    status: string;
  };
  canAccept: boolean;
  isAcceptedByMe: boolean;
  acceptedByInfo?: {
    name: string;
    acceptedAt: string;
  } | null;
}

const pathwayNames: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Voedingsbegeleiding',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

function ReferralViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geen geldige uitnodigingslink');
      setLoading(false);
      return;
    }

    fetchReferral();
  }, [token]);

  const fetchReferral = async () => {
    try {
      const response = await fetch('/api/referral/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Kon verwijzing niet laden');
      }
    } catch (err) {
      setError('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    try {
      const response = await fetch('/api/referral/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: token }),
      });

      const result = await response.json();

      if (result.success) {
        setAccepted(true);
        // Refresh data to show updated status
        await fetchReferral();
      } else if (result.alreadyAccepted) {
        // Refresh to show who accepted
        await fetchReferral();
        setError('Deze patiënt is al geaccepteerd door een andere zorgverlener');
      } else {
        setError(result.error || 'Kon niet accepteren');
      }
    } catch (err) {
      setError('Er is een fout opgetreden');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verwijzing laden...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oeps!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { referral, invite, canAccept, isAcceptedByMe, acceptedByInfo } = data;
  const isUrgent = referral.urgency === 'urgent';
  const pathwayList = referral.pathways.map(p => pathwayNames[p] || p).join(', ');
  const expiresAt = new Date(referral.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`p-6 ${isUrgent ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Patiënt Verwijzing</h1>
                <p className="text-white/80 mt-1">Hallo, {invite.providerName}</p>
              </div>
              {isUrgent && (
                <span className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm">
                  SPOED
                </span>
              )}
            </div>
          </div>

          {/* Status Banner */}
          {referral.status === 'accepted' && (
            <div className={`p-4 ${isAcceptedByMe ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
              {isAcceptedByMe ? (
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">U heeft deze patiënt geaccepteerd!</span>
                </div>
              ) : (
                <div className="flex items-center text-red-800">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    Helaas! Deze patiënt is al geaccepteerd
                    {acceptedByInfo && ` door ${acceptedByInfo.name}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {accepted && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Patiënt succesvol geaccepteerd! U ontvangt binnenkort de volledige gegevens.</span>
              </div>
            </div>
          )}

          {/* Patient Info */}
          <div className="p-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Patiënt</span>
                </div>
                <span className="font-semibold text-gray-900">{referral.patientInitials}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Locatie</span>
                </div>
                <span className="font-semibold text-gray-900">{referral.patientCity}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Zorgpad</span>
                </div>
                <span className="font-semibold text-gray-900">{pathwayList}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Verloopt</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {expiresAt.toLocaleDateString('nl-NL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {referral.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Opmerking:</strong> {referral.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Warning Banner */}
            {canAccept && !accepted && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>Let op:</strong> Deze uitnodiging is ook verstuurd naar andere zorgverleners in uw regio.
                    De eerste die accepteert, krijgt de patiënt toegewezen.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && data && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Accept Button */}
            {canAccept && !accepted && (
              <div className="mt-6">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all ${
                    isUrgent
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                  } disabled:cursor-not-allowed`}
                >
                  {accepting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Bezig met accepteren...
                    </span>
                  ) : (
                    'Accepteer Patiënt'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          ZorgRoute Nederland Platform
        </p>
      </div>
    </div>
  );
}

export default function ReferralViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <ReferralViewContent />
    </Suspense>
  );
}
