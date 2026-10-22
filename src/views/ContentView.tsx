import React, { useState, useMemo } from 'react';
import {
  Video,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShoppingBag,
  Trash2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentItem, ContentType, Platform } from '../types';
import { formatCurrency, formatNumber, calculateEngagementRate } from '../utils/calculations';
import { ConfirmModal } from '../components/ConfirmModal';

interface ContentViewProps {
  onOpenQuickEntry: (tab: any) => void;
}

export const ContentView: React.FC<ContentViewProps> = ({ onOpenQuickEntry }) => {
  const { content, campaigns, softDeleteContent, canEdit, canDelete } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  const activeContent = useMemo(() => {
    return content.filter(c => {
      if (c.deleted_at) return false;
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchHook = c.hook.toLowerCase().includes(q);
        const matchCreator = (c.creator || '').toLowerCase().includes(q);
        if (!matchTitle && !matchHook && !matchCreator) return false;
      }
      return true;
    });
  }, [content, platformFilter, typeFilter, searchQuery]);

  const getTypeBadge = (type: ContentType) => {
    const labels: Record<ContentType, string> = {
      reel: 'فيديو ريلز (Reel)',
      carousel: 'كاروسيل (Carousel)',
      story: 'ستوري (Story)',
      video: 'فيديو إعلاني (Video)',
      post: 'بوست (Post)',
      other: 'أخرى',
    };
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
            <span>المحتوى الإعلاني والخطافات (Creatives & Hooks)</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeContent.length} مادة إعلانية
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة أداء الفيديوهات والصور والخطافات الأكثر جذباً للعملاء وتحقيقاً للمبيعات في توب ستور.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenQuickEntry('content')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>محتوى إعلاني جديد</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالعنوان، الخطاف، أو صانع المحتوى..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع المنصات</option>
            <option value="tiktok">تيك توك</option>
            <option value="instagram">انستغرام</option>
            <option value="snapchat">سناب شات</option>
            <option value="whatsapp">واتساب</option>
            <option value="facebook">فيسبوك</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            <option value="all">جميع أنواع المحتوى</option>
            <option value="reel">ريلز (Reel)</option>
            <option value="carousel">كاروسيل (Carousel)</option>
            <option value="story">ستوري (Story)</option>
            <option value="video">فيديو (Video)</option>
            <option value="post">بوست (Post)</option>
          </select>
        </div>
      </div>

      {/* Content Cards */}
      {activeContent.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">لا يوجد محتوى تسويقي مسجل</p>
          <p className="text-xs text-slate-400 mt-1">
            أضف مقاطع الريلز أو المنشورات وسجل أرقام التفاعل والمبيعات الناتجة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeContent.map(item => {
            const engResult = calculateEngagementRate(item);
            const parentCampaign = campaigns.find(c => c.id === item.campaignId);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {item.platform}
                      </span>
                      {getTypeBadge(item.type)}
                      {parentCampaign && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          حملة: {parentCampaign.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.publishDate}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-950 leading-snug">
                    {item.title}
                  </h3>

                  {/* Hook Box */}
                  <div className="my-3 p-3 bg-gradient-to-r from-amber-50/70 to-blue-50/40 rounded-xl border border-amber-200/70 text-xs">
                    <span className="font-extrabold text-amber-900 block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      الخطاف الإعلاني (Hook / زاوية البيع):
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      "{item.hook}"
                    </p>
                  </div>

                  {/* Key Results Numbers */}
                  <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 my-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">المشاهدات</span>
                      <span className="text-xs font-bold text-slate-800">{formatNumber(item.views)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الوصول</span>
                      <span className="text-xs font-bold text-slate-800">{formatNumber(item.reach)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الرسائل</span>
                      <span className="text-xs font-bold text-slate-800">{formatNumber(item.messages)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المبيعات</span>
                      <span className="text-xs font-black text-emerald-600">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>

                  {/* Interactions breakdown */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 py-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {formatNumber(item.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        {formatNumber(item.comments)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                        {formatNumber(item.shares)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                        {formatNumber(item.saves)}
                      </span>
                    </div>

                    <div className="font-bold text-slate-700">
                      معدل التفاعل: <span className="text-blue-600">{engResult.formatted}</span>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    صانع المحتوى: <strong className="text-slate-700">{item.creator || 'فريق المتجر'}</strong>
                  </span>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="نقل إلى سلة المحذوفات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد نقل المحتوى إلى سلة المحذوفات"
        message={`هل أنت متأكد من نقل مادة المحتوى "${itemToDelete?.title}" إلى سلة المحذوفات؟ لن يتم حذفها نهائياً، ويمكن استعادتها لاحقاً.`}
        confirmLabel="نقل لسلة المحذوفات"
        onConfirm={() => {
          if (itemToDelete) {
            softDeleteContent(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
