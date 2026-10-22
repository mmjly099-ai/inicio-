import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  Trash2,
  Crown,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatCurrency } from '../utils/calculations';
import { ConfirmModal } from '../components/ConfirmModal';

interface CustomersViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onOpenQuickEntry }) => {
  const { customers, campaigns, softDeleteCustomer, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const activeCustomers = useMemo(() => {
    return customers.filter(c => {
      if (c.deleted_at) return false;
      if (typeFilter !== 'all') {
        if (typeFilter === 'vip') {
          if (c.totalSpent < 1000 && c.totalOrders < 3) return false;
        } else if (c.customerType !== typeFilter) {
          return false;
        }
      }
      if (cityFilter !== 'all' && c.city !== cityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [customers, typeFilter, cityFilter, searchQuery]);

  // Unique cities for filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (!c.deleted_at && c.city) set.add(c.city);
    });
    return Array.from(set);
  }, [customers]);

  const totalRevenueFromCustomers = activeCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersPlaced = activeCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
  const vipCount = activeCustomers.filter(c => c.totalSpent >= 1000 || c.totalOrders >= 3).length;

  const getCustomerBadge = (customer: Customer) => {
    if (customer.totalSpent >= 1000 || customer.totalOrders >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          عميل VIP متميز
        </span>
      );
    }
    if (customer.customerType === 'returning') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          عميل متكرر
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        عميل جديد
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>قاعدة العملاء الفعليين (Customer Base)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeCustomers.length} عميل
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل العملاء الذين قاموا بالشراء، مع تتبع إجمالي مشترياتهم وتصنيفهم ومصدر الحملة الإعلانية التي جذبتهم.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('lead')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عميل / محتمل جديد</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي مشتريات العملاء</span>
          <span className="text-lg font-black text-slate-900">{formatCurrency(totalRevenueFromCustomers)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي عدد الطلبات المنفذة</span>
          <span className="text-lg font-black text-slate-900">{totalOrdersPlaced} طلب</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">عملاء VIP المميزون</span>
          <span className="text-lg font-black text-amber-600">{vipCount} عميل</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالاسم، الجوال، أو المدينة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="vip">عملاء VIP (إنفاق 1,000+ ر.س)</option>
            <option value="new">عملاء جدد</option>
            <option value="returning">عملاء متكررون</option>
          </select>
        </div>

        <div>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع المدن</option>
            {cities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {activeCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا يوجد عملاء يطابقون خيارات البحث</p>
          <p className="text-xs text-slate-400 mt-1">
            سجل العملاء الفعليين أو حول العملاء المحتملين من قسم Leads.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">العميل</th>
                  <th className="p-4">الجوال والمدينة</th>
                  <th className="p-4">حملة الاكتساب الأولى</th>
                  <th className="p-4">الطلبات</th>
                  <th className="p-4">إجمالي الإنفاق (LTV)</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeCustomers.map(customer => {
                  const camp = campaigns.find(c => c.id === customer.sourceCampaignId);

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {customer.name}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          تاريخ أول طلب: {customer.firstOrderDate}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.city && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{customer.city}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {camp ? (
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                            {camp.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {customer.sourcePlatform || 'مباشر'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {customer.totalOrders} طلب
                      </td>
                      <td className="p-4 font-black text-emerald-700 text-sm">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="p-4">
                        {getCustomerBadge(customer)}
                      </td>
                      <td className="p-4">
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(customer)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="نقل إلى سلة المحذوفات"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title="تأكيد نقل العميل إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل العميل "${customerToDelete?.name}" إلى سلة المحذوفات؟ لن يتم حذف البيانات نهائياً.`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (customerToDelete) {
            softDeleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
