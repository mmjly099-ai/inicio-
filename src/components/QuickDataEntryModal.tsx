import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Megaphone,
  Video,
  UserPlus,
  Receipt,
  Calendar,
  ShoppingBag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Platform, CampaignObjective, ContentType, LeadStatus, ExpenseCategory, PlanItemStatus } from '../types';

export type QuickEntryTab = 'daily_metric' | 'campaign' | 'content' | 'lead' | 'expense' | 'plan' | 'order';

interface QuickDataEntryModalProps {
  isOpen: boolean;
  initialTab?: QuickEntryTab;
  onClose: () => void;
  preselectedCampaignId?: string;
}

export const QuickDataEntryModal: React.FC<QuickDataEntryModalProps> = ({
  isOpen,
  initialTab = 'daily_metric',
  onClose,
  preselectedCampaignId,
}) => {
  const {
    campaigns,
    customers,
    addDailyMetric,
    addCampaign,
    addContent,
    addLead,
    addExpense,
    addPlanItem,
    addOrder,
    canEdit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<QuickEntryTab>(initialTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active non-deleted campaigns
  const activeCampaigns = campaigns.filter(c => !c.deleted_at);

  // Form states
  // 1. Daily Metric Form
  const [metricCampaignId, setMetricCampaignId] = useState(preselectedCampaignId || (activeCampaigns[0]?.id || ''));

  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (preselectedCampaignId) {
        setMetricCampaignId(preselectedCampaignId);
      } else if (activeCampaigns.length > 0 && !metricCampaignId) {
        setMetricCampaignId(activeCampaigns[0].id);
      }
    }
  }, [isOpen, initialTab, preselectedCampaignId]);
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [metricSpend, setMetricSpend] = useState<number | ''>('');
  const [metricReach, setMetricReach] = useState<number | ''>('');
  const [metricImpressions, setMetricImpressions] = useState<number | ''>('');
  const [metricClicks, setMetricClicks] = useState<number | ''>('');
  const [metricMessages, setMetricMessages] = useState<number | ''>('');
  const [metricLeads, setMetricLeads] = useState<number | ''>('');
  const [metricNewCustomers, setMetricNewCustomers] = useState<number | ''>('');
  const [metricOrders, setMetricOrders] = useState<number | ''>('');
  const [metricRevenue, setMetricRevenue] = useState<number | ''>('');
  const [metricNotes, setMetricNotes] = useState('');

  // 2. Campaign Form
  const [cmpName, setCmpName] = useState('');
  const [cmpPlatform, setCmpPlatform] = useState<Platform>('tiktok');
  const [cmpObjective, setCmpObjective] = useState<CampaignObjective>('sales');
  const [cmpBudget, setCmpBudget] = useState<number | ''>('');
  const [cmpStartDate, setCmpStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [cmpEndDate, setCmpEndDate] = useState('');
  const [cmpTargetAudience, setCmpTargetAudience] = useState('');

  // 3. Content Form
  const [cntTitle, setCntTitle] = useState('');
  const [cntCampaignId, setCntCampaignId] = useState(activeCampaigns[0]?.id || '');
  const [cntPlatform, setCntPlatform] = useState<Platform>('instagram');
  const [cntType, setCntType] = useState<ContentType>('reel');
  const [cntHook, setCntHook] = useState('');
  const [cntCreator, setCntCreator] = useState('');
  const [cntPublishDate, setCntPublishDate] = useState(new Date().toISOString().split('T')[0]);

  // 4. Lead Form
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadPlatform, setLeadPlatform] = useState<Platform>('whatsapp');
  const [leadCampaignId, setLeadCampaignId] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('new');
  const [leadNotes, setLeadNotes] = useState('');

  // 5. Expense Form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('paid_ads');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCampaignId, setExpCampaignId] = useState('');
  const [expPaymentMethod, setExpPaymentMethod] = useState('تحويل بنكي');

  // 6. Plan Item Form
  const [planTitle, setPlanTitle] = useState('');
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [planPlatform, setPlanPlatform] = useState<Platform>('tiktok');
  const [planContentType, setPlanContentType] = useState<ContentType>('reel');
  const [planHook, setPlanHook] = useState('');
  const [planAssignedTo, setPlanAssignedTo] = useState('');
  const [planStatus, setPlanStatus] = useState<PlanItemStatus>('idea');

  // 7. Order Form
  const [ordCustomerName, setOrdCustomerName] = useState('');
  const [ordCustomerPhone, setOrdCustomerPhone] = useState('');
  const [ordAmount, setOrdAmount] = useState<number | ''>('');
  const [ordCost, setOrdCost] = useState<number | ''>('');
  const [ordPlatform, setOrdPlatform] = useState<Platform>('instagram');
  const [ordCampaignId, setOrdCampaignId] = useState('');
  const [ordNotes, setOrdNotes] = useState('');

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  const handleMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricCampaignId) {
      setErrorMsg('يرجى اختيار الحملة أولاً');
      return;
    }
    if (metricSpend === '' || Number(metricSpend) < 0) {
      setErrorMsg('يرجى إدخال مبلغ الصرف بشكل صحيح');
      return;
    }

    addDailyMetric({
      campaignId: metricCampaignId,
      date: metricDate,
      spend: Number(metricSpend) || 0,
      reach: Number(metricReach) || 0,
      impressions: Number(metricImpressions) || 0,
      clicks: Number(metricClicks) || 0,
      messages: Number(metricMessages) || 0,
      leads: Number(metricLeads) || 0,
      newCustomers: Number(metricNewCustomers) || 0,
      orders: Number(metricOrders) || 0,
      revenue: Number(metricRevenue) || 0,
      notes: metricNotes,
    });

    showNotification('تم تسجيل الأداء اليومي للحملة بنجاح وتحديث التحليلات فوراً!');
    setMetricSpend('');
    setMetricReach('');
    setMetricImpressions('');
    setMetricClicks('');
    setMetricMessages('');
    setMetricLeads('');
    setMetricNewCustomers('');
    setMetricOrders('');
    setMetricRevenue('');
    setMetricNotes('');
  };

  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpName.trim()) {
      setErrorMsg('يرجى كتابة اسم الحملة');
      return;
    }
    if (cmpBudget === '' || Number(cmpBudget) <= 0) {
      setErrorMsg('يرجى تحديد ميزانية صحيحة للحملة');
      return;
    }

    addCampaign({
      name: cmpName.trim(),
      platform: cmpPlatform,
      objective: cmpObjective,
      budget: Number(cmpBudget),
      startDate: cmpStartDate,
      endDate: cmpEndDate || undefined,
      status: 'active',
      targetAudience: cmpTargetAudience,
    });

    showNotification(`تم إنشاء الحملة الإعلانية "${cmpName}" بنجاح!`);
    setCmpName('');
    setCmpBudget('');
    setCmpTargetAudience('');
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntTitle.trim()) {
      setErrorMsg('يرجى كتابة عنوان المحتوى');
      return;
    }

    addContent({
      title: cntTitle.trim(),
      campaignId: cntCampaignId || undefined,
      platform: cntPlatform,
      type: cntType,
      hook: cntHook,
      creator: cntCreator,
      publishDate: cntPublishDate,
      status: 'published',
      views: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      messages: 0,
      leads: 0,
      orders: 0,
      revenue: 0,
    });

    showNotification(`تمت إضافة المحتوى التسويقي "${cntTitle}" بنجاح!`);
    setCntTitle('');
    setCntHook('');
    setCntCreator('');
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل ورقم الهاتف');
      return;
    }

    addLead({
      name: leadName.trim(),
      phone: leadPhone.trim(),
      platform: leadPlatform,
      campaignId: leadCampaignId || undefined,
      status: leadStatus,
      notes: leadNotes,
    });

    showNotification(`تم تسجيل العميل المحتمل "${leadName}" بنجاح!`);
    setLeadName('');
    setLeadPhone('');
    setLeadNotes('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount === '' || Number(expAmount) <= 0) {
      setErrorMsg('يرجى ملء تفاصيل المصروف والمبلغ بشكل صحيح');
      return;
    }

    addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      expenseDate: expDate,
      campaignId: expCampaignId || undefined,
      paymentMethod: expPaymentMethod,
    });

    showNotification(`تم تسجيل المصروف بمبلغ ${expAmount} ر.س بنجاح!`);
    setExpTitle('');
    setExpAmount('');
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      setErrorMsg('يرجى كتابة عنوان خطة المحتوى');
      return;
    }

    addPlanItem({
      title: planTitle.trim(),
      date: planDate,
      platform: planPlatform,
      contentType: planContentType,
      hook: planHook,
      assignedTo: planAssignedTo || 'فريق التسويق',
      status: planStatus,
    });

    showNotification(`تمت إضافة الفكرة إلى الخطة التسويقية بنجاح!`);
    setPlanTitle('');
    setPlanHook('');
    setPlanAssignedTo('');
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordCustomerName.trim() || ordAmount === '' || Number(ordAmount) <= 0) {
      setErrorMsg('يرجى إدخال اسم العميل وقيمة الطلب بشكل صحيح');
      return;
    }

    const orderAmt = Number(ordAmount);
    const orderCost = Number(ordCost) || Math.round(orderAmt * 0.4);
    const profit = orderAmt - orderCost;

    addOrder({
      orderNumber: `TOP-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: `cust-${Date.now()}`,
      customerName: ordCustomerName.trim(),
      campaignId: ordCampaignId || undefined,
      platform: ordPlatform,
      orderDate: new Date().toISOString().split('T')[0],
      amount: orderAmt,
      cost: orderCost,
      profit,
      status: 'new',
      notes: ordNotes,
    });

    showNotification(`تم تسجيل الطلب للعميل "${ordCustomerName}" بقيمة ${ordAmount} ر.س بنجاح!`);
    setOrdCustomerName('');
    setOrdCustomerPhone('');
    setOrdAmount('');
    setOrdCost('');
    setOrdNotes('');
  };

  return (
    <div
      id="quick-entry-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="quick-entry-modal-container"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col text-right overflow-hidden transform transition-all my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            id="close-quick-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-end">
              <span>نافذة الإدخال السريع</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إدخال مباشر وفوري لبيانات التسويق والحملات في TOP STORE
            </p>
          </div>
        </div>

        {/* Tab selection pills */}
        <div className="p-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveTab('daily_metric'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'daily_metric'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>نتيجة أداء يومي</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('campaign'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>حملة جديدة</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('lead'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lead'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>عميل محتمل</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('order'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'order'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>طلب تسويق</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('content'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>محتوى إعلاني</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('expense'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>مصروف</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('plan'); setErrorMsg(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>فكرة بالخطة</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {!canEdit ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-semibold">صلاحية مشاهدة فقط (Viewer)</p>
              <p className="text-xs text-slate-400 mt-1">
                قم بالتبديل إلى دور "مسؤول" أو "مسوق" من شريط التنقل لإضافة البيانات وتعديلها.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: DAILY METRIC */}
              {activeTab === 'daily_metric' && (
                <form onSubmit={handleMetricSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الحملة الإعلانية *
                      </label>
                      <select
                        value={metricCampaignId}
                        onChange={e => setMetricCampaignId(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">اختر الحملة...</option>
                        {activeCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.platform})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        تاريخ الأداء *
                      </label>
                      <input
                        type="date"
                        value={metricDate}
                        onChange={e => setMetricDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                      <label className="block text-xs font-bold text-blue-900 mb-1">
                        الإنفاق اليومي (ر.س) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="مثال: 250"
                        value={metricSpend}
                        onChange={e => setMetricSpend(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        قيمة المبيعات (ر.س) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="مثال: 3200"
                        value={metricRevenue}
                        onChange={e => setMetricRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        عدد الطلبات المحققة
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="مثال: 12"
                        value={metricOrders}
                        onChange={e => setMetricOrders(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        الرسائل المستلمة
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricMessages}
                        onChange={e => setMetricMessages(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        عملاء محتملون (Leads)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricLeads}
                        onChange={e => setMetricLeads(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        عملاء جدد فعلياً
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricNewCustomers}
                        onChange={e => setMetricNewCustomers(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        النقرات (Clicks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricClicks}
                        onChange={e => setMetricClicks(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        مرات الظهور (Impressions)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricImpressions}
                        onChange={e => setMetricImpressions(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        الوصول (Reach)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricReach}
                        onChange={e => setMetricReach(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      ملاحظات اليوم (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تفاعل عالي مع زاوية تصوير حقيبة السفر..."
                      value={metricNotes}
                      onChange={e => setMetricNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-daily-metric-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      حفظ وتحديث المؤشرات الذكية
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: NEW CAMPAIGN */}
              {activeTab === 'campaign' && (
                <form onSubmit={handleCampaignSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم الحملة الإعلانية *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: حملة حقائب السفر الذكية المقاومة للسرقة"
                      value={cmpName}
                      onChange={e => setCmpName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        المنصة *
                      </label>
                      <select
                        value={cmpPlatform}
                        onChange={e => setCmpPlatform(e.target.value as Platform)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="tiktok">تيك توك (TikTok)</option>
                        <option value="instagram">انستغرام (Instagram)</option>
                        <option value="snapchat">سناب شات (Snapchat)</option>
                        <option value="whatsapp">واتساب (WhatsApp)</option>
                        <option value="facebook">فيسبوك (Facebook)</option>
                        <option value="google">إعلانات جوجل (Google)</option>
                        <option value="other">منصة أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        هدف الحملة *
                      </label>
                      <select
                        value={cmpObjective}
                        onChange={e => setCmpObjective(e.target.value as CampaignObjective)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="sales">مبيعات وطلبات (Sales)</option>
                        <option value="messages">رسائل وتواصل (Messages)</option>
                        <option value="leads">جمع عملاء محتملين (Leads)</option>
                        <option value="retargeting">إعادة استهداف (Retargeting)</option>
                        <option value="awareness">وعي بالعلامة (Awareness)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الميزانية المخصصة (ر.س) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="مثال: 4500"
                        value={cmpBudget}
                        onChange={e => setCmpBudget(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تاريخ البدء *
                      </label>
                      <input
                        type="date"
                        value={cmpStartDate}
                        onChange={e => setCmpStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تاريخ الانتهاء (اختياري)
                      </label>
                      <input
                        type="date"
                        value={cmpEndDate}
                        onChange={e => setCmpEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      الجمهور المستهدف والملاحظات
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: رواد الأعمال وعشاق السفر (25-45 سنة) في السعودية والخليج"
                      value={cmpTargetAudience}
                      onChange={e => setCmpTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-new-campaign-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      إنشاء الحملة وحفظها
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: NEW LEAD */}
              {activeTab === 'lead' && (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        اسم العميل المحتمل *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: ناصر القحطاني"
                        value={leadName}
                        onChange={e => setLeadName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        رقم الجوال / الواتساب *
                      </label>
                      <input
                        type="text"
                        placeholder="05xxxxxxxx"
                        value={leadPhone}
                        onChange={e => setLeadPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        مصدر الإعلان / المنصة
                      </label>
                      <select
                        value={leadPlatform}
                        onChange={e => setLeadPlatform(e.target.value as Platform)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="whatsapp">واتساب (WhatsApp)</option>
                        <option value="tiktok">تيك توك (TikTok)</option>
                        <option value="instagram">انستغرام (Instagram)</option>
                        <option value="snapchat">سناب شات (Snapchat)</option>
                        <option value="facebook">فيسبوك (Facebook)</option>
                        <option value="google">جوجل (Google)</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الحملة المرتبطة
                      </label>
                      <select
                        value={leadCampaignId}
                        onChange={e => setLeadCampaignId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="">بدون حملة محددة</option>
                        {activeCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        حالة العميل
                      </label>
                      <select
                        value={leadStatus}
                        onChange={e => setLeadStatus(e.target.value as LeadStatus)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="new">عميل جديد (New)</option>
                        <option value="contacted">تم التواصل معه</option>
                        <option value="qualified">مؤهل للشراء</option>
                        <option value="opportunity">فرصة بيعية نشطة</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      ملاحظات أو المنتجات التي سأل عنها
                    </label>
                    <textarea
                      rows={2}
                      placeholder="استفسر عن توفر لون التيتانيوم وموعد التوصيل للرياض..."
                      value={leadNotes}
                      onChange={e => setLeadNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-lead-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      حفظ العميل المحتمل
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: NEW ORDER */}
              {activeTab === 'order' && (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        اسم العميل *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: محمد بن فيصل"
                        value={ordCustomerName}
                        onChange={e => setOrdCustomerName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        قيمة الطلب الإجمالية (ر.س) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="مثال: 480"
                        value={ordAmount}
                        onChange={e => setOrdAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        المنصة / المصدر
                      </label>
                      <select
                        value={ordPlatform}
                        onChange={e => setOrdPlatform(e.target.value as Platform)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="tiktok">تيك توك</option>
                        <option value="instagram">انستغرام</option>
                        <option value="whatsapp">واتساب</option>
                        <option value="snapchat">سناب شات</option>
                        <option value="facebook">فيسبوك</option>
                        <option value="google">جوجل</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الحملة التسويقية
                      </label>
                      <select
                        value={ordCampaignId}
                        onChange={e => setOrdCampaignId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="">طلب تسويقي عام</option>
                        {activeCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تكلفة الشحن/البضاعة (ر.س)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="مثال: 190"
                        value={ordCost}
                        onChange={e => setOrdCost(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      تفاصيل المنتج والطلب
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: حقيبة سفر ذكية كربون فايبر 20 بوصة"
                      value={ordNotes}
                      onChange={e => setOrdNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-order-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      تسجيل الطلب واحتساب الأرباح
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: NEW CONTENT */}
              {activeTab === 'content' && (
                <form onSubmit={handleContentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      عنوان المحتوى الإعلاني *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فيديو ريلز استعراض فتح صندوق حقيبة السفر"
                      value={cntTitle}
                      onChange={e => setCntTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center justify-between">
                      <span>الخطاف الإعلاني أو الزاوية البيعية (Hook) *</span>
                      <span className="text-[11px] text-blue-600 font-normal">أول 3 ثوانٍ تجذب المشاهد</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: هل تعبت من انكسار حقيبتك في المطار؟ شوف الحل الذكي!"
                      value={cntHook}
                      onChange={e => setCntHook(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-blue-50/50 border border-blue-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        نوع المحتوى
                      </label>
                      <select
                        value={cntType}
                        onChange={e => setCntType(e.target.value as ContentType)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="reel">فيديو ريلز (Reel)</option>
                        <option value="carousel">كاروسيل صور (Carousel)</option>
                        <option value="story">ستوري تفاعلي (Story)</option>
                        <option value="video">فيديو إعلاني (Video)</option>
                        <option value="post">بوست عادي (Post)</option>
                        <option value="other">نوع آخر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        المنصة
                      </label>
                      <select
                        value={cntPlatform}
                        onChange={e => setCntPlatform(e.target.value as Platform)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="tiktok">تيك توك</option>
                        <option value="instagram">انستغرام</option>
                        <option value="snapchat">سناب شات</option>
                        <option value="facebook">فيسبوك</option>
                        <option value="whatsapp">واتساب</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الحملة التابعة
                      </label>
                      <select
                        value={cntCampaignId}
                        onChange={e => setCntCampaignId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="">محتوى مستقل</option>
                        {activeCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        المصمم أو صانع المحتوى
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: فريق الإنتاج"
                        value={cntCreator}
                        onChange={e => setCntCreator(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تاريخ النشر
                      </label>
                      <input
                        type="date"
                        value={cntPublishDate}
                        onChange={e => setCntPublishDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-content-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      حفظ المحتوى الإعلاني
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 6: NEW EXPENSE */}
              {activeTab === 'expense' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      وصف بند المصروف *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: جلسة تصوير فوتوغرافي للمنتجات الجديدة"
                      value={expTitle}
                      onChange={e => setExpTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        المبلغ (ر.س) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="مثال: 1200"
                        value={expAmount}
                        onChange={e => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        فئة المصروف *
                      </label>
                      <select
                        value={expCategory}
                        onChange={e => setExpCategory(e.target.value as ExpenseCategory)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="content_design">صناعة محتوى وتصميم</option>
                        <option value="paid_ads">إعلانات ممولة إضافية</option>
                        <option value="influencers">مؤثرين ورعايات</option>
                        <option value="tools_software">أدوات واشتراكات تقنية</option>
                        <option value="other">مصاريف أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تاريخ المصروف
                      </label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={e => setExpDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        الحملة المرتبطة (إن وجدت)
                      </label>
                      <select
                        value={expCampaignId}
                        onChange={e => setExpCampaignId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="">مصروف تسويقي عام</option>
                        {activeCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        طريقة السداد
                      </label>
                      <input
                        type="text"
                        value={expPaymentMethod}
                        onChange={e => setExpPaymentMethod(e.target.value)}
                        placeholder="تحويل بنكي / مدى"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-expense-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      حفظ المصروف التسويقي
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 7: PLAN ITEM */}
              {activeTab === 'plan' && (
                <form onSubmit={handlePlanSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      عنوان المنشور أو الفكرة *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فيديو مقارنة بين منتجنا والمنتجات المقلدة"
                      value={planTitle}
                      onChange={e => setPlanTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الخطاف الإعلاني أو الرسالة الرئيسية
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: قبل أن تشتري حقيبة السفر.. انتبه من هذا الفخ!"
                      value={planHook}
                      onChange={e => setPlanHook(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        تاريخ النشر المستهدف
                      </label>
                      <input
                        type="date"
                        value={planDate}
                        onChange={e => setPlanDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        المنصة
                      </label>
                      <select
                        value={planPlatform}
                        onChange={e => setPlanPlatform(e.target.value as Platform)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        <option value="tiktok">تيك توك</option>
                        <option value="instagram">انستغرام</option>
                        <option value="whatsapp">واتساب</option>
                        <option value="snapchat">سناب شات</option>
                        <option value="facebook">فيسبوك</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        المسؤول عن التنفيذ
                      </label>
                      <input
                        type="text"
                        placeholder="سارة / عبدالرحمن"
                        value={planAssignedTo}
                        onChange={e => setPlanAssignedTo(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-plan-item-btn"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      إضافة إلى جدول الخطة
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
