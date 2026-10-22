import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, AlertOctagon, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SmartEvaluation } from '../types';

interface SmartDecisionBadgeProps {
  evaluation: SmartEvaluation;
  size?: 'sm' | 'md' | 'lg';
  showDetailsToggle?: boolean;
}

export const SmartDecisionBadge: React.FC<SmartDecisionBadgeProps> = ({
  evaluation,
  size = 'md',
  showDetailsToggle = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (evaluation.score) {
      case 'excellent':
        return <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4 text-emerald-600'} />;
      case 'needs_improvement':
        return <AlertCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4 text-amber-600'} />;
      case 'critical_review':
        return <AlertOctagon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4 text-rose-600'} />;
      default:
        return <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
    }
  };

  const badgeClass =
    size === 'sm'
      ? 'text-xs px-2.5 py-1 gap-1.5'
      : size === 'lg'
      ? 'text-base px-4 py-2 gap-2.5 font-bold'
      : 'text-xs px-3 py-1.5 gap-2 font-semibold';

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex items-center rounded-full border shadow-xs transition-all ${evaluation.color} ${badgeClass} ${
          showDetailsToggle ? 'cursor-pointer hover:opacity-90' : ''
        }`}
        onClick={() => showDetailsToggle && setExpanded(!expanded)}
        title={evaluation.reason}
      >
        <span className="shrink-0">{getIcon()}</span>
        <span className="whitespace-nowrap font-bold">{evaluation.label}</span>
        {showDetailsToggle && (
          <span className="opacity-70 mr-1">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        )}
      </div>

      {showDetailsToggle && expanded && (
        <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-md text-xs text-right max-w-xs animate-in fade-in duration-150 z-10">
          <p className="font-semibold text-slate-800 mb-1 leading-snug">{evaluation.reason}</p>
          <div className="mt-2 pt-2 border-t border-slate-100 text-slate-700 font-medium">
            {evaluation.actionRecommendation}
          </div>
        </div>
      )}
    </div>
  );
};
