import React, { useState, useRef, useEffect } from 'react';
import {
  Audit,
  AuditItem,
  AuditType,
  AuditStatus,
  AttachedFile,
  ItemStatus
} from '../types';
import {
  X,
  Plus,
  Trash2,
  Paperclip,
  Upload,
  Calendar,
  Building,
  UserCheck,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { createAttachedFile, downloadFile, formatFileSize } from '../utils/fileUtils';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audit: Audit) => void;
  initialAudit?: Audit | null;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAudit,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AuditType>('국정감사');
  const [status, setStatus] = useState<AuditStatus>('ongoing');
  const [deadline, setDeadline] = useState('');
  const [requester, setRequester] = useState('');
  const [targetAgency, setTargetAgency] = useState('');
  const [guidelineFiles, setGuidelineFiles] = useState<AttachedFile[]>([]);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const guidelineInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (initialAudit) {
      setTitle(initialAudit.title);
      setType(initialAudit.type);
      setStatus(initialAudit.status);
      // Format deadline for datetime-local input (YYYY-MM-DDTHH:mm)
      if (initialAudit.deadline) {
        const d = new Date(initialAudit.deadline);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setDeadline(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      } else {
        setDeadline('');
      }
      setRequester(initialAudit.requester || '');
      setTargetAgency(initialAudit.targetAgency || '');
      setGuidelineFiles(initialAudit.guidelineFiles || []);
      setItems(initialAudit.items || []);
    } else {
      // Default new audit values
      setTitle('');
      setType('국정감사');
      setStatus('ongoing');
      
      // Default deadline: 3 days later 18:00
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      defaultDate.setHours(18, 0, 0, 0);
      const yyyy = defaultDate.getFullYear();
      const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dd = String(defaultDate.getDate()).padStart(2, '0');
      setDeadline(`${yyyy}-${mm}-${dd}T18:00`);

      setRequester('');
      setTargetAgency('');
      setGuidelineFiles([]);
      // Provide 1 initial blank item for convenience
      setItems([
        {
          id: 'item-new-' + Date.now(),
          itemNumber: 1,
          title: '',
          description: '',
          departmentRelated: true, // Default Y
          departmentName: '우리 팀',
          status: 'pending',
          files: [],
          notes: '',
          updatedAt: new Date().toISOString(),
        }
      ]);
    }
    setErrorMessage('');
  }, [initialAudit, isOpen]);

  if (!isOpen) return null;

  // Handle Guideline files upload
  const handleGuidelineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const attached: AttachedFile[] = [];
      for (const f of files) {
        const fileObj = await createAttachedFile(f, '감사총괄');
        attached.push(fileObj);
      }
      setGuidelineFiles((prev) => [...prev, ...attached]);
    }
  };

  const handleRemoveGuidelineFile = (id: string) => {
    setGuidelineFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Add new audit item
  const handleAddItem = () => {
    const nextNumber = items.length > 0 ? Math.max(...items.map((it) => it.itemNumber)) + 1 : 1;
    const newItem: AuditItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemNumber: nextNumber,
      title: '',
      description: '',
      departmentRelated: true, // Default Y
      departmentName: '우리 팀',
      status: 'pending',
      files: [],
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update specific item field
  const handleUpdateItem = (id: string, field: keyof AuditItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value, updatedAt: new Date().toISOString() };
        }
        return item;
      })
    );
  };

  // Upload file for a specific item
  const handleItemFileUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const attached: AttachedFile[] = [];
      for (const f of files) {
        const fileObj = await createAttachedFile(f, '팀담당자');
        attached.push(fileObj);
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              files: [...item.files, ...attached],
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
    }
  };

  // Remove file from specific item
  const handleRemoveItemFile = (itemId: string, fileId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            files: item.files.filter((f) => f.id !== fileId),
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      // Keep at least one empty
      setItems([
        {
          id: 'item-reset-' + Date.now(),
          itemNumber: 1,
          title: '',
          description: '',
          departmentRelated: true,
          status: 'pending',
          files: [],
          updatedAt: new Date().toISOString(),
        }
      ]);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('감사 제목을 입력해주세요.');
      return;
    }
    if (!deadline) {
      setErrorMessage('제출기한을 설정해주세요.');
      return;
    }

    // Filter out items that have no title and sanitize numbers
    const validItems = items.filter((it) => it.title.trim() !== '');
    if (validItems.length === 0) {
      setErrorMessage('최소 1개 이상의 감사 세부 요구항목을 입력해주세요.');
      return;
    }

    const renumberedItems = validItems.map((it, idx) => ({
      ...it,
      itemNumber: idx + 1,
    }));

    const auditToSave: Audit = {
      id: initialAudit ? initialAudit.id : 'audit-' + Date.now(),
      title: title.trim(),
      type,
      status,
      deadline: new Date(deadline).toISOString(),
      requester: requester.trim() || undefined,
      targetAgency: targetAgency.trim() || undefined,
      guidelineFiles,
      items: renumberedItems,
      createdAt: initialAudit ? initialAudit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(auditToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-800 max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* 4-Color Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500 flex-shrink-0" />
        
        {/* Modal Header with Solid Gradient Fill */}
        <div className="p-6 pb-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex-shrink-0 shadow-md">
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
              {initialAudit ? '감사 요구자료 수정' : '국정감사 / 행정감사 신규 등록'}
            </h2>
            <p className="text-xs text-blue-100 mt-1 font-medium">
              요구된 감사의 기본 정보와 세부 항목, 팀 관련 여부(Y/N) 및 서식을 등록합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>1. 감사 기본 정보</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Audit Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  감사 제목 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 2026년 ○○○의원 국정감사 요구자료"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
                />
              </div>

              {/* Audit Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  감사 종류 <span className="text-rose-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AuditType)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                >
                  <option value="국정감사">국정감사</option>
                  <option value="행정감사">행정감사</option>
                  <option value="기타">기타 감사</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Submission Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  제출기한 설정 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * 기한에 따라 D-Day 및 마감임박(D-3)이 자동 계산됩니다.
                </p>
              </div>

              {/* Requester */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  요구자 / 의원실
                </label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder="예: 교육위 ○○○의원실"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  진행 상태 구분
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('ongoing')}
                    className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                      status === 'ongoing'
                        ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    진행중 (준비 필요)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('completed')}
                    className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    종료 (제출 완료)
                  </button>
                </div>
              </div>
            </div>

            {/* Common Guideline / Form Files Upload */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    감사 지침 및 공통 서식 첨부 (선택)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    전체 팀 공통 작성요령, 국정감사 요구자료 서식 파일 업로드
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => guidelineInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <Upload className="w-3 h-3 stroke-[2.5]" />
                  <span>지침서식 파일 추가</span>
                </button>
                <input
                  ref={guidelineInputRef}
                  type="file"
                  multiple
                  onChange={handleGuidelineUpload}
                  className="hidden"
                />
              </div>

              {guidelineFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {guidelineFiles.map((file) => (
                    <div
                      key={file.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium text-slate-800 max-w-[200px] truncate">
                        {file.name}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        ({formatFileSize(file.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGuidelineFile(file.id)}
                        className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">등록된 공통 지침/서식 파일이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Section 2: Direct Audit Items Registration */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>2. 감사 세부 요구 항목 등록</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black shadow-sm">
                    {items.length}개 항목
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  항목별 요구자료명, 팀 관련 여부(Y/N) 체크 및 전용 서식을 직접 등록합니다.
                </p>
              </div>

              {/* 직접 등록 버튼 */}
              <button
                type="button"
                id="btn-add-audit-item"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ 세부 항목 추가</span>
              </button>
            </div>

            {/* List of items */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.departmentRelated
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/20'
                      : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Item Number Badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Item Core Fields */}
                    <div className="flex-1 space-y-2.5">
                      
                      {/* Item Title & Department Y/N Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <input
                          type="text"
                          required
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                          placeholder={`항목 ${index + 1}: 요구자료 명칭을 입력하세요 (예: 최근 3년간 시스템 도입 현황)`}
                          className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                        />

                        {/* SPEC REQUIREMENT: 팀 관련 내용 (Y/N) 체크 항목 */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs font-bold text-slate-400 mr-1">
                            팀 관련:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(item.id, 'departmentRelated', true)}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                              item.departmentRelated
                                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            Y (관련)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(item.id, 'departmentRelated', false)}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                              !item.departmentRelated
                                ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-300'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            N (해당없음)
                          </button>
                        </div>
                      </div>

                      {/* Detailed Description / Requirements */}
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="세부 요구 내용 및 작성 기준 (예: 연도별 집행액, 잔액, 계약업체명 필수 기재)"
                        className="w-full px-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-300"
                      />

                      {/* SPEC REQUIREMENT: 감사 항목별 서식 또는 참고자료 업로드 기능 (다운로드 가능) */}
                      <div className="pt-1.5 border-t border-slate-200/60 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            항목별 첨부 서식 및 참고자료 ({item.files.length}개)
                          </span>
                          <label className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>서식/참고자료 파일 첨부</span>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleItemFileUpload(item.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* List of files attached to this item */}
                        {item.files.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.files.map((file) => (
                              <div
                                key={file.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                              >
                                <span className="text-slate-700 font-medium max-w-[180px] truncate">
                                  {file.name}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  ({formatFileSize(file.size)})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemFile(item.id, file.id)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5"
                                  title="삭제"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="항목 삭제"
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Item Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>감사 세부 요구 항목 추가하기</span>
              </button>
            </div>

          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/70 rounded-b-3xl flex-shrink-0">
          <div className="text-xs text-slate-400">
            총 <span className="font-black text-white">{items.filter(i => i.title.trim()).length}</span>개 항목
            (우리 팀 관련: <span className="font-black text-emerald-400">{items.filter(i => i.title.trim() && i.departmentRelated).length}</span>개)
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              id="btn-save-audit"
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{initialAudit ? '수정사항 저장' : '감사 등록 완료'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
