import { Audit } from '../types';

export function getInitialAudits(): Audit[] {
  const now = new Date();
  
  // Create relative dates based on current date
  const addDays = (days: number, hour: number = 18) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const subDays = (days: number, hour: number = 18) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'audit-2026-001',
      title: '2026년도 국회 교육위원회 ○○○의원 국정감사 요구자료',
      type: '국정감사',
      status: 'ongoing',
      deadline: addDays(2, 17), // 2 days left (Imminent!)
      requester: '국회 교육위원회 ○○○ 의원실',
      targetAgency: '기획조정실 / 정보화운영처',
      guidelineFiles: [
        {
          id: 'guide-01',
          name: '2026년도_국정감사_요구자료_작성지침_및_표준서식.hwp',
          size: 1420000,
          type: 'application/x-hwp',
          uploadedAt: subDays(3),
          uploaderName: '감사총괄팀',
        },
        {
          id: 'guide-02',
          name: '국감_제출_일정_및_팀별_유의사항.pdf',
          size: 890000,
          type: 'application/pdf',
          uploadedAt: subDays(3),
          uploaderName: '감사총괄팀',
        },
      ],
      items: [
        {
          id: 'item-101',
          itemNumber: 1,
          title: '최근 3년간 클라우드 인프라 구축 및 지능형 AI 교육 서비스 예산 집행 현황',
          description: '연도별(2024~2026) 예산 편성액, 실제 집행액, 잔액 및 주요 성과 지표 포함',
          departmentRelated: true, // Y
          departmentName: '디지털혁신팀',
          status: 'in_progress',
          assignee: '김담당 주무관',
          notes: '2026년도 3분기 잠정집행액 수치 검증 진행중',
          files: [
            {
              id: 'file-101-1',
              name: '[서식1호]_클라우드_및_AI_예산집행현황_제출서식.xlsx',
              size: 245000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadedAt: subDays(2),
              uploaderName: '감사총괄팀',
            },
            {
              id: 'file-101-2',
              name: '2024-2025년도_기존국감_답변자료(참고용).pdf',
              size: 1250000,
              type: 'application/pdf',
              uploadedAt: subDays(1),
              uploaderName: '디지털혁신팀',
            }
          ],
          updatedAt: subDays(1),
        },
        {
          id: 'item-102',
          itemNumber: 2,
          title: '기관 내 전산 소프트웨어 및 라이선스 도입·계약 현황 및 보안 점검 결과',
          description: '인가 소프트웨어 목록, 수의계약 현황, 최근 정보보안 취약점 조치 내역',
          departmentRelated: true, // Y
          departmentName: '정보인프라팀',
          status: 'pending',
          assignee: '박선임 주임',
          notes: '보안점검 결과보고서 첨부 완료, 최종 결재 대기',
          files: [
            {
              id: 'file-102-1',
              name: '[서식2호]_SW라이선스_도입현황_표준양식.xlsx',
              size: 184000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadedAt: subDays(2),
              uploaderName: '감사총괄팀',
            }
          ],
          updatedAt: subDays(1),
        },
        {
          id: 'item-103',
          itemNumber: 3,
          title: '직할 연수원 시설물 내진성능 평가 및 소방방재 안전점검 실적',
          description: '안전관리등급 C등급 이하 시설물 현황 및 보수 예산 소요 내역',
          departmentRelated: false, // N (우리 팀 무관)
          departmentName: '시설안전관리과',
          status: 'completed',
          assignee: '이과장',
          notes: '시설관리팀 자체 작성 완료 및 제출',
          files: [
            {
              id: 'file-103-1',
              name: '[서식3호]_시설물_안전점검실적_보고서식.hwp',
              size: 512000,
              type: 'application/x-hwp',
              uploadedAt: subDays(2),
              uploaderName: '감사총괄팀',
            }
          ],
          updatedAt: subDays(2),
        },
        {
          id: 'item-104',
          itemNumber: 4,
          title: '개인정보 유출 방지 조치 현황 및 임직원 대상 정보보호 교육 이수율',
          description: '2024~2026 연간 정보보호 교육 계획 대비 실적, 모의해킹 훈련 결과',
          departmentRelated: true, // Y
          departmentName: '정보보안센터',
          status: 'completed',
          assignee: '최책임 연구원',
          notes: '감사총괄팀 1차 검토 완료, 제출본 파일 등록됨',
          files: [
            {
              id: 'file-104-1',
              name: '[서식4호]_정보보호교육이수율_및_조치현황.xlsx',
              size: 320000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadedAt: subDays(2),
              uploaderName: '감사총괄팀',
            },
            {
              id: 'file-104-2',
              name: '최종제출본_정보보호교육실적_보고서(직인본).pdf',
              size: 980000,
              type: 'application/pdf',
              uploadedAt: subDays(1),
              uploaderName: '정보보안센터',
            }
          ],
          updatedAt: subDays(1),
        },
        {
          id: 'item-105',
          itemNumber: 5,
          title: '최근 3년간 소속 임직원 공무 국외출장 여비 정산 내역 및 결과보고서',
          description: '국외연수 및 학회 참석 여비 집행 및 결과보고서 미제출자 명단',
          departmentRelated: false, // N (우리 팀 무관)
          departmentName: '총무인사팀',
          status: 'in_progress',
          assignee: '정계장',
          notes: '인사팀 취합 중',
          files: [],
          updatedAt: subDays(2),
        },
      ],
      createdAt: subDays(4),
      updatedAt: subDays(1),
    },
    {
      id: 'audit-2026-002',
      title: '2026년도 시의회 행정안전위원회 행정사무감사 사전 질의자료',
      type: '행정감사',
      status: 'ongoing',
      deadline: addDays(5, 18), // 5 days left
      requester: '시의회 행정안전위원회',
      targetAgency: '시민소통국 / 정보정책관',
      guidelineFiles: [
        {
          id: 'guide-201',
          name: '2026_시의회_행정사무감사_자료작성요령.pdf',
          size: 650000,
          type: 'application/pdf',
          uploadedAt: subDays(2),
          uploaderName: '의회협력담당관',
        }
      ],
      items: [
        {
          id: 'item-201',
          itemNumber: 1,
          title: '시민참여형 모바일 공공앱 유지보수 비용 및 사용자 활성화(MAU) 추이',
          description: '앱스토어 평점, 다운로드 수, 오류 개선 건수 및 차년도 기능개편 계획',
          departmentRelated: true, // Y
          departmentName: '디지털혁신팀',
          status: 'in_progress',
          assignee: '김담당 주무관',
          notes: 'MAU 통계 그래프 시각화 자료 작성중',
          files: [
            {
              id: 'file-201-1',
              name: '행감서식_모바일앱_유지보수현황.xlsx',
              size: 210000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadedAt: subDays(2),
              uploaderName: '의회협력담당관',
            }
          ],
          updatedAt: subDays(1),
        },
        {
          id: 'item-202',
          itemNumber: 2,
          title: '주민자치센터 공공 와이파이(Wi-Fi) 통신 품질 점검 및 교체 사업 현황',
          description: '구별 AP 설치 대수 및 장애 접수/처리율',
          departmentRelated: true, // Y
          departmentName: '통신망운영팀',
          status: 'pending',
          assignee: '한선임',
          notes: '',
          files: [],
          updatedAt: subDays(2),
        },
        {
          id: 'item-203',
          itemNumber: 3,
          title: '전통시장 및 취약계층 소방안전시설 현대화 지원 보조금 집행 실적',
          description: '보조금 정산 완료 여부 및 부정수급 적발 환수 내역',
          departmentRelated: false, // N
          departmentName: '소상공인지원과',
          status: 'in_progress',
          assignee: '윤주무관',
          notes: '',
          files: [],
          updatedAt: subDays(2),
        },
      ],
      createdAt: subDays(2),
      updatedAt: subDays(1),
    },
    {
      id: 'audit-2026-003',
      title: '2026년도 상반기 공공데이터 개방 및 품질관리 특정감사 요구서',
      type: '기타',
      status: 'ongoing',
      deadline: addDays(9, 15), // 9 days left
      requester: '감사원 행정안보감사국',
      targetAgency: '데이터전략담당관',
      guidelineFiles: [
        {
          id: 'guide-301',
          name: '공공데이터_품질점검_특정감사_실시통보서.pdf',
          size: 420000,
          type: 'application/pdf',
          uploadedAt: subDays(1),
          uploaderName: '감사실',
        }
      ],
      items: [
        {
          id: 'item-301',
          itemNumber: 1,
          title: '공공데이터 포털 제공 오픈API 연계 오류율 및 실시간 모니터링 로그',
          description: '트래픽 상위 10개 API의 서비스 가용률 및 장애 복구 시간',
          departmentRelated: true, // Y
          departmentName: '빅데이터운영팀',
          status: 'pending',
          assignee: '조연구원',
          notes: '로그 데이터 덤프 추출 예정',
          files: [],
          updatedAt: subDays(1),
        },
        {
          id: 'item-302',
          itemNumber: 2,
          title: '비정형 데이터 비식별화 조치 지침 준수 및 외부 제공 사전 심의 대장',
          description: '최근 1년간 개인식별 가능정보 포함 여부 검증 이력',
          departmentRelated: true, // Y
          departmentName: '데이터전략담당관',
          status: 'pending',
          assignee: '김담당 주무관',
          notes: '',
          files: [],
          updatedAt: subDays(1),
        }
      ],
      createdAt: subDays(1),
      updatedAt: subDays(1),
    },
    {
      id: 'audit-2026-004',
      title: '2025년도 결산검사 및 국정감사 시정·요구사항 조치결과 보고',
      type: '국정감사',
      status: 'completed', // 종료된 건!
      deadline: subDays(20, 18), // 이미 종료됨
      requester: '국회 예산결산특별위원회',
      targetAgency: '전 부서 공통',
      guidelineFiles: [
        {
          id: 'guide-401',
          name: '2025회계연도_시정요구사항_최종조치결과서_작성양식.hwp',
          size: 780000,
          type: 'application/x-hwp',
          uploadedAt: subDays(30),
          uploaderName: '감사총괄팀',
        }
      ],
      items: [
        {
          id: 'item-401',
          itemNumber: 1,
          title: '정보화 사업 불용액 최소화 대책 수립 및 분기별 집행점검 실적',
          description: '사전 사업타당성 검토 강화 및 예산 이월 방지 대책',
          departmentRelated: true, // Y
          departmentName: '디지털혁신팀',
          status: 'completed',
          assignee: '김담당 주무관',
          notes: '최종 국회 보고 완료 (완결 처리)',
          files: [
            {
              id: 'file-401-1',
              name: '국회제출완료_조치결과보고서(최종).pdf',
              size: 2150000,
              type: 'application/pdf',
              uploadedAt: subDays(20),
              uploaderName: '디지털혁신팀',
            }
          ],
          updatedAt: subDays(20),
        },
        {
          id: 'item-402',
          itemNumber: 2,
          title: '원격근무 보안 VPN 접속 이중인증(2FA) 전사 확대 적용 실적',
          description: '전 직원 스마트 OTP 및 생체인증 의무화 완료 증빙',
          departmentRelated: true, // Y
          departmentName: '정보보안센터',
          status: 'completed',
          assignee: '최책임 연구원',
          notes: '조치완료 통보 접수됨',
          files: [
            {
              id: 'file-402-1',
              name: '2FA_적용완료_검증결과보고.pdf',
              size: 890000,
              type: 'application/pdf',
              uploadedAt: subDays(20),
              uploaderName: '정보보안센터',
            }
          ],
          updatedAt: subDays(20),
        },
        {
          id: 'item-403',
          itemNumber: 3,
          title: '공용차량 배차 관리 시스템 전산화 및 유류비 정산 투명성 제고',
          description: 'GPS 연동 운행일지 및 유류카드 사용 관리 내역',
          departmentRelated: false, // N
          departmentName: '총무과',
          status: 'completed',
          assignee: '박차장',
          notes: '총무과 조치 완료',
          files: [],
          updatedAt: subDays(20),
        }
      ],
      createdAt: subDays(35),
      updatedAt: subDays(20),
    }
  ];
}
