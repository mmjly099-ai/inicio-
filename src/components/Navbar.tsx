import React, { useState } from 'react';
import {
  Menu,
  Plus,
  ShieldCheck,
  Globe,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenQuickEntry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenQuickEntry }) => {
  const { currentUser, canEdit, syncStatus, logoutUser } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <div
            title="متصل ومتزامن سحابياً عبر جميع أجهزتك"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">مزامنة سحابية نشطة</span>
            <span className="md:hidden">متزامن</span>
          </div>
        );
      case 'syncing':
      case 'connecting':
        return (
          <div
            title="جاري مزامنة البيانات مع السحابة"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-blue-50 text-blue-800 border-blue-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="hidden md:inline">جاري المزامنة...</span>
            <span className="md:hidden">مزامنة</span>
          </div>
        );
      case 'offline':
        return (
          <div
            title="العمل محلياً دون إنترنت — ستتم المزامنة فور عودة الاتصال"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200"
          >
            <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">حفظ محلي مؤقت</span>
            <span className="md:hidden">محلي</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header
      id="top-store-navbar"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Right side (in RTL): Menu toggle & Store Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="تبديل القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Logo Badge */}
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg tracking-wider shadow-sm border border-slate-800">
              TOP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-950 tracking-tight">
                  توب ستور | TOP STORE
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                  <Globe className="w-3 h-3 text-blue-600" />
                  "أسواق العالم بين يديك"
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                نظام إدارة وتسويق وتحليلات القرارات الذكية
              </p>
            </div>
          </div>
        </div>

        {/* Left side (in RTL): Actions & User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Quick Entry Action Button */}
          {canEdit && (
            <button
              type="button"
              id="open-quick-entry-btn"
              onClick={onOpenQuickEntry}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إدخال سريع</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          )}

          {/* Live Cloud Sync Status */}
          {renderSyncBadge()}

          {/* Workspace Profile Menu */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-dropdown-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs">
                T
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>جلسة متزامنة</span>
                </p>
              </div>
            </button>

            {userMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 text-right animate-in fade-in duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-2 py-2 mb-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">مساحة عمل TOP STORE السحابية</p>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 mb-2 flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>أدخل نفس كلمة المرور على أي هاتف أو جهاز لمزامنة جميع بيانات متجرك فوراً.</span>
                </div>

                <button
                  type="button"
                  id="sign-out-btn"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>قفل التطبيق / تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
