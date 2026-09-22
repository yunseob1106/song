import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Audit, AuditItem, ItemStatus, AttachedFile } from './types';
import { calculateDDay } from './utils/dateUtils';
import { Header } from './components/Header';
import { AuditSimpleItem } from './components/AuditSimpleItem';
import { AuditDetailView } from './components/AuditDetailView';
import { AuditModal } from './components/AuditModal';
import { ItemUploadModal } from './components/ItemUploadModal';
import { QuickAddItemModal } from './components/QuickAddItemModal';
import {
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Layers,
  Archive
} from 'lucide-react';

export default function App() {
  // 1. Firebase Firestore에서 실시간으로 감사 목록(audits) 불러오기
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    // Firestore 'audits' 컬렉션의 데이터가 변경될 때마다 실시간으로 화면 반영
    const unsubscribe = onSnapshot(collection(db, 'audits'), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Audit);
      setAudits(data);
    });
    return () => unsubscribe();
  }, []);

  // Active view: null means Main list; string is audit id currently being viewed in detail
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAuditForEdit, setSelectedAuditForEdit] = useState<Audit | null>(null);

  // Upload modal state
  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean;
    auditId: string;
    itemId?: string;
    title: string;
    subtitle: string;
    isGuideline?: boolean;
  }>({
    isOpen: false,
    auditId: '',
    title: '',
    subtitle: '',
  });

  // Quick Add Item modal state
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    auditId: string;
    auditTitle: string;
    existingCount: number;
  }>({
    isOpen: false,
    auditId: '',
    auditTitle: '',
    existingCount: 0,
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    let ongoing = 0;
    let completed = 0;
    let imminent = 0;

    audits.forEach((a) => {
      if (a.status === 'ongoing') {
        ongoing++;
        const dday = calculateDDay(a.deadline, false);
        if (dday.isImminent) imminent++;
      } else {
        completed++;
      }
    });

    return { ongoing, completed, imminent };
  }, [audits]);

  // Filtered audits by search
  const filteredAudits = useMemo(() => {
    if (!searchQuery.trim()) return audits;
    const q = searchQuery.toLowerCase().trim();
    return audits.filter((audit) => {
      const matchTitle = audit.title.toLowerCase().includes(q);
      const matchRequester = audit.requester?.toLowerCase().includes(q);
      const matchItem = audit.items.some(
        (it) => it.title.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q)
      );
      return matchTitle || matchRequester || matchItem;
    });
  }, [audits, searchQuery]);

  // Separate Ongoing (작성 대상) and Completed (종료)
  const ongoingAudits = useMemo(
    () => filteredAudits.filter((a) => a.status === 'ongoing'),
    [filteredAudits]
  );
  const completedAudits = useMemo(
    () => filteredAudits.filter((a) => a.status === 'completed'),
    [filteredAudits]
  );

  // Selected audit object for detail view
  const currentAudit = useMemo(() => {
    if (!activeAuditId) return null;
    return audits.find((a) => a.id === activeAuditId) || null;
  }, [audits, activeAuditId]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedAuditForEdit(null);
    setIsAuditModalOpen(true);
  };

  const handleEditAudit = (audit: Audit) => {
    setSelectedAuditForEdit(audit);
    setIsAuditModalOpen(true);
  };

  // 2. 감사 생성 및 수정 (requester 등 undefined 필드 완전 방지 안전 처리)
  const handleSaveAudit = async (auditToSave: Audit) => {
    try {
      const auditId =
        auditToSave.id && auditToSave.id.trim() !== ''
          ? auditToSave.id
          : `audit_${Date.now()}`;

      // undefined가 될 수 있는 필드를 기본값("") 처리하여 Firestore 거부 방지
      const safeData: Audit = {
        ...auditToSave,
        id: auditId,
        requester: auditToSave.requester ?? '',
        category: auditToSave.category ?? '',
        updatedAt: new Date().toISOString(),
        items: (auditToSave.items || []).map((item) => ({
          ...item,
          description: item.description ?? '',
          departmentRelated: item.departmentRelated ?? false,
          files: item.files || [],
        })),
        guidelineFiles: auditToSave.guidelineFiles || [],
      };

      const cleanData = JSON.parse(JSON.stringify(safeData));

      await setDoc(doc(db, 'audits', auditId), cleanData);
      setIsAuditModalOpen(false);
      showToast(`"${auditToSave.title}" 감사가 저장되었습니다.`);
    } catch (error) {
      console.error('Firestore 저장 상세 오류:', error);
      showToast('저장 중 오류가 발생했습니다.');
    }
  };

  // 3. 감사 삭제 (Firebase Firestore 삭제)
  const handleDeleteAudit = async (id: string) => {
    const target = audits.find((a) => a.id === id);
    if (!target) return;
    if (window.confirm(`'${target.title}' 감사 요구자료를 삭제하시겠습니까?`)) {
      try {
        await deleteDoc(doc(db, 'audits', id));
        if (activeAuditId === id) {
          setActiveAuditId(null);
        }
        showToast('감사가 삭제되었습니다.');
      } catch (error) {
        console.error('Firestore 삭제 상세 오류:', error);
        showToast('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 4. 감사 상태 변경 (ongoing <-> completed)
  const handleToggleAuditStatus = async (id: string) => {
    const target = audits.find((a) => a.id === id);
    if (!target) return;

    const newStatus = target.status === 'ongoing' ? 'completed' : 'ongoing';
    const updatedAudit: Audit = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      const cleanData = JSON.parse(JSON.stringify(updatedAudit));
      await setDoc(doc(db, 'audits', id), cleanData);
      showToast(
        newStatus === 'completed'
          ? '감사가 [종료] 처리되었습니다.'
          : '감사가 [작성 대상]으로 변경되었습니다.'
      );
    } catch (error) {
      console.error('상태 변경 상세 오류:', error);
    }
  };

  // 5. 항목 팀 관련 여부 토글 (Y / N)
  const handleToggleItemDepartmentRelated = async (auditId: string, itemId: string) => {
    const target = audits.find((a) => a.id === auditId);
    if (!target) return;

    let toastMsg = '';
    const updatedItems = target.items.map((item) => {
      if (item.id === itemId) {
        const newRelated = !item.departmentRelated;
        toastMsg = newRelated
          ? `항목 ${item.itemNumber}번이 [우리 팀 관련 (Y)]로 설정되었습니다.`
          : `항목 ${item.itemNumber}번이 [해당 없음 (N)]으로 변경되었습니다.`;
        return {
          ...item,
          departmentRelated: newRelated,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updatedAudit: Audit = {
      ...target,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    try {
      const cleanData = JSON.parse(JSON.stringify(updatedAudit));
      await setDoc(doc(db, 'audits', auditId), cleanData);
      if (toastMsg) showToast(toastMsg);
    } catch (error) {
      console.error('팀 관련 여부 변경 상세 오류:', error);
    }
  };

  // 6. 항목 작성 상태 변경 (작성 대기, 작성 중, 작성 완료)
  const handleChangeItemStatus = async (auditId: string, itemId: string, newStatus: ItemStatus) => {
    const target = audits.find((a) => a.id === auditId);
    if (!target) return;

    const updatedItems = target.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updatedAudit: Audit = {
      ...target,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    try {
      const cleanData = JSON.parse(JSON.stringify(updatedAudit));
      await setDoc(doc(db, 'audits', auditId), cleanData);
      showToast(
        newStatus === 'completed'
          ? '항목이 [작성 완료] 처리되었습니다.'
          : newStatus === 'in_progress'
          ? '항목이 [작성 중]으로 변경되었습니다.'
          : '항목이 [작성 대기]로 변경되었습니다.'
      );
    } catch (error) {
      console.error('항목 상태 변경 상세 오류:', error);
    }
  };

  const handleOpenItemUploadModal = (auditId: string, item: AuditItem) => {
    setUploadModal({
      isOpen: true,
      auditId,
      itemId: item.id,
      title: `[항목 ${item.itemNumber}] ${item.title}`,
      subtitle: '이 항목에 필요한 서식 파일(HWP, Excel 등)이나 참고자료를 업로드하세요.',
      isGuideline: false,
    });
  };

  const handleOpenGuidelineUploadModal = (audit: Audit) => {
    setUploadModal({
      isOpen: true,
      auditId: audit.id,
      title: `[공통 서식/지침] ${audit.title}`,
      subtitle: '팀 공통 작성 지침서, 기본 서식 파일 등을 업로드하세요.',
      isGuideline: true,
    });
  };

  // 7. 업로드 파일 정보 저장
  const handleSaveUploadedFiles = async (files: AttachedFile[]) => {
    const target = audits.find((a) => a.id === uploadModal.auditId);
    if (!target) return;

    let updatedAudit: Audit = { ...target };

    if (uploadModal.isGuideline) {
      updatedAudit = {
        ...target,
        guidelineFiles: [...target.guidelineFiles, ...files],
        updatedAt: new Date().toISOString(),
      };
    } else if (uploadModal.itemId) {
      const updatedItems = target.items.map((it) => {
        if (it.id === uploadModal.itemId) {
          return {
            ...it,
            files: [...it.files, ...files],
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      });
      updatedAudit = { ...target, items: updatedItems, updatedAt: new Date().toISOString() };
    }

    try {
      const cleanData = JSON.parse(JSON.stringify(updatedAudit));
      await setDoc(doc(db, 'audits', uploadModal.auditId), cleanData);
      setUploadModal((prev) => ({ ...prev, isOpen: false }));
      showToast(`파일 ${files.length}개가 성공적으로 등록되었습니다.`);
    } catch (error) {
      console.error('파일 등록 상세 오류:', error);
    }
  };

  const handleAddItemDirectly = (auditId: string) => {
    const target = audits.find((a) => a.id === auditId);
    if (!target) return;
    setQuickAddModal({
      isOpen: true,
      auditId,
      auditTitle: target.title,
      existingCount: target.items.length,
    });
  };

  // 8. 요구자료 항목 빠르게 추가 (안전 처리 반영)
  const handleSaveQuickItem = async (newItem: AuditItem) => {
    const target = audits.find((a) => a.id === quickAddModal.auditId);
    if (!target) return;

    const safeItem: AuditItem = {
      ...newItem,
      description: newItem.description ?? '',
      departmentRelated: newItem.departmentRelated ?? false,
      files: newItem.files || [],
    };

    const updatedAudit: Audit = {
      ...target,
      items: [...target.items, safeItem],
      updatedAt: new Date().toISOString(),
    };

    try {
      const cleanData = JSON.parse(JSON.stringify(updatedAudit));
      await setDoc(doc(db, 'audits', quickAddModal.auditId), cleanData);
      setQuickAddModal((prev) => ({ ...prev, isOpen: false }));
      showToast(`[항목 ${newItem.itemNumber}] 요구자료 항목이 추가되었습니다.`);
    } catch (error) {
      console.error('항목 추가 상세 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header with Quad-Chroma Accent and Solid Dark Canvas */}
      <Header
        onOpenCreateModal={handleOpenCreateModal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        imminentCount={metrics.imminent}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Toast Notification with Solid Fill */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-400/50 flex items-center gap-3 text-xs font-black shadow-blue-900/60 animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-xs shadow-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Mode: If an audit is clicked, show Detail View with Tabs */}
        {currentAudit ? (
          <AuditDetailView
            audit={currentAudit}
            onBack={() => setActiveAuditId(null)}
            onEditAudit={handleEditAudit}
            onDeleteAudit={handleDeleteAudit}
            onToggleAuditStatus={handleToggleAuditStatus}
            onToggleItemDepartmentRelated={handleToggleItemDepartmentRelated}
            onChangeItemStatus={handleChangeItemStatus}
            onOpenItemUploadModal={handleOpenItemUploadModal}
            onOpenGuidelineUploadModal={handleOpenGuidelineUploadModal}
            onAddItemDirectly={handleAddItemDirectly}
          />
        ) : (
          /* Main Page: Simple Two Sections (작성 대상, 종료) with Full Rich Color Fills */
          <div className="space-y-7">
            {/* Top Bar with Simple Header & Action */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    감사 요구자료 목록
                  </h2>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30">
                    전체 {audits.length}건
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  요구자료 카드를 클릭하면 세부 지침 및 요구자료별 탭으로 바로 이동합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>감사 등록</span>
                </button>
              </div>
            </div>

            {/* 1. 작성 대상 Section */}
            <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Top Color Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-blue-500" />

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                    <span className="w-3 h-3 rounded-full bg-rose-500 relative" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    작성 대상
                  </h3>
                  <span className="text-xs px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black shadow-md">
                    {ongoingAudits.length}건
                  </span>
                </div>

                <span className="text-xs font-bold text-rose-200 bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-800/60 shadow-inner">
                  준비 및 작성 필요
                </span>
              </div>

              {ongoingAudits.length > 0 ? (
                <div className="space-y-3">
                  {ongoingAudits.map((audit, idx) => (
                    <AuditSimpleItem
                      key={audit.id}
                      audit={audit}
                      index={idx}
                      onClick={() => setActiveAuditId(audit.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                  현재 작성 대상인 감사 자료가 없습니다.
                </div>
              )}
            </section>

            {/* 2. 종료 Section */}
            <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-200 tracking-tight">
                    종료
                  </h3>
                  <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black shadow-md">
                    {completedAudits.length}건
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800/60 shadow-inner">
                  제출 완료 및 이력
                </span>
              </div>

              {completedAudits.length > 0 ? (
                <div className="space-y-3">
                  {completedAudits.map((audit, idx) => (
                    <AuditSimpleItem
                      key={audit.id}
                      audit={audit}
                      index={idx}
                      onClick={() => setActiveAuditId(audit.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                  종료된 감사 자료가 없습니다.
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="flex items-center justify-center gap-2 font-black">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="ml-1 text-slate-300">감사 자료 한눈에 보기</span>
        </div>
      </footer>

      {/* Modals */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSave={handleSaveAudit}
        initialAudit={selectedAuditForEdit}
      />

      <ItemUploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal((prev) => ({ ...prev, isOpen: false }))}
        title={uploadModal.title}
        subtitle={uploadModal.subtitle}
        onSaveFiles={handleSaveUploadedFiles}
      />

      <QuickAddItemModal
        isOpen={quickAddModal.isOpen}
        onClose={() => setQuickAddModal((prev) => ({ ...prev, isOpen: false }))}
        auditTitle={quickAddModal.auditTitle}
        existingCount={quickAddModal.existingCount}
        onAddItem={handleSaveQuickItem}
      />
    </div>
  );
}