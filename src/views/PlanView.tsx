import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Trash2,
  Tag,
  Kanban,
  Table,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Flame,
  Target,
  ArrowUpRight,
  AlertCircle,
  FileSpreadsheet,
  Share2,
  Layers,
  BarChart2,
  PlayCircle,
  Send,
  MoreVertical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketingPlanItem, PlanItemStatus, PlanItemPriority, Platform, ContentType } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface PlanViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

type ViewMode = 'calendar' | 'table' | 'kanban';

export const PlanView: React.FC<PlanViewProps> = ({ onOpenQuickEntry }) => {
  const { planItems, updatePlanItem, softDeletePlanItem, campaigns, canEdit, canDelete } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<MarketingPlanItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<MarketingPlanItem | null>(null);

  // Month navigation state for interactive calendar
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 1)); // Sept 2026 default to match store demo timeline

  // Filtered active plan items
  const activePlan = useMemo(() => {
    return planItems.filter((p: MarketingPlanItem) => {
      if (p.deleted_at) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
      if (priorityFilter !== 'all' && (p.priority || 'medium') !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAssignee = (p.assignedTo || '').toLowerCase().includes(q);
        const matchNotes = (p.notes || '').toLowerCase().includes(q);
        const matchHook = (p.hook || '').toLowerCase().includes(q);
        const matchGoal = (p.targetGoal || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAssignee && !matchNotes && !matchHook && !matchGoal) return false;
      }
      return true;
    });
  }, [planItems, statusFilter, platformFilter, priorityFilter, searchQuery]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = activePlan.length;
    const published = activePlan.filter(p => p.status === 'published').length;
    const ready = activePlan.filter(p => p.status === 'ready').length;
    const inProgress = activePlan.filter(p => p.status === 'in_progress').length;
    const ideas = activePlan.filter(p => p.status === 'idea').length;
    const highPriority = activePlan.filter(p => p.priority === 'high').length;
    return { total, published, ready, inProgress, ideas, highPriority };
  }, [activePlan]);

  const getStatusBadge = (status: PlanItemStatus) => {
    switch (status) {
      case 'idea':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            فكرة (Idea)
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            قيد الإعداد والتصوير
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            جاهز للنشر (Ready)
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            تم النشر (Published)
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: PlanItemPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            أولوية قصوى
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            أولوية متوسطة
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            أولوية عادية
          </span>
        );
      default:
        return null;
    }
  };

  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case 'tiktok':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white">تيك توك</span>;
      case 'instagram':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-600 text-white">انستغرام</span>;
      case 'snapchat':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">سناب شات</span>;
      case 'whatsapp':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">واتساب</span>;
      case 'twitter':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-100">إكس (Twitter)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white">{platform}</span>;
    }
  };

  const handleStatusChange = (id: string, newStatus: PlanItemStatus) => {
    if (!canEdit) return;
    updatePlanItem(id, { status: newStatus });
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Arabic days starting from Saturday (السبت)
  // standard js getDay(): 0 is Sunday, 6 is Saturday
  // To make Saturday first:
  const dayOffset = (firstDayIndex + 1) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    // Jump to demo month 2026-09 or actual today
    setCurrentDate(new Date(2026, 8, 1));
  };

  // Items grouped by day string 'YYYY-MM-DD'
  const itemsByDate = useMemo(() => {
    const map = new Map<string, MarketingPlanItem[]>();
    activePlan.forEach(item => {
      const existing = map.get(item.date) || [];
      existing.push(item);
      map.set(item.date, existing);
    });
    return map;
  }, [activePlan]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2.5">
                <span>جدولة وتخطيط التسويق (Marketing Schedule & Planner)</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {stats.total} مهمة وحملة
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                جدول زمني متكامل لإطلاق الحملات، تصوير الإعلانات، إدارة تقويم النشر، ومتابعة فريق TOP STORE.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          {/* Switch View Mode Controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>تقويم شهري</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول النشر</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>مراحل العمل (كانبان)</span>
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => onOpenQuickEntry('plan')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>جدولة مهمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي المهام المجدولة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">{stats.total}</span>
            <CalendarDays className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block mb-1">تم نشرها بنجاح</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-800">{stats.published}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 block mb-1">جاهزة للإطلاق والنشر</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-blue-800">{stats.ready}</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block mb-1">قيد التصوير والإعداد</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-800">{stats.inProgress}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">أفكار قيد الدراسة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-700">{stats.ideas}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 block mb-1">أولوية قصوى وعاجلة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-rose-800">{stats.highPriority}</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث بالمهمة، الخطاف الإعلاني، صانع المحتوى، الهدف، أو الملاحظات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="idea">فكرة</option>
            <option value="in_progress">قيد الإعداد</option>
            <option value="ready">جاهز للنشر</option>
            <option value="published">تم النشر</option>
          </select>

          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">كل المنصات</option>
            <option value="tiktok">تيك توك</option>
            <option value="instagram">انستغرام</option>
            <option value="snapchat">سناب شات</option>
            <option value="whatsapp">واتساب</option>
            <option value="twitter">إكس</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">كل الأولويات</option>
            <option value="high">أولوية قصوى 🔥</option>
            <option value="medium">متوسطة</option>
            <option value="low">عادية</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || platformFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPlatformFilter('all');
                setPriorityFilter('all');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT: Calendar / Table / Kanban */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Calendar Month Navigation Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {monthNamesArabic[month]} {year}
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                جدول النشر الشهري
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={jumpToToday}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white rounded-lg border border-slate-200 transition-colors"
              >
                الشهر الحالي
              </button>

              <div className="flex items-center bg-white rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-200"></div>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid Container (scrollable on mobile) */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[600px] md:min-w-0">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 border-b border-slate-200 text-center bg-slate-100/60 font-bold text-xs text-slate-600 py-2.5">
                <div>السبت</div>
                <div>الأحد</div>
                <div>الإثنين</div>
                <div>الثلاثاء</div>
                <div>الأربعاء</div>
                <div>الخميس</div>
                <div className="text-blue-700">الجمعة</div>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-x-reverse divide-y divide-slate-100">
                {/* Empty offset cells before start of month */}
                {Array.from({ length: dayOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="bg-slate-50/40 min-h-[90px] md:min-h-[110px] p-2 text-slate-300 text-xs">
                {/* Empty spacer */}
              </div>
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayItems = itemsByDate.get(dateStr) || [];
              const isToday = dateStr === '2026-09-20'; // Highlight store active day

              return (
                <div
                  key={dateStr}
                  className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors hover:bg-blue-50/30 ${
                    isToday ? 'bg-amber-50/30 ring-1 ring-inset ring-amber-400/50' : 'bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-lg ${
                          isToday
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        {dayNumber}
                      </span>

                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Items on this day */}
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItemForDetails(item)}
                          className={`w-full text-right p-1.5 rounded-lg text-[10px] font-bold border transition-all truncate block cursor-pointer ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : item.status === 'ready'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : item.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                          title={item.title}
                        >
                          <div className="flex items-center gap-1">
                            {item.time && (
                              <span className="text-[9px] text-slate-500 font-normal">
                                {item.time}
                              </span>
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>
                        </button>
                      ))}

                      {dayItems.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedItemForDetails(dayItems[3])}
                          className="w-full text-center text-[9px] font-bold text-slate-500 hover:text-blue-600 p-0.5"
                        >
                          +{dayItems.length - 3} مهام إضافية
                        </button>
                      )}
                    </div>
                  </div>

                  {canEdit && dayItems.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenQuickEntry('plan')}
                      className="text-[10px] text-slate-300 hover:text-blue-600 opacity-0 hover:opacity-100 transition-opacity self-end mt-1"
                    >
                      + إضافة
                    </button>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE VIEW MODE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">تاريخ ووقت النشر</th>
                  <th className="p-3.5">عنوان المهمة والمحتوى</th>
                  <th className="p-3.5">المنصة والنوع</th>
                  <th className="p-3.5">الهدف والخطاف</th>
                  <th className="p-3.5">المسؤول</th>
                  <th className="p-3.5">الأولوية</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activePlan.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      لا توجد مهام مطابقة للبحث أو الفلتر
                    </td>
                  </tr>
                ) : (
                  activePlan.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{item.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.time || '18:00'}</span>
                        </div>
                      </td>

                      {/* Title & Notes */}
                      <td className="p-3.5 max-w-xs">
                        <div
                          className="font-black text-slate-900 text-xs sm:text-sm hover:text-blue-600 cursor-pointer"
                          onClick={() => setSelectedItemForDetails(item)}
                        >
                          {item.title}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Platform & Type */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 mb-1">
                          {getPlatformBadge(item.platform)}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.contentType}
                        </span>
                      </td>

                      {/* Goal & Hook */}
                      <td className="p-3.5 max-w-xs">
                        {item.targetGoal && (
                          <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1 mb-0.5">
                            <Target className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{item.targetGoal}</span>
                          </div>
                        )}
                        {item.hook && (
                          <div className="text-[11px] text-amber-900 bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/60 line-clamp-2">
                            "{item.hook}"
                          </div>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.assignedTo || 'فريق التسويق'}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getPriorityBadge(item.priority || 'medium')}
                      </td>

                      {/* Status select */}
                      <td className="p-3.5 whitespace-nowrap">
                        {canEdit ? (
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value as PlanItemStatus)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer"
                          >
                            <option value="idea">فكرة</option>
                            <option value="in_progress">قيد الإعداد</option>
                            <option value="ready">جاهز للنشر</option>
                            <option value="published">تم النشر</option>
                          </select>
                        ) : (
                          getStatusBadge(item.status)
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItemForDetails(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="عرض التفاصيل"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف ونقل للمحذوفات"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. KANBAN VIEW MODE */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(
            [
              { id: 'idea', title: 'الأفكار والمقترحات (Ideas)', color: 'border-slate-300 bg-slate-50/50' },
              { id: 'in_progress', title: 'قيد الإعداد والتصوير', color: 'border-amber-300 bg-amber-50/30' },
              { id: 'ready', title: 'جاهز للإطلاق والنشر', color: 'border-blue-300 bg-blue-50/30' },
              { id: 'published', title: 'تم النشر (Published)', color: 'border-emerald-300 bg-emerald-50/30' },
            ] as const
          ).map(column => {
            const colItems = activePlan.filter(p => p.status === column.id);

            return (
              <div
                key={column.id}
                className={`rounded-2xl border-2 ${column.color} p-4 flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {column.title}
                  </h4>
                  <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                      onClick={() => setSelectedItemForDetails(item)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getPlatformBadge(item.platform)}
                          {getPriorityBadge(item.priority)}
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setItemToDelete(item);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h5 className="font-bold text-xs sm:text-sm text-slate-950 leading-snug">
                        {item.title}
                      </h5>

                      {item.hook && (
                        <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/70 leading-relaxed line-clamp-2">
                          "{item.hook}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.assignedTo || 'فريق التسويق'}</span>
                        </div>
                      </div>

                      {/* Quick status transition dropdown */}
                      {canEdit && (
                        <div className="pt-1" onClick={e => e.stopPropagation()}>
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value as PlanItemStatus)}
                            className="w-full px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50"
                          >
                            <option value="idea">نقل إلى: فكرة</option>
                            <option value="in_progress">نقل إلى: قيد الإعداد</option>
                            <option value="ready">نقل إلى: جاهز للنشر</option>
                            <option value="published">نقل إلى: تم النشر</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}

                  {colItems.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      لا توجد مهام في هذه المرحلة
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Item Detail Modal */}
      {selectedItemForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedItemForDetails(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getPlatformBadge(selectedItemForDetails.platform)}
                  {getPriorityBadge(selectedItemForDetails.priority)}
                  {getStatusBadge(selectedItemForDetails.status)}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedItemForDetails.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">موعد النشر المجدول</span>
                <span className="font-bold text-slate-900">
                  {selectedItemForDetails.date} • الساعة {selectedItemForDetails.time || '18:00'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">المسؤول عن التنفيذ</span>
                <span className="font-bold text-slate-900">
                  {selectedItemForDetails.assignedTo || 'فريق التسويق'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">نوع المحتوى</span>
                <span className="font-bold text-slate-900">
                  {selectedItemForDetails.contentType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الهدف التسويقي</span>
                <span className="font-bold text-blue-700">
                  {selectedItemForDetails.targetGoal || 'زيادة المبيعات والوصول'}
                </span>
              </div>
            </div>

            {selectedItemForDetails.hook && (
              <div>
                <span className="text-xs font-bold text-amber-800 block mb-1">
                  الخطاف الإعلاني / زاوية الفيديو (Hook):
                </span>
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-medium text-amber-950 leading-relaxed">
                  "{selectedItemForDetails.hook}"
                </div>
              </div>
            )}

            {selectedItemForDetails.notes && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  ملاحظات الخطة والتنفيذ:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedItemForDetails.notes}
                </div>
              </div>
            )}

            {/* Change Status Inside Modal */}
            {canEdit && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">تحديث الحالة:</span>
                <select
                  value={selectedItemForDetails.status}
                  onChange={e => {
                    const newSt = e.target.value as PlanItemStatus;
                    handleStatusChange(selectedItemForDetails.id, newSt);
                    setSelectedItemForDetails(prev => (prev ? { ...prev, status: newSt } : null));
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-100"
                >
                  <option value="idea">فكرة (Idea)</option>
                  <option value="in_progress">قيد الإعداد والتصوير</option>
                  <option value="ready">جاهز للنشر (Ready)</option>
                  <option value="published">تم النشر (Published)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد نقل المهمة إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل المهمة "${itemToDelete?.title}" إلى سلة المحذوفات؟`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (itemToDelete) {
            softDeletePlanItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
