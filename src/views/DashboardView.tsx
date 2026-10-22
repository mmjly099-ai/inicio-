import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  calculateCAC,
  calculateCostPerOrder,
  calculateConversionRate,
  calculateLeadConversionRate,
  calculateROAS,
  calculateAOV,
  calculateTotalCAC,
  computeStoreBenchmarks,
  evaluateCampaignSmart,
} from '../utils/calculations';
import { SmartDecisionBadge } from '../components/SmartDecisionBadge';
import { PageId } from '../components/Sidebar';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';

interface DashboardViewProps {
  onNavigate: (page: PageId) => void;
  onOpenQuickEntry: (tab?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickEntry }) => {
  const { campaigns, metrics, content, leads, orders, expenses, isDemoMode } = useApp();
  const [period, setPeriod] = useState<PeriodFilter>('month');

  // Filter metrics according to the chosen period
  const { filteredMetrics, prevMetrics, periodLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helpers for date ranges
    const getDaysDiff = (dateStr: string) => {
      const d = new Date(dateStr);
      return Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
    };

    const activeMetrics = metrics.filter(m => !m.deleted_at);

    if (period === 'today') {
      const current = activeMetrics.filter(m => m.date === todayStr);
      const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().split('T')[0];
      const prev = activeMetrics.filter(m => m.date === yesterday);
      return { filteredMetrics: current, prevMetrics: prev, periodLabel: 'اليوم مقارنة بالأمس' };
    }

    if (period === 'week') {
      const current = activeMetrics.filter(m => getDaysDiff(m.date) <= 7);
      const prev = activeMetrics.filter(m => getDaysDiff(m.date) > 7 && getDaysDiff(m.date) <= 14);
      return { filteredMetrics: current, prevMetrics: prev, periodLabel: 'آخر 7 أيام مقارنة بالأسبوع السابق' };
    }

    if (period === 'month') {
      const current = activeMetrics.filter(m => getDaysDiff(m.date) <= 30);
      const prev = activeMetrics.filter(m => getDaysDiff(m.date) > 30 && getDaysDiff(m.date) <= 60);
      return { filteredMetrics: current, prevMetrics: prev, periodLabel: 'هذا الشهر مقارنة بالشهر السابق' };
    }

    // 'all'
    return { filteredMetrics: activeMetrics, prevMetrics: [], periodLabel: 'كامل الفترة المسجلة' };
  }, [metrics, period]);

  // Totals for current period
  const totalSpend = filteredMetrics.reduce((sum, m) => sum + m.spend, 0);
  const totalRevenue = filteredMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = filteredMetrics.reduce((sum, m) => sum + m.orders, 0);
  const totalNewCustomers = filteredMetrics.reduce((sum, m) => sum + m.newCustomers, 0);
  const totalLeads = filteredMetrics.reduce((sum, m) => sum + m.leads, 0);
  const totalMessages = filteredMetrics.reduce((sum, m) => sum + m.messages, 0);
  const totalClicks = filteredMetrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalReach = filteredMetrics.reduce((sum, m) => sum + m.reach, 0);

  // Totals for previous period for % growth
  const prevSpend = prevMetrics.reduce((sum, m) => sum + m.spend, 0);
  const prevRevenue = prevMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const prevOrders = prevMetrics.reduce((sum, m) => sum + m.orders, 0);
  const prevNewCustomers = prevMetrics.reduce((sum, m) => sum + m.newCustomers, 0);

  const getChangePercent = (curr: number, prev: number) => {
    if (prev <= 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  const revenueChange = getChangePercent(totalRevenue, prevRevenue);
  const spendChange = getChangePercent(totalSpend, prevSpend);
  const ordersChange = getChangePercent(totalOrders, prevOrders);
  const customersChange = getChangePercent(totalNewCustomers, prevNewCustomers);

  // Marketing total spend including general expenses
  const activeExpenses = expenses.filter(e => !e.deleted_at);
  const totalGeneralExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMarketingBudgetSpent = totalSpend + totalGeneralExpenses;

  // Key derived ratios
  const cacResult = calculateCAC(totalSpend, totalNewCustomers);
  const totalCacResult = calculateTotalCAC(totalMarketingBudgetSpent, totalNewCustomers);
  const cpoResult = calculateCostPerOrder(totalSpend, totalOrders);
  const roasResult = calculateROAS(totalRevenue, totalSpend);
  const aovResult = calculateAOV(totalRevenue, totalOrders);
  const convRateResult = calculateConversionRate(totalOrders, totalMessages);
  const leadConvResult = calculateLeadConversionRate(totalNewCustomers, totalLeads);

  // Store benchmark for smart decisions
  const benchmarks = useMemo(() => computeStoreBenchmarks(metrics), [metrics]);

  // Campaign evaluations
  const activeCampaigns = campaigns.filter(c => !c.deleted_at);
  const evaluatedCampaigns = useMemo(() => {
    return activeCampaigns.map(cmp => {
      const campMetrics = metrics.filter(m => m.campaignId === cmp.id && !m.deleted_at);
      const cSpend = campMetrics.reduce((s, m) => s + m.spend, 0);
      const cRevenue = campMetrics.reduce((s, m) => s + m.revenue, 0);
      const cCustomers = campMetrics.reduce((s, m) => s + m.newCustomers, 0);
      const cOrders = campMetrics.reduce((s, m) => s + m.orders, 0);

      const evaluation = evaluateCampaignSmart(cSpend, cRevenue, cCustomers, cOrders, benchmarks);
      const roas = cSpend > 0 ? cRevenue / cSpend : 0;
      const cac = cCustomers > 0 ? cSpend / cCustomers : null;

      return {
        campaign: cmp,
        spend: cSpend,
        revenue: cRevenue,
        customers: cCustomers,
        orders: cOrders,
        roas,
        cac,
        evaluation,
      };
    });
  }, [activeCampaigns, metrics, benchmarks]);

  // Best campaign by ROAS
  const bestCampaign = [...evaluatedCampaigns]
    .filter(e => e.spend > 0)
    .sort((a, b) => b.roas - a.roas)[0];

  // Best content by revenue or reach
  const activeContent = content.filter(c => !c.deleted_at);
  const topContent = [...activeContent].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Period Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-950">
              لوحة التحكم والمؤشرات الرئيسية
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              توب ستور
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة حية للإنفاق الإعلاني، العملاء الجدد، العائد ROAS، والقرارات التوجيهية الفورية.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'today'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'week'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الأسبوع
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'month'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الشهر
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Ad Spend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">الإنفاق الإعلاني</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalSpend)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {spendChange !== null ? (
              <span
                className={`font-bold flex items-center ${
                  spendChange <= 0 ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {spendChange > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(spendChange).toFixed(1)}%
              </span>
            ) : null}
            <span className="text-slate-400">مقارنة بالفترة السابقة</span>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">المبيعات المحققة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {revenueChange !== null ? (
              <span
                className={`font-bold flex items-center ${
                  revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
            ) : null}
            <span className="text-slate-400">مقارنة بالفترة السابقة</span>
          </div>
        </div>

        {/* Card 3: ROAS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">العائد الإعلاني (ROAS)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {roasResult.formatted}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>المعدل المستهدف: 3.5x</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                (roasResult.value || 0) >= 3.0
                  ? 'bg-emerald-50 text-emerald-700'
                  : (roasResult.value || 0) >= 1.5
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {(roasResult.value || 0) >= 3.0 ? 'مربح جداً' : (roasResult.value || 0) >= 1.5 ? 'مقبول' : 'منخفض'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">الطلبات المؤكدة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatNumber(totalOrders)} طلب
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {ordersChange !== null ? (
              <span
                className={`font-bold flex items-center ${
                  ordersChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {ordersChange >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(ordersChange).toFixed(1)}%
              </span>
            ) : null}
            <span className="text-slate-400">مقارنة بالفترة السابقة</span>
          </div>
        </div>
      </div>

      {/* Secondary Calculated Performance Ratios Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200">
        {/* Ratio 1: CAC (Ad Customer Acquisition Cost) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            تكلفة اكتساب العميل (CAC إعلاني)
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {cacResult.formatted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">الإنفاق الإعلاني ÷ عملاء جدد</p>
        </div>

        {/* Ratio 2: Cost Per Order */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            تكلفة الطلب الواحد (Cost/Order)
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {cpoResult.formatted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">الإنفاق الإعلاني ÷ عدد الطلبات</p>
        </div>

        {/* Ratio 3: Average Order Value (AOV) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            متوسط قيمة الطلب (AOV)
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {aovResult.formatted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">المبيعات ÷ عدد الطلبات</p>
        </div>

        {/* Ratio 4: Lead to Customer Conversion Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            معدل تحويل العملاء المحتملين
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            {leadConvResult.formatted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">عملاء جدد ÷ العملاء المحتملين</p>
        </div>
      </div>

      {/* SMART DECISIONS & RECOMMENDATIONS SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
              <span>شريط القرارات والتوصيات الذكية لـ TOP STORE</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مقارنة أداء كل حملة تلقائياً بمتوسط المتجر التراكمي (CAC: {formatCurrency(benchmarks.avgCAC)} | ROAS: {benchmarks.avgROAS.toFixed(2)}x) لتوجيه الميزانية بدقة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campaigns')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>عرض تفاصيل الحملات</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {evaluatedCampaigns.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد حملات مسجلة بعد. أضف حملة إعلانية لبدء التحليل الذكي.
          </div>
        ) : (
          <div className="space-y-3">
            {evaluatedCampaigns.map(item => (
              <div
                key={item.campaign.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {item.campaign.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.campaign.platform}
                    </span>
                    <SmartDecisionBadge evaluation={item.evaluation} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.evaluation.reason}
                  </p>
                  <p className="text-xs font-bold text-slate-800 pt-0.5">
                    {item.evaluation.actionRecommendation}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 border-t md:border-t-0 md:border-r border-slate-200 pt-2 md:pt-0 md:pr-4 shrink-0">
                  <div>
                    <span className="block text-[10px] text-slate-400">الإنفاق</span>
                    <span className="font-bold text-slate-800">{formatCurrency(item.spend)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">المبيعات</span>
                    <span className="font-bold text-slate-800">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">العائد (ROAS)</span>
                    <span className={`font-black ${item.roas >= 2.5 ? 'text-emerald-600' : item.roas < 1.3 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.roas > 0 ? `${item.roas.toFixed(2)}x` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HIGHLIGHTS SECTION: BEST CAMPAIGN & BEST CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Campaign Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">
                أفضل حملة إعلانية أداءً (Top Campaign)
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              الأعلى عائداً
            </span>
          </div>

          {bestCampaign ? (
            <div className="space-y-3">
              <div>
                <p className="text-base font-bold text-slate-900">{bestCampaign.campaign.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  المنصة: {bestCampaign.campaign.platform} | الهدف: {bestCampaign.campaign.objective}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">العائد الإعلاني</span>
                  <span className="text-sm font-black text-emerald-600">
                    {bestCampaign.roas.toFixed(2)}x
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">تكلفة العميل CAC</span>
                  <span className="text-sm font-black text-slate-800">
                    {bestCampaign.cac ? formatCurrency(bestCampaign.cac) : 'قيد القياس'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">المبيعات</span>
                  <span className="text-sm font-black text-slate-800">
                    {formatCurrency(bestCampaign.revenue)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                حققت هذه الحملة أعلى معدل كفاءة في TOP STORE، ويُوصى بتكرار الخطافات الإعلانية المشابهة.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">لا توجد بيانات حملات كافية بعد.</p>
          )}
        </div>

        {/* Top Creative / Content Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">
                أفضل محتوى إعلاني (Top Creative)
              </h4>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              الأعلى مبيعات
            </span>
          </div>

          {topContent ? (
            <div className="space-y-3">
              <div>
                <p className="text-base font-bold text-slate-900">{topContent.title}</p>
                <div className="mt-1.5 p-2 bg-blue-50/60 rounded-lg border border-blue-100 text-xs font-semibold text-blue-900">
                  <span className="text-slate-500 font-normal">الخطاف (Hook): </span>
                  "{topContent.hook}"
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">الوصول الفعلي</span>
                  <span className="text-sm font-black text-slate-800">
                    {formatNumber(topContent.reach)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الرسائل المستلمة</span>
                  <span className="text-sm font-black text-slate-800">
                    {formatNumber(topContent.messages)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">المبيعات الناتجة</span>
                  <span className="text-sm font-black text-emerald-600">
                    {formatCurrency(topContent.revenue)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">لا يوجد محتوى تسويقي مسجل بعد.</p>
          )}
        </div>
      </div>

      {/* MARKETING CONVERSION FUNNEL BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h4 className="font-extrabold text-sm text-slate-900 mb-3">
          مسار التحويل التسويقي (Marketing Funnel)
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">1. الوصول والظهور</span>
            <span className="text-base font-black text-slate-800">{formatNumber(totalReach)}</span>
            <span className="text-[10px] text-slate-400 block mt-1">مشاهدة حقيقية</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">2. النقرات (Clicks)</span>
            <span className="text-base font-black text-slate-800">{formatNumber(totalClicks)}</span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {totalReach > 0 ? `${((totalClicks / totalReach) * 100).toFixed(1)}% CTR` : '0%'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">3. الرسائل والاستفسارات</span>
            <span className="text-base font-black text-slate-800">{formatNumber(totalMessages)}</span>
            <span className="text-[10px] text-slate-400 block mt-1">محادثة بيع</span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-center">
            <span className="text-[10px] font-bold text-blue-700 block mb-1">4. عملاء محتملون (Leads)</span>
            <span className="text-base font-black text-blue-900">{formatNumber(totalLeads)}</span>
            <span className="text-[10px] text-blue-600 block mt-1">مهتم وجاد</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold text-emerald-700 block mb-1">5. طلبات شراء مؤكدة</span>
            <span className="text-base font-black text-emerald-800">{formatNumber(totalOrders)}</span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              {totalMessages > 0 ? `${((totalOrders / totalMessages) * 100).toFixed(1)}% تحويل` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
