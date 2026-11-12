import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BarChart2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Save,
} from 'lucide-react';
import { ContentItem } from '../types';
import { calculateEngagementRate, formatPercent, formatCurrency } from '../utils/calculations';

interface EditContentMetricsModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ContentItem>) => void;
}

export const EditContentMetricsModal: React.FC<EditContentMetricsModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [views, setViews] = useState<number>(item.views || 0);
  const [reach, setReach] = useState<number>(item.reach || 0);
  const [likes, setLikes] = useState<number>(item.likes || 0);
  const [comments, setComments] = useState<number>(item.comments || 0);
  const [shares, setShares] = useState<number>(item.shares || 0);
  const [saves, setSaves] = useState<number>(item.saves || 0);
  const [messages, setMessages] = useState<number>(item.messages || 0);
  const [revenue, setRevenue] = useState<number>(item.revenue || 0);
  const [hook, setHook] = useState<string>(item.hook || '');

  // Calculate simulated engagement rate live
  const totalInteractions = likes + comments + shares + saves;
  const baseForRate = reach > 0 ? reach : views;
  const engagementRate = baseForRate > 0 ? (totalInteractions / baseForRate) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      views: Number(views) || 0,
      reach: Number(reach) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      messages: Number(messages) || 0,
      revenue: Number(revenue) || 0,
      hook: hook.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col text-right overflow-hidden transform transition-all my-auto animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2 justify-end">
              <span>تحديث تحليل وتفاعل الفيديو / المنشور</span>
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-md">
              {item.title} ({item.platform} • {item.type})
            </p>
          </div>
        </div>

        {/* Live Engagement Preview Bar */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-amber-50 border-b border-blue-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">مجموع التفاعلات الحالية:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {totalInteractions.toLocaleString('ar-SA')} تفاعل
            </span>
          </div>

          <div className="text-left">
            <span className="text-slate-500 block text-[10px]">معدل التفاعل المتوقع:</span>
            <span
              className={`font-black text-sm px-2.5 py-0.5 rounded-full ${
                engagementRate >= 5
                  ? 'bg-emerald-100 text-emerald-800'
                  : engagementRate >= 2
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {engagementRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-160px)]">
          {/* Hook edit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>الخطاف الإعلاني / زاوية الفيديو (Hook):</span>
            </label>
            <textarea
              rows={2}
              value={hook}
              onChange={e => setHook(e.target.value)}
              placeholder="مثال: لماذا يشتري الجميع هذه الحقيبة؟"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Section: Reach & Views */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              1. المشاهدات والوصول
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>عدد المشاهدات (Views)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={views}
                  onChange={e => setViews(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>الوصول (Reach)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={reach}
                  onChange={e => setReach(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Interaction Metrics (Likes, Comments, Shares, Saves) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              2. التفاعلات (Interactions & Engagement)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>الإعجابات</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={e => setLikes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>التعليقات</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={comments}
                  onChange={e => setComments(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>المشاركات (Share)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={shares}
                  onChange={e => setShares(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>الحفظ (Saves)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={saves}
                  onChange={e => setSaves(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Business Outcomes (Messages & Revenue) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              3. النتائج التجارية والمبيعات
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>رسائل واستفسارات الشراء</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={messages}
                  onChange={e => setMessages(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المبيعات الناتجة (ر.س)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={revenue}
                  onChange={e => setRevenue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتحديث التحليل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
