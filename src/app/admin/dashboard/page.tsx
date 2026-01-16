'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Euro,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  totalPartners: number;
  activePartners: number;
  totalCasesThisMonth: number;
  totalCasesLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  pendingInvoices: number;
  acceptanceRate: number;
  avgResponseTime: string;
  casesByPathway: {
    fysio: number;
    ergo: number;
    diet: number;
    smoking: number;
  };
  recentActivity: {
    type: string;
    description: string;
    time: string;
  }[];
}

const defaultStats: DashboardStats = {
  totalPartners: 0,
  activePartners: 0,
  totalCasesThisMonth: 0,
  totalCasesLastMonth: 0,
  revenueThisMonth: 0,
  revenueLastMonth: 0,
  pendingInvoices: 0,
  acceptanceRate: 0,
  avgResponseTime: '-',
  casesByPathway: { fysio: 0, ergo: 0, diet: 0, smoking: 0 },
  recentActivity: [],
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const casesGrowth = stats.totalCasesLastMonth > 0
    ? Math.round(((stats.totalCasesThisMonth - stats.totalCasesLastMonth) / stats.totalCasesLastMonth) * 100)
    : 0;

  const revenueGrowth = stats.revenueLastMonth > 0
    ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)
    : 0;

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overzicht van Oscar Zorgcoordinatie</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cases */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            {casesGrowth !== 0 && (
              <span className={`text-sm font-medium ${casesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {casesGrowth > 0 ? '+' : ''}{casesGrowth}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCasesThisMonth}</p>
          <p className="text-gray-500 text-sm">Cases deze maand</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            {revenueGrowth !== 0 && (
              <span className={`text-sm font-medium ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">€{stats.revenueThisMonth}</p>
          <p className="text-gray-500 text-sm">Omzet deze maand</p>
        </div>

        {/* Partners */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activePartners}/{stats.totalPartners}</p>
          <p className="text-gray-500 text-sm">Actieve partners</p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.acceptanceRate}%</p>
          <p className="text-gray-500 text-sm">Acceptatie ratio</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cases by Pathway */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cases per Zorgpad</h2>
          <div className="space-y-4">
            {Object.entries(stats.casesByPathway).map(([pathway, count]) => {
              const total = Object.values(stats.casesByPathway).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = {
                fysio: 'bg-blue-500',
                ergo: 'bg-green-500',
                diet: 'bg-purple-500',
                smoking: 'bg-amber-500',
              };
              const labels: Record<string, string> = {
                fysio: 'Fysiotherapie',
                ergo: 'Ergotherapie',
                diet: 'Diëtetiek',
                smoking: 'Stoppen met Roken',
              };

              return (
                <div key={pathway}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{labels[pathway]}</span>
                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[pathway]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Snelle Statistieken</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">Gem. Responstijd</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.avgResponseTime}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Openstaand</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.pendingInvoices} facturen</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Vorige Maand</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.totalCasesLastMonth} cases</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <Euro className="h-4 w-4 mr-2" />
                <span className="text-sm">Vorige Maand</span>
              </div>
              <p className="text-xl font-bold text-gray-900">€{stats.revenueLastMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className={`p-2 rounded-lg mr-4 ${
                activity.type === 'case' ? 'bg-blue-100' :
                activity.type === 'invoice' ? 'bg-green-100' :
                activity.type === 'partner' ? 'bg-purple-100' :
                'bg-amber-100'
              }`}>
                <Activity className={`h-4 w-4 ${
                  activity.type === 'case' ? 'text-blue-600' :
                  activity.type === 'invoice' ? 'text-green-600' :
                  activity.type === 'partner' ? 'text-purple-600' :
                  'text-amber-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{activity.description}</p>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
