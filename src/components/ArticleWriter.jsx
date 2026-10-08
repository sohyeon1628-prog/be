import React, { useState, useRef, useEffect } from "react";
import FactCheckDrawer from "./FactCheckDrawer";
import { renderDerivative, cropForRatio } from "../utils/imageEditor";
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
  ChevronDown,
  Download,
  FileText,
  Copy,
  Printer,
  Save
} from "lucide-react";

// 사용자 캡처 이미지와 100% 동일한 자물쇠 아이콘 컴포넌트
function ShackleLockIcon({ locked }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[22px] h-[22px] transition-transform duration-150"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d={locked ? "M8 10V7a4 4 0 0 1 8 0v3" : "M8 10V7a4 4 0 0 1 8 0"} />
    </svg>
  );
}

// 사용자 캡처 이미지와 100% 동일한 AI 로봇 아이콘 + AI 텍스트 컴포넌트
function RobotAiButtonIcon() {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <svg
        viewBox="0 0 24 24"
        className="w-[22px] h-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v4M3 11H1m22 0h-2M8 20v1m8-1v1" />
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <circle cx="9" cy="12" r="1.3" fill="currentColor" />
        <circle cx="15" cy="12" r="1.3" fill="currentColor" />
        <path d="M9 16h6" />
      </svg>
      <span className="text-[15px] font-black tracking-tight leading-none">AI</span>
    </div>
  );
}

