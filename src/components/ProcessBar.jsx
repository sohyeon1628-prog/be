import React from "react";
import { PenTool, Sparkles, FolderArchive } from "lucide-react";

/**
 * Warm Minimal Soft Binder Tabs Component
 * - 레퍼런스 스타일: 둥근 Capsule / Soft Tab 형태
 * - 선택된 탭: Dark Circle Icon + Dark Text, 메인 컨테이너(#FAF8F5)와 매끄럽게 연결
 * - 비선택 탭: Soft Beige(#E7E2D9) 알약 캡슐
 */
export default function ProcessBar({ activeTab, setActiveTab }) {
  const steps = [
    { id: "writer", label: "작성·검토", icon: PenTool },
    { id: "convert", label: "플랫폼 변환", icon: Sparkles },
    { id: "archive", label: "보관함", icon: FolderArchive },
  ];

  // 활성 탭 식별 (writer 관련 하위 단계 포함)
  const isStepActive = (tabId) => {
    if (tabId === "writer") {
      return ["writer", "factcheck", "search"].includes(activeTab);
    }
    return activeTab === tabId;
  };

  return (
    <div className="w-full flex items-end justify-start gap-2.5 px-4 md:px-8 select-none relative z-30 mb-0">
      {steps.map((step) => {
        const active = isStepActive(step.id);
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            onClick={() => setActiveTab(step.id)}
            className={`transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-2.5 h-11 px-5 md:px-6 relative text-xs md:text-sm font-bold ${
              active
                ? "soft-tab-active text-[#292B2F]"
                : "soft-tab-inactive hover:text-[#292B2F]"
            }`}
            title={step.label}
          >
            {/* 좌측 하단 메인 컨테이너 연결 부드러운 오목 곡선 */}
            {active && (
              <div className="absolute -bottom-[3px] -left-3 w-3 h-3 pointer-events-none z-40">
                <svg viewBox="0 0 12 12" fill="none" className="w-full h-full">
                  <path d="M 0 12 A 12 12 0 0 0 12 0 V 12 H 0 Z" fill="#FAF8F5" />
                  <path d="M 0 12 A 12 12 0 0 0 12 0" stroke="#E7E2D9" strokeWidth="1" fill="none" />
                </svg>
              </div>
            )}

            {/* 바닥 메인 박스 가로 경계선 완전 융합 화이트 패치 */}
            {active && (
              <div className="absolute -bottom-[3px] left-0 right-0 h-[5px] bg-[#FAF8F5] z-40 pointer-events-none" />
            )}

            {/* 아이콘: 활성 시 다크 원형(#292B2F) + 골드/화이트 아이콘 */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                active ? "bg-[#292B2F] text-[#FAF8F5]" : "text-[#57514A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            
            <span className={active ? "font-extrabold text-[#292B2F]" : "font-medium text-[#57514A]"}>
              {step.label}
            </span>

            {/* 우측 하단 메인 컨테이너 연결 부드러운 오목 곡선 */}
            {active && (
              <div className="absolute -bottom-[3px] -right-3 w-3 h-3 pointer-events-none z-40">
                <svg viewBox="0 0 12 12" fill="none" className="w-full h-full">
                  <path d="M 0 0 A 12 12 0 0 0 12 12 H 0 V 0 Z" fill="#FAF8F5" />
                  <path d="M 0 0 A 12 12 0 0 0 12 12" stroke="#E7E2D9" strokeWidth="1" fill="none" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}