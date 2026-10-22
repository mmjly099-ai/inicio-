import React, { useState } from 'react';
import {
  Menu,
  Plus,
  ShieldCheck,
  UserCheck,
  Eye,
  Database,
  Globe,
  HelpCircle,
  Check,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenQuickEntry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenQuickEntry }) => {
  const { currentUser, users, switchUserRole, isDemoMode, loadDemoData, clearToEmptyData, canEdit } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            مسؤول (كامل الصلاحيات)
          </span>
        );
      case 'marketer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            مسوق (إدخال وتعديل)
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Eye className="w-3.5 h-3.5" />
            مشاهد (تقارير فقط)
          </span>
        );
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

          {/* Demo Mode Toggle Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="demo-mode-dropdown-btn"
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">
                {isDemoMode ? 'وضع تجريبي نشط' : 'نظام فعلي نظيف'}
              </span>
              <span className="md:hidden">
                {isDemoMode ? 'تجريبي' : 'نظيف'}
              </span>
            </button>

            {demoMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 text-right animate-in fade-in duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-xs font-bold text-slate-800 mb-1">
                  إدارة نمط البيانات
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                  يمكنك التبديل بين البيانات التجريبية الغنية لتفقد كافة الميزات أو البدء بنظام فارغ للإدخال اليدوي الحقيقي.
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      loadDemoData();
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDemoMode ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>تحميل بيانات تجريبية واقعية</span>
                    {isDemoMode && <Check className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearToEmptyData();
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isDemoMode ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>تفريغ للبيانات الحقيقية (جديد)</span>
                    {!isDemoMode && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              type="button"
              id="user-role-dropdown-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.role === 'admin' ? 'مسؤول' : currentUser.role === 'marketer' ? 'مسوق' : 'مشاهد'}
                </p>
              </div>
            </button>

            {roleMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-40 text-right animate-in fade-in duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-2 py-1.5 mb-1 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>

                <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
                  تبديل الصلاحية (للاختبار والمحاكاة):
                </div>

                <div className="space-y-1">
                  {(['admin', 'marketer', 'viewer'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        switchUserRole(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        currentUser.role === role ? 'bg-blue-50 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {role === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                        {role === 'marketer' && <UserCheck className="w-4 h-4 text-blue-600" />}
                        {role === 'viewer' && <Eye className="w-4 h-4 text-slate-500" />}
                        <span>
                          {role === 'admin' ? 'مسؤول (كامل الصلاحيات)' : role === 'marketer' ? 'مسوق (إدخال وتعديل)' : 'مشاهد (استعراض فقط)'}
                        </span>
                      </div>
                      {currentUser.role === role && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
