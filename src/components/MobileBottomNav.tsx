import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  PlusCircle,
  MoreHorizontal,
  ShoppingBag,
  BarChart3,
  Users,
} from 'lucide-react';
import { PageId } from './Sidebar';

interface MobileBottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenQuickEntry: () => void;
  onOpenMobileMenu: () => void;
  canEdit: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenQuickEntry,
  onOpenMobileMenu,
  canEdit,
}) => {
  const navItems = [
    {
      id: 'dashboard' as PageId,
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'campaigns' as PageId,
      label: 'الحملات',
      icon: Megaphone,
    },
    {
      id: 'plan' as PageId,
      label: 'التقويم',
      icon: CalendarDays,
    },
    {
      id: 'orders' as PageId,
      label: 'الطلبات',
      icon: ShoppingBag,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentPage === 'dashboard'
              ? 'text-blue-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">الرئيسية</span>
        </button>

        {/* Tab 2: Campaigns */}
        <button
          type="button"
          onClick={() => onNavigate('campaigns')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentPage === 'campaigns'
              ? 'text-blue-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">الحملات</span>
        </button>

        {/* Center Action: Floating Quick Entry FAB */}
        {canEdit ? (
          <button
            type="button"
            onClick={onOpenQuickEntry}
            aria-label="إدخال سريع فوري"
            className="flex flex-col items-center justify-center -mt-5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 border-2 border-white ring-2 ring-blue-100">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 mt-1">إضافة</span>
          </button>
        ) : null}

        {/* Tab 3: Marketing Calendar & Plan */}
        <button
          type="button"
          onClick={() => onNavigate('plan')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentPage === 'plan'
              ? 'text-blue-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">التقويم</span>
        </button>

        {/* Tab 4: More / All Sections */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] text-slate-500 hover:text-slate-900"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">المزيد</span>
        </button>
      </div>
    </nav>
  );
};
