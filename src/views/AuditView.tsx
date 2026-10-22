import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditLog, MarketingPlanItem } from '../types';

export const AuditView: React.FC = () => {
  const {
    auditLogs,
    campaigns,
    content,
    leads,
    customers,
    orders,
    expenses,
    planItems,
    restoreCampaign,
    restoreContent,
    restoreLead,
    restoreCustomer,
    restoreOrder,
    restoreExpense,
    restorePlanItem,
    canEdit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'audit' | 'trash'>('audit');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRestore = (entity: string, id: string) => {
    switch (entity) {
      case 'campaign':
        restoreCampaign(id);
        break;
      case 'content':
        restoreContent(id);
        break;
      case 'lead':
        restoreLead(id);
        break;
      case 'customer':
        restoreCustomer(id);
        break;
      case 'order':
        restoreOrder(id);
        break;
      case 'expense':
        restoreExpense(id);
        break;
      case 'plan':
        restorePlanItem(id);
        break;
    }
  };

  // Collect all soft-deleted items across entities
  const trashItems = useMemo(() => {
    const items: Array<{
      id: string;
      entity: 'campaign' | 'content' | 'lead' | 'customer' | 'order' | 'expense' | 'plan';
      name: string;
      deletedAt: string;
      details: string;
    }> = [];

    campaigns.filter(c => c.deleted_at).forEach(c => {
      items.push({
        id: c.id,
        entity: 'campaign',
        name: `حملة: ${c.name}`,
        deletedAt: c.deleted_at!,
        details: `المنصة: ${c.platform} • الميزانية: ${c.budget} ر.س`,
      });
    });

    content.filter(c => c.deleted_at).forEach(c => {
      items.push({
        id: c.id,
        entity: 'content',
        name: `محتوى: ${c.title}`,
        deletedAt: c.deleted_at!,
        details: `الخطاف: "${c.hook}"`,
      });
    });

    leads.filter(l => l.deleted_at).forEach(l => {
      items.push({
        id: l.id,
        entity: 'lead',
        name: `عميل محتمل: ${l.name}`,
        deletedAt: l.deleted_at!,
        details: `الجوال: ${l.phone} • المصدر: ${l.platform}`,
      });
    });

    customers.filter(c => c.deleted_at).forEach(c => {
      items.push({
        id: c.id,
        entity: 'customer',
        name: `عميل: ${c.name}`,
        deletedAt: c.deleted_at!,
        details: `المدينة: ${c.city || '-'} • المشتريات: ${c.totalSpent} ر.س`,
      });
    });

    orders.filter(o => o.deleted_at).forEach(o => {
      items.push({
        id: o.id,
        entity: 'order',
        name: `طلب: ${o.orderNumber}`,
        deletedAt: o.deleted_at!,
        details: `العميل: ${o.customerName} • القيمة: ${o.amount} ر.س`,
      });
    });

    expenses.filter(e => e.deleted_at).forEach(e => {
      items.push({
        id: e.id,
        entity: 'expense',
        name: `مصروف: ${e.title}`,
        deletedAt: e.deleted_at!,
        details: `المبلغ: ${e.amount} ر.س • التصنيف: ${e.category}`,
      });
    });

    planItems.filter((p: MarketingPlanItem) => p.deleted_at).forEach((p: MarketingPlanItem) => {
      items.push({
        id: p.id,
        entity: 'plan',
        name: `مهمة: ${p.title}`,
        deletedAt: p.deleted_at!,
        details: `الموعد: ${p.date} • المسؤول: ${p.assignedTo}`,
      });
    });

    return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }, [campaigns, content, leads, customers, orders, expenses, planItems]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = log.userName.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchTarget = log.targetTitle.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        if (!matchUser && !matchDetails && !matchTarget && !matchAction) return false;
      }
      return true;
    });
  }, [auditLogs, searchQuery]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">إضافة جديدة</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">تعديل بيانات</span>;
      case 'soft_delete':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">نقل للمحذوفات</span>;
      case 'restore':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">استعادة محذوف</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>سجل التدقيق وسلة المحذوفات (Audit & Trash)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل تاريخي كامل لكل العمليات التي تتم في النظام، مع ضمان عدم فقدان أي بيانات عبر ميزة الحذف الناعم والاستعادة الفورية.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل النشاطات ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سلة المحذوفات ({trashItems.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'audit' ? 'بحث في سجل التدقيق والمستخدمين والتفاصيل...' : 'بحث في العناصر المحذوفة...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {filteredAuditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              لا توجد سجلات تطابق البحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">الوقت والتاريخ</th>
                    <th className="p-4">المستخدم والصلاحية</th>
                    <th className="p-4">نوع الإجراء</th>
                    <th className="p-4">العنصر المتأثر</th>
                    <th className="p-4">تفاصيل العملية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-400">
                          {log.userRole === 'admin' ? 'مسؤول' : log.userRole === 'marketer' ? 'مسوق' : 'مشاهد'}
                        </span>
                      </td>
                      <td className="p-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {log.targetTitle}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {log.targetType}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRASH CAN & RESTORE */}
      {activeTab === 'trash' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {trashItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700">سلة المحذوفات فارغة تماماً</p>
              <p className="text-xs text-slate-400 mt-1">
                جميع بيانات المتجر نشطة ولم يتم نقل أي عنصر لسلة المحذوفات.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">العنصر المحذوف</th>
                    <th className="p-4">النوع والتفاصيل</th>
                    <th className="p-4">تاريخ النقل للمحذوفات</th>
                    <th className="p-4">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trashItems.map(item => (
                    <tr key={`${item.entity}-${item.id}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {item.name}
                      </td>
                      <td className="p-4 text-slate-600">
                        {item.details}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {item.deletedAt}
                      </td>
                      <td className="p-4">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleRestore(item.entity, item.id)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                            <span>استعادة العنصر</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
