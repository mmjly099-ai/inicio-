import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Trash2,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketingPlanItem, PlanItemStatus } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface PlanViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({ onOpenQuickEntry }) => {
  const { planItems, updatePlanItem, softDeletePlanItem, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<MarketingPlanItem | null>(null);

  const activePlan = useMemo(() => {
    return planItems.filter((p: MarketingPlanItem) => {
      if (p.deleted_at) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAssignee = (p.assignedTo || '').toLowerCase().includes(q);
        const matchNotes = (p.notes || '').toLowerCase().includes(q);
        const matchHook = (p.hook || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAssignee && !matchNotes && !matchHook) return false;
      }
      return true;
    });
  }, [planItems, statusFilter, searchQuery]);

  const getStatusBadge = (status: PlanItemStatus) => {
    switch (status) {
      case 'idea':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">فكرة (Idea)</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">قيد الإعداد والتصوير</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">جاهز للنشر (Ready)</span>;
      case 'published':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">تم النشر (Published)</span>;
    }
  };

  const handleStatusChange = (id: string, newStatus: PlanItemStatus) => {
    if (!canEdit) return;
    updatePlanItem(id, { status: newStatus });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>التقويم وخطة التسويق (Marketing Calendar & Plan)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activePlan.length} مهمة مجدولة
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدول إطلاق الحملات، تصوير الريلز، تجهيز العروض الترويجية، ومتابعة فريق التسويق في توب ستور.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('plan')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة للخطة</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالمهمة، الخطاف، المسؤول، أو الملاحظات..."
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
            <option value="idea">فكرة (Idea)</option>
            <option value="in_progress">قيد الإعداد والتصوير</option>
            <option value="ready">جاهز للنشر (Ready)</option>
            <option value="published">تم النشر (Published)</option>
          </select>
        </div>
      </div>

      {/* Plan Items List / Cards */}
      {activePlan.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا توجد مهام في الخطة تطابق الفلتر</p>
          <p className="text-xs text-slate-400 mt-1">
            أضف مهام التصوير والحملات القادمة لتنظيم جدول النشر التسويقي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePlan.map((item: MarketingPlanItem) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {item.platform} • {item.contentType}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      موعد التنفيذ: <strong>{item.date}</strong>
                    </span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug mt-1">
                  {item.title}
                </h3>

                {item.hook && (
                  <div className="mt-2 text-xs bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl text-amber-950 font-medium">
                    <span className="font-bold block text-[10px] text-amber-700 mb-0.5">زاوية الإعلان أو الخطاف:</span>
                    "{item.hook}"
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>المسؤول: <strong className="text-slate-800">{item.assignedTo || 'غير محدد'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {canEdit && (
                    <select
                      value={item.status}
                      onChange={e => handleStatusChange(item.id, e.target.value as PlanItemStatus)}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <option value="idea">فكرة</option>
                      <option value="in_progress">قيد الإعداد</option>
                      <option value="ready">جاهز</option>
                      <option value="published">تم النشر</option>
                    </select>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="نقل إلى سلة المحذوفات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد نقل المهمة إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل المهمة "${itemToDelete?.title}" إلى سلة المحذوفات؟`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (itemToDelete) {
            softDeletePlanItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
