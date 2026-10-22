import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Check,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, Platform } from '../types';
import { formatCurrency } from '../utils/calculations';
import { ConfirmModal } from '../components/ConfirmModal';

interface LeadsViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenQuickEntry }) => {
  const { leads, campaigns, updateLead, softDeleteLead, convertLeadToCustomer, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Convert Lead Modal state
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [custCity, setCustCity] = useState('الرياض');
  const [initialOrderAmount, setInitialOrderAmount] = useState<number | ''>(450);
  const [orderNotes, setOrderNotes] = useState('');

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const activeLeads = useMemo(() => {
    return leads.filter(l => {
      if (l.deleted_at) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (platformFilter !== 'all' && l.platform !== platformFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchPhone = l.phone.includes(q);
        const matchNotes = (l.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNotes) return false;
      }
      return true;
    });
  }, [leads, statusFilter, platformFilter, searchQuery]);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">جديد (New)</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">تم التواصل</span>;
      case 'qualified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">مؤهل للشراء</span>;
      case 'opportunity':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">فرصة بيعية</span>;
      case 'won':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">مغلق ناجح (تم التحويل)</span>;
      case 'lost':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">خاسر</span>;
    }
  };

  const handleConvertConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    convertLeadToCustomer(convertingLead.id, {
      city: custCity,
      initialOrderAmount: initialOrderAmount === '' ? 0 : Number(initialOrderAmount),
      orderNotes,
    });

    setConvertingLead(null);
    setInitialOrderAmount(450);
    setOrderNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>إدارة العملاء المحتملين (Leads Management)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeLeads.length} عميل محتمل
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة استفسارات ورسائل العملاء من الحملات الإعلانية مع ميزة التحويل المباشر لعميل وتسجيل طلب شراء.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('lead')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عميل محتمل جديد</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالاسم، الجوال، أو الملاحظات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="new">جديد (New)</option>
            <option value="contacted">تم التواصل</option>
            <option value="qualified">مؤهل للشراء</option>
            <option value="opportunity">فرصة بيعية نشطة</option>
            <option value="won">مغلق ناجح (عميل فعلي)</option>
            <option value="lost">خاسر</option>
          </select>
        </div>

        <div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع مصادر الإعلانات</option>
            <option value="whatsapp">واتساب (WhatsApp)</option>
            <option value="tiktok">تيك توك (TikTok)</option>
            <option value="instagram">انستغرام (Instagram)</option>
            <option value="snapchat">سناب شات (Snapchat)</option>
            <option value="facebook">فيسبوك (Facebook)</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {activeLeads.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا يوجد عملاء محتملون يطابقون البحث</p>
          <p className="text-xs text-slate-400 mt-1">
            سجل المهتمين القادمين من حملاتك الإعلانية لتحويلهم لعملاء دائمين.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم العميل المحتمل</th>
                  <th className="p-4">رقم الجوال</th>
                  <th className="p-4">المصدر / الحملة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الملاحظات</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeLeads.map(lead => {
                  const camp = campaigns.find(c => c.id === lead.campaignId);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {lead.name}
                        {lead.convertedCustomerId && (
                          <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                            ✓ تم تحويله لعميل بالمتجر
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {lead.platform}
                        </span>
                        {camp && (
                          <span className="block text-[10px] text-slate-400 mt-1 truncate max-w-[180px]">
                            {camp.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="p-4 max-w-xs text-slate-600 truncate">
                        {lead.notes || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {lead.status !== 'won' && canEdit && (
                            <button
                              type="button"
                              onClick={() => setConvertingLead(lead)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>تحويل لعميل</span>
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="نقل إلى سلة المحذوفات"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {convertingLead && (
        <div
          id="convert-lead-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setConvertingLead(null)}
        >
          <div
            id="convert-lead-modal"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-right overflow-hidden transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  تحويل العميل المحتمل إلى عميل فعلي
                </h3>
                <p className="text-xs text-slate-500">
                  العميل: <strong>{convertingLead.name}</strong> ({convertingLead.phone})
                </p>
              </div>
            </div>

            <form onSubmit={handleConvertConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المدينة
                </label>
                <input
                  type="text"
                  value={custCity}
                  onChange={e => setCustCity(e.target.value)}
                  placeholder="الرياض / جدة / الدمام..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  قيمة أول طلب شراء (ر.س) - اختياري
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialOrderAmount}
                  onChange={e => setInitialOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 480"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  سيتم إنشاء طلب شراء وربطه بالعميل والحملة الإعلانية فوراً لاحتساب العائد.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات الطلب أو المنتجات
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="مثال: حقيبة سفر مقاس 20 بوصة مع كود الخصم"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="confirm-convert-lead-btn"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs"
                >
                  تأكيد التحويل الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="تأكيد نقل العميل المحتمل إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل العميل "${leadToDelete?.name}" إلى سلة المحذوفات؟`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (leadToDelete) {
            softDeleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
};
