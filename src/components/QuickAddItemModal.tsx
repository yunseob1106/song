import React, { useState, useRef } from 'react';
import { X, Plus, Paperclip, Check, FileText } from 'lucide-react';
import { AuditItem, AttachedFile } from '../types';
import { createAttachedFile, formatFileSize } from '../utils/fileUtils';

interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTitle: string;
  onAddItem: (item: AuditItem) => void;
  existingCount: number;
}

export const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({
  isOpen,
  onClose,
  auditTitle,
  onAddItem,
  existingCount,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentRelated, setDepartmentRelated] = useState(true); // Y default
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const attached: AttachedFile[] = [];
      for (const f of selected) {
        const itemFile = await createAttachedFile(f, '담당자');
        attached.push(itemFile);
      }
      setFiles((prev) => [...prev, ...attached]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: AuditItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemNumber: existingCount + 1,
      title: title.trim(),
      description: description.trim() || undefined,
      departmentRelated,
      status: 'pending',
      files,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* 4-Color Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500" />
        
        {/* Solid Header */}
        <div className="p-6 pb-4 flex items-start justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-md">
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <Plus className="w-5 h-5 text-white stroke-[3]" />
              <span>감사 요구 세부 항목 추가</span>
            </h3>
            <p className="text-xs text-blue-100 mt-1 truncate max-w-sm font-medium">
              [{auditTitle}]
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              요구자료 항목명 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 최근 3년간 사이버 침해사고 접수 및 조치 현황"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Department Related Toggle (Solid Buttons) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              팀 관련 여부 (Y/N) 체크
            </label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDepartmentRelated(true)}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                  departmentRelated
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                ✓ 팀 관련 (Y) - 우리 팀
              </button>
              <button
                type="button"
                onClick={() => setDepartmentRelated(false)}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                  !departmentRelated
                    ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-300'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                ✕ 해당 없음 (N) - 타부서
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              세부 작성 지침 / 요구사항
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="제출 기준, 연도별 데이터 범위 등"
              className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* File attachment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                서식 또는 참고자료 파일
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 font-bold hover:underline cursor-pointer"
              >
                + 파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-1.5 mt-1">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs">
                    <span className="truncate max-w-[240px] text-white font-medium">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
            >
              항목 추가 완료
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
