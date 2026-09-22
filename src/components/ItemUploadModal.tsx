import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, Paperclip } from 'lucide-react';
import { createAttachedFile, formatFileSize } from '../utils/fileUtils';
import { AttachedFile } from '../types';

interface ItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  onSaveFiles: (files: AttachedFile[]) => void;
}

export const ItemUploadModal: React.FC<ItemUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  onSaveFiles,
}) => {
  const [uploaderName, setUploaderName] = useState('감사담당자');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);

    try {
      const attachedList: AttachedFile[] = [];
      for (const f of selectedFiles) {
        const attached = await createAttachedFile(f, uploaderName.trim() || '담당자');
        attachedList.push(attached);
      }
      onSaveFiles(attachedList);
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* 4-Color Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500" />
        
        {/* Solid Header */}
        <div className="p-6 pb-5 flex items-start justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-md">
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <Upload className="w-5 h-5 text-white stroke-[2.5]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-blue-100 mt-1 max-w-sm line-clamp-2 font-medium">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Solid Dark Palette */}
        <div className="p-6 space-y-4">
          
          {/* Uploader Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              작성자 / 팀명
            </label>
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="예: 디지털혁신팀 김주무관"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Drag & Drop File select Area with Solid Box */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              첨부할 서식 또는 참고자료 파일
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-500/60 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-800/80 hover:bg-slate-800 transition-all shadow-inner"
            >
              <Paperclip className="w-9 h-9 text-blue-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-black text-white">
                파일을 클릭하여 선택하거나 이곳으로 드래그하세요
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                서식(HWP, Excel, Word), 증빙자료(PDF, Zip 등) 업로드 가능
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              <div className="text-xs font-bold text-slate-300">
                선택된 파일 ({selectedFiles.length}개):
              </div>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs shadow-md"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-white truncate">{file.name}</span>
                    <span className="text-slate-400">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-blue-200 bg-blue-950/70 p-3 rounded-xl border border-blue-800/60 font-medium">
            💡 업로드된 파일은 다른 팀원이 즉시 내려받아 작성 서식으로 활용할 수 있습니다.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              id="btn-confirm-upload"
              disabled={selectedFiles.length === 0 || isProcessing}
              onClick={handleUploadSubmit}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-white rounded-xl transition-all cursor-pointer shadow-md ${
                selectedFiles.length === 0 || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-600/30'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isProcessing ? '업로드 처리중...' : `파일 ${selectedFiles.length}개 업로드 완료`}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
