import { AttachedFile } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Creates an AttachedFile object from an uploaded File
 */
export async function createAttachedFile(file: File, uploaderName: string = '담당자'): Promise<AttachedFile> {
  let dataUrl = '';
  try {
    dataUrl = await readFileAsDataUrl(file);
  } catch (e) {
    console.error('Failed to read file as data url', e);
  }

  return {
    id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    dataUrl,
    uploadedAt: new Date().toISOString(),
    uploaderName,
  };
}

/**
 * Triggers browser download for an AttachedFile
 */
export function downloadFile(file: AttachedFile): void {
  if (file.dataUrl) {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // If no dataUrl (e.g. sample initial file), generate a sample text/document blob
  const sampleContent = `[감사 제출 서식 및 참고자료]\n문서명: ${file.name}\n등록일시: ${new Date(file.uploadedAt).toLocaleString('ko-KR')}\n작성자: ${file.uploaderName || '감사담당자'}\n\n본 파일은 감사 자료 한눈에 보기 시스템에 등록된 표준 서식 및 요구자료 문서입니다.\n공식 양식에 따라 해당 팀 자료를 기한 내 작성하여 제출하시기 바랍니다.`;
  const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name.endsWith('.txt') || file.name.endsWith('.hwp') || file.name.endsWith('.xlsx') || file.name.endsWith('.pdf') ? file.name : `${file.name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
