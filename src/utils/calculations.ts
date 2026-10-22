import { Campaign, DailyCampaignMetric, SmartEvaluation, ContentItem } from '../types';

/**
 * Currency formatter for Saudi Riyals (ر.س)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ر.س';
  }
  return new Intl.NumberFormat('ar-SA', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(amount) + ' ر.س';
}

/**
 * Compact currency for metric badges
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' م.ر.س';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(1) + ' ك.ر.س';
  }
  return amount.toLocaleString('ar-SA') + ' ر.س';
}

/**
 * Number formatter with Arabic thousands separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('ar-SA').format(num);
}

/**
 * Percentage formatter
 */
export function formatPercent(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return 'لا توجد بيانات كافية للتحليل';
  }
  return `${rate.toFixed(1)}%`;
}

/**
 * Calculations & Safe Math
 */
export interface MetricResult {
  value: number | null;
  formatted: string;
  hasEnoughData: boolean;
}

// 1. التكلفة لكل عميل (Customer Acquisition Cost - Ad CAC): الإنفاق الإعلاني / العملاء الجدد
export function calculateCAC(spend: number, newCustomers: number): MetricResult {
  if (spend <= 0 || newCustomers <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const cac = spend / newCustomers;
  return {
    value: cac,
    formatted: formatCurrency(cac),
    hasEnoughData: true,
  };
}

// 2. تكلفة الطلب الواحد: الإنفاق الإعلاني / الطلبات
export function calculateCostPerOrder(spend: number, orders: number): MetricResult {
  if (spend <= 0 || orders <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const cpo = spend / orders;
  return {
    value: cpo,
    formatted: formatCurrency(cpo),
    hasEnoughData: true,
  };
}

// 3. معدل التحويل: (الطلبات / الرسائل) * 100
export function calculateConversionRate(orders: number, messages: number): MetricResult {
  if (messages <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const rate = (orders / messages) * 100;
  return {
    value: rate,
    formatted: `${rate.toFixed(1)}%`,
    hasEnoughData: true,
  };
}

// 4. معدل تحويل العملاء المحتملين: (عملاء جدد / عملاء محتملون) * 100
export function calculateLeadConversionRate(newCustomers: number, leads: number): MetricResult {
  if (leads <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const rate = (newCustomers / leads) * 100;
  return {
    value: rate,
    formatted: `${rate.toFixed(1)}%`,
    hasEnoughData: true,
  };
}

// 5. العائد على الإنفاق الإعلاني (ROAS): المبيعات / الإنفاق الإعلاني
export function calculateROAS(revenue: number, spend: number): MetricResult {
  if (spend <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const roas = revenue / spend;
  return {
    value: roas,
    formatted: `${roas.toFixed(2)}x`,
    hasEnoughData: true,
  };
}

// 6. متوسط قيمة الطلب (AOV): المبيعات / الطلبات
export function calculateAOV(revenue: number, orders: number): MetricResult {
  if (orders <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const aov = revenue / orders;
  return {
    value: aov,
    formatted: formatCurrency(aov),
    hasEnoughData: true,
  };
}

// 7. CAC الشامل: الإنفاق التسويقي الكلي / العملاء الجدد
export function calculateTotalCAC(totalMarketingSpend: number, newCustomers: number): MetricResult {
  if (totalMarketingSpend <= 0 || newCustomers <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const totalCac = totalMarketingSpend / newCustomers;
  return {
    value: totalCac,
    formatted: formatCurrency(totalCac),
    hasEnoughData: true,
  };
}

// 8. معدل التفاعل للمحتوى: ((الإعجابات + التعليقات + المشاركات + الحفظ) / الوصول) * 100
export function calculateEngagementRate(content: ContentItem): MetricResult {
  const interactions = (content.likes || 0) + (content.comments || 0) + (content.shares || 0) + (content.saves || 0);
  if (!content.reach || content.reach <= 0) {
    return { value: null, formatted: 'لا توجد بيانات كافية للتحليل', hasEnoughData: false };
  }
  const rate = (interactions / content.reach) * 100;
  return {
    value: rate,
    formatted: `${rate.toFixed(2)}%`,
    hasEnoughData: true,
  };
}

/**
 * Smart Decision Evaluation System
 * Compares campaign performance against historical store benchmark averages.
 */
export interface StoreBenchmark {
  avgCAC: number;
  avgROAS: number;
  avgCostPerOrder: number;
  avgConversionRate: number;
  totalCampaignsAnalyzed: number;
}

export function computeStoreBenchmarks(
  metrics: DailyCampaignMetric[]
): StoreBenchmark {
  const activeMetrics = metrics.filter(m => !m.deleted_at);
  const totalSpend = activeMetrics.reduce((acc, m) => acc + m.spend, 0);
  const totalRevenue = activeMetrics.reduce((acc, m) => acc + m.revenue, 0);
  const totalNewCustomers = activeMetrics.reduce((acc, m) => acc + m.newCustomers, 0);
  const totalOrders = activeMetrics.reduce((acc, m) => acc + m.orders, 0);
  const totalMessages = activeMetrics.reduce((acc, m) => acc + m.messages, 0);

  return {
    avgCAC: totalNewCustomers > 0 ? totalSpend / totalNewCustomers : 85,
    avgROAS: totalSpend > 0 ? totalRevenue / totalSpend : 3.2,
    avgCostPerOrder: totalOrders > 0 ? totalSpend / totalOrders : 45,
    avgConversionRate: totalMessages > 0 ? (totalOrders / totalMessages) * 100 : 15,
    totalCampaignsAnalyzed: activeMetrics.length,
  };
}

export function evaluateCampaignSmart(
  campaignSpend: number,
  campaignRevenue: number,
  campaignCustomers: number,
  campaignOrders: number,
  benchmark: StoreBenchmark
): SmartEvaluation {
  if (campaignSpend <= 0) {
    return {
      score: 'needs_improvement',
      label: 'في الانتظار',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      reason: 'الحملة لم تبدأ بالإنفاق الإعلاني الفعلي بعد.',
      actionRecommendation: 'ابدأ تفعيل الميزانية ومتابعة أول 48 ساعة.',
    };
  }

  const roas = campaignRevenue / campaignSpend;
  const cac = campaignCustomers > 0 ? campaignSpend / campaignCustomers : null;
  const costPerOrder = campaignOrders > 0 ? campaignSpend / campaignOrders : null;

  // Excellent condition:
  // ROAS significantly higher than benchmark OR CAC lower than benchmark with healthy ROAS
  if (roas >= benchmark.avgROAS * 1.15 || (cac !== null && cac <= benchmark.avgCAC * 0.85 && roas >= 2.0)) {
    let reason = 'الحملة حققت أداءً استثنائياً يفوق متوسط TOP STORE!';
    if (cac !== null && cac < benchmark.avgCAC) {
      reason = `الحملة حققت عملاء بتكلفة (${cac.toFixed(0)} ر.س) أقل من متوسط المتجر (${benchmark.avgCAC.toFixed(0)} ر.س) وبعائد ممتاز (${roas.toFixed(2)}x).`;
    } else {
      reason = `عائد الإنفاق الإعلاني (${roas.toFixed(2)}x) أعلى من متوسط المتجر (${benchmark.avgROAS.toFixed(2)}x).`;
    }
    return {
      score: 'excellent',
      label: 'ناجح ومربح',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      reason,
      actionRecommendation: '🟢 التوصية: زيادة ميزانية الحملة بنسبة 20% - 30% مع توسيع نطاق الجمهور الناجح.',
    };
  }

  // Critical condition:
  // ROAS < 1.2 or CAC significantly above store benchmark or high spend with zero sales/orders
  if (roas < 1.3 || (cac !== null && cac > benchmark.avgCAC * 1.5) || (costPerOrder !== null && costPerOrder > benchmark.avgCostPerOrder * 1.6)) {
    let reason = 'أداء الحملة يمثل مخاطرة مالية مقارنة بمتوسطات المتجر.';
    if (roas < 1.0) {
      reason = `الحملة خاسرة: العائد الإعلاني (${roas.toFixed(2)}x) أقل من رأس المال المستثمر.`;
    } else if (cac !== null && cac > benchmark.avgCAC * 1.5) {
      reason = `تكلفة اكتساب العميل (${cac.toFixed(0)} ر.س) مرتفعة جداً مقارنة بمتوسط المتجر (${benchmark.avgCAC.toFixed(0)} ر.س).`;
    }
    return {
      score: 'critical_review',
      label: 'يحتاج مراجعة فورية',
      color: 'bg-rose-50 text-rose-700 border-rose-300',
      reason,
      actionRecommendation: '🔴 التوصية: إيقاف الإعلان فوراً أو مراجعة الخطاف الإعلاني وصفحة المنتج ووقف نزيف الميزانية.',
    };
  }

  // Moderate condition
  return {
    score: 'needs_improvement',
    label: 'يحتاج تحسين',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    reason: `الحملة متقاربة مع متوسط المتجر (عائد ${roas.toFixed(2)}x). توجد فرصة لتقليل تكلفة الاكتساب.`,
    actionRecommendation: '🟡 التوصية: تجربة زوايا تصوير وخطافات محتوى جديدة (A/B Test) وإعادة استهداف المهتمين.',
  };
}
