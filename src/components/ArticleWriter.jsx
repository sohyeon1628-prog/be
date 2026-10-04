import React, { useState, useRef } from "react";
import FactCheckDrawer from "./FactCheckDrawer";
import { 
  Sparkles, 
  Search, 
  Check, 
  RotateCcw, 
  Bold, 
  Italic, 
  Underline,
  Quote, 
  Wand2, 
  AlertTriangle,
  Eye,
  Edit3,
  Columns,
  Image as ImageIcon,
  Upload,
  Send,
  Share2,
  Bookmark,
  ShieldCheck,
  List,
  ListOrdered,
  Link2,
  ChevronDown
} from "lucide-react";

export default function ArticleWriter({ 
  article, 
  setArticle, 
  onOpenSearch, 
  onRunFactCheck,
  factCheckActive,
  factCheckIssues,
  activeFactIndex,
  onApplyFactFix,
  onSkipFactFix
}) {
  // 1. 화면 뷰 모드: 'editor' (에디터만) | 'split' (에디터+미리보기 나란히) | 'preview' (미리보기 전체)
  const [viewMode, setViewMode] = useState("editor");

  // 팩트체크 & 근거자료 우측 슬라이더(Drawer) 열림 상태
  const [isFactCheckDrawerOpen, setIsFactCheckDrawerOpen] = useState(false);

  // 2. 미리보기 플랫폼 탭: 'donga' (동아일보 공식 웹) | 'naver' (네이버 뉴스 포털)
  const [previewPlatform, setPreviewPlatform] = useState("donga");

  // 3. 사진/미디어 관리 상태
  const [photos, setPhotos] = useState(article.photos || [
    {
      id: "photo-1",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      caption: "국내 연구진이 개발한 차세대 AI 반도체 웨이퍼 시제품",
      source: "한국반도체연구원",
      provider: "김동아 기자",
      ratio: "16:9 (동아일보 대표)"
    }
  ]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newSource, setNewSource] = useState("한국반도체연구원");
  const [newProvider, setNewProvider] = useState("김동아 기자");
  const [newRatio, setNewRatio] = useState("16:9");

  // 4. CMS 발행 이관 상태
  const [isCmsExporting, setIsCmsExporting] = useState(false);
  const [isCmsSuccessModal, setIsCmsSuccessModal] = useState(false);

  // 에디터 서식 및 제목 관련 상태
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isTitleConfirmed, setIsTitleConfirmed] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [floatingToolbarPos, setFloatingToolbarPos] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const editorRef = useRef(null);
  const photoInputRef = useRef(null);

  // 텍스트 드래그 선택 서식 툴바
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setFloatingToolbarPos(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 0) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = editorRef.current.getBoundingClientRect();

      setFloatingToolbarPos({
        top: Math.max(0, rect.top - containerRect.top - 48),
        left: Math.max(10, rect.left - containerRect.left + (rect.width / 2) - 120)
      });
    } else {
      setFloatingToolbarPos(null);
    }
  };

  const handleTitleConfirm = () => {
    setIsTitleConfirmed(true);
  };

  const handleRegenerateTitle = () => {
    const titles = [
      "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
      "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
      "초거대 AI 혁명 이끄는 K-반도체... 연산 속도 10배 끌어올린다",
      "GPU 한계 넘는다... 차세대 PIM·NPU 반도체 생태계 급부상"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    setArticle((prev) => ({ ...prev, suggestedTitle: randomTitle, title: randomTitle }));
    setIsTitleConfirmed(false);
  };

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setArticle((prev) => ({
        ...prev,
        title: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
        suggestedTitle: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
        subtitle: "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
        content: `인공지능(AI) 기술의 급격한 발전에 따라 고성능·고효율 AI 반도체의 수요가 폭발적으로 증가하고 있다. 기존 GPU 중심의 연산 시스템은 높은 전력 소비와 발열 문제로 한계에 부딪히고 있으며, 이에 따라 NPU(신경망 처리장치)와 PIM(지능형 반도체)이 차세대 대안으로 주목받고 있다.

국내 주요 기업과 연구진은 초거대 AI 모델 지원을 위한 고성능 AI 반도체를 자체 개발하여 글로벌 빅테크 기업들과 경쟁을 펼치고 있다. 이번 취재 결과, 국내 개발진은 데이터 병목 현상을 해결하고 전력 소비를 최대 70% 감소시키는 성과를 얻어냈다.

전문가들은 "단순한 칩 제조를 넘어 인공지능 알고리즘과의 최적화 소프트웨어가 향후 반도체 패권의 승패를 결정지을 것"이라고 조언했다. 이에 따른 정부 차원의 집중 지원과 실증 사업 확대가 시급한 시점이다.`
      }));
      setIsGenerating(false);
      setShowDraftModal(false);
      setIsTitleConfirmed(false);
    }, 1200);
  };

  const applyFormat = (formatType) => {
    if (!selectedText) {
      alert(`[${formatType}] 서식 도구가 선택되었습니다.`);
      return;
    }
    alert(`선택한 문장 "${selectedText.slice(0, 15)}..." 에 [${formatType}] 서식을 적용했습니다.`);
    setFloatingToolbarPos(null);
  };

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          const newPhoto = {
            id: `photo-${Date.now()}`,
            url: uploadEvt.target.result,
            caption: newCaption || file.name,
            source: newSource || "한국반도체연구원",
            provider: newProvider || "김동아 기자",
            ratio: newRatio
          };
          const updated = [newPhoto, ...photos];
          setPhotos(updated);
          setArticle((prev) => ({ ...prev, photos: updated }));
          setNewCaption("");
          setShowPhotoModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 본문에 사진 태그 삽입
  const handleInsertPhotoToContent = (photo) => {
    const photoTag = `\n\n[사진 삽입: ${photo.caption} (출처: ${photo.source})]\n\n`;
    setArticle((prev) => ({
      ...prev,
      content: prev.content + photoTag
    }));
    alert(`"${photo.caption}" 사진이 기사 본문에 삽입되었습니다.`);
  };

  // CMS 발행/이관 실행
  const handleCmsExport = () => {
    setIsCmsExporting(true);
    setTimeout(() => {
      setIsCmsExporting(false);
      setIsCmsSuccessModal(true);
      setArticle((prev) => ({ ...prev, status: "검증 완료" }));
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 animate-float-in">


      {/* ──────────────────────────────────────────
          2. 메인 작성 컨테이너 & 미리보기
         ────────────────────────────────────────── */}
      <div className="flex items-start gap-6 w-full min-w-0">

        {/* [좌측 메인 컬럼]: 기사 에디터 / 미리보기 */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* 팩트체크 진행 배너 (활성화 시 상단에 부드럽게 노출) */}
          {factCheckActive && factCheckIssues.length > 0 && (
            <div className="bg-[#FAF8F5] border border-amber-300 rounded-[24px] p-5 shadow-xs space-y-3 animate-float-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#292B2F] font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>AI 팩트체크 순서형 검사 ({activeFactIndex + 1} / {factCheckIssues.length})</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                  {factCheckIssues[activeFactIndex]?.type}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E7E2D9] space-y-1.5 text-xs md:text-sm">
                <p className="font-semibold text-[#292B2F]">
                  문제 문장: <span className="underline decoration-red-400 decoration-2 text-red-700 bg-red-50/80 px-1 rounded">{factCheckIssues[activeFactIndex]?.targetText}</span>
                </p>
                <p className="text-[#57514A]">
                  <strong>발생 이유:</strong> {factCheckIssues[activeFactIndex]?.reason}
                </p>
                <div className="text-[#292B2F] bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span><strong>AI 수정안 제안:</strong> "{factCheckIssues[activeFactIndex]?.suggestion}"</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={onSkipFactFix}
                  className="px-4 py-1.5 text-xs font-bold bg-[#E7E2D9] hover:bg-[#DDD7CD] text-[#292B2F] rounded-full transition cursor-pointer"
                >
                  건너뛰기
                </button>
                <button
                  onClick={onApplyFactFix}
                  className="px-4 py-1.5 text-xs font-extrabold bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] rounded-full transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-[#D8C76A]" />
                  수정 적용
                </button>
              </div>
            </div>
          )}

          {/* 뷰 모드에 따른 Grid 레이아웃 */}
          <div className={`grid gap-6 items-start ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            
            {/* ──────────────────
                [A] 기사 작성 에디터 캔버스 (레퍼런스 이미지의 핵심 영역)
               ────────────────── */}
            {(viewMode === "editor" || viewMode === "split") && (
              <div className="w-full space-y-6">

                {/* 1. 기사 제목 영역 */}
                <div 
                  className="space-y-1 relative"
                  onMouseEnter={() => setIsTitleHovered(true)}
                  onMouseLeave={() => setIsTitleHovered(false)}
                >
                  <div className="flex items-center justify-between text-xs text-[#8E8982] font-semibold">
                    <span>기사 제목</span>
                  </div>

                  {/* 제목 텍스트 인풋 */}
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => {
                      setArticle({ ...article, title: e.target.value });
                      setIsTitleConfirmed(true);
                    }}
                    placeholder="기사 제목을 입력하세요"
                    className="w-full text-2xl md:text-3xl font-extrabold text-[#292B2F] pb-3 pt-1 border-b border-[#E7E2D9] outline-none transition-colors bg-transparent tracking-tight leading-snug"
                  />
                </div>

                {/* 2. 부제 (부제목) 영역 */}
                <div className="space-y-1">
                  <label className="text-xs text-[#8E8982] font-semibold block">부제 (부제목)</label>
                  <input
                    type="text"
                    value={article.subtitle}
                    onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
                    placeholder="기사 부제를 입력하세요"
                    className="w-full text-base md:text-lg font-bold text-[#292B2F] pb-2 outline-none bg-transparent transition-colors tracking-tight"
                  />
                </div>

                {/* 3. 첨부된 사진 썸네일 스트립 (레퍼런스 스타일) */}
                {photos.length > 0 && (
                  <div className="p-4 bg-[#EFECE6] rounded-[24px] border border-[#E7E2D9] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#57514A] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#57514A]" />
                        첨부된 사진 ({photos.length}) - 클릭하여 본문에 바로 삽입:
                      </span>
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-xs cursor-pointer"
                      >
                        + 사진 추가
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleInsertPhotoToContent(p)}
                          className="flex items-center gap-3 p-2 px-3 bg-[#FAF8F5] rounded-[16px] border border-[#E7E2D9] hover:border-[#292B2F] transition cursor-pointer shadow-2xs group min-w-[240px]"
                          title="클릭 시 본문에 사진 태그가 삽입됩니다"
                        >
                          <img src={p.url} alt="thumb" className="w-14 h-11 object-cover rounded-xl flex-shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-extrabold text-[#292B2F] block truncate">{p.caption}</span>
                            <span className="text-[11px] text-[#8E8982] block">{p.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. 본문 작성 영역 (자유 작성 및 서식 적용) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E8982] font-semibold">
                    <span>본문 작성 영역 (자유 작성 및 서식 적용)</span>
                    <span>공백 포함 {article.content.length.toLocaleString()}자</span>
                  </div>

                  {/* 에디터 카드 컨테이너 */}
                  <div 
                    className="relative bg-[#FAF8F5] rounded-[24px] border border-[#E7E2D9] p-5 md:p-6 shadow-[0_2px_12px_rgba(41,43,47,0.02)]"
                    ref={editorRef} 
                    onMouseUp={handleSelection}
                  >
                    {/* 드래그 플로팅 툴바 */}
                    {floatingToolbarPos && (
                      <div
                        style={{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }}
                        className="absolute z-30 flex items-center gap-1 bg-[#292B2F] text-[#FAF8F5] px-2.5 py-1.5 rounded-full shadow-lg border border-[#57514A] animate-float-in text-xs"
                      >
                        <button onClick={() => applyFormat("굵게")} className="p-1 hover:bg-[#3D4046] rounded-md" title="굵게">
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => applyFormat("기울임")} className="p-1 hover:bg-[#3D4046] rounded-md" title="기울임">
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => applyFormat("인용구")} className="p-1 hover:bg-[#3D4046] rounded-md" title="인용구">
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[1px] h-3.5 bg-[#57514A] my-auto mx-1" />
                        <button
                          onClick={() => applyFormat("AI 다듬기")}
                          className="p-1 px-2 hover:bg-[#3D4046] rounded-md transition flex items-center gap-1 text-[#D8C76A] font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          AI 문장 다듬기
                        </button>
                      </div>
                    )}

                    {/* 본문 텍스트에어리어 */}
                    <textarea
                      value={article.content}
                      onChange={(e) => setArticle({ ...article, content: e.target.value })}
                      placeholder="기사 본문을 입력하세요. 자유롭게 문단을 작성할 수 있습니다..."
                      className="w-full min-h-[300px] text-[#292B2F] text-base leading-[1.8] bg-transparent outline-none resize-y font-sans tracking-normal"
                    />

                    {/* 하단 에디터 툴바 (레퍼런스 이미지 스타일) */}
                    <div className="border-t border-[#E7E2D9] pt-4 mt-4 flex flex-wrap items-center justify-between gap-3">
                      
                      {/* 좌측 서식 버튼 모음 */}
                      <div className="flex items-center gap-1 text-[#292B2F]">
                        {/* 본문 드롭다운 버튼 */}
                        <button 
                          onClick={() => applyFormat("본문 스타일")}
                          className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E2D9] hover:bg-[#E7E2D9]/60 rounded-full text-xs font-bold text-[#292B2F] flex items-center gap-1 mr-1 transition cursor-pointer"
                        >
                          <span>본문</span>
                          <ChevronDown className="w-3 h-3 text-[#57514A]" />
                        </button>

                        <button 
                          onClick={() => applyFormat("굵게")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="굵게"
                        >
                          <Bold className="w-4 h-4 font-bold" />
                        </button>

                        <button 
                          onClick={() => applyFormat("기울임")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="기울임"
                        >
                          <Italic className="w-4 h-4 italic" />
                        </button>

                        <button 
                          onClick={() => applyFormat("밑줄")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="밑줄"
                        >
                          <Underline className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => applyFormat("글머리 기호")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="글머리 기호"
                        >
                          <List className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => applyFormat("번호 매기기")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="번호 매기기"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => applyFormat("인용구")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="인용구"
                        >
                          <Quote className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => applyFormat("링크")}
                          className="w-8 h-8 rounded-lg hover:bg-[#E7E2D9]/70 flex items-center justify-center transition cursor-pointer text-[#292B2F]" 
                          title="링크"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 우측 저장 상태 및 [✨ AI 제안 받기] Primary CTA Button */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#8E8982] font-medium">
                          자동 저장됨 · 12:58
                        </span>

                        <button
                          onClick={() => setShowDraftModal(true)}
                          className="btn-primary-dark px-5 py-2.5 flex items-center gap-2 text-xs md:text-sm font-extrabold cursor-pointer group"
                          title="AI 제안 및 본문 다듬기 도구를 실행합니다"
                        >
                          <Sparkles className="w-4 h-4 text-[#D8C76A] fill-[#D8C76A]/20 group-hover:rotate-12 transition-transform" />
                          <span>AI 제안 받기</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ──────────────────
                [B] 실시간 포털/신문 미리보기 캔버스 (viewMode가 'preview' 또는 'split'일 때 표시)
               ────────────────── */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="w-full bg-[#FAF8F5] rounded-[24px] border border-[#E7E2D9] p-5 md:p-7 space-y-5 shadow-xs">
                
                {/* 미리보기 상단 플랫폼 전환 탭 */}
                <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs md:text-sm font-extrabold text-[#292B2F]">
                      실시간 독자 화면 미리보기
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#E7E2D9] p-1 rounded-full border border-[#D8D2C6]">
                    <button
                      onClick={() => setPreviewPlatform("donga")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                        previewPlatform === "donga"
                          ? "bg-[#292B2F] text-[#FAF8F5] shadow-2xs"
                          : "text-[#57514A] hover:text-[#292B2F]"
                      }`}
                    >
                      동아일보 웹
                    </button>
                    <button
                      onClick={() => setPreviewPlatform("naver")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                        previewPlatform === "naver"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-[#57514A] hover:text-[#292B2F]"
                      }`}
                    >
                      네이버 뉴스
                    </button>
                  </div>
                </div>

                {/* 실제 미리보기 프레임 */}
                <div className="bg-[#EFECE6] p-4 md:p-6 rounded-[20px] border border-[#E7E2D9]">
                  
                  {/* 1. 동아일보 공식 웹 뉴스 뷰 */}
                  {previewPlatform === "donga" && (
                    <div className="bg-[#FAF8F5] rounded-2xl shadow-sm border border-[#E7E2D9] p-6 md:p-8 space-y-4 max-w-2xl mx-auto animate-float-in">
                      {/* 동아 브랜드 헤더 */}
                      <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3 text-xs">
                        <span className="font-serif font-black text-[#292B2F] text-lg tracking-wider">
                          東亞日報
                        </span>
                        <span className="text-[#8E8982] font-medium">경제 · IT 산업</span>
                      </div>

                      {/* 제목 & 부제 */}
                      <div className="space-y-1.5">
                        <h2 className="text-xl md:text-2xl font-black text-[#292B2F] leading-tight">
                          {article.title || "기사 제목이 이곳에 표시됩니다"}
                        </h2>
                        {article.subtitle && (
                          <p className="text-xs md:text-sm font-bold text-[#57514A] leading-relaxed">
                            {article.subtitle}
                          </p>
                        )}
                      </div>

                      {/* 바이라인 & 작성일자 */}
                      <div className="flex items-center justify-between text-[11px] text-[#8E8982] border-b border-[#E7E2D9] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#292B2F]">김동아 기자</span>
                          <span>|</span>
                          <span>입력 2026-10-02 17:00</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Bookmark className="w-3.5 h-3.5 text-[#8E8982]" />
                          <Share2 className="w-3.5 h-3.5 text-[#8E8982]" />
                        </div>
                      </div>

                      {/* 대표 사진 */}
                      {photos.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="aspect-video rounded-xl overflow-hidden bg-[#E7E2D9] border border-[#E7E2D9]">
                            <img src={photos[0].url} alt="main article" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[11px] text-[#8E8982] font-medium">
                            ▲ {photos[0].caption} (출처: {photos[0].source})
                          </p>
                        </div>
                      )}

                      {/* 기사 본문 */}
                      <div className="text-xs md:text-sm text-[#292B2F] leading-loose whitespace-pre-line font-serif space-y-4 pt-1">
                        {article.content || "기사 본문 내용이 실시간으로 렌더링됩니다..."}
                      </div>
                    </div>
                  )}

                  {/* 2. 네이버 뉴스 포털 뷰 */}
                  {previewPlatform === "naver" && (
                    <div className="bg-[#FAF8F5] rounded-2xl shadow-sm border border-[#E7E2D9] p-5 md:p-7 space-y-4 max-w-2xl mx-auto animate-float-in">
                      <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                            N
                          </span>
                          <span className="font-extrabold text-xs text-[#292B2F]">네이버 뉴스 · IT/과학</span>
                        </div>
                        <span className="text-[10px] text-[#8E8982]">포털 송고 규격</span>
                      </div>

                      <h2 className="text-lg md:text-xl font-black text-[#292B2F] leading-snug">
                        {article.title || "기사 제목이 표시됩니다"}
                      </h2>

                      <div className="flex items-center justify-between text-xs text-[#8E8982] pb-2 border-b border-[#E7E2D9]">
                        <span className="font-bold text-[#292B2F]">동아일보</span>
                        <span className="text-[11px]">2026.10.02. 오후 5:00</span>
                      </div>

                      {photos.length > 0 && (
                        <div className="space-y-1">
                          <div className="aspect-video rounded-xl overflow-hidden bg-[#E7E2D9] border border-[#E7E2D9]">
                            <img src={photos[0].url} alt="naver news media" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] text-[#8E8982] block">{photos[0].caption}</span>
                        </div>
                      )}

                      <div className="text-xs md:text-sm text-[#292B2F] leading-relaxed whitespace-pre-line font-sans pt-1">
                        {article.content || "작성된 기사 본문이 포털 양식으로 미리보기됩니다."}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

        {/* [우측 컬럼]: 팩트체크 & 근거자료 검증 패널 */}
        {isFactCheckDrawerOpen && (
          <FactCheckDrawer
            isOpen={isFactCheckDrawerOpen}
            onClose={() => setIsFactCheckDrawerOpen(false)}
            article={article}
            setArticle={setArticle}
          />
        )}

      </div>

      {/* ──────────────────────────────────────────
          3. 사진·미디어 관리 및 규격 편집 모달
         ────────────────────────────────────────── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-[#292B2F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-float-in border border-[#E7E2D9]">
            <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-[#292B2F]">기사 사진 업로드 및 규격 편집</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-[#8E8982] hover:text-[#292B2F] text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* 새 사진 업로드 폼 */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#292B2F] block mb-1">사진 설명 (캡션)</label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="예: 국내 연구진이 발표한 차세대 AI 반도체 시제품"
                  className="w-full px-3 py-2 bg-white border border-[#E7E2D9] rounded-xl outline-none focus:border-[#292B2F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#292B2F] block mb-1">사진 출처</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="한국반도체연구원"
                    className="w-full px-3 py-2 bg-white border border-[#E7E2D9] rounded-xl outline-none focus:border-[#292B2F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#292B2F] block mb-1">제공자</label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    placeholder="김동아 기자"
                    className="w-full px-3 py-2 bg-white border border-[#E7E2D9] rounded-xl outline-none focus:border-[#292B2F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#292B2F] block mb-1">자동 규격 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {["16:9 (대표)", "4:3 (본문)", "1:1 (SNS)"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRatio(r)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        newRatio === r
                          ? "bg-[#292B2F] text-[#FAF8F5] border-[#292B2F]"
                          : "bg-white text-[#57514A] border-[#E7E2D9] hover:bg-[#E7E2D9]/50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full py-3 bg-[#EFECE6] hover:bg-[#E7E2D9] text-[#292B2F] font-extrabold rounded-xl border border-[#E7E2D9] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-[#A855F7]" />
                  <span>내 PC에서 사진 파일 업로드</span>
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* 현재 등록된 사진 리스트 */}
            <div className="border-t border-[#E7E2D9] pt-3 space-y-2">
              <span className="text-xs font-bold text-[#292B2F] block">등록된 사진 목록:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {photos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E7E2D9] text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={p.url} alt="p" className="w-10 h-8 object-cover rounded-md flex-shrink-0" />
                      <span className="font-bold text-[#292B2F] truncate">{p.caption}</span>
                    </div>
                    <button
                      onClick={() => handleInsertPhotoToContent(p)}
                      className="px-2.5 py-1 bg-[#E7E2D9] hover:bg-[#DDD7CD] text-[#292B2F] font-bold rounded-lg shadow-2xs flex-shrink-0 cursor-pointer"
                    >
                      본문 삽입
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 bg-[#292B2F] text-[#FAF8F5] rounded-xl text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          4. CMS 최종 발행 성공 알림 모달
         ────────────────────────────────────────── */}
      {isCmsSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#292B2F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-float-in border border-[#E7E2D9]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-[#292B2F]">CMS 발행이 완료되었습니다</h3>
            <p className="text-xs text-[#57514A] leading-relaxed font-medium">
              동아일보 디지털 통합 시스템(CMS)과 포털 송고 대기열로 기사 텍스트와 사진 데이터가 성공적으로 이관되었습니다.
            </p>
            <button
              onClick={() => setIsCmsSuccessModal(false)}
              className="w-full py-2.5 bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          5. AI 기사 초안 생성 모달
         ────────────────────────────────────────── */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-[#292B2F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-[#E7E2D9] space-y-5 animate-float-in">
            <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#D8C76A]" />
                <h3 className="text-base font-bold text-[#292B2F]">AI 기사 초안 생성</h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-[#8E8982] hover:text-[#292B2F] text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <p className="text-[#57514A]">
                수집된 취재자료나 녹취 데이터를 바탕으로 AI가 종합 기사 초안을 작성합니다.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-[#292B2F] block">연결할 취재자료 선택</label>
                <div className="space-y-2 bg-white p-3 rounded-xl border border-[#E7E2D9]">
                  {["2026 차세대 반도체 산업 동향 보고서", "김성민 박사 인터뷰 전사본", "전력망 확충 회의록"].map((src, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 text-[#292B2F] text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={idx < 2} 
                        className="w-4 h-4 rounded text-[#292B2F] focus:ring-[#292B2F]"
                      />
                      <span>{src}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#292B2F] block">추가 지시사항 (선택)</label>
                <input
                  type="text"
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  placeholder="예: 핵심 기술 성과 위주로 객관적 톤으로 작성해줘"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D9] rounded-xl text-[#292B2F] outline-none focus:border-[#292B2F] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2D9]">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 bg-[#E7E2D9] hover:bg-[#DDD7CD] text-[#292B2F] border border-[#D8D2C6] text-xs font-bold rounded-full transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="px-5 py-2 bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] text-xs font-bold rounded-full transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>초안 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-[#D8C76A]" />
                    <span>초안 자동 생성</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
