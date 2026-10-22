import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  TrendingDown,
  Trash2,
  PieChart,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketingExpense, ExpenseCategory } from '../types';
import {
  formatCurrency,
  calculateCAC,
  calculateTotalCAC,
} from '../utils/calculations';
import { ConfirmModal } from '../components/ConfirmModal';

interface ExpensesViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenQuickEntry }) => {
  const { expenses, metrics, campaigns, softDeleteExpense, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expenseToDelete, setExpenseToDelete] = useState<MarketingExpense | null>(null);

  const activeExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.deleted_at) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchPayment = (e.paymentMethod || '').toLowerCase().includes(q);
        const matchNotes = (e.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPayment && !matchNotes) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  // Overall calculations for CAC comparison
  const totalGeneralExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const activeMetrics = metrics.filter(m => !m.deleted_at);
  const totalAdSpend = activeMetrics.reduce((sum, m) => sum + m.spend, 0);
  const totalNewCustomers = activeMetrics.reduce((sum, m) => sum + m.newCustomers, 0);

  const adCac = calculateCAC(totalAdSpend, totalNewCustomers);
  const totalCac = calculateTotalCAC(totalAdSpend + totalGeneralExpenses, totalNewCustomers);

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, string> = {
      paid_ads: 'إعلانات ممولة إضافية',
      content_design: 'تصميم ومونتاج محتوى',
      tools_software: 'أدوات واشتراكات برمجية',
      influencers: 'مشاهير ومؤثرون ورعايات',
      other: 'مصروفات تسويقية أخرى',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>المصروفات التسويقية التشغيلية (Marketing Expenses)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeExpenses.length} سند صرف
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل تكاليف الإنتاج، المشاهير، أدوات التصميم والذكاء الاصطناعي لاحتساب تكلفة الاستحواذ الشاملة بدقة.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف تسويقي</span>
          </button>
        )}
      </div>

      {/* CAC Distinction Educational Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad CAC */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              تكلفة العميل الإعلانية (Ad CAC)
            </span>
            <span className="text-lg font-black text-slate-900">{adCac.formatted}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            محسوبة فقط من صرف المنصات الإعلانية ({formatCurrency(totalAdSpend)}) ÷ {totalNewCustomers} عميل. تفيد في قياس كفاءة المنصة مباشرة.
          </p>
        </div>

        {/* Comprehensive CAC */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              تكلفة العميل الشاملة (Full Marketing CAC)
            </span>
            <span className="text-lg font-black text-slate-900">{totalCac.formatted}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            تشمل ميزانية الإعلانات + المصروفات التشغيلية للمتجر ({formatCurrency(totalAdSpend + totalGeneralExpenses)}) ÷ {totalNewCustomers} عميل. هي المعيار الحقيقي لربحية توب ستور.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالبند، طريقة الدفع، أو الملاحظات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="paid_ads">إعلانات ممولة إضافية</option>
            <option value="content_design">تصميم ومونتاج محتوى</option>
            <option value="tools_software">أدوات واشتراكات برمجية</option>
            <option value="influencers">مشاهير ومؤثرون ورعايات</option>
            <option value="other">مصروفات أخرى</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {activeExpenses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا توجد مصروفات مسجلة</p>
          <p className="text-xs text-slate-400 mt-1">
            سجل تكاليف الإنتاج والخدمات لحساب التكلفة التسويقية الشاملة.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">البند التسويقي</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">المبلغ المنصرف</th>
                  <th className="p-4">طريقة الدفع</th>
                  <th className="p-4">تاريخ الصرف</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeExpenses.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block text-sm">{item.title}</span>
                      {item.notes && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">{item.notes}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="p-4 font-black text-rose-600 text-sm">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-4 text-slate-800 font-medium">
                      {item.paymentMethod || '-'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {item.expenseDate}
                    </td>
                    <td className="p-4">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="نقل إلى سلة المحذوفات"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title="تأكيد نقل المصروف إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل سند المصروف "${expenseToDelete?.title}" بمبلغ ${expenseToDelete ? formatCurrency(expenseToDelete.amount) : ''} إلى سلة المحذوفات؟`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (expenseToDelete) {
            softDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
