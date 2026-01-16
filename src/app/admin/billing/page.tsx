'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Euro,
  Calendar,
  Filter,
  Plus,
  Loader2,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  partnerName: string;
  partnerEmail: string;
  period: string;
  cases: number;
  subtotal: number;
  vat: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

const statusConfig = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Verzonden', color: 'bg-blue-100 text-blue-700', icon: Send },
  paid: { label: 'Betaald', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  overdue: { label: 'Verlopen', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/admin/billing?status=${filterStatus}`);
      const data = await response.json();
      if (data.success) {
        setInvoices(data.invoices);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoices = async () => {
    setGenerating(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`${data.invoicesCreated} facturen gegenereerd!`);
        fetchInvoices();
      } else {
        alert(data.message || 'Geen facturen gegenereerd');
      }
    } catch (error) {
      console.error('Failed to generate invoices:', error);
    } finally {
      setGenerating(false);
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchInvoices();
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const filteredInvoices = invoices;

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
          <h1 className="text-2xl font-bold text-gray-900">Facturatie</h1>
          <p className="text-gray-500">Beheer facturen en betalingen</p>
        </div>
        <button
          onClick={generateInvoices}
          disabled={generating}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          {generating ? 'Genereren...' : 'Facturen Genereren'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Totaal</span>
            <Euro className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">€{stats.total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Betaald</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">€{stats.paid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Openstaand</span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">€{stats.pending.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Verlopen</span>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">€{stats.overdue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="sent">Verzonden</option>
            <option value="paid">Betaald</option>
            <option value="overdue">Verlopen</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Factuur</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Partner</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Periode</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Cases</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Bedrag</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Vervaldatum</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status].icon;
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{invoice.partnerName}</p>
                      <p className="text-sm text-gray-500">{invoice.partnerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.period}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{invoice.cases}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">€{invoice.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">incl. €{invoice.vat.toFixed(2)} BTW</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[invoice.status].color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[invoice.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Bekijken">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Downloaden">
                          <Download className="h-4 w-4" />
                        </button>
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Verzenden"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {invoice.status === 'sent' && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                            className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Markeer als betaald"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Geen facturen gevonden</p>
          </div>
        )}
      </div>
    </div>
  );
}
