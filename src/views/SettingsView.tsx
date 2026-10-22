import React, { useRef, useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileJson,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    exportBackupJSON,
    importBackupJSON,
    loadDemoData,
    clearToEmptyData,
    isDemoMode,
    campaigns,
    customers,
    leads,
    orders,
    metrics,
    expenses,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);

  // CSV Export Helpers
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row)
        .map(val => (typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val))
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('تمت استعادة النسخة الاحتياطية بنجاح.');
        } else {
          setImportStatus('خطأ: الملف المرفوع لا يطابق بنية بيانات توب ستور.');
        }
      } catch (err) {
        setImportStatus('خطأ في قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>الإعدادات والنسخ الاحتياطي وتصدير البيانات</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          إدارة حفظ واستعادة بيانات TOP STORE محلياً وتصدير ملفات Excel/CSV للحسابات والإداريين.
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-between">
          <span>{importStatus}</span>
          <button
            type="button"
            onClick={() => setImportStatus(null)}
            className="text-xs underline text-blue-700"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Brand Identity Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>بيانات هوية المتجر (Store Identity)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">اسم النظام</span>
            <span className="font-extrabold text-slate-900 text-sm">
              تحليلات التسويق في المتاجر الكبرى
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">المتجر والشعار</span>
            <span className="font-extrabold text-slate-900 text-sm">
              TOP STORE | "أسواق العالم بين يديك"
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">العملة والمنطقة</span>
            <span className="font-extrabold text-slate-900 text-sm">
              الريال السعودي (ر.س - SAR) • المملكة العربية السعودية
            </span>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-emerald-600" />
          <span>النسخ الاحتياطي الكامل للنظام (JSON Backup & Restore)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          قم بحفظ نسخة كاملة من كل بياناتك (الحملات، المبيعات، العملاء، النفقات) واستعادتها في أي وقت بضغطة زر.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="export-json-backup-btn"
            onClick={exportBackupJSON}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل نسخة احتياطية كاملة (JSON)</span>
          </button>

          <button
            type="button"
            id="import-json-backup-btn"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>استيراد واستعادة نسخة احتياطية</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* CSV / Excel Export Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>تصدير الجداول إلى ملفات CSV / Excel</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          تصدير مجموعات البيانات الفردية لفتحها وتحليلها في برامج جداول البيانات.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => exportToCSV(campaigns.filter(c => !c.deleted_at), 'top_store_campaigns')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">الحملات الإعلانية</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(customers.filter(c => !c.deleted_at), 'top_store_customers')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">قاعدة العملاء</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(orders.filter(o => !o.deleted_at), 'top_store_orders')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">طلبات التسويق</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(leads.filter(l => !l.deleted_at), 'top_store_leads')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">العملاء المحتملون</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Database Reset / Demo Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600" />
          <span>إدارة وضع البيانات (تجريبي / فعلي نظيف)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          يمكنك إعادة ملء النظام بالبيانات التجريبية الواقعية لاختبار التحليلات، أو تفريغ النظام لبدء تسجيل بيانات حقيقية لـ TOP STORE.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmDemoOpen(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            إعادة تحميل البيانات التجريبية الشاملة
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            تفريغ النظام للبدء ببيانات متجرك الحقيقية
          </button>
        </div>
      </div>

      {/* Confirmation for Clear */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="تأكيد تفريغ النظام لبدء العمل الفعلي"
        message="هل أنت متأكد من تفريغ كافة البيانات التجريبية؟ سيصبح النظام نظيفاً وجاهزاً لإدخال بيانات توب ستور الحقيقية."
        confirmLabel="نعم، تفريغ النظام"
        isDestructive={true}
        onConfirm={() => {
          clearToEmptyData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      {/* Confirmation for Demo Reload */}
      <ConfirmModal
        isOpen={confirmDemoOpen}
        title="إعادة تحميل البيانات التجريبية"
        message="سيؤدي هذا الإجراء إلى استبدال البيانات الحالية بمجموعة غنية من بيانات الحملات والمقاييس التجريبية."
        confirmLabel="تحميل البيانات التجريبية"
        onConfirm={() => {
          loadDemoData();
          setConfirmDemoOpen(false);
        }}
        onCancel={() => setConfirmDemoOpen(false)}
      />
    </div>
  );
};
