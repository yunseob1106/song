import React, { useState } from 'react';
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
  Calendar,
  Clock,
  Building,
  Paperclip,
  Download,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  AlertTriangle,
  FileText,
  Plus,
  Flame,
  Check,
  X,
  Share2,
  CornerDownRight
} from 'lucide-react';

interface AuditCardProps {
  audit: Audit;
  viewFilter: ViewFilter;
  onEditAudit: (audit: Audit) => void;
  onDeleteAudit: (id: string) => void;
  onToggleAuditStatus: (id: string) => void;
  onToggleItemDepartmentRelated: (auditId: string, itemId: string) => void;
  onChangeItemStatus: (auditId: string, itemId: string, newStatus: ItemStatus) => void;
  onOpenItemUploadModal: (auditId: string, item: AuditItem) => void;
  onOpenGuidelineUploadModal: (audit: Audit) => void;
  onAddItemDirectly: (auditId: string) => void;
}

export const AuditCard: React.FC<AuditCardProps> = ({
  audit,
  viewFilter,
  onEditAudit,
  onDeleteAudit,
  onToggleAuditStatus,
  onToggleItemDepartmentRelated,
  onChangeItemStatus,
  onOpenItemUploadModal,
  onOpenGuidelineUploadModal,
  onAddItemDirectly,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isOngoing = audit.status === 'ongoing';
  const ddayInfo = calculateDDay(audit.deadline, !isOngoing);

  // Filter items if viewFilter is 'dept_only'
  const filteredItems = viewFilter === 'dept_only'
    ? audit.items.filter((it) => it.departmentRelated)
    : audit.items;

  const totalItemCount = audit.items.length;
  const deptRelatedCount = audit.items.filter((it) => it.departmentRelated).length;
  const deptCompletedCount = audit.items.filter((it) => it.departmentRelated && it.status === 'completed').length;
  const hiddenNonDeptCount = totalItemCount - deptRelatedCount;

  // Type badge styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case '국정감사':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '행정감사':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      id={`audit-card-${audit.id}`}
      className={`rounded-2xl transition-all duration-200 overflow-hidden mb-5 ${
        isOngoing
          ? 'bg-white border-2 border-blue-500/40 shadow-md ring-1 ring-blue-500/10'
          : 'bg-slate-50/80 border border-slate-200 opacity-95'
      }`}
    >
      {/* SPEC REQUIREMENT: 진행중인 건은 구분선을 강조하여 표시 */}
      {isOngoing ? (
        <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500" />
      ) : (
        <div className="h-1 w-full bg-slate-300" />
      )}

      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
          
          {/* Left: Badges, Title, Requester, Due info */}
          <div className="flex-1 space-y-2">
            
            {/* Status & Type Bar */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Ongoing vs Completed Distinct Badge */}
              {isOngoing ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-blue-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  진행중인 감사 (준비 필요)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  감사 종료 (신경 안 써도 됨)
                </span>
              )}

              {/* Audit Type Badge */}
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getTypeBadge(audit.type)}`}>
                {audit.type}
              </span>

              {/* D-Day Badge with Imminent Highlighting */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${ddayInfo.bgClass} ${ddayInfo.colorClass} ${ddayInfo.borderClass}`}
              >
                {ddayInfo.isToday && <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />}
                {ddayInfo.isImminent && !ddayInfo.isToday && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{ddayInfo.label}</span>
              </span>
            </div>

            {/* Audit Title */}
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {audit.title}
              </h2>
            </div>

            {/* Meta Information: Deadline, Requester, Target Agency */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-800">제출기한:</span>
                <span className={ddayInfo.isImminent ? 'font-bold text-amber-900 underline' : 'font-medium'}>
                  {formatKoreanDate(audit.deadline)}
                </span>
              </div>

              {audit.requester && (
                <div className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">요구:</span>
                  <span className="font-medium text-slate-700">{audit.requester}</span>
                </div>
              )}

              {audit.targetAgency && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500">소관:</span>
                  <span className="font-medium text-slate-700">{audit.targetAgency}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            
            {/* Status Switcher Button */}
            <button
              onClick={() => onToggleAuditStatus(audit.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isOngoing
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
              }`}
            >
              {isOngoing ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>종료 처리</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>진행중으로 복원</span>
                </>
              )}
            </button>

            {/* Edit Audit */}
            <button
              onClick={() => onEditAudit(audit)}
              title="감사 정보 수정"
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Delete Audit */}
            <button
              onClick={() => onDeleteAudit(audit.id)}
              title="감사 삭제"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Accordion Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? '접기' : '항목 펼치기'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Audit Common Guidelines / Forms Download Row */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
              감사 지침/공통서식:
            </span>
            {audit.guidelineFiles.length > 0 ? (
              audit.guidelineFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => downloadFile(file)}
                  title="클릭하여 파일 다운로드"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer group"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="max-w-[220px] truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({formatFileSize(file.size)})</span>
                  <Download className="w-3 h-3 text-blue-500 ml-0.5" />
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">등록된 공통 지침 파일 없음</span>
            )}
          </div>

          <button
            onClick={() => onOpenGuidelineUploadModal(audit)}
            className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold hover:text-blue-900 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3 h-3" />
            <span>+ 지침/서식 파일 추가</span>
          </button>
        </div>

      </div>

      {/* Audit Items Table Section */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          
          {/* Items Section Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>요구자료 세부 항목</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {filteredItems.length}건 표시
                </span>
              </h3>

              {viewFilter === 'dept_only' && hiddenNonDeptCount > 0 && (
                <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  팀 무관 {hiddenNonDeptCount}건 숨김
                </span>
              )}
            </div>

            {/* Quick Add Item inside card */}
            <button
              onClick={() => onAddItemDirectly(audit.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 새 요구항목 추가</span>
            </button>
          </div>

          {/* Items List */}
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.departmentRelated
                      ? 'bg-emerald-50/25 border-emerald-300 ring-1 ring-emerald-500/10'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    
                    {/* Left: Item Number, Title, Description, Department Y/N, Meta */}
                    <div className="flex-1 space-y-1.5">
                      
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.itemNumber}
                        </span>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.title}
                            </h4>

                            {/* SPEC REQUIREMENT: 감사 항목별 팀 관련 내용 (Y/N) 체크 항목 */}
                            <button
                              onClick={() => onToggleItemDepartmentRelated(audit.id, item.id)}
                              title="클릭하여 팀 관련 여부(Y/N) 전환"
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                                item.departmentRelated
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs hover:bg-emerald-700'
                                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              {item.departmentRelated ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>팀 관련 (Y)</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" />
                                  <span>해당 없음 (N)</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Sub description / instructions */}
                          {item.description && (
                            <p className="text-xs text-slate-600 mt-1 pl-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {item.notes && (
                            <p className="text-[11px] text-blue-700 font-medium mt-1 bg-blue-50/80 px-2 py-0.5 rounded inline-block">
                              메모: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* SPEC REQUIREMENT: 감사 항목별 서식 또는 참고자료를 업로드 할 수 있는 기능 (다른 사람이 업로드 된 것을 다운받을 수 있어야 함) */}
                      <div className="pt-2 pl-7.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-600" />
                          첨부자료:
                        </span>

                        {item.files && item.files.length > 0 ? (
                          item.files.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => downloadFile(file)}
                              title={`${file.uploaderName || '담당자'} 등록 | 클릭하여 다운로드`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer group"
                            >
                              <Paperclip className="w-3 h-3 text-blue-500" />
                              <span className="max-w-[180px] truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400">({formatFileSize(file.size)})</span>
                              <Download className="w-3 h-3 text-blue-600 group-hover:translate-y-0.5 transition-transform ml-0.5" />
                            </button>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">첨부 서식 없음</span>
                        )}

                        {/* Upload file button for this item */}
                        <button
                          onClick={() => onOpenItemUploadModal(audit.id, item)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>서식/자료 업로드</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                {viewFilter === 'dept_only'
                  ? '현재 우리 팀 관련(Y)으로 체크된 항목이 없습니다.'
                  : '등록된 감사 세부 항목이 없습니다.'}
              </p>
              <button
                onClick={() => onAddItemDirectly(audit.id)}
                className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                + 새 항목 추가하기
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
