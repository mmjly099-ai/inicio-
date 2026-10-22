import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  PieChart,
  ArrowUpRight,
  Printer,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  calculateCAC,
  calculateROAS,
  calculateCostPerOrder,
  calculateConversionRate,
  computeStoreBenchmarks,
} from '../utils/calculations';
import { Platform } from '../types';

export const AnalyticsView: React.FC = () => {
  const { campaigns, metrics, leads, orders, expenses } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<'roas' | 'spend' | 'revenue' | 'orders'>('roas');

  const activeMetrics = useMemo(() => metrics.filter(m => !m.deleted_at), [metrics]);
  const activeCampaigns = useMemo(() => campaigns.filter(c => !c.deleted_at), [campaigns]);

  // Group metrics by platform
  const platformBreakdown = useMemo(() => {
    const platforms: Platform[] = ['tiktok', 'instagram', 'snapchat', 'whatsapp', 'facebook', 'google'];

    return platforms.map(plat => {
      // Find campaigns belonging to this platform
      const platCampaignIds = activeCampaigns
        .filter(c => c.platform === plat)
        .map(c => c.id);

      const platMetrics = activeMetrics.filter(m => platCampaignIds.includes(m.campaignId));

      const spend = platMetrics.reduce((s, m) => s + m.spend, 0);
      const revenue = platMetrics.reduce((s, m) => s + m.revenue, 0);
      const ordersCount = platMetrics.reduce((s, m) => s + m.orders, 0);
      const customersCount = platMetrics.reduce((s, m) => s + m.newCustomers, 0);
      const messagesCount = platMetrics.reduce((s, m) => s + m.messages, 0);
      const reachCount = platMetrics.reduce((s, m) => s + m.reach, 0);

      const roas = spend > 0 ? revenue / spend : 0;
      const cac = customersCount > 0 ? spend / customersCount : null;
      const cpo = ordersCount > 0 ? spend / ordersCount : null;

      const labels: Record<Platform, string> = {
        tiktok: 'تيك توك (TikTok)',
        instagram: 'انستغرام (Instagram)',
        snapchat: 'سناب شات (Snapchat)',
        whatsapp: 'واتساب (WhatsApp)',
        facebook: 'فيسبوك (Facebook)',
        google: 'إعلانات جوجل',
        other: 'أخرى',
      };

      return {
        platform: plat,
        label: labels[plat] || plat,
        spend,
        revenue,
        ordersCount,
        customersCount,
        messagesCount,
        reachCount,
        roas,
        cac,
        cpo,
      };
    }).filter(p => p.spend > 0 || p.revenue > 0);
  }, [activeCampaigns, activeMetrics]);

  // Overall benchmarks
  const benchmarks = useMemo(() => computeStoreBenchmarks(activeMetrics), [activeMetrics]);

  // Top platform by ROAS
  const topPlatform = [...platformBreakdown].sort((a, b) => b.roas - a.roas)[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>التحليلات والمقارنات الشاملة (Comparative Analytics)</span>
            <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
              تقارير استثمارية
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مقارنة أداء المنصات التسويقية واكتشاف القنوات الأكثر تحقيقاً للأرباح وأقلها تكلفة للعميل.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة تقرير التحليلات</span>
        </button>
      </div>

      {/* Highlights Top Platform Card */}
      {topPlatform && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-amber-400 font-bold block">القناة الإعلانية الذهبية لـ TOP STORE</span>
                <h3 className="text-lg font-black text-white">{topPlatform.label}</h3>
              </div>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block">العائد الإعلاني (ROAS)</span>
              <span className="text-2xl font-black text-amber-400">{topPlatform.roas.toFixed(2)}x</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            حققت قناة <strong>{topPlatform.label}</strong> أعلى عائد استثماري، بمبيعات إجمالية بلغت {formatCurrency(topPlatform.revenue)} مقابل إنفاق {formatCurrency(topPlatform.spend)}. يُوصى بزيادة الحصة المخصصة لها في الميزانية الشهرية القادمة.
          </p>
        </div>
      )}

      {/* Platform Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          مقارنة أداء المنصات التسويقية (Cross-Platform Matrix)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          جدول مقارن للإنفاق والمبيعات وتكلفة العميل والعائد على كل منصة بشكل مستقل.
        </p>

        {platformBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد بيانات منصات مسجلة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">المنصة</th>
                  <th className="p-3.5">الإنفاق الإعلاني</th>
                  <th className="p-3.5">المبيعات المحققة</th>
                  <th className="p-3.5">العائد (ROAS)</th>
                  <th className="p-3.5">الطلبات</th>
                  <th className="p-3.5">العملاء الجدد</th>
                  <th className="p-3.5">تكلفة العميل (CAC)</th>
                  <th className="p-3.5">تكلفة الطلب (CPO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {platformBreakdown.map(p => {
                  const isTop = topPlatform && p.platform === topPlatform.platform;

                  return (
                    <tr
                      key={p.platform}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isTop ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="p-3.5 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{p.label}</span>
                          {isTop && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                              الأفضل
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{formatCurrency(p.spend)}</td>
                      <td className="p-3.5 font-bold text-slate-800">{formatCurrency(p.revenue)}</td>
                      <td className="p-3.5 font-black text-sm">
                        <span
                          className={
                            p.roas >= 3.0
                              ? 'text-emerald-600'
                              : p.roas < 1.3
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }
                        >
                          {p.roas > 0 ? `${p.roas.toFixed(2)}x` : '-'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{p.ordersCount}</td>
                      <td className="p-3.5 font-semibold text-blue-700">{p.customersCount}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {p.cac ? formatCurrency(p.cac) : '-'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {p.cpo ? formatCurrency(p.cpo) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Relative Performance Bars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-3">
          توزيع المبيعات مقارنة بالإنفاق حسب المنصة
        </h3>

        <div className="space-y-4">
          {platformBreakdown.map(p => {
            const maxRevenue = Math.max(...platformBreakdown.map(x => x.revenue), 1);
            const percentWidth = Math.min(100, Math.round((p.revenue / maxRevenue) * 100));

            return (
              <div key={p.platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{p.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">إنفاق: {formatCurrency(p.spend)}</span>
                    <span className="font-bold text-emerald-700">مبيعات: {formatCurrency(p.revenue)}</span>
                    <span className="font-black text-slate-900">({p.roas.toFixed(1)}x)</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
