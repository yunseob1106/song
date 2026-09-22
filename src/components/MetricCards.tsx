import React from 'react';
import { Clock, AlertTriangle, FileCheck, CheckCircle2, Bookmark, Flame } from 'lucide-react';
import { StatusFilter, ViewFilter } from '../types';

interface MetricCardsProps {
  ongoingCount: number;
  completedCount: number;
  imminentCount: number;
  deptRelatedCount: number;
  deptCompletedCount: number;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  viewFilter: ViewFilter;
  onViewFilterChange: (view: ViewFilter) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  ongoingCount,
  completedCount,
  imminentCount,
  deptRelatedCount,
  deptCompletedCount,
  statusFilter,
  onStatusFilterChange,
  viewFilter,
  onViewFilterChange,
}) => {
  const deptProgressPercent = deptRelatedCount > 0 
    ? Math.round((deptCompletedCount / deptRelatedCount) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. 진행중인 감사 (Active / Needs Attention) */}
      <div
        id="metric-card-ongoing"
        onClick={() => onStatusFilterChange(statusFilter === 'ongoing' ? 'all' : 'ongoing')}
        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
          statusFilter === 'ongoing'
            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            현재 준비 대상
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-blue-900 tracking-tight">
            {ongoingCount}
          </span>
          <span className="text-xs font-medium text-slate-500">건 진행중</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-blue-700 font-medium">
            ● 집중 준비 필요
          </span>
          <span className="text-slate-400 text-[11px]">
            {statusFilter === 'ongoing' ? '필터 적용됨 ✓' : '클릭시 모아보기'}
          </span>
        </div>
        {/* Active border indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-xl" />
      </div>

      {/* 2. 마감 임박 (D-3 이내 / Warning) */}
      <div
        id="metric-card-imminent"
        onClick={() => onStatusFilterChange('ongoing')}
        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
          imminentCount > 0
            ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400 hover:shadow-xs'
            : 'bg-white border-slate-200 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            마감 임박 (D-3 이내)
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            imminentCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold tracking-tight ${
            imminentCount > 0 ? 'text-amber-900' : 'text-slate-700'
          }`}>
            {imminentCount}
          </span>
          <span className="text-xs font-medium text-slate-500">건 기한 임박</span>
        </div>
        <div className="mt-2 text-xs text-amber-700 font-medium flex items-center justify-between">
          <span>{imminentCount > 0 ? '최우선 자료 제출 요청' : '임박 건 없음 (안정)'}</span>
          <span className="text-slate-400 text-[11px]">D-Day 확인</span>
        </div>
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          imminentCount > 0 ? 'bg-amber-500' : 'bg-slate-300'
        }`} />
      </div>

      {/* 3. 우리 팀 관련 요구항목 (Y) */}
      <div
        id="metric-card-dept-related"
        onClick={() => onViewFilterChange(viewFilter === 'dept_only' ? 'all' : 'dept_only')}
        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
          viewFilter === 'dept_only'
            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            팀 관련 요구항목 (Y)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-950 tracking-tight">
              {deptRelatedCount}
            </span>
            <span className="text-xs font-medium text-slate-500">개 요구자료</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            우리 팀 소관
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>우리 팀 작성 대상</span>
          <span className="text-emerald-700 font-semibold">
            {viewFilter === 'dept_only' ? '팀 필터 ON ✓' : '클릭시 팀만 보기'}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-xl" />
      </div>

      {/* 4. 종료된 감사 (Completed / 신경 안써도 됨) */}
      <div
        id="metric-card-completed"
        onClick={() => onStatusFilterChange(statusFilter === 'completed' ? 'all' : 'completed')}
        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
          statusFilter === 'completed'
            ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            종료된 감사
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-700 tracking-tight">
            {completedCount}
          </span>
          <span className="text-xs font-medium text-slate-500">건 완료</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span className="text-slate-500 font-medium">
            ✓ 신경 안 써도 됨 (보관)
          </span>
          <span className="text-slate-400 text-[11px]">
            {statusFilter === 'completed' ? '필터 적용됨 ✓' : '이력 조회'}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400 rounded-t-xl" />
      </div>

    </div>
  );
};
