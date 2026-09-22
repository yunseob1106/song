import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Audit,
  AuditItem,
  AttachedFile,
  ViewFilter,
  ItemStatus
} from '../types';
import { calculateDDay, formatKoreanDate } from '../utils/dateUtils';
import { downloadFile, formatFileSize } from '../utils/fileUtils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  Paperclip,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Flame,
  Check,
  X,
  Edit,
  Trash2,
  Layers,
  Sparkles,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface AuditDetailViewProps {
  audit: Audit;
  onBack: () => void;
  onEditAudit: (audit: Audit) => void;
  onDeleteAudit: (id: string) => void;
  onToggleAuditStatus: (id: string) => void;
  onToggleItemDepartmentRelated: (auditId: string, itemId: string) => void;
  onChangeItemStatus: (auditId: string, itemId: string, newStatus: ItemStatus) => void;
  onOpenItemUploadModal: (auditId: string, item: AuditItem) => void;
  onOpenGuidelineUploadModal: (audit: Audit) => void;
  onAddItemDirectly: (auditId: string) => void;
}

export const AuditDetailView: React.FC<AuditDetailViewProps> = ({
  audit,
  onBack,
  onEditAudit,
  onDeleteAudit,
  onToggleAuditStatus,
  onToggleItemDepartmentRelated,
  onChangeItemStatus,
  onOpenItemUploadModal,
  onOpenGuidelineUploadModal,
  onAddItemDirectly,
}) => {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return audit.items.length > 0 ? audit.items[0].id : '';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isOngoing = audit.status === 'ongoing';
  const ddayInfo = calculateDDay(audit.deadline, !isOngoing);

  // Items filtered by 팀 관련 여부 (Y)
  const displayedItems = viewFilter === 'dept_only'
    ? audit.items.filter((item) => item.departmentRelated)
    : audit.items;

  // Active selected item for detailed view
  const activeItem = audit.items.find((item) => item.id === selectedItemId) || displayedItems[0] || audit.items[0];

  const currentIndex = displayedItems.findIndex((it) => it.id === activeItem?.id);
  const prevItem = currentIndex > 0 ? displayedItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < displayedItems.length - 1 ? displayedItems[currentIndex + 1] : null;

  const totalItemCount = audit.items.length;
  const deptRelatedCount = audit.items.filter((it) => it.departmentRelated).length;
  const deptCompletedCount = audit.items.filter((it) => it.departmentRelated && it.status === 'completed').length;

  // 솔리드 컬러 채움 유형 배지
  const getTypeBadge = (type: string) => {
    switch (type) {
      case '국정감사':
        return 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
      case '행정감사':
        return 'bg-teal-600 text-white shadow-md shadow-teal-600/30';
      default:
        return 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/30';
    }
  };

  // 파일 확장자에 따른 솔리드 컬러 아이콘 테마
  const getFileIconStyle = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return {
        bg: 'bg-emerald-600 text-white shadow-md',
        icon: FileSpreadsheet,
      };
    }
    if (['hwp', 'hwpx', 'doc', 'docx'].includes(ext)) {
      return {
        bg: 'bg-blue-600 text-white shadow-md',
        icon: FileText,
      };
    }
    if (['pdf'].includes(ext)) {
      return {
        bg: 'bg-rose-600 text-white shadow-md',
        icon: FileText,
      };
    }
    return {
      bg: 'bg-amber-500 text-amber-950 shadow-md',
      icon: FileText,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar (Solid Dark Canvas) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-750 rounded-xl transition-all cursor-pointer shadow-md border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 stroke-[2.5]" />
            <span>목록으로 돌아가기</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status: Solid Blue or Solid Emerald */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl shadow-md ${
                isOngoing
                  ? 'bg-blue-600 text-white shadow-blue-600/30'
                  : 'bg-emerald-600 text-white shadow-emerald-600/30'
              }`}
            >
              {isOngoing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
                  작성 대상
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  종료됨
                </>
              )}
            </span>

            {/* Audit Type Solid Pill */}
            <span className={`px-3 py-1.5 text-xs font-black rounded-xl ${getTypeBadge(audit.type)}`}>
              {audit.type}
            </span>

            {/* D-Day Solid Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl shadow-md ${
                ddayInfo.isToday
                  ? 'bg-red-600 text-white'
                  : ddayInfo.isImminent
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {ddayInfo.isToday && <Flame className="w-3.5 h-3.5 text-white fill-white animate-bounce" />}
              {ddayInfo.isImminent && !ddayInfo.isToday && <AlertTriangle className="w-3.5 h-3.5 text-amber-950" />}
              <span>{ddayInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Action Controls with Solid Colors */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onToggleAuditStatus(audit.id)}
            className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md ${
              isOngoing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isOngoing ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>종료 처리</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>작성 대상으로 복원</span>
              </>
            )}
          </button>

          <button
            onClick={() => onEditAudit(audit)}
            title="감사 정보 수정"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer shadow-md"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteAudit(audit.id)}
            title="감사 삭제"
            className="p-2 text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 rounded-xl border border-rose-800/80 transition-colors cursor-pointer shadow-md"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Overview Header Card (Rich Midnight Slate with Accent Colors) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Top 4-Color Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500" />

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
          {audit.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800">
          {/* Deadline Pill in Solid Amber */}
          <div className="flex items-center gap-2 bg-amber-400 text-amber-950 font-black px-3 py-1.5 rounded-xl shadow-md">
            <Calendar className="w-4 h-4 text-amber-950 stroke-[2.5]" />
            <span>제출기한:</span>
            <span>{formatKoreanDate(audit.deadline)}</span>
          </div>

          {audit.requester && (
            <div className="flex items-center gap-1.5 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 font-medium">요구 의원실/기관:</span>
              <span className="font-bold text-white">{audit.requester}</span>
            </div>
          )}

          {audit.targetAgency && (
            <div className="flex items-center gap-1.5 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-medium">소관:</span>
              <span className="font-bold text-white">{audit.targetAgency}</span>
            </div>
          )}

          {/* Department Related Stats Pill in Solid Emerald */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-black text-slate-950 bg-emerald-400 px-3.5 py-1.5 rounded-xl shadow-md">
              우리 팀 관련: {deptRelatedCount}/{totalItemCount} 항목
            </span>
          </div>
        </div>

        {/* Guideline / Common Forms Attachment Panel with Solid Fill */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-blue-300 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-blue-400" />
              공통 작성 지침 및 서식:
            </span>
            {audit.guidelineFiles.length > 0 ? (
              audit.guidelineFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => downloadFile(file)}
                  title="클릭하여 파일 다운로드"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 transition-all cursor-pointer group"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <span className="text-[10px] text-blue-200">({formatFileSize(file.size)})</span>
                  <Download className="w-3 h-3 text-white ml-0.5" />
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">등록된 공통 지침 파일 없음</span>
            )}
          </div>

          <button
            onClick={() => onOpenGuidelineUploadModal(audit)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white font-black bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-200" />
            <span>+ 지침/서식 파일 추가</span>
          </button>
        </div>
      </div>

      {/* Main Requirement Tabs & Content View with High Color Saturation */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Tab Filter Header with Solid Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>요구자료 항목 목록</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black shadow-md">
                {displayedItems.length}개
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle: Solid Fills */}
            <div className="inline-flex p-1 bg-slate-800 border border-slate-700 rounded-xl shadow-inner items-center gap-1">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  viewFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                전체 항목 ({totalItemCount})
              </button>
              <button
                onClick={() => setViewFilter('dept_only')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  viewFilter === 'dept_only'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>팀 관련만 ({deptRelatedCount})</span>
              </button>
            </div>

            <button
              onClick={() => onAddItemDirectly(audit.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>새 요구항목</span>
            </button>
          </div>
        </div>

        {/* 요구자료별 세로 정렬 목록 (Vertical Alignment) */}
        {displayedItems.length > 0 ? (
          <div className="p-4 sm:p-6 space-y-3">
            {/* Guidance banner */}
            <div className="p-3.5 bg-blue-950/60 border border-blue-800/70 rounded-2xl flex items-center justify-between text-xs text-blue-200 shadow-md">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-medium">
                  항목을 클릭하면 <strong>우측 슬라이드 창</strong>에서 세부 작성 지침과 서식 파일을 바로 확인하고 관리할 수 있습니다.
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-300 hidden md:inline-block bg-blue-900/80 px-2.5 py-1 rounded-lg">
                총 {displayedItems.length}개 요구자료
              </span>
            </div>

            {/* Vertical Stack of Requirement Items */}
            <div className="space-y-2.5">
              {displayedItems.map((item) => {
                const isSelectedAndOpen = isDrawerOpen && activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setIsDrawerOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedItemId(item.id);
                        setIsDrawerOpen(true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md hover:shadow-lg select-none ${
                      isSelectedAndOpen
                        ? 'bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-blue-400 ring-2 ring-blue-400/40 shadow-blue-500/20'
                        : item.departmentRelated
                        ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-emerald-500/60'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      {/* Number Chip with Solid Theme */}
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                          item.departmentRelated
                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        #{item.itemNumber}
                      </span>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 팀 관련 여부 (Y/N) 뱃지 */}
                          {item.departmentRelated ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-black rounded-md bg-emerald-500 text-slate-950 shadow-xs">
                              우리 팀 관련 (Y)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                              해당 없음 (N)
                            </span>
                          )}

                          {/* 첨부파일 개수 */}
                          {item.files.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-blue-300 bg-blue-950/70 border border-blue-800/60 rounded">
                              <Paperclip className="w-3 h-3 text-blue-400" />
                              <span>서식 {item.files.length}개</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-blue-200 transition-colors">
                          {item.title}
                        </h3>

                        {/* Brief 1-line description preview */}
                        {item.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 font-normal">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-black">
              {viewFilter === 'dept_only'
                ? '우리 팀 관련(Y)으로 지정된 요구항목이 없습니다.'
                : '등록된 요구항목이 없습니다.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              {viewFilter === 'dept_only' && (
                <button
                  onClick={() => setViewFilter('all')}
                  className="px-4 py-2 text-xs font-black bg-slate-800 text-white hover:bg-slate-700 rounded-xl shadow-md border border-slate-700"
                >
                  전체 항목 보기
                </button>
              )}
              <button
                onClick={() => onAddItemDirectly(audit.id)}
                className="px-4 py-2 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                + 세부 항목 추가하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 우측 슬라이드 창 (Slide-over Drawer from Right) */}
      <AnimatePresence>
        {isDrawerOpen && activeItem && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-in Drawer Container */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl sm:max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden"
            >
              {/* 4-Color Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500 flex-shrink-0" />

              {/* Drawer Header (Solid Gradient) */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-md flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white text-xs font-black shadow-xs">
                        요구항목 #{activeItem.itemNumber}
                      </span>
                      <span className="text-xs text-blue-100 font-medium truncate max-w-xs">
                        [{audit.type}] {audit.title}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black leading-snug">
                      {activeItem.title}
                    </h3>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    title="닫기 (ESC)"
                    className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Quick Controls in Header */}
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between flex-wrap gap-2 text-xs">
                  {/* 팀 관련 여부 (Y/N) 토글 */}
                  <button
                    onClick={() => onToggleItemDepartmentRelated(audit.id, activeItem.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer shadow-md ${
                      activeItem.departmentRelated
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/30'
                        : 'bg-slate-900/70 hover:bg-slate-900 text-white border border-white/25'
                    }`}
                  >
                    {activeItem.departmentRelated ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3] text-slate-950" />
                        <span>우리 팀 관련 (Y)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-white/70" />
                        <span>해당 없음 (N)</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-blue-200 font-medium">
                    클릭하여 우리 팀 소관 여부를 변경할 수 있습니다.
                  </span>
                </div>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* 세부 요구사항 및 작성 지침 (Solid Blue Panel) */}
                {activeItem.description ? (
                  <div className="bg-blue-950/70 rounded-2xl p-5 border border-blue-800/70 shadow-lg">
                    <h4 className="text-xs font-black text-blue-300 mb-2.5 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>세부 요구사항 및 작성 지침</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-100 whitespace-pre-line leading-relaxed font-medium">
                      {activeItem.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 italic">
                    등록된 세부 작성 지침이 없습니다.
                  </div>
                )}

                {/* 특이사항 / 참고사항 (Solid Amber Panel) */}
                {activeItem.notes && (
                  <div className="bg-amber-950/70 rounded-2xl p-4 border border-amber-800/70 text-xs text-amber-200 shadow-md">
                    <span className="font-black mr-2 text-amber-300">특이사항 / 참고사항:</span>
                    <span className="font-medium">{activeItem.notes}</span>
                  </div>
                )}

                {/* 서식 및 참고자료 목록 */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-400" />
                      <span>항목별 작성 서식 및 참고자료 ({activeItem.files.length}개)</span>
                    </h4>

                    <button
                      onClick={() => onOpenItemUploadModal(audit.id, activeItem)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ 파일 업로드</span>
                    </button>
                  </div>

                  {activeItem.files.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeItem.files.map((file) => {
                        const iconTheme = getFileIconStyle(file.name);
                        const IconComp = iconTheme.icon;
                        return (
                          <div
                            key={file.id}
                            className="p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 transition-all flex items-center justify-between gap-3 shadow-md group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconTheme.bg}`}
                              >
                                <IconComp className="w-5 h-5 stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-white truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {formatFileSize(file.size)}
                                  {file.uploaderName && ` · 등록: ${file.uploaderName}`}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => downloadFile(file)}
                              title="다운로드"
                              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <Download className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                      <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">
                        이 항목에 등록된 서식이나 참고자료 파일이 없습니다.
                      </p>
                      <button
                        onClick={() => onOpenItemUploadModal(audit.id, activeItem)}
                        className="mt-2.5 text-xs font-black text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        + 서식 파일 업로드하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer with Prev / Next Navigation & Close */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    disabled={!prevItem}
                    onClick={() => prevItem && setSelectedItemId(prevItem.id)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      prevItem
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                        : 'bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>이전 항목</span>
                  </button>

                  <button
                    disabled={!nextItem}
                    onClick={() => nextItem && setSelectedItemId(nextItem.id)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      nextItem
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                        : 'bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                    }`}
                  >
                    <span>다음 항목</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2 text-xs font-black text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  창 닫기
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
