export type AuditType = '국정감사' | '행정감사' | '기타';

export type AuditStatus = 'ongoing' | 'completed';

export type ItemStatus = 'pending' | 'in_progress' | 'completed';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // base64 representation for persistent download
  uploadedAt: string;
  uploaderName?: string;
}

export interface AuditItem {
  id: string;
  itemNumber: number;
  title: string;
  description?: string;
  departmentRelated: boolean; // Y or N
  departmentName?: string;
  status: ItemStatus;
  files: AttachedFile[]; // 서식 또는 참고자료
  assignee?: string;
  notes?: string;
  updatedAt: string;
}

export interface Audit {
  id: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  deadline: string; // ISO date string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  requester?: string; // e.g. "○○○ 의원실"
  targetAgency?: string; // e.g. "교육위원회", "행정안전위원회"
  guidelineFiles: AttachedFile[]; // 감사 지침/서식
  items: AuditItem[];
  createdAt: string;
  updatedAt: string;
}

export type ViewFilter = 'all' | 'dept_only'; // 전체 보기 / 팀 관련 내용만 보기
export type StatusFilter = 'all' | 'ongoing' | 'completed';
