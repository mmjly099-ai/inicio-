import React, { useState } from 'react';
import { DownloadCloud, Smartphone, Check, X, Share2, PlusSquare, ArrowDownCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'card' | 'sidebar';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone mode
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم تثبيت تطبيق TOP STORE بنجاح وهو يعمل الآن كتطبيق أصلي (Standalone App).</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // If deferred prompt is not available (e.g., iOS or browser already shown it), show helpful guide
      setShowGuideModal(true);
    }
  };

  // 1. Sidebar variant
  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 transition-all cursor-pointer ${className}`}
          title="تثبيت TOP STORE كتطبيق على جهازك"
        >
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-amber-600 shrink-0" />
            <span>تنزيل كتطبيق للجوال والكمبيوتر</span>
          </div>
          <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md font-extrabold text-amber-900">
            تثبيت
          </span>
        </button>

        {showGuideModal && <InstallGuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
      </>
    );
  }

  // 2. Card variant (for SettingsView or Banner)
  if (variant === 'card') {
    return (
      <>
        <div className={`p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-sm border border-slate-700/60 ${className}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Smartphone className="w-4 h-4" />
                <span>تطبيق الويب التقدمي (Progressive Web App - PWA)</span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                تنزيل TOP STORE كتطبيق مستقل على هاتفك أو حاسوبك
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                ثبّت النظام على شاشتك الرئيسية للوصول السريع الفوري بنقرة واحدة، ودعم العمل بدون انترنت، وتجربة سلسة بدون أشرطة المتصفح.
              </p>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <DownloadCloud className="w-4 h-4 text-slate-950" />
              <span>{isInstallable ? 'تثبيت التطبيق الآن' : 'كيفية تنزيل التطبيق'}</span>
            </button>
          </div>
        </div>

        {showGuideModal && <InstallGuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
      </>
    );
  }

  // 3. Navbar variant (default)
  return (
    <>
      <button
        type="button"
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs border border-amber-400/50 transition-all cursor-pointer ${className}`}
        title="تنزيل وتثبيت TOP STORE كتطبيق على الشاشة الرئيسية"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-slate-950 shrink-0" />
        <span className="hidden sm:inline">تنزيل كتطبيق</span>
        <span className="sm:hidden">تثبيت</span>
      </button>

      {showGuideModal && <InstallGuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
    </>
  );
};

// Guide Modal for iOS & Desktop
const InstallGuideModal: React.FC<{ onClose: () => void; isIOS: boolean }> = ({ onClose, isIOS }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-right animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              تثبيت تطبيق TOP STORE
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-800">
              لتثبيت التطبيق على أجهزة آيفون وآيباد (iOS Safari):
            </p>
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p className="leading-relaxed">
                  اضغط على أيقونة <strong>المشاركة (Share)</strong>{' '}
                  <Share2 className="w-4 h-4 inline-block text-blue-600 mx-1 align-sub" />{' '}
                  في أسفل شاشة متصفح Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p className="leading-relaxed">
                  مرر للأسفل في القائمة واضغط على خيار{' '}
                  <strong className="text-slate-900">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline-block text-emerald-600 mx-1 align-sub" />.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p className="leading-relaxed">
                  اضغط على زر <strong>"إضافة" (Add)</strong> في الزاوية العلوية، وسيظهر تطبيق توب ستور مباشرة في شاشتك الرئيسية.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-800">
              لتثبيت التطبيق على أجهزة أندرويد والكمبيوتر (Chrome / Edge):
            </p>
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p className="leading-relaxed">
                  في متصفح <strong>Google Chrome</strong> أو <strong>Edge</strong>، انقر على أيقونة التثبيت{' '}
                  <ArrowDownCircle className="w-4 h-4 inline-block text-amber-600 mx-1 align-sub" />{' '}
                  الموجودة في شريط العنوان (URL bar) بالأعلى أو من خيارات القائمة (⋮).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p className="leading-relaxed">
                  اختر <strong className="text-slate-900">"تثبيت TOP STORE" (Install app)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p className="leading-relaxed">
                  سيتم فتح التطبيق في نافذة مستقلة أنيقة بدون إطارات المتصفح وإضافته لسطح المكتب أو قائمة التطبيقات.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
