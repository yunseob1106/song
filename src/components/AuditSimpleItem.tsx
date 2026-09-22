import React from 'react';
import { Audit } from '../types';
import { calculateDDay } from '../utils/dateUtils';
import { ChevronRight, FileText, Flame, AlertTriangle, Building, ArrowRight } from 'lucide-react';

interface AuditSimpleItemProps {
  audit: Audit;
  onClick: () => void;
  index?: number;
}

export const AuditSimpleItem: React.FC<AuditSimpleItemProps> = ({ audit, onClick, index = 0 }) => {
  const isOngoing = audit.status === 'ongoing';
  const ddayInfo = calculateDDay(audit.deadline, !isOngoing);

  // 메뉴 전체가 색깔로 가득 채워지는 리치 솔리드 컬러 테마 (Full Solid Color Fills)
  // 빨강, 노랑, 초록, 파랑 4색이 선명한 면(Surface)으로 화면을 가득 채우도록 구성
  const getSolidTheme = () => {
    if (!isOngoing) {
      // 종료 항목: 차분한 제이드/슬레이트 솔리드 면
      return {
        cardBg: 'bg-slate-800 hover:bg-slate-750 text-slate-100',
        badgeBg: 'bg-slate-900/80 text-emerald-400 border border-emerald-500/30',
        iconBg: 'bg-emerald-600/40 text-emerald-300',
        tagBg: 'bg-slate-900/60 text-slate-300',
        arrowColor: 'text-slate-400 group-hover:text-emerald-300',
        highlightText: 'text-slate-100',
      };
    }

    // 마감임박 (D-3 이내): [빨강] 강렬하고 세련된 크림슨/루비 레드 솔리드 면
    if (ddayInfo.isImminent) {
      return {
        cardBg: 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-650 hover:to-red-550 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/40',
        badgeBg: 'bg-amber-400 text-amber-950 font-black shadow-xs',
        iconBg: 'bg-rose-900/60 text-rose-100',
        tagBg: 'bg-rose-900/50 text-rose-100',
        arrowColor: 'text-rose-200 group-hover:text-white',
        highlightText: 'text-white',
      };
    }

    // 국정감사: [파랑] 묵직하고 믿음직한 로얄 사파이어 / 코발트 블루 솔리드 면
    if (audit.type === '국정감사') {
      return {
        cardBg: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 hover:from-blue-650 hover:to-indigo-650 text-white shadow-lg shadow-blue-950/40 ring-1 ring-blue-400/40',
        badgeBg: 'bg-blue-950/80 text-blue-200 border border-blue-400/40',
        iconBg: 'bg-blue-900/60 text-blue-100',
        tagBg: 'bg-indigo-950/60 text-indigo-100',
        arrowColor: 'text-blue-200 group-hover:text-white',
        highlightText: 'text-white',
      };
    }

    // 행정감사: [초록] 짙은 세이지 제이드 / 에메랄드 솔리드 면
    return {
      cardBg: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 hover:from-emerald-650 hover:to-teal-650 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/40',
      badgeBg: 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/40',
      iconBg: 'bg-emerald-900/60 text-emerald-100',
      tagBg: 'bg-teal-950/60 text-teal-100',
      arrowColor: 'text-emerald-200 group-hover:text-white',
      highlightText: 'text-white',
    };
  };

  const theme = getSolidTheme();

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${theme.cardBg}`}
    >
      {/* Left: Filled Icon, Type Tag, Title & Requester */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-3">
        {/* Full Filled Icon Chip */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md ${theme.iconBg}`}
        >
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="min-w-0 space-y-1.5">
          {/* Top Info Bar inside card: Type & Requester */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg ${theme.tagBg}`}>
              {audit.type}
            </span>
            {audit.requester && (
              <span className="text-[11px] font-medium opacity-85 truncate max-w-[140px] sm:max-w-[200px]">
                {audit.requester}
              </span>
            )}
          </div>

          {/* Main Title (Prominent Bold White) */}
          <h3 className={`text-base sm:text-lg font-black tracking-tight truncate ${theme.highlightText}`}>
            {audit.title}
          </h3>
        </div>
      </div>

      {/* Right: D-Day solid pill & Animated Arrow */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isOngoing && (
          <span
            className={`text-xs px-3 py-1.5 rounded-xl font-black inline-flex items-center gap-1.5 shadow-md ${theme.badgeBg}`}
          >
            {ddayInfo.isToday && <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-bounce" />}
            {ddayInfo.isImminent && !ddayInfo.isToday && <AlertTriangle className="w-3.5 h-3.5 text-amber-950" />}
            <span>{ddayInfo.label}</span>
          </span>
        )}

        <div className={`p-2 rounded-xl bg-black/20 group-hover:bg-black/30 transition-all ${theme.arrowColor}`}>
          <ChevronRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
