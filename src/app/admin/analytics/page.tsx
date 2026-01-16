'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Loader2,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalCases: number;
    casesGrowth: number;
    acceptanceRate: number;
    acceptanceGrowth: number;
    avgResponseTime: number; // minutes
    responseTimeChange: number;
    activeProviders: number;
    providersGrowth: number;
  };
  casesByMonth: { month: string; cases: number }[];
  casesByPathway: { pathway: string; count: number; percentage: number }[];
  casesByCity: { city: string; count: number }[];
  responseTimeByPathway: { pathway: string; avgMinutes: number }[];
  topPartners: { name: string; cases: number; revenue: number }[];
  topProviders: { name: string; cases: number; acceptanceRate: number }[];
}

const defaultAnalytics: AnalyticsData = {
  overview: {
    totalCases: 0,
    casesGrowth: 0,
    acceptanceRate: 0,
    acceptanceGrowth: 0,
    avgResponseTime: 0,
    responseTimeChange: 0,
    activeProviders: 0,
    providersGrowth: 0,
  },
  casesByMonth: [],
  casesByPathway: [],
  casesByCity: [],
  responseTimeByPathway: [],
  topPartners: [],
  topProviders: [],
};

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}u ${mins}m` : `${mins}m`;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('6m');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const pathwayColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Inzichten en statistieken</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1m">Laatste maand</option>
            <option value="3m">Laatste 3 maanden</option>
            <option value="6m">Laatste 6 maanden</option>
            <option value="1y">Laatste jaar</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${analytics.overview.casesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.casesGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {analytics.overview.casesGrowth}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCases}</p>
          <p className="text-gray-500 text-sm">Totaal Cases</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${analytics.overview.acceptanceGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.acceptanceGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {analytics.overview.acceptanceGrowth}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.overview.acceptanceRate}%</p>
          <p className="text-gray-500 text-sm">Acceptatie Ratio</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${analytics.overview.responseTimeChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.responseTimeChange <= 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
              {Math.abs(analytics.overview.responseTimeChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMinutes(analytics.overview.avgResponseTime)}</p>
          <p className="text-gray-500 text-sm">Gem. Responstijd</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${analytics.overview.providersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.providersGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {analytics.overview.providersGrowth}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeProviders}</p>
          <p className="text-gray-500 text-sm">Actieve Zorgverleners</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cases Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Cases per Maand</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {analytics.casesByMonth.map((item, index) => {
              const maxCases = Math.max(...analytics.casesByMonth.map(m => m.cases));
              const height = (item.cases / maxCases) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-xs text-gray-500 mt-2">{item.month}</p>
                  <p className="text-xs font-medium text-gray-700">{item.cases}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cases by Pathway */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Cases per Zorgpad</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.casesByPathway.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.pathway}</span>
                  <span className="font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pathwayColors[index]} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Cities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Steden</h2>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.casesByCity.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{item.city}</span>
                </div>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time by Pathway */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Responstijd per Zorgpad</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.responseTimeByPathway.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.pathway}</span>
                <span className={`font-medium ${item.avgMinutes <= 180 ? 'text-green-600' : item.avgMinutes <= 300 ? 'text-amber-600' : 'text-red-600'}`}>
                  {formatMinutes(item.avgMinutes)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Providers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Zorgverleners</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.topProviders.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.cases} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Partners Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Partners (Omzet)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Partner</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Cases</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topPartners.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 text-gray-700">{item.cases}</td>
                  <td className="py-3 font-medium text-green-600">€{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
