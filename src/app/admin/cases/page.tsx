'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';

interface Case {
  id: string;
  patientInitials: string;
  patientCity: string;
  pathway: string;
  referredBy: string;
  referredByType: string;
  acceptedBy: string | null;
  status: 'open' | 'accepted' | 'expired';
  urgency: 'normal' | 'urgent';
  createdAt: string;
  acceptedAt: string | null;
  responseTime: string | null;
}

const pathwayLabels: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Diëtetiek',
  smoking: 'Stoppen met Roken',
};

const pathwayColors: Record<string, string> = {
  fysio: 'bg-blue-100 text-blue-700',
  ergo: 'bg-green-100 text-green-700',
  diet: 'bg-purple-100 text-purple-700',
  smoking: 'bg-amber-100 text-amber-700',
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  accepted: { label: 'Geaccepteerd', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired: { label: 'Verlopen', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPathway, setFilterPathway] = useState<string>('all');

  useEffect(() => {
    fetchCases();
  }, [filterStatus, filterPathway]);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterPathway !== 'all') params.set('pathway', filterPathway);

      const response = await fetch(`/api/admin/cases?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.patientInitials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referredBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesPathway = filterPathway === 'all' || c.pathway === filterPathway;
    return matchesSearch && matchesStatus && matchesPathway;
  });

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    accepted: cases.filter(c => c.status === 'accepted').length,
    expired: cases.filter(c => c.status === 'expired').length,
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
        <p className="text-gray-500">Overzicht van alle patiëntverwijzingen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Totaal</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Open</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Geaccepteerd</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Verlopen</p>
          <p className="text-2xl font-bold text-gray-400">{stats.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoeken..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle statussen</option>
          <option value="open">Open</option>
          <option value="accepted">Geaccepteerd</option>
          <option value="expired">Verlopen</option>
        </select>
        <select
          value={filterPathway}
          onChange={(e) => setFilterPathway(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle zorgpaden</option>
          <option value="fysio">Fysiotherapie</option>
          <option value="ergo">Ergotherapie</option>
          <option value="diet">Diëtetiek</option>
          <option value="smoking">Stoppen met Roken</option>
        </select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => {
          const StatusIcon = statusConfig[caseItem.status].icon;
          return (
            <div key={caseItem.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Patient & Pathway Info */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{caseItem.patientInitials}</span>
                      {caseItem.urgency === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">SPOED</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {caseItem.patientCity}
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${pathwayColors[caseItem.pathway]}`}>
                      {pathwayLabels[caseItem.pathway]}
                    </span>
                  </div>
                </div>

                {/* Middle: Referral Flow */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Van</p>
                    <p className="font-medium text-gray-700">{caseItem.referredBy}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Naar</p>
                    <p className="font-medium text-gray-700">
                      {caseItem.acceptedBy || <span className="text-gray-400">-</span>}
                    </p>
                  </div>
                </div>

                {/* Right: Status & Time */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(caseItem.createdAt).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {caseItem.responseTime && (
                      <p className="text-xs text-gray-400">Responstijd: {caseItem.responseTime}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[caseItem.status].color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[caseItem.status].label}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Geen cases gevonden</p>
        </div>
      )}
    </div>
  );
}
