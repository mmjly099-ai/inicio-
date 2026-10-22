import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Video,
  UserPlus,
  Users,
  ShoppingBag,
  Receipt,
  CalendarDays,
  BarChart3,
  History,
  Settings,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type PageId =
  | 'dashboard'
  | 'campaigns'
  | 'content'
  | 'leads'
  | 'customers'
  | 'orders'
  | 'expenses'
  | 'plan'
  | 'analytics'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const { campaigns, leads, orders, auditLogs } = useApp();

  const activeCampaignsCount = campaigns.filter(c => !c.deleted_at && c.status === 'active').length;
  const newLeadsCount = leads.filter(l => !l.deleted_at && l.status === 'new').length;
  const newOrdersCount = orders.filter(o => !o.deleted_at && o.status === 'new').length;

  const navItems = [
    {
      id: 'dashboard' as PageId,
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'campaigns' as PageId,
      label: 'الحملات الإعلانية',
      icon: Megaphone,
      badge: activeCampaignsCount > 0 ? `${activeCampaignsCount} نشطة` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'content' as PageId,
      label: 'المحتوى والخطافات',
      icon: Video,
      badge: null,
    },
    {
      id: 'leads' as PageId,
      label: 'العملاء المحتملون (Leads)',
      icon: UserPlus,
      badge: newLeadsCount > 0 ? `${newLeadsCount} جديد` : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'customers' as PageId,
      label: 'العملاء الفعليون',
      icon: Users,
      badge: null,
    },
    {
      id: 'orders' as PageId,
      label: 'طلبات التسويق',
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? `${newOrdersCount} جديد` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'expenses' as PageId,
      label: 'المصروفات التسويقية',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'plan' as PageId,
      label: 'التقويم وخطة التسويق',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'analytics' as PageId,
      label: 'التحليلات والتقارير',
      icon: BarChart3,
      badge: 'مقارنات',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'audit' as PageId,
      label: 'سجل التدقيق والمحذوفات',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as PageId,
      label: 'الإعدادات والنسخ الاحتياطي',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 lg:top-[61px] right-0 h-full lg:h-[calc(100vh-61px)] w-68 bg-white border-l border-slate-200/80 shadow-lg lg:shadow-none z-40 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1 scrollbar-thin">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            أقسام النظام الرئيسية
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Store Slogan Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-extrabold tracking-wide">TOP STORE</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">"أسواق العالم بين يديك"</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              تحويل مدخلات التسويق اليومية إلى قرارات استثمارية مدروسة.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
