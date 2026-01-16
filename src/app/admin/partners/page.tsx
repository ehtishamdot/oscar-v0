'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Building2,
  Mail,
  Phone,
  Euro,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'fysio_partner' | 'ergo_partner' | 'diet_partner' | 'smoking_partner';
  companyName: string;
  city: string;
  rate: number;
  casesThisMonth: number;
  totalCases: number;
  isActive: boolean;
  billingType: 'paid' | 'free';
}

const typeLabels: Record<string, string> = {
  fysio_partner: 'Fysiotherapie',
  ergo_partner: 'Ergotherapie',
  diet_partner: 'Diëtetiek',
  smoking_partner: 'Stoppen met Roken',
};

const typeColors: Record<string, string> = {
  fysio_partner: 'bg-blue-100 text-blue-700',
  ergo_partner: 'bg-green-100 text-green-700',
  diet_partner: 'bg-purple-100 text-purple-700',
  smoking_partner: 'bg-amber-100 text-amber-700',
};

const defaultRates: Record<string, number> = {
  fysio_partner: 25,
  ergo_partner: 25,
  diet_partner: 30,
  smoking_partner: 35,
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);

  const [filterBilling, setFilterBilling] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'fysio_partner' as Partner['type'],
    companyName: '',
    city: '',
    rate: 25,
    isActive: true,
    billingType: 'paid' as 'paid' | 'free',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners');
      const data = await response.json();
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async () => {
    setSaving(true);
    try {
      const method = editingPartner ? 'PUT' : 'POST';
      const body = editingPartner ? { id: editingPartner.id, ...formData } : formData;

      const response = await fetch('/api/admin/partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        fetchPartners();
        setShowAddModal(false);
        setEditingPartner(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save partner:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'fysio_partner',
      companyName: '',
      city: '',
      rate: 25,
      isActive: true,
      billingType: 'paid',
    });
  };

  const openEditModal = (partner: Partner) => {
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone || '',
      type: partner.type,
      companyName: partner.companyName,
      city: partner.city,
      rate: partner.rate,
      isActive: partner.isActive,
      billingType: partner.billingType || 'paid',
    });
    setEditingPartner(partner);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || partner.type === filterType;
    const matchesBilling = filterBilling === 'all' || partner.billingType === filterBilling;
    return matchesSearch && matchesType && matchesBilling;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterBilling]);

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
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-500">Beheer uw zorgpartners en tarieven</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Partner Toevoegen
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoeken op naam, bedrijf of email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle types</option>
          <option value="fysio_partner">Fysiotherapie</option>
          <option value="ergo_partner">Ergotherapie</option>
          <option value="diet_partner">Diëtetiek</option>
          <option value="smoking_partner">Stoppen met Roken</option>
        </select>
        <select
          value={filterBilling}
          onChange={(e) => setFilterBilling(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle (Paid & Free)</option>
          <option value="paid">Paid (Coordinators)</option>
          <option value="free">Free (Providers)</option>
        </select>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Partner</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Billing</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Tarief</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Cases</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{partner.companyName}</p>
                        <p className="text-sm text-gray-500">{partner.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${typeColors[partner.type]}`}>
                      {typeLabels[partner.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {partner.billingType === 'free' ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Paid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {partner.email || '-'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {partner.phone || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center font-medium text-gray-900">
                      <Euro className="h-4 w-4 mr-1 text-gray-400" />
                      {partner.rate}
                    </div>
                    <p className="text-xs text-gray-500">per case</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{partner.casesThisMonth}</p>
                    <p className="text-xs text-gray-500">deze maand ({partner.totalCases} totaal)</p>
                  </td>
                  <td className="px-6 py-4">
                    {partner.isActive ? (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Actief
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-400">
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactief
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(partner)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedPartners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Geen partners gevonden</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPartners.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Toon</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per pagina</span>
            <span className="ml-4 text-gray-500">
              {startIndex + 1}-{Math.min(endIndex, filteredPartners.length)} van {filteredPartners.length} partners
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Eerste
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-3 py-1 text-sm">
              Pagina {currentPage} van {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Laatste
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {Object.entries(typeLabels).map(([type, label]) => {
          const count = partners.filter(p => p.type === type && p.isActive).length;
          const cases = partners.filter(p => p.type === type).reduce((sum, p) => sum + p.casesThisMonth, 0);
          return (
            <div key={type} className="bg-white rounded-lg p-4 shadow-sm">
              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${typeColors[type]}`}>
                {label}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-sm text-gray-500">actieve partners • {cases} cases</p>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingPartner) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPartner ? 'Partner Bewerken' : 'Nieuwe Partner'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contactpersoon *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const type = e.target.value as Partner['type'];
                      setFormData({ ...formData, type, rate: defaultRates[type] });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fysio_partner">Fysiotherapie</option>
                    <option value="ergo_partner">Ergotherapie</option>
                    <option value="diet_partner">Diëtetiek</option>
                    <option value="smoking_partner">Stoppen met Roken</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stad *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Type *</label>
                  <select
                    value={formData.billingType}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value as 'paid' | 'free', rate: e.target.value === 'free' ? 0 : 25 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paid">Paid (Coordinator - pays per case)</option>
                    <option value="free">Free (Provider - accepts patients)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarief (€ per case)</label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={formData.billingType === 'free'}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">Actief</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditingPartner(null); resetForm(); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSavePartner}
                disabled={saving || !formData.name || !formData.email || !formData.companyName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
