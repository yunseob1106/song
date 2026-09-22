import React from 'react';
import { AuditType, StatusFilter, ViewFilter } from '../types';
import { Filter, Layers, CheckCircle2, Clock, Check, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface FilterToolbarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  typeFilter: 'all' | AuditType;
  onTypeFilterChange: (type: 'all' | AuditType) => void;
  viewFilter: ViewFilter;
  onViewFilterChange: (view: ViewFilter) => void;
  totalCount: number;
  ongoingCount: number;
  completedCount: number;
  deptItemCount: number;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  viewFilter,
  onViewFilterChange,
  totalCount,
  ongoingCount,
  completedCount,
  deptItemCount,
  onResetFilters,
  isFiltered,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Status and Type Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Segmented Control */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              id="filter-status-all"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({totalCount})
            </button>
            <button
              id="filter-status-ongoing"
              onClick={() => onStatusFilterChange('ongoing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                statusFilter === 'ongoing'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>진행중인 감사 ({ongoingCount})</span>
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
            </button>
            <button
              id="filter-status-completed"
              onClick={() => onStatusFilterChange('completed')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>종료된 감사 ({completedCount})</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Audit Type Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">유형:</span>
            {(['all', '국정감사', '행정감사', '기타'] as const).map((t) => {
              const isActive = typeFilter === t;
              return (
                <button
                  key={t}
                  id={`filter-type-${t}`}
                  onClick={() => onTypeFilterChange(t)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'all' ? '전체 종류' : t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Key Specification - 「전체 보기 / 서부 관련 내용만 보기」 */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          
          <div className="inline-flex p-1 bg-emerald-50/80 border border-emerald-300 rounded-xl items-center shadow-xs">
            <span className="text-[11px] font-bold text-emerald-900 px-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              감사 항목 필터:
            </span>
            <button
              id="view-mode-all"
              onClick={() => onViewFilterChange('all')}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                viewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 보기
            </button>
            <button
              id="view-mode-dept-only"
              onClick={() => onViewFilterChange('dept_only')}
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                viewFilter === 'dept_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>팀 관련 내용만 보기 (Y)</span>
            </button>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              title="필터 초기화"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}

        </div>

      </div>

      {/* Active Filter Hint Message */}
      {viewFilter === 'dept_only' && (
        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              '우리 팀 관련 항목(Y)' 필터가 켜져 있습니다. 타 팀 항목은 숨겨집니다.
            </span>
          </div>
          <button
            onClick={() => onViewFilterChange('all')}
            className="text-xs text-emerald-900 underline font-medium hover:text-emerald-950 cursor-pointer"
          >
            전체 항목 보기로 전환
          </button>
        </div>
      )}
    </div>
  );
};
