import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Megaphone,
  Trash2,
  Edit,
  TrendingUp,
  Calendar,
  Layers,
  ChevronLeft,
  X,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Campaign, DailyCampaignMetric, Platform, CampaignObjective, CampaignStatus } from '../types';
import {
  formatCurrency,
  formatNumber,
  calculateCAC,
  calculateCostPerOrder,
  calculateConversionRate,
  calculateROAS,
  computeStoreBenchmarks,
  evaluateCampaignSmart,
} from '../utils/calculations';
import { SmartDecisionBadge } from '../components/SmartDecisionBadge';
import { ConfirmModal } from '../components/ConfirmModal';

interface CampaignsViewProps {
  onOpenQuickEntry: (tab: any, campaignId?: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenQuickEntry }) => {
  const { campaigns, metrics, softDeleteCampaign, updateCampaign, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected campaign for detail modal
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Confirmation modal for soft delete
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const benchmarks = useMemo(() => computeStoreBenchmarks(metrics), [metrics]);

  // Filtered campaigns
  const activeCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (c.deleted_at) return false;
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchPlatform = c.platform.toLowerCase().includes(query);
        const matchTarget = (c.targetAudience || '').toLowerCase().includes(query);
        if (!matchName && !matchPlatform && !matchTarget) return false;
      }
      return true;
    });
  }, [campaigns, platformFilter, statusFilter, searchQuery]);

  const getCampaignStats = (campId: string) => {
    const campMetrics = metrics.filter(m => m.campaignId === campId && !m.deleted_at);
    const spend = campMetrics.reduce((s, m) => s + m.spend, 0);
    const revenue = campMetrics.reduce((s, m) => s + m.revenue, 0);
    const orders = campMetrics.reduce((s, m) => s + m.orders, 0);
    const customers = campMetrics.reduce((s, m) => s + m.newCustomers, 0);
    const messages = campMetrics.reduce((s, m) => s + m.messages, 0);
    const leads = campMetrics.reduce((s, m) => s + m.leads, 0);
    const reach = campMetrics.reduce((s, m) => s + m.reach, 0);
    const clicks = campMetrics.reduce((s, m) => s + m.clicks, 0);

    const roasResult = calculateROAS(revenue, spend);
    const cacResult = calculateCAC(spend, customers);
    const cpoResult = calculateCostPerOrder(spend, orders);
    const convResult = calculateConversionRate(orders, messages);
    const evaluation = evaluateCampaignSmart(spend, revenue, customers, orders, benchmarks);

    return {
      spend,
      revenue,
      orders,
      customers,
      messages,
      leads,
      reach,
      clicks,
      roasResult,
      cacResult,
      cpoResult,
      convResult,
      evaluation,
      metricsCount: campMetrics.length,
      metricsList: campMetrics,
    };
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">نشطة</span>;
      case 'paused':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">متوقفة</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">مكتملة</span>;
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">مسودة</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>الحملات الإعلانية</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeCampaigns.length} حملة
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة ومتابعة نتائج الحملات عبر المنصات (تيك توك، انستغرام، واتساب، سناب، فيسبوك) واحتساب العائد والتكلفة.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('campaign')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>حملة إعلانية جديدة</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالاسم أو المنصة أو الجمهور..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Platform filter */}
        <div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">جميع المنصات</option>
            <option value="tiktok">تيك توك (TikTok)</option>
            <option value="instagram">انستغرام (Instagram)</option>
            <option value="whatsapp">واتساب (WhatsApp)</option>
            <option value="snapchat">سناب شات (Snapchat)</option>
            <option value="facebook">فيسبوك (Facebook)</option>
            <option value="google">إعلانات جوجل (Google)</option>
            <option value="other">منصات أخرى</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة (Active)</option>
            <option value="paused">متوقفة (Paused)</option>
            <option value="completed">مكتملة (Completed)</option>
            <option value="draft">مسودة (Draft)</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid / Cards */}
      {activeCampaigns.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا توجد حملات تطابق البحث أو الفلتر</p>
          <p className="text-xs text-slate-400 mt-1">
            جرب تعديل خيارات الفلترة أو أضف حملة إعلانية جديدة الآن.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCampaigns.map(cmp => {
            const stats = getCampaignStats(cmp.id);

            return (
              <div
                key={cmp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {cmp.platform} • {cmp.objective}
                      </span>
                      <h3 className="text-base font-black text-slate-900 leading-snug mt-0.5">
                        {cmp.name}
                      </h3>
                    </div>
                    <div>{getStatusBadge(cmp.status)}</div>
                  </div>

                  {/* Smart decision badge */}
                  <div className="my-2">
                    <SmartDecisionBadge evaluation={stats.evaluation} showDetailsToggle />
                  </div>

                  {/* Key Stats numbers grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 my-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">إجمالي الإنفاق</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {formatCurrency(stats.spend)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المبيعات</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {formatCurrency(stats.revenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">العائد ROAS</span>
                      <span className={`text-xs sm:text-sm font-black ${
                        (stats.roasResult.value || 0) >= 3.0 ? 'text-emerald-600' : (stats.roasResult.value || 0) < 1.3 ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {stats.roasResult.formatted}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Metrics pills */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mb-3 font-medium">
                    <div className="bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">تكلفة العميل (CAC):</span>
                      <span className="font-bold text-slate-800">{stats.cacResult.formatted}</span>
                    </div>
                    <div className="bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">تكلفة الطلب:</span>
                      <span className="font-bold text-slate-800">{stats.cpoResult.formatted}</span>
                    </div>
                    <div className="bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">الطلبات / العملاء:</span>
                      <span className="font-bold text-slate-800">{stats.orders} طلب / {stats.customers} عميل</span>
                    </div>
                  </div>
                </div>

                {/* Bottom card actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(cmp)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>سجل المقاييس ({stats.metricsCount})</span>
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenQuickEntry('daily_metric', cmp.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تسجيل أداء يومي</span>
                      </button>
                    )}
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setCampaignToDelete(cmp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="نقل إلى سلة المحذوفات (حذف ناعم)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CAMPAIGN DETAILS & DAILY METRICS MODAL */}
      {selectedCampaign && (
        <div
          id="campaign-detail-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            id="campaign-detail-modal"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-right overflow-hidden transform transition-all my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-slate-400">تفاصيل وسجل الحملة</span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedCampaign.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Campaign summary info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">المنصة والهدف</span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedCampaign.platform} • {selectedCampaign.objective}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">الميزانية المقررة</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatCurrency(selectedCampaign.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">الفترة الزمنية</span>
                  <span className="text-xs font-bold text-slate-800">
                    من {selectedCampaign.startDate} {selectedCampaign.endDate ? `إلى ${selectedCampaign.endDate}` : 'مستمرة'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">حالة الحملة</span>
                  <span className="text-xs font-bold text-slate-800">
                    {getStatusBadge(selectedCampaign.status)}
                  </span>
                </div>
              </div>

              {selectedCampaign.targetAudience && (
                <div className="text-xs text-slate-600 bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900">الجمهور المستهدف: </span>
                  {selectedCampaign.targetAudience}
                </div>
              )}

              {/* Action Button inside modal */}
              {canEdit && (
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    سجل المقاييس اليومية المدخلة
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      onOpenQuickEntry('daily_metric', selectedCampaign.id);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ إضافة نتيجة يومية جديدة</span>
                  </button>
                </div>
              )}

              {/* Metrics Table */}
              {getCampaignStats(selectedCampaign.id).metricsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  لا توجد سجلات أداء يومية مدخلة لهذه الحملة بعد.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">الإنفاق</th>
                        <th className="p-3">الوصول</th>
                        <th className="p-3">النقرات</th>
                        <th className="p-3">الرسائل</th>
                        <th className="p-3">العملاء الجدد</th>
                        <th className="p-3">الطلبات</th>
                        <th className="p-3">المبيعات</th>
                        <th className="p-3">العائد (ROAS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {getCampaignStats(selectedCampaign.id).metricsList.map(m => {
                        const mRoas = m.spend > 0 ? (m.revenue / m.spend).toFixed(2) : '-';
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-semibold text-slate-900">{m.date}</td>
                            <td className="p-3 font-bold text-slate-800">{formatCurrency(m.spend)}</td>
                            <td className="p-3">{formatNumber(m.reach)}</td>
                            <td className="p-3">{formatNumber(m.clicks)}</td>
                            <td className="p-3">{formatNumber(m.messages)}</td>
                            <td className="p-3 font-semibold text-blue-700">{m.newCustomers}</td>
                            <td className="p-3 font-semibold text-amber-700">{m.orders}</td>
                            <td className="p-3 font-bold text-emerald-700">{formatCurrency(m.revenue)}</td>
                            <td className="p-3 font-black">{mRoas}x</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!campaignToDelete}
        title="تأكيد نقل الحملة إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل الحملة "${campaignToDelete?.name}" إلى سلة المحذوفات؟ لن يتم حذف بياناتها نهائياً، بل سيتم حفظها في سجل التدقيق وسلة المحذوفات مع إمكانية استعادتها في أي وقت.`}
        confirmLabel="نقل لسلة المحذوفات (حذف ناعم)"
        cancelLabel="تراجع"
        isDestructive={true}
        onConfirm={() => {
          if (campaignToDelete) {
            softDeleteCampaign(campaignToDelete.id);
            setCampaignToDelete(null);
          }
        }}
        onCancel={() => setCampaignToDelete(null)}
      />
    </div>
  );
};
