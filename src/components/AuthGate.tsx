import React from 'react';
import {
  Cloud,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Globe,
  ExternalLink,
  LogIn,
} from 'lucide-react';

interface AuthGateProps {
  loading: boolean;
  error: string | null;
  onSignIn: () => Promise<void>;
  onSignInRedirect: () => Promise<void>;
  signingIn: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  loading,
  error,
  onSignIn,
  onSignInRedirect,
  signingIn,
}) => {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-['Cairo',sans-serif]"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl tracking-wider shadow-md mb-4 animate-pulse">
          TOP
        </div>
        <p className="text-sm font-bold text-slate-700">جاري الاتصال بقاعدة البيانات السحابية...</p>
        <p className="text-xs text-slate-400 mt-1">مزامنة حساب TOP STORE عبر أجهزتك</p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]"
    >
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-2xl tracking-wider shadow-md mx-auto border border-slate-800">
            TOP
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-950">
              توب ستور | TOP STORE
            </h1>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full mt-2">
              <Globe className="w-3.5 h-3.5" />
              <span>"أسواق العالم بين يديك"</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            نظام إدارة وتحليلات التسويق الفعلي — سجّل دخولك بحساب Google لحفظ جميع بياناتك ومزامنتها لحظياً عبر كل هواتفك وأجهزتك.
          </p>
        </div>

        {/* Cloud Sync Features */}
        <div className="space-y-2.5 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span>مزامنة فورية تلقائية بين الجوال والكمبيوتر والتابلت</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <span>حفظ سحابي دائم مع دعم العمل دون إنترنت والمزامنة عند عودته</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>بيانات حقيقية 100% ومحمية بالكامل بحسابك الشخصي</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Primary Google Sign-in button */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="google-signin-btn"
            disabled={signingIn}
            onClick={() => void onSignIn()}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.39 0 3.41 2.69 1.49 6.6l3.66 2.84C6.02 6.82 8.77 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.72-4.93 3.72-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.15 14.56c-.22-.66-.35-1.36-.35-2.06s.13-1.4.35-2.06L1.49 7.6C.54 9.5 0 11.69 0 14s.54 4.5 1.49 6.4l3.66-2.84z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.23 0-5.98-1.82-6.85-4.44L1.49 17.78C3.41 21.69 7.39 24 12 24z"
              />
            </svg>
            <span>{signingIn ? 'جاري تسجيل الدخول...' : 'الدخول بحساب Google وبدء المزامنة'}</span>
          </button>

          {/* Direct Redirect Login for Mobile/PWA when popups are blocked */}
          {!isInIframe && (
            <button
              type="button"
              id="google-signin-redirect-btn"
              disabled={signingIn}
              onClick={() => void onSignInRedirect()}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>الدخول المباشر للجوال (بدون نافذة منبثقة)</span>
            </button>
          )}

          {/* Open in external Chrome tab when inside embedded preview iframe */}
          {(isInIframe || error) && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-blue-200"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>فتح التطبيق في تبويب Chrome مستقل للدخول</span>
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5" />
          <span>استخدم نفس البريد على جميع هواتفك للمزامنة الفورية</span>
        </div>
      </div>
    </div>
  );
};
