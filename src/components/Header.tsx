import React from 'react';
import { ShieldCheck, Plus, Search } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  imminentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
  imminentCount,
}) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
      {/* 4색 조화 스펙트럼 라인 (Red - Amber - Green - Blue) */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3.5 gap-4">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  감사 자료 한눈에 보기
                </h1>
                <div className="hidden sm:flex items-center gap-1 pl-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="긴급/마감" />
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="진행 중" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="우리 팀 관련/완료" />
                  <span className="w-2 h-2 rounded-full bg-blue-500" title="신뢰/공통" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Bar: Solid Search Bar & Vivid Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-sm">
            {/* Solid Dark Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="감사 요구자료 검색..."
                className="w-full pl-9 pr-7 py-2 text-xs bg-slate-800 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Create Button with Rich Solid Blue Fill */}
            <button
              id="btn-register-audit"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>감사 등록</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
