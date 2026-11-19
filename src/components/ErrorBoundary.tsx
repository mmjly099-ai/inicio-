import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isPermissionError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isPermissionError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let message = error.message || 'حدث خطأ غير متوقع في النظام';
    let isPermissionError = false;

    try {
      const parsed = JSON.parse(message);
      if (parsed && parsed.error) {
        message = parsed.error;
        if (
          typeof parsed.error === 'string' &&
          parsed.error.toLowerCase().includes('permission')
        ) {
          isPermissionError = true;
        }
      }
    } catch {
      if (message.toLowerCase().includes('permission')) {
        isPermissionError = true;
      }
    }

    return {
      hasError: true,
      errorMessage: message,
      isPermissionError,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Cairo',sans-serif]"
        >
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {this.state.isPermissionError
                  ? 'تعذر الوصول أو حفظ البيانات السحابية'
                  : 'حدث خطأ غير متوقع في التطبيق'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {this.state.isPermissionError
                  ? 'يرجى التأكد من تسجيل الدخول بكلمة مرور المتجر والتحقق من اتصال الإنترنت ثم إعادة المحاولة.'
                  : 'تم رصد خطأ تقني مؤقت أثناء معالجة البيانات.'}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 font-mono break-all text-left" dir="ltr">
              {this.state.errorMessage}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تحميل النظام</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
