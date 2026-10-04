import React from "react";
import { 
  PenTool, 
  Mic, 
  FileText,
  Calendar,
  Share2, 
  Settings,
  FolderArchive,
  LogOut,
  Sparkles
} from "lucide-react";

/**
 * Warm Minimal Slim Floating Sidebar
 * - 독립적으로 배치된 슬림한 Floating Capsule 형태 (width: ~76px)
 * - 밝은 배경과 은은한 테두리, 부드러운 그림자 (#FAF8F5 / #E7E2D9)
 * - 선택 상태: #292B2F 다크 원형 배경 + #D8C76A 골드 액센트 / 화이트 아이콘
 * - 기본 상태: 소프트 호버 + 다크 그레이 아이콘 (#292B2F)
 */
export default function Sidebar({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) {
  // 메인 네비게이션 아이템
  const navItems = [
    { id: "writer", label: "기사 작성", icon: PenTool, isTab: true },
    { id: "interview", label: "녹음 파일 및 인터뷰", icon: Mic, isTab: true },
    { id: "search", label: "취재자료 및 기사 목록", icon: FileText, isTab: true },
    { id: "schedule", label: "취재 캘린더 / 일정", icon: Calendar, isTab: false, onClick: () => alert("취재 일정 캘린더 기능이 준비 중입니다.") },
    { id: "convert", label: "플랫폼 변환", icon: Share2, isTab: true },
    { id: "settings", label: "환경 설정", icon: Settings, isTab: false, onClick: () => alert("디지털 편집국 설정 패널입니다.") },
  ];

  // 활성 탭 식별 함수
  const isTabActive = (tabId) => {
    if (tabId === "writer") {
      return ["writer", "factcheck"].includes(activeTab);
    }
    return activeTab === tabId;
  };

  return (
    <aside className="h-full z-20 select-none flex flex-col items-center flex-shrink-0">
      <div 
        className="floating-soft-sidebar w-[74px] md:w-[78px] py-5 px-3 flex flex-col items-center"
        style={{ minHeight: "calc(100vh - 100px)" }}
      >
        
        {/* 1. 최상단 로고 / 브랜드 심볼 */}
        <button
          onClick={() => setActiveTab("writer")}
          className="w-11 h-11 mb-4 rounded-full flex items-center justify-center text-[#292B2F] hover:bg-[#E7E2D9]/60 transition-all cursor-pointer group"
          title="AI Newsroom 홈"
        >
          <div className="w-8 h-8 rounded-xl bg-[#292B2F] text-[#FAF8F5] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-xs font-black tracking-tighter">▲</span>
          </div>
        </button>

        {/* 2. 메인 네비게이션 아이콘 리스트 */}
        <div className="flex flex-col items-center gap-3.5 w-full">
          {navItems.map((item) => {
            const active = item.isTab && isTabActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isTab) {
                    setActiveTab(item.id);
                  } else if (item.onClick) {
                    item.onClick();
                  }
                }}
                title={item.label}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative group ${
                  active
                    ? "bg-[#292B2F] text-[#D8C76A] shadow-[0_4px_14px_rgba(41,43,47,0.18)] scale-105"
                    : "text-[#57514A] hover:text-[#292B2F] hover:bg-[#E7E2D9]/70"
                }`}
              >
                <Icon 
                  className={`w-4.5 h-4.5 transition-colors ${
                    active ? "text-[#D8C76A]" : "text-[#57514A] group-hover:text-[#292B2F]"
                  }`} 
                />
                
                {/* 툴팁 */}
                <div className="absolute left-[84px] bg-[#292B2F] text-[#FAF8F5] text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. 구분선 */}
        <div className="w-8 h-[1px] bg-[#E7E2D9] my-4" />

        {/* 4. 보관함 (나의 기사 모아보기) */}
        <button
          onClick={() => setActiveTab("archive")}
          title="기사 보관함"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative group ${
            activeTab === "archive"
              ? "bg-[#292B2F] text-[#D8C76A] shadow-[0_4px_14px_rgba(41,43,47,0.18)] scale-105"
              : "text-[#57514A] hover:text-[#292B2F] hover:bg-[#E7E2D9]/70"
          }`}
        >
          <FolderArchive className="w-4.5 h-4.5" />
          <div className="absolute left-[84px] bg-[#292B2F] text-[#FAF8F5] text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
            기사 보관함
          </div>
        </button>

        {/* 5. 최하단: 사용자 프로필 아바타 */}
        <div className="mt-auto pt-4 flex flex-col items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E7E2D9] hover:border-[#292B2F] transition-colors cursor-pointer shadow-xs group relative"
            title="김동아 기자 프로필"
            onClick={() => alert("김동아 기자 (디지털 편집국)")}
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
              alt="User Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // 대체 아바타 표시
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-[#292B2F] text-[#FAF8F5] text-xs font-extrabold flex items-center justify-center -z-10">
              김
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