// 기사 본문 마크다운 및 태그 렌더러 컴포넌트 (동아일보 / 네이버 규격 실시간 렌더링)
function ArticlePreviewRenderer({ content, photos, platform = "donga" }) {
  if (!content) {
    return (
      <p className="text-stone-400 italic">
        {platform === "donga" ? "기사 본문 내용이 실시간으로 렌더링됩니다..." : "작성된 기사 본문이 포털 양식으로 미리보기됩니다."}
      </p>
    );
  }

  // 본문을 단락별로 분리
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className={`space-y-4 ${platform === "donga" ? "font-serif text-[#292B2F] text-[15px] leading-[1.85]" : "font-sans text-[#292B2F] text-[14px] leading-[1.75]"}`}>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // 1. 사진 삽입 태그 감지: [사진 삽입: 캡션 (출처: 출처)]
        const photoMatch = trimmed.match(/^\[사진 삽입:\s*(.*?)(?:\s*\(출처:\s*(.*?)\))?\]$/);
        if (photoMatch) {
          const caption = photoMatch[1];
          const source = photoMatch[2];
          const matchedPhoto = photos.find(p => p.caption === caption) || photos[0];

          return (
            <figure key={pIdx} className="my-5 space-y-1.5 overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-[#E7E2D9] border border-[#E7E2D9]">
                <img
                  src={matchedPhoto?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
                  alt={caption}
                  className="w-full h-auto object-cover max-h-[460px]"
                />
              </div>
              <figcaption className={`text-[11px] text-[#8E8982] ${platform === "donga" ? "font-sans" : "font-sans"}`}>
                ▲ {caption} {source ? `(출처: ${source})` : ""}
              </figcaption>
            </figure>
          );
        }

        // 2. 소제목 감지: ### ● 또는 ### 또는 ●
        if (trimmed.startsWith("###") || trimmed.startsWith("● ")) {
          const cleanSubtitle = trimmed.replace(/^###\s*/, "").replace(/^●\s*/, "");
          return (
            <h3
              key={pIdx}
              className={`font-black text-[#292B2F] pt-3 pb-1 border-l-3 border-[#008285] pl-2.5 ${platform === "donga" ? "text-lg font-sans" : "text-base font-sans"}`}
            >
              ● {cleanSubtitle}
            </h3>
          );
        }

        // 3. 인용구 감지: > 인용문
        if (trimmed.startsWith(">")) {
          const quoteText = trimmed.replace(/^>\s*/, "");
          return (
            <blockquote
              key={pIdx}
              className="border-l-4 border-[#008285]/60 bg-[#FAF8F5] pl-4 py-2 my-2 italic text-[#57514A] rounded-r-lg"
            >
              "{quoteText}"
            </blockquote>
          );
        }

        // 4. 일반 본문 단락
        return (
          <p key={pIdx} className="whitespace-pre-wrap">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// 인라인 서식 파싱 헬퍼 함수
function renderInlineFormatting(text) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-bold text-[#1F2124]">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith("<u>") && token.endsWith("</u>")) {
      parts.push(<u key={match.index} className="underline decoration-[#008285]/70 underline-offset-4">{token.slice(3, -4)}</u>);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      parts.push(<s key={match.index} className="line-through text-stone-400">{token.slice(2, -2)}</s>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

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

  // 팩트체크 우측 드로어
  const [isFactCheckDrawerOpen, setIsFactCheckDrawerOpen] = useState(false);

  // 2. 미리보기 플랫폼: 'donga' | 'naver'
  const [previewPlatform, setPreviewPlatform] = useState("donga");

  // 카테고리 분야 선택
  const [category, setCategory] = useState(article.category || "사회");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categories = ["사회", "정치", "경제", "국제", "문화", "생활", "스포츠"];

  // 3. 잠금 기능 상태 (사용자 요구: 잠금기능)
  const [isTitleLocked, setIsTitleLocked] = useState(false);
  const [isSubtitleLocked, setIsSubtitleLocked] = useState(false);

  // 4. AI 버튼 클릭 시 스크롤바 추천창 토글 상태 (사용자 요구: ai를 누르면 그때 제목을 추천해주는 스크롤 바가 내려오도록)
  const [isTitleAiOpen, setIsTitleAiOpen] = useState(false);
  const [isSubtitleAiOpen, setIsSubtitleAiOpen] = useState(false);

  // 추천 후보 목록
  const [titleCandidates, setTitleCandidates] = useState([]);
  const [subtitleCandidates, setSubtitleCandidates] = useState([]);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // 5. 사진 관리 상태
  const [photos, setPhotos] = useState(article.photos || [
    {
      id: "photo-1",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
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

  // 6. CMS 발행 이관
  const [isCmsExporting, setIsCmsExporting] = useState(false);
  const [isCmsSuccessModal, setIsCmsSuccessModal] = useState(false);

  // 수동 저장하기 피드백 상태
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // 에디터 서식 및 툴바 상태
  const [selectedText, setSelectedText] = useState("");
  const [floatingToolbarPos, setFloatingToolbarPos] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraftTab, setActiveDraftTab] = useState("generate");

  // 실시간 자동 저장 상태
  const [lastSavedTime, setLastSavedTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const photoInputRef = useRef(null);

  // [기능 1] 브라우저 로컬 저장소 자동 복원
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("team01_article_draft_v1");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.content) {
          setArticle(prev => ({
            ...prev,
            title: parsed.title || prev.title,
            subtitle: parsed.subtitle || prev.subtitle,
            content: parsed.content || prev.content
          }));
          if (parsed.category) setCategory(parsed.category);
          if (parsed.photos && parsed.photos.length > 0) setPhotos(parsed.photos);
          if (parsed.updatedAt) setLastSavedTime(parsed.updatedAt);
        }
      }
    } catch (e) {
      console.error("초안 불러오기 실패:", e);
    }
  }, []);

  // [기능 2] 실시간 자동 저장
  useEffect(() => {
    if (!article.content && !article.title) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const draftData = {
          title: article.title,
          subtitle: article.subtitle,
          content: article.content,
          category,
          photos,
          updatedAt: timeStr
        };
        localStorage.setItem("team01_article_draft_v1", JSON.stringify(draftData));
        setLastSavedTime(timeStr);
      } catch (err) {
        console.error("초안 저장 오류:", err);
      } finally {
        setIsSaving(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [article.title, article.subtitle, article.content, category, photos]);

  // 본문 80자 이상 시 자동 AI 추천 후보 계산
  const bodyText = (article.content || "").trim();
  const isLongEnough = bodyText.length >= 80;

  useEffect(() => {
    if (isLongEnough) {
      if (bodyText.includes("반도체") || bodyText.includes("AI") || bodyText.includes("기술")) {
        setTitleCandidates([
          "초거대 AI 혁명 이끄는 K-반도체... 연산 속도 10배 끌어올린다",
          "GPU 한계 넘는다... 차세대 PIM·NPU 반도체 생태계 급부상",
          "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
          "전력 소모 70% 줄인 차세대 지능형 칩... 국내 연구진 실증 발표",
          "글로벌 빅테크 공급망 격변 속 한국 팹리스 기업 약진"
        ]);
        setSubtitleCandidates([
          "국내 주요 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
          "전력 소모 70% 절감 실증... 소프트웨어 생태계 구축이 승부처",
          "정부 차원의 대규모 실증 사업과 인프라 지원 시급"
        ]);
      } else {
        const firstSentence = bodyText.split(/[\n.]/)[0] || "주요 현장 취재";
        setTitleCandidates([
          `${firstSentence.slice(0, 24)}... 심층 분석`,
          `현장 검증: 데이터로 확인한 핵심 쟁점과 향후 전망`,
          `단독 인터뷰: 현장에서 만난 관계자들이 밝힌 숨은 실태`,
          `급변하는 현장과 정책적 과제... 선제적 대응책 절실`
        ]);
        setSubtitleCandidates([
          "현장 검증과 전문가 증언으로 살펴본 핵심 정책 과제",
          "선제적 제도 개선과 후속 대책 마련이 시급한 시점",
          "이해관계자 간 논의 활성화로 합리적 대안 모색 필요"
        ]);
      }
    } else {
      setTitleCandidates([]);
      setSubtitleCandidates([]);
    }
  }, [bodyText, isLongEnough]);

  // AI 제목 추천 토글 (누를 때 스크롤 박스가 내려옴)
  const handleToggleTitleAi = () => {
    if (isTitleLocked) return;
    setIsTitleAiOpen(prev => !prev);
  };

  // AI 부제목 추천 토글
  const handleToggleSubtitleAi = () => {
    if (isSubtitleLocked) return;
    setIsSubtitleAiOpen(prev => !prev);
  };

  // 추천 제목 선택 적용
  const handleSelectCandidateTitle = (cand) => {
    setArticle(prev => ({ ...prev, title: cand }));
    setIsTitleAiOpen(false); // 선택 후 닫기
  };

  // 추천 부제목 선택 적용
  const handleSelectCandidateSubtitle = (cand) => {
    setArticle(prev => ({ ...prev, subtitle: cand }));
    setIsSubtitleAiOpen(false); // 선택 후 닫기
  };

  // 텍스트 선택 서식 툴바
  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = textarea.value.substring(start, end).trim();
      setSelectedText(selected);
      setFloatingToolbarPos({ top: 10, left: 20 });
    } else {
      setSelectedText("");
      setFloatingToolbarPos(null);
    }
  };

  // 서식 적용 헬퍼
  const applyFormat = (formatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = article.content || "";
    const selected = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;

    switch (formatType) {
      case "굵게":
        replacement = selected ? `**${selected}**` : `**굵은 텍스트**`;
        cursorOffset = selected ? replacement.length : 2;
        break;
      case "기울임":
        replacement = selected ? `*${selected}*` : `*기울임 텍스트*`;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case "밑줄":
        replacement = selected ? `<u>${selected}</u>` : `<u>밑줄 텍스트</u>`;
        cursorOffset = selected ? replacement.length : 3;
        break;
      case "소제목":
        replacement = selected ? `\n\n### ● ${selected}\n\n` : `\n\n### ● 소제목\n\n`;
        cursorOffset = replacement.length;
        break;
      case "인용구":
        replacement = selected ? `\n\n> ${selected}\n\n` : `\n\n> 인용문을 입력하세요.\n\n`;
        cursorOffset = replacement.length;
        break;
      case "글머리 기호":
        replacement = selected ? `\n- ${selected}\n` : `\n- 목록 항목\n`;
        cursorOffset = replacement.length;
        break;
      case "번호 매기기":
        replacement = selected ? `\n1. ${selected}\n` : `\n1. 첫 번째 항목\n`;
        cursorOffset = replacement.length;
        break;
      case "링크":
        replacement = selected ? `[${selected}](https://)` : `[링크 텍스트](https://)`;
        cursorOffset = replacement.length - 1;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setArticle(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);

    setFloatingToolbarPos(null);
  };

  // 본문 클립보드 복사
  const handleCopyBody = () => {
    if (!article.content) return;
    navigator.clipboard.writeText(article.content);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // 플랫폼 규격 다운로드
  const handleDownloadPhoto = (photo, targetWidth = 684, platformName = "donga") => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const crop = cropForRatio(img.naturalWidth, img.naturalHeight, targetWidth / (targetWidth * 0.625));
        const dataUrl = renderDerivative(img, crop, [], targetWidth, 1, 100);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${platformName}_${photo.id || "image"}_${targetWidth}px.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("이미지 리사이즈 실패:", err);
        window.open(photo.url, "_blank");
      }
    };
    img.onerror = () => window.open(photo.url, "_blank");
    img.src = photo.url;
  };

  // 사진 삽입
  const handleInsertPhotoToContent = (photo) => {
    const photoTag = `\n\n[사진 삽입: ${photo.caption} (출처: ${photo.source})]\n\n`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = article.content || "";
      const newContent = text.substring(0, start) + photoTag + text.substring(end);
      setArticle(prev => ({ ...prev, content: newContent }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + photoTag.length, start + photoTag.length);
      }, 0);
    } else {
      setArticle((prev) => ({
        ...prev,
        content: prev.content + photoTag
      }));
    }
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

  // CMS 발행 이관
  const handleCmsExport = () => {
    setIsCmsExporting(true);
    setTimeout(() => {
      setIsCmsExporting(false);
      setIsCmsSuccessModal(true);
      setArticle((prev) => ({ ...prev, status: "검증 완료" }));
    }, 1200);
  };

  // 수동 저장하기 기능
  const handleManualSave = () => {
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const draftData = {
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        category,
        photos,
        updatedAt: timeStr
      };
      localStorage.setItem("team01_article_draft_v1", JSON.stringify(draftData));
      setLastSavedTime(timeStr);
      setIsSaveSuccess(true);
      setTimeout(() => setIsSaveSuccess(false), 2000);
    } catch (e) {
      console.error("수동 저장 오류:", e);
      alert("기사 저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 transition-all animate-float-in relative">

      {/* ──────────────────────────────────────────
          메인 작성 컨테이너 (상단이 깨끗하게 시작되는 메인박스의 시작점)
         ────────────────────────────────────────── */}
      <main className="main-warm-container flex-1 py-7 px-5 md:px-10 min-w-0 transition-all relative z-20">
        
        {/* ⭐ 우측 세로 돌출 다이어리 인덱스 탭 (상하 굴곡 일체형 디자인) */}
        <aside className="absolute -right-[175px] top-8 w-[176px] bg-[#FAF8F5] border-t border-r border-b border-[#E7E2D9] rounded-r-[22px] py-3.5 px-3 flex flex-col gap-2 select-none shadow-[6px_0_20px_-3px_rgba(41,43,47,0.04)] z-30">
          
          {/* 상단 오목 곡선 (굴곡!) */}
          <div className="absolute -top-4 -left-[1px] w-4 h-4 pointer-events-none z-40">
            <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
              <path d="M 0 0 A 16 16 0 0 0 16 16 H 0 V 0 Z" fill="#FAF8F5" />
              <path d="M 0 0 A 16 16 0 0 0 16 16" stroke="#E7E2D9" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* 메인 박스 오른쪽 세로 경계선 일체화 패치 */}
          <div className="absolute -left-[4px] top-0 bottom-0 w-[8px] bg-[#FAF8F5] z-30 pointer-events-none" />

          {/* 인덱스 탭 라벨 */}
          <div className="text-[10px] font-extrabold text-[#8E8982] tracking-wider uppercase px-1 pb-1 border-b border-[#E7E2D9]/70 flex items-center justify-between">
            <span>취재 도구</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* 1. 취재자료 검색 버튼 */}
          <button
            onClick={onOpenSearch}
            className="w-full px-3 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E7E2D9] text-[#292B2F] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs hover:shadow-xs group text-left"
            title="자체 취재자료 빠른 검색 및 연결"
          >
            <div className="w-6 h-6 rounded-lg bg-[#EFECE6] text-[#292B2F] flex items-center justify-center flex-shrink-0 group-hover:bg-[#292B2F] group-hover:text-[#FAF8F5] transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">취재자료 검색</span>
          </button>

          {/* 2. 팩트체크 검사 버튼 */}
          <button
            onClick={onRunFactCheck}
            className="w-full px-3 py-2 bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs group text-left"
            title="AI 순서형 팩트체크 검사 시작"
          >
            <div className="w-6 h-6 rounded-lg bg-[#1F2124] text-[#D8C76A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">팩트체크 검사</span>
          </button>

          {/* 하단 오목 곡선 (굴곡!) */}
          <div className="absolute -bottom-4 -left-[1px] w-4 h-4 pointer-events-none z-40">
            <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
              <path d="M 16 0 A 16 16 0 0 0 0 16 V 0 H 16 Z" fill="#FAF8F5" />
              <path d="M 16 0 A 16 16 0 0 0 0 16" stroke="#E7E2D9" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </aside>

        {/* ──────────────────────────────────────────
            1. 상단 액션 바: (✍️ 🪟 👁️) & [💾 저장하기] (이전과 같은 디자인)
           ────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E7E2D9]">
          <div className="flex items-center gap-2.5">
            {/* [축약형 캡슐 뷰 모드 바]: 이모지만 살린 컴팩트 디자인 */}
            <div className="flex items-center gap-1 bg-[#E7E2D9] p-1 rounded-full border border-[#D8D2C6]">
              <button
                onClick={() => setViewMode("editor")}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  viewMode === "editor"
                    ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs"
                    : "text-[#57514A] hover:text-[#292B2F] hover:bg-[#DDD7CD]/50"
                }`}
                title="기사 작성 (에디터 전용)"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  viewMode === "split"
                    ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs"
                    : "text-[#57514A] hover:text-[#292B2F] hover:bg-[#DDD7CD]/50"
                }`}
                title="나란히 보기 (에디터 + 실시간 미리보기)"
              >
                <Columns className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[#292B2F] text-[#FAF8F5] shadow-xs"
                    : "text-[#57514A] hover:text-[#292B2F] hover:bg-[#DDD7CD]/50"
                }`}
                title="독자 미리보기 (동아/네이버)"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>

            {/* [저장하기 버튼] */}
            <button
              onClick={handleManualSave}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
                isSaveSuccess
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white hover:bg-[#EFECE6] border-[#E7E2D9] text-[#292B2F]"
              }`}
              title="현재 기사 즉시 저장"
            >
              {isSaveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span className="font-extrabold text-emerald-700">저장 완료!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#57514A]" />
                  <span>저장하기</span>
                </>
              )}
            </button>
          </div>

          {/* 마지막 저장 시각 */}
          {lastSavedTime && (
            <div className="text-[11px] text-[#8E8982] font-medium hidden sm:block">
              마지막 저장: {lastSavedTime}
            </div>
          )}
        </div>

        {/* 2. 메인 작성 에디터 & 컬럼 */}
        <div className="flex items-start gap-6 w-full min-w-0">

        {/* [좌측 메인 컬럼]: 기사 에디터 / 미리보기 */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* 팩트체크 진행 배너 */}
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
                [A] 기사 작성 에디터 캔버스 (사용자 이미지 구조 100% 동일 구현)
               ────────────────── */}
            {(viewMode === "editor" || viewMode === "split") && (
              <div className="w-full bg-white rounded-[24px] border border-[#E7E2D9] p-6 md:p-8 space-y-4 shadow-[0_2px_12px_rgba(41,43,47,0.02)]">

                {/* 1. 카테고리 드롭다운 (사회 ∨) */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-md text-xs font-bold text-[#18181B] transition cursor-pointer"
                  >
                    <span>{category}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
                  </button>

                  {showCategoryMenu && (
                    <div className="absolute left-0 mt-1 z-30 w-28 bg-white border border-[#E4E4E7] rounded-xl shadow-lg py-1 text-xs">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c);
                            setArticle(prev => ({ ...prev, category: c }));
                            setShowCategoryMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-[#F4F4F5] cursor-pointer font-bold ${category === c ? "text-[#008285]" : "text-[#27272A]"
                            }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. 기사 제목 입력 라인 + 🔒 잠금 아이콘 + 🤖 AI 버튼 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => setArticle({ ...article, title: e.target.value })}
                      placeholder="제목을 입력하세요"
                      disabled={isTitleLocked}
                      readOnly={isTitleLocked}
                      className={`flex-1 text-2xl md:text-3xl font-bold tracking-tight bg-transparent outline-none border-none transition-colors ${isTitleLocked
                        ? "text-[#71717A] bg-stone-50/50 cursor-not-allowed select-none"
                        : "text-[#27272A] placeholder:text-[#A1A1AA]"
                        }`}
                    />

                    {/* 우측 사용자 캡처 이미지 속 정확한 아이콘 2개 */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* [잠금 버튼] */}
                      <button
                        type="button"
                        onClick={() => setIsTitleLocked(!isTitleLocked)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${isTitleLocked
                          ? "text-[#18181B] bg-stone-100"
                          : "text-[#71717A] hover:text-[#18181B] hover:bg-stone-50"
                          }`}
                        title={isTitleLocked ? "제목 잠금 해제" : "제목 잠금 (AI 추천으로부터 보호)"}
                      >
                        <ShackleLockIcon locked={isTitleLocked} />
                      </button>

                      {/* [AI 추천 버튼] (클릭 시 스크롤바 추천창이 스르륵 내려옴) */}
                      <button
                        type="button"
                        onClick={handleToggleTitleAi}
                        disabled={isTitleLocked}
                        className={`p-1.5 px-2 rounded-lg transition cursor-pointer flex items-center ${isTitleLocked
                          ? "opacity-40 cursor-not-allowed text-stone-400"
                          : isTitleAiOpen
                            ? "bg-stone-100 text-[#18181B]"
                            : "text-[#71717A] hover:text-[#18181B] hover:bg-stone-50"
                          }`}
                        title={isTitleLocked ? "확정을 해제하면 AI 추천을 받을 수 있어요" : "AI 제목 추천 보기"}
                      >
                        <RobotAiButtonIcon />
                      </button>
                    </div>
                  </div>

                  {/* 3. AI 제목 추천 스크롤바 박스 (AI 버튼을 누르면 스르륵 내려옴) */}
                  {isTitleAiOpen && (
                    <div className="w-full border border-[#E4E4E7] rounded-xl p-4 bg-white shadow-sm transition-all duration-200 animate-float-in space-y-2.5">
                      {titleCandidates.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#008285] pb-1 border-b border-[#F4F4F5]">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              본문 기반 AI 추천 헤드라인 (클릭하여 즉시 적용)
                            </span>
                            <span className="text-[11px] text-stone-400 font-normal">
                              스크롤하여 {titleCandidates.length}개 후보 확인
                            </span>
                          </div>

                          {/* 스크롤바가 있는 목록 영역 */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {titleCandidates.map((cand, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectCandidateTitle(cand)}
                                className="p-3 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F4F5] border border-[#E4E4E7] hover:border-[#008285]/50 text-xs font-bold text-[#27272A] cursor-pointer transition flex items-center justify-between group"
                              >
                                <span className="flex-1 pr-2">{cand}</span>
                                <span className="text-[11px] text-[#008285] font-semibold opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                                  제목으로 적용 ↵
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#71717A] py-2 flex items-center justify-between">
                          <span>기사 본문을 작성하면 기사 제목을 추천해드립니다.</span>
                          <span className="text-[10px] text-stone-400">최소 80자 권장</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. 부제목 입력 라인 + 🔒 잠금 아이콘 + 🤖 AI 버튼 */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="text"
                      value={article.subtitle}
                      onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
                      placeholder="부제목"
                      disabled={isSubtitleLocked}
                      readOnly={isSubtitleLocked}
                      className={`flex-1 text-base md:text-lg font-bold tracking-tight bg-transparent outline-none border-none transition-colors ${isSubtitleLocked
                        ? "text-[#71717A] bg-stone-50/50 cursor-not-allowed select-none"
                        : "text-[#52525B] placeholder:text-[#A1A1AA]"
                        }`}
                    />

                    {/* 우측 아이콘 2개 */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* [잠금 버튼] */}
                      <button
                        type="button"
                        onClick={() => setIsSubtitleLocked(!isSubtitleLocked)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${isSubtitleLocked
                          ? "text-[#18181B] bg-stone-100"
                          : "text-[#71717A] hover:text-[#18181B] hover:bg-stone-50"
                          }`}
                        title={isSubtitleLocked ? "부제목 잠금 해제" : "부제목 잠금 (AI 추천으로부터 보호)"}
                      >
                        <ShackleLockIcon locked={isSubtitleLocked} />
                      </button>

                      {/* [AI 추천 버튼] (클릭 시 스크롤바 추천창이 스르륵 내려옴) */}
                      <button
                        type="button"
                        onClick={handleToggleSubtitleAi}
                        disabled={isSubtitleLocked}
                        className={`p-1.5 px-2 rounded-lg transition cursor-pointer flex items-center ${isSubtitleLocked
                          ? "opacity-40 cursor-not-allowed text-stone-400"
                          : isSubtitleAiOpen
                            ? "bg-stone-100 text-[#18181B]"
                            : "text-[#71717A] hover:text-[#18181B] hover:bg-stone-50"
                          }`}
                        title={isSubtitleLocked ? "확정을 해제하면 AI 추천을 받을 수 있어요" : "AI 부제목 추천 보기"}
                      >
                        <RobotAiButtonIcon />
                      </button>
                    </div>
                  </div>

                  {/* 5. AI 부제목 추천 스크롤바 박스 (AI 버튼 클릭 시 스르륵 내려옴) */}
                  {isSubtitleAiOpen && (
                    <div className="w-full border border-[#E4E4E7] rounded-xl p-4 bg-white shadow-sm transition-all duration-200 animate-float-in space-y-2.5">
                      {subtitleCandidates.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#008285] pb-1 border-b border-[#F4F4F5]">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              본문 기반 AI 추천 부제목 (클릭하여 즉시 적용)
                            </span>
                            <span className="text-[11px] text-stone-400 font-normal">
                              스크롤하여 {subtitleCandidates.length}개 후보 확인
                            </span>
                          </div>

                          {/* 스크롤바가 있는 목록 영역 */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {subtitleCandidates.map((cand, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectCandidateSubtitle(cand)}
                                className="p-3 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F4F5] border border-[#E4E4E7] hover:border-[#008285]/50 text-xs font-semibold text-[#52525B] cursor-pointer transition flex items-center justify-between group"
                              >
                                <span className="flex-1 pr-2">{cand}</span>
                                <span className="text-[11px] text-[#008285] font-semibold opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                                  부제목으로 적용 ↵
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#71717A] py-2 flex items-center justify-between">
                          <span>기사 본문을 작성하면 부제목을 추천해드립니다.</span>
                          <span className="text-[10px] text-stone-400">최소 80자 권장</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. 얇은 가로 구분선 */}
                <div className="border-b border-[#E4E4E7] my-3" />

                {/* 7. 본문 툴바 아이콘 4개 (정사각형 테두리: 🖼️ 📄 📋 🖨️) */}
                <div className="flex items-center justify-between gap-3 pt-1 pb-1">
                  <div className="flex items-center gap-2">
                    {/* [1. 사진 넣기] */}
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      className="w-10 h-10 border border-[#E4E4E7] rounded-lg bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="사진 넣기 및 규격 다운로드"
                    >
                      <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                    </button>

                    {/* [2. 요약 / 글 흐름 보기] */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDraftTab("flow");
                        setShowDraftModal(true);
                      }}
                      className="w-10 h-10 border border-[#E4E4E7] rounded-lg bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="요약 및 글 흐름 보기"
                    >
                      <FileText className="w-5 h-5 stroke-[1.5]" />
                    </button>

                    {/* [3. 본문 복사] */}
                    <button
                      type="button"
                      onClick={handleCopyBody}
                      className="w-10 h-10 border border-[#E4E4E7] rounded-lg bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition shadow-2xs cursor-pointer relative"
                      title="본문 복사"
                    >
                      <Copy className="w-5 h-5 stroke-[1.5]" />
                      {copiedNotice && (
                        <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-[#292B2F] text-white text-[10px] rounded-md shadow whitespace-nowrap animate-float-in">
                          복사 완료!
                        </span>
                      )}
                    </button>

                    {/* [4. 인쇄하기] */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-10 h-10 border border-[#E4E4E7] rounded-lg bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="인쇄하기"
                    >
                      <Printer className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>

                  {/* 자동 저장 상태 */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5 font-medium">
                      {isSaving ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>저장 중...</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>자동 저장됨 · {lastSavedTime || "방금"}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* 8. 사진 보관함 썸네일 스트립 (등록된 사진이 있을 때) */}
                {photos.length > 0 && (
                  <div className="p-3.5 bg-[#F4F4F5] rounded-xl border border-[#E4E4E7] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#52525B] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        사진 보관함 ({photos.length}) - 클릭 시 본문 커서 위치에 삽입:
                      </span>
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="text-[#008285] hover:underline font-bold text-xs cursor-pointer"
                      >
                        + 사진 추가 / 관리
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 p-2 px-3 bg-white rounded-xl border border-[#E4E4E7] hover:border-[#27272A] transition shadow-2xs min-w-[280px]"
                        >
                          <div
                            onClick={() => handleInsertPhotoToContent(p)}
                            className="flex items-center gap-2.5 truncate cursor-pointer flex-1"
                            title="클릭 시 본문에 사진 태그 삽입"
                          >
                            <img src={p.url} alt="thumb" className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
                            <div className="truncate text-xs">
                              <span className="font-bold text-[#27272A] block truncate">{p.caption}</span>
                              <span className="text-[10px] text-[#A1A1AA] block">{p.source}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleDownloadPhoto(p, 684, "donga")}
                              className="px-2 py-1 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#27272A] font-bold rounded border border-[#E4E4E7] cursor-pointer"
                              title="동아일보 684px 다운로드"
                            >
                              동아(684px)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. 본문 에디터 (기사를 작성하세요.) */}
                <div className="relative pt-2" ref={editorRef}>
                  {/* 드래그 플로팅 서식 툴바 */}
                  {floatingToolbarPos && selectedText && (
                    <div
                      style={{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }}
                      className="absolute z-30 flex items-center gap-1 bg-[#27272A] text-white px-2.5 py-1.5 rounded-full shadow-lg border border-stone-600 animate-float-in text-xs"
                    >
                      <button onClick={() => applyFormat("굵게")} className="p-1 hover:bg-[#3F3F46] rounded cursor-pointer" title="굵게">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => applyFormat("기울임")} className="p-1 hover:bg-[#3F3F46] rounded cursor-pointer" title="기울임">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => applyFormat("밑줄")} className="p-1 hover:bg-[#3F3F46] rounded cursor-pointer" title="밑줄">
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => applyFormat("소제목")} className="p-1 hover:bg-[#3F3F46] rounded cursor-pointer text-[#008285] font-black" title="● 소제목">
                        ●
                      </button>
                      <button onClick={() => applyFormat("인용구")} className="p-1 hover:bg-[#3F3F46] rounded cursor-pointer" title="인용구">
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={article.content}
                    onChange={(e) => setArticle({ ...article, content: e.target.value })}
                    onSelect={handleSelection}
                    onKeyUp={handleSelection}
                    onMouseUp={handleSelection}
                    placeholder="기사를 작성하세요."
                    className="w-full min-h-[380px] text-[#18181B] placeholder:text-[#A1A1AA] text-base leading-[1.85] bg-transparent outline-none resize-y font-sans tracking-normal border-none"
                  />
                </div>

              </div>
            )}

            {/* ──────────────────
                [B] 실시간 포털/신문 미리보기 캔버스
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
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${previewPlatform === "donga"
                        ? "bg-[#292B2F] text-[#FAF8F5] shadow-2xs"
                        : "text-[#57514A] hover:text-[#292B2F]"
                        }`}
                    >
                      동아일보 웹 (684px)
                    </button>
                    <button
                      onClick={() => setPreviewPlatform("naver")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${previewPlatform === "naver"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-[#57514A] hover:text-[#292B2F]"
                        }`}
                    >
                      네이버 뉴스 (666px)
                    </button>
                  </div>
                </div>

                {/* 실제 미리보기 프레임 */}
                <div className="bg-[#EFECE6] p-4 md:p-6 rounded-[20px] border border-[#E7E2D9] overflow-x-auto">

                  {/* 1. 동아일보 공식 웹 뉴스 뷰 (최대 가로 684px) */}
                  {previewPlatform === "donga" && (
                    <div className="bg-[#FAF8F5] rounded-2xl shadow-sm border border-[#E7E2D9] p-6 md:p-8 space-y-4 max-w-[684px] mx-auto animate-float-in">
                      <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3 text-xs">
                        <span className="font-serif font-black text-[#292B2F] text-lg tracking-wider">
                          東亞日報
                        </span>
                        <span className="text-[#8E8982] font-medium">{category}</span>
                      </div>

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

                      <div className="flex items-center justify-between text-[11px] text-[#8E8982] border-b border-[#E7E2D9] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#292B2F]">김동아 기자</span>
                          <span>|</span>
                          <span>입력 2026-10-05 02:00</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Bookmark className="w-3.5 h-3.5 text-[#8E8982]" />
                          <Share2 className="w-3.5 h-3.5 text-[#8E8982]" />
                        </div>
                      </div>

                      {photos.length > 0 && !article.content?.includes(photos[0].caption) && (
                        <div className="space-y-1.5">
                          <div className="aspect-video rounded-xl overflow-hidden bg-[#E7E2D9] border border-[#E7E2D9]">
                            <img src={photos[0].url} alt="main article" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[11px] text-[#8E8982] font-medium">
                            ▲ {photos[0].caption} (출처: {photos[0].source})
                          </p>
                        </div>
                      )}

                      <ArticlePreviewRenderer
                        content={article.content}
                        photos={photos}
                        platform="donga"
                      />
                    </div>
                  )}

                  {/* 2. 네이버 뉴스 포털 뷰 (최대 가로 666px) */}
                  {previewPlatform === "naver" && (
                    <div className="bg-[#FAF8F5] rounded-2xl shadow-sm border border-[#E7E2D9] p-5 md:p-7 space-y-4 max-w-[666px] mx-auto animate-float-in">
                      <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                            N
                          </span>
                          <span className="font-extrabold text-xs text-[#292B2F]">네이버 뉴스 · {category}</span>
                        </div>
                        <span className="text-[10px] text-[#8E8982]">포털 송고 규격 (666px)</span>
                      </div>

                      <h2 className="text-lg md:text-xl font-black text-[#292B2F] leading-snug">
                        {article.title || "기사 제목이 표시됩니다"}
                      </h2>

                      {article.subtitle && (
                        <p className="text-xs font-semibold text-[#57514A]">
                          {article.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#8E8982] pb-2 border-b border-[#E7E2D9]">
                        <span className="font-bold text-[#292B2F]">동아일보</span>
                        <span className="text-[11px]">2026.10.05. 오전 2:00</span>
                      </div>

                      {photos.length > 0 && !article.content?.includes(photos[0].caption) && (
                        <div className="space-y-1">
                          <div className="aspect-video rounded-xl overflow-hidden bg-[#E7E2D9] border border-[#E7E2D9]">
                            <img src={photos[0].url} alt="naver news media" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] text-[#8E8982] block">{photos[0].caption}</span>
                        </div>
                      )}

                      <ArticlePreviewRenderer
                        content={article.content}
                        photos={photos}
                        platform="naver"
                      />
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
                <h3 className="text-base font-black text-[#292B2F]">기사 사진 관리 및 플랫폼 규격 다운로드</h3>
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
                  {["16:9 (동아일보 대표)", "4:3 (본문)", "1:1 (SNS)"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRatio(r)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${newRatio === r
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

            {/* 현재 등록된 사진 리스트 및 규격 다운로드 */}
            <div className="border-t border-[#E7E2D9] pt-3 space-y-2">
              <span className="text-xs font-bold text-[#292B2F] block">등록된 사진 목록:</span>
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {photos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E7E2D9] text-xs gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={p.url} alt="p" className="w-10 h-8 object-cover rounded-md flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-[#292B2F] truncate block">{p.caption}</span>
                        <span className="text-[10px] text-[#8E8982] block">{p.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDownloadPhoto(p, 684, "donga")}
                        className="px-2 py-1 bg-[#FAF8F5] hover:bg-[#E7E2D9] text-[#292B2F] font-bold rounded-lg border border-[#E7E2D9] text-[10px] cursor-pointer flex items-center gap-1"
                        title="동아일보 규격 684px 다운로드"
                      >
                        <Download className="w-2.5 h-2.5" />
                        <span>동아(684px)</span>
                      </button>
                      <button
                        onClick={() => handleInsertPhotoToContent(p)}
                        className="px-2.5 py-1 bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] font-bold rounded-lg shadow-2xs text-[10px] cursor-pointer"
                      >
                        본문 삽입
                      </button>
                    </div>
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
          5. AI 요약 및 글 흐름 보기 모달
         ────────────────────────────────────────── */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-[#292B2F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-[#E7E2D9] space-y-5 animate-float-in">
            <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#D8C76A]" />
                <h3 className="text-base font-bold text-[#292B2F]">AI 편집 제안 및 글 흐름 분석</h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-[#8E8982] hover:text-[#292B2F] text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#E7E2D9] p-1 rounded-xl">
              <button
                onClick={() => setActiveDraftTab("generate")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeDraftTab === "generate" ? "bg-white text-[#292B2F] shadow-xs" : "text-[#57514A]"
                  }`}
              >
                초안 자동 생성
              </button>
              <button
                onClick={() => setActiveDraftTab("flow")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeDraftTab === "flow" ? "bg-white text-[#292B2F] shadow-xs" : "text-[#57514A]"
                  }`}
              >
                글의 흐름 분석
              </button>
            </div>

            {activeDraftTab === "generate" && (
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
            )}

            {activeDraftTab === "flow" && (
              <div className="space-y-3 text-xs">
                <p className="text-[#57514A] leading-relaxed">
                  현재 작성된 본문의 문단별 논리 흐름과 핵심 메시지를 요약합니다.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {article.content ? (
                    article.content.split(/\n\n+/).filter(Boolean).map((para, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-[#E7E2D9] space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#008285]">
                          <span>단락 {idx + 1} {idx === 0 ? "(도입부/리드문)" : idx === 1 ? "(핵심 실증/데이터)" : "(전망 및 제언)"}</span>
                          <span className="text-stone-400 font-normal">{para.length}자</span>
                        </div>
                        <p className="text-stone-600 line-clamp-2">
                          {para.replace(/\[.*?\]/g, '').replace(/###/g, '')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-center py-4">본문을 먼저 작성해 주세요.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2D9]">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 bg-[#E7E2D9] hover:bg-[#DDD7CD] text-[#292B2F] border border-[#D8D2C6] text-xs font-bold rounded-full transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
