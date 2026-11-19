import React, { useState } from 'react';
import {
  Cloud,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Globe,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from 'lucide-react';

interface AuthGateProps {
  loading: boolean;
  error: string | null;
  onUnlock: (password: string) => Promise<void>;
  signingIn: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  loading,
  error,
  onUnlock,
  signingIn,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        <p className="text-xs text-slate-400 mt-1">مزامنة بيانات TOP STORE عبر أجهزتك</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || signingIn) return;
    void onUnlock(password);
  };

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
            أدخل كلمة مرور المتجر للدخول إلى النظام ومزامنة جميع البيانات لحظياً عبر كل هواتفك وأجهزتك.
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
            <span>دخول سريع ومباشر بكلمة المرور دون تعقيد المتصفحات</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="workspace-password-input"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              كلمة مرور الدخول
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="workspace-password-input"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pr-10 pl-10 py-3 text-sm font-bold text-center tracking-wider bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="password-unlock-btn"
            disabled={signingIn || !password.trim()}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{signingIn ? 'جاري التحقق والمزامنة...' : 'دخول وبدء المزامنة'}</span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5" />
          <span>أدخل نفس كلمة المرور على جميع هواتفك للمزامنة الفورية</span>
        </div>
      </div>
    </div>
  );
};
