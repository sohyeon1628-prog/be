import React, { useState } from "react";
import { 
  FolderArchive, 
  FileText, 
  Search, 
  Mic, 
  Image as ImageIcon, 
  Sparkles, 
  History, 
  FolderOpen
} from "lucide-react";
import { initialArticles, mockSources, mockInterviews } from "../data/mockData";

export default function ArchiveView() {
  const [selectedArticle, setSelectedArticle] = useState(initialArticles[0]);
  const [selectedTab, setSelectedTab] = useState("all"); // all | draft | published

  const filteredArticles = initialArticles.filter((art) => {
    if (selectedTab === "draft") return art.status === "작성 중";
    if (selectedTab === "published") return art.status === "발행본";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-6 animate-float-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EFECE6] border border-[#E7E2D9] rounded-2xl p-5 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#292B2F] flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-[#292B2F]" />
            기사 중심 통합 보관함
          </h2>
          <p className="text-xs text-[#8E8982] font-semibold mt-1">
            파편화된 파일 중심이 아닌, 하나의 '기사'를 중심으로 취재자료, 녹취, 사진, 변환 콘텐츠, 발행 이력을 통합 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-full text-xs font-semibold border border-[#E7E2D9]">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              selectedTab === "all" ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs font-bold" : "text-[#57514A] hover:text-[#292B2F]"
            }`}
          >
            전체 기사
          </button>
          <button
            onClick={() => setSelectedTab("draft")}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              selectedTab === "draft" ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs font-bold" : "text-[#57514A] hover:text-[#292B2F]"
            }`}
          >
            작성 중
          </button>
          <button
            onClick={() => setSelectedTab("published")}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              selectedTab === "published" ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs font-bold" : "text-[#57514A] hover:text-[#292B2F]"
            }`}
          >
            발행본
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Article List */}
        <div className="lg:col-span-4 space-y-3">
          <label className="text-xs font-extrabold text-[#292B2F] block">기사 선택 (기사 중심 보기)</label>

          <div className="space-y-3">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedArticle.id === art.id
                    ? "bg-white border-[#292B2F] ring-1 ring-[#292B2F]/20 shadow-xs"
                    : "bg-white/80 border-[#E7E2D9] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    art.status === "작성 중" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    {art.status}
                  </span>
                  <span className="text-[#8E8982]">{art.updatedAt}</span>
                </div>

                <h4 className="text-sm font-extrabold text-[#292B2F] line-clamp-1">{art.title}</h4>
                <p className="text-xs text-[#57514A] mt-1 line-clamp-2 leading-relaxed">{art.subtitle}</p>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#E7E2D9] text-[11px] text-[#8E8982] font-semibold">
                  <span>취재자료: {art.linkedSources.length}건</span>
                  <span>|</span>
                  <span>녹취: {art.linkedInterviews.length}건</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Article Tree View */}
        <div className="lg:col-span-8 bg-[#EFECE6] rounded-2xl border border-[#E7E2D9] p-6 space-y-6">
          <div className="border-b border-[#E7E2D9] pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-white text-[#292B2F] px-2.5 py-1 rounded-lg border border-[#E7E2D9]">
                선택된 기사 패키지
              </span>
              <span className="text-xs text-[#8E8982] font-semibold">ID: {selectedArticle.id}</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#292B2F]">{selectedArticle.title}</h3>
            <p className="text-xs text-[#57514A] font-bold">{selectedArticle.subtitle}</p>
          </div>

          {/* Integrated Asset Tree */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-[#292B2F] uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-[#292B2F]" />
              연결된 통합 작업물 구조 (원고 / 취재자료 / 인터뷰 / 사진 / 변환본 / 이력)
            </h4>

            <div className="space-y-3 pl-2 border-l-2 border-[#D8D2C6]">
              {/* 1. 원고 (Master) */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <FileText className="w-4 h-4 text-[#292B2F] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">원고 (원본 Master)</span>
                    <span className="text-[10px] bg-[#E7E2D9] px-1.5 py-0.5 rounded text-[#292B2F] font-bold">최신 버전</span>
                  </div>
                  <p className="text-[#57514A] line-clamp-2">{selectedArticle.content}</p>
                </div>
              </div>

              {/* 2. 취재자료 (Source) */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <Search className="w-4 h-4 text-[#292B2F] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">취재자료 ({selectedArticle.linkedSources.length}건)</span>
                    <span className="text-[10px] bg-[#E7E2D9] text-[#292B2F] px-1.5 py-0.5 rounded font-bold">공식 출처</span>
                  </div>
                  {selectedArticle.linkedSources.map((srcId) => {
                    const src = mockSources.find((s) => s.id === srcId);
                    return src ? (
                      <div key={src.id} className="text-[#57514A] font-semibold">
                        • [{src.category}] {src.title}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* 3. 인터뷰·녹취 (Interview) */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <Mic className="w-4 h-4 text-[#292B2F] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">인터뷰·녹취 전사본</span>
                    <span className="text-[10px] bg-[#E7E2D9] text-[#292B2F] px-1.5 py-0.5 rounded font-bold">확인·수정본</span>
                  </div>
                  {mockInterviews[0] && (
                    <p className="text-[#57514A] font-semibold">• {mockInterviews[0].title} ({mockInterviews[0].audioDuration})</p>
                  )}
                </div>
              </div>

              {/* 4. 사진·영상 (Media) */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <ImageIcon className="w-4 h-4 text-[#292B2F] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">사진·미디어 ({selectedArticle.photos.length}건)</span>
                    <span className="text-[10px] bg-[#E7E2D9] text-[#292B2F] px-1.5 py-0.5 rounded font-bold">동아일보 규격</span>
                  </div>
                  {selectedArticle.photos.map((p) => (
                    <div key={p.id} className="text-[#57514A]">
                      • 캡션: {p.caption} (출처: {p.source})
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. 카드뉴스/영상 */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#292B2F] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">편집·변환본 (카드뉴스 / 숏폼)</span>
                    <span className="text-[10px] bg-[#E7E2D9] text-[#292B2F] px-1.5 py-0.5 rounded font-bold">자동 변환</span>
                  </div>
                  <p className="text-[#57514A]">• 카드뉴스 3장 생성 완료 및 숏폼 스크립트 작성됨</p>
                </div>
              </div>

              {/* 6. 발행 이력 */}
              <div className="p-3 bg-white rounded-xl border border-[#E7E2D9] flex items-start gap-3">
                <History className="w-4 h-4 text-[#8E8982] mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#292B2F]">발행 이력 및 타임라인</span>
                    <span className="text-[10px] bg-[#E7E2D9] text-[#57514A] px-1.5 py-0.5 rounded font-bold">히스토리</span>
                  </div>
                  <p className="text-[#57514A]">• 2026-10-01 14:30 AI 초안 생성 -&gt; 16:20 팩트체크 검증 완료</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
