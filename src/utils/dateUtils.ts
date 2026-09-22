export interface DDayInfo {
  daysDiff: number;
  label: string;
  isImminent: boolean;
  isOverdue: boolean;
  isToday: boolean;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export function calculateDDay(deadlineStr: string, isCompleted: boolean = false): DDayInfo {
  if (isCompleted) {
    return {
      daysDiff: 0,
      label: '감사 종료',
      isImminent: false,
      isOverdue: false,
      isToday: false,
      colorClass: 'text-slate-600',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-300',
    };
  }

  if (!deadlineStr) {
    return {
      daysDiff: 999,
      label: '기한 미설정',
      isImminent: false,
      isOverdue: false,
      isToday: false,
      colorClass: 'text-slate-500',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-200',
    };
  }

  // Calculate target date vs today at midnight
  const targetDate = new Date(deadlineStr);
  const now = new Date();
  
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetMidnight.getTime() - nowMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysDiff: diffDays,
      label: `D+${Math.abs(diffDays)} (기한초과)`,
      isImminent: true,
      isOverdue: true,
      isToday: false,
      colorClass: 'text-rose-700 font-bold',
      bgClass: 'bg-rose-100',
      borderClass: 'border-rose-400',
    };
  }

  if (diffDays === 0) {
    return {
      daysDiff: 0,
      label: 'D-Day (오늘 마감)',
      isImminent: true,
      isOverdue: false,
      isToday: true,
      colorClass: 'text-red-700 font-bold',
      bgClass: 'bg-red-100 animate-pulse',
      borderClass: 'border-red-500',
    };
  }

  if (diffDays <= 3) {
    return {
      daysDiff: diffDays,
      label: `D-${diffDays} (마감임박)`,
      isImminent: true,
      isOverdue: false,
      isToday: false,
      colorClass: 'text-amber-800 font-bold',
      bgClass: 'bg-amber-100',
      borderClass: 'border-amber-400',
    };
  }

  if (diffDays <= 7) {
    return {
      daysDiff: diffDays,
      label: `D-${diffDays}`,
      isImminent: false,
      isOverdue: false,
      isToday: false,
      colorClass: 'text-blue-700 font-semibold',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-300',
    };
  }

  return {
    daysDiff: diffDays,
    label: `D-${diffDays}`,
    isImminent: false,
    isOverdue: false,
    isToday: false,
    colorClass: 'text-slate-700 font-medium',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-300',
  };
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  let timePart = '';
  if (dateStr.includes('T')) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    timePart = ` ${hours}:${minutes}`;
  }

  return `${year}.${month}.${day}(${dayOfWeek})${timePart}`;
}
