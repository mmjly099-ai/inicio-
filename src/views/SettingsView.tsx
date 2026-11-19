import React, { useRef, useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Cloud,
  Globe,
  FileSpreadsheet,
  FileJson,
  Trash2,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    exportBackupJSON,
    importBackupJSON,
    clearAllWorkspaceData,
    currentUser,
    syncStatus,
    campaigns,
    customers,
    leads,
    orders,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // CSV Export Helpers
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
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
    reader.onload = async event => {
      try {
        const content = event.target?.result as string;
        const success = await importBackupJSON(content);
        if (success) {
          setImportStatus('تمت استعادة النسخة الاحتياطية ومزامنتها سحابياً بنجاح.');
        } else {
          setImportStatus('خطأ: الملف المرفوع لا يطابق بنية بيانات توب ستور.');
        }
      } catch {
        setImportStatus('خطأ في قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>الإعدادات والمزامنة السحابية وتصدير البيانات</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          إدارة المزامنة الفورية عبر الهواتف والأجهزة، والنسخ الاحتياطي السحابي، وتصدير ملفات Excel/CSV.
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-between">
          <span>{importStatus}</span>
          <button
            type="button"
            onClick={() => setImportStatus(null)}
            className="text-xs underline text-blue-700 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* PWA App Install Card */}
      <PWAInstallButton variant="card" />

      {/* Cloud Sync Status Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-600" />
          <span>حالة الحفظ السحابي والمزامنة بين الأجهزة</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
            <span className="text-emerald-700 block mb-1 font-bold">حالة الاتصال السحابي</span>
            <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {syncStatus === 'offline' ? 'محفوظ محلياً (بانتظار الإنترنت)' : 'متصل ومتزامن لحظياً'}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">نظام الدخول والمزامنة</span>
            <span className="font-extrabold text-slate-900 text-sm">
              TOP STORE • محمي بكلمة المرور
            </span>
          </div>
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-blue-700 block mb-1 font-bold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              مزامنة الهواتف الأخرى
            </span>
            <span className="text-slate-700 text-xs font-semibold leading-relaxed block">
              افتح التطبيق على أي هاتف وأدخل كلمة المرور لمزامنة كل البيانات فوراً.
            </span>
          </div>
        </div>
      </div>

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
          قم بحفظ نسخة إضافية من كل بياناتك (الحملات، المبيعات، العملاء، النفقات) أو استيراد نسخة احتياطية ليتم حفظها في السحابة تلقائياً.
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
            onClick={() => exportToCSV(campaigns.filter(c => !c.deleted_at) as unknown as Record<string, unknown>[], 'top_store_campaigns')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">الحملات الإعلانية</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(customers.filter(c => !c.deleted_at) as unknown as Record<string, unknown>[], 'top_store_customers')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">قاعدة العملاء</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(orders.filter(o => !o.deleted_at) as unknown as Record<string, unknown>[], 'top_store_orders')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">طلبات التسويق</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(leads.filter(l => !l.deleted_at) as unknown as Record<string, unknown>[], 'top_store_leads')}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-right cursor-pointer"
          >
            <span className="font-bold text-xs text-slate-800 block">العملاء المحتملون</span>
            <span className="text-[10px] text-slate-400 mt-1 block">تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Clear Cloud Data Option */}
      <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>تصفير بيانات المتجر السحابية</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          في حال رغبتك بحذف كافة الحملات والطلبات والمقاييس الحالية نهائياً للبدء من الصفر عبر جميع أجهزتك.
        </p>

        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer"
        >
          مسح جميع السجلات الحالية والبدء من الصفر
        </button>
      </div>

      {/* Confirmation for Clear */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="تأكيد مسح كافة البيانات السحابية"
        message="سيتم حذف جميع الحملات والمبيعات والعملاء والمحتوى والمصروفات من قاعدة البيانات السحابية في جميع أجهزتك. يفضل تنزيل نسخة احتياطية JSON أولاً."
        confirmLabel="نعم، مسح الكل والبدء من الصفر"
        isDestructive={true}
        onConfirm={() => {
          void clearAllWorkspaceData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
