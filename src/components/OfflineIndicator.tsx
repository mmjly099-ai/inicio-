import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom duration-200">
      <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
      <span>وضع العمل بدون اتصال — البيانات المخزنة محلياً متاحة للاستخدام.</span>
    </div>
  );
};
