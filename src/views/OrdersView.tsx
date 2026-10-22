import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  RotateCcw,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketingOrder, OrderStatus } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { ConfirmModal } from '../components/ConfirmModal';

interface OrdersViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenQuickEntry }) => {
  const { orders, customers, campaigns, softDeleteOrder, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderToDelete, setOrderToDelete] = useState<MarketingOrder | null>(null);

  const activeOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.deleted_at) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchNotes = (o.notes || '').toLowerCase().includes(q);
        if (!matchNum && !matchCust && !matchNotes) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const totalRevenue = activeOrders
    .filter(o => o.status !== 'returned')
    .reduce((sum, o) => sum + o.amount, 0);

  const deliveredCount = activeOrders.filter(o => o.status === 'delivered').length;
  const processingCount = activeOrders.filter(o => o.status === 'processing' || o.status === 'new').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">طلب جديد</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">قيد التنفيذ والشحن</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">مكتمل ومستلم</span>;
      case 'returned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">مرتجع (Returned)</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>طلبات التسويق والمبيعات (Marketing Orders)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeOrders.length} طلب
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل وتتبع طلبات الشراء الناتجة عن الحملات الإعلانية ومحركات التواصل الاجتماعي للمتجر.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('order')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طلب جديد</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي قيمة الطلبات الفعالة</span>
          <span className="text-lg font-black text-slate-900">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">طلبات قيد التجهيز والشحن</span>
          <span className="text-lg font-black text-blue-600">{processingCount} طلب</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">طلبات تم تسليمها بنجاح</span>
          <span className="text-lg font-black text-emerald-600">{deliveredCount} طلب</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، أو الملاحظات..."
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
            <option value="new">طلب جديد (New)</option>
            <option value="processing">قيد التنفيذ والشحن (Processing)</option>
            <option value="delivered">مكتمل ومستلم (Delivered)</option>
            <option value="returned">مرتجع (Returned)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {activeOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا توجد طلبات تطابق معايير الفلترة</p>
          <p className="text-xs text-slate-400 mt-1">
            سجل طلبات الشراء لربطها بالحملات الإعلانية ومتابعة العائد.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">اسم العميل</th>
                  <th className="p-4">القيمة (ر.س)</th>
                  <th className="p-4">الحملة والمنصة</th>
                  <th className="p-4">تاريخ الطلب</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeOrders.map(order => {
                  const camp = campaigns.find(c => c.id === order.campaignId);
                  const cust = customers.find(c => c.id === order.customerId);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-700 text-sm">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        {cust && (
                          <span className="font-mono text-[11px] text-slate-400">{cust.phone}</span>
                        )}
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
                          {order.platform}
                        </span>
                        {camp && (
                          <span className="block text-[10px] text-slate-400 mt-1 truncate max-w-[160px]">
                            {camp.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {order.orderDate}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
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
        isOpen={!!orderToDelete}
        title="تأكيد نقل الطلب إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل الطلب رقم "${orderToDelete?.orderNumber}" إلى سلة المحذوفات؟`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (orderToDelete) {
            softDeleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};
