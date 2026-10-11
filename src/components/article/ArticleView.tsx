import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MapPin,
  Globe2,
  AlertCircle,
  FileText,
  Bookmark,
  Printer,
  ChevronLeft,
  ChevronUp,
  BookOpen,
  Check,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import {
  formatRelativeTime,
  convertNumeralsToBengali,
  SUPPORTED_LANGUAGES,
  getUIText,
  getLocalizedHeadline,
  getLocalizedCategory,
  translateTextToTargetLanguage,
} from '../../utils/translation';
import { getArticleReadingStats, DEFAULT_WORDS_PER_MINUTE } from '../../utils/readingTime';
import { useTranslatedArticle } from '../../hooks/useTranslatedArticle';
import { ShareBar } from './ShareBar';
import { ReactionsBar } from './ReactionsBar';
import { RelatedArticlesWidget } from './RelatedArticlesWidget';
import { CommentsSection } from './CommentsSection';
import { AdBanner } from '../public/AdBanner';
import { LazyImage } from '../common/LazyImage';
import { LazyBoundary } from '../common/LazyBoundary';

export const ArticleView: React.FC = () => {
  const {
    articles,
    selectedArticleId,
    currentLanguage,
    detectedVisitorLanguage,
    setLanguage,
    toggleLanguage,
    viewArticle,
    setActiveView,
    viewCategory,
    viewAuthor,
    savedArticleIds,
    toggleSaveArticle,
    setIsBookmarksModalOpen,
    fontSize,
    setFontSize,
    readerTheme,
    setReaderTheme,
    liveTick,
  } = useNews();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  const article = articles.find((a) => a.id === selectedArticleId) || articles[0];
  if (!article) return null;

  const isSaved = savedArticleIds.includes(article.id);

  // Dynamic reading progress calculation (tracks article reading accurately)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect();
        const articleTop = rect.top + scrollTop;
        const articleHeight = rect.height;
        // The reader begins progressing as soon as the article content enters the viewport
        const startOffset = Math.max(0, articleTop - 120);
        // Reading is 100% complete when reaching the bottom of the article text & actions
        const endOffset = articleTop + articleHeight - window.innerHeight;
        const totalDistance = Math.max(1, endOffset - startOffset);

        if (scrollTop <= startOffset) {
          setReadingProgress(0);
        } else if (scrollTop >= endOffset) {
          setReadingProgress(100);
        } else {
          const raw = ((scrollTop - startOffset) / totalDistance) * 100;
          setReadingProgress(Math.min(100, Math.max(0, Math.round(raw))));
        }
      } else {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          const progress = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
          setReadingProgress(progress);
        } else {
          setReadingProgress(0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id]);

  const handleToggleSave = () => {
    toggleSaveArticle(article.id);
    const willBeSaved = !isSaved;
    const toastMsg = willBeSaved
      ? (currentLanguage === 'bn' ? 'সংবাদটি বুকমার্কে সংরক্ষিত হয়েছে' : currentLanguage === 'ja' ? '記事がブックマークに保存されました' : 'Article saved to bookmarks in local storage')
      : (currentLanguage === 'bn' ? 'সংবাদটি বুকমার্ক থেকে সরানো হয়েছে' : currentLanguage === 'ja' ? 'ブックマークから削除されました' : 'Removed from bookmarks');
    setSaveToast(toastMsg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Dynamic live language translation hook for this article
  const isEnglish = currentLanguage === 'en';
  const isBengali = currentLanguage === 'bn';
  const translated = useTranslatedArticle(article, currentLanguage);

  const displayTitle = translated.title || article.title;
  const displaySummary = translated.summary || article.summary;
  const displayLocation = translated.location || (isBengali ? article.location_bn || article.location : article.location);
  const displayCaption = translated.caption || (isBengali ? article.featuredImage?.caption_bn || article.featuredImage?.caption : article.featuredImage?.caption) || '';
  const displayAuthorName = translated.authorName || (isBengali ? article.author?.name_bn || article.author?.name : article.author?.name) || '';
  const displayAuthorTitle = translated.authorTitle || (isBengali ? article.author?.title_bn || article.author?.title : article.author?.title) || '';
  const displayAuthorBio = translated.authorBio || article.author?.bio || '';

  // Dynamic word count calculation and estimated reading time
  const readingStats = getArticleReadingStats(article, currentLanguage);

  // Related news based on same category or tags
  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.status === 'published' && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 4);

  // Most read articles
  const mostReadArticles = [...articles]
    .filter((a) => a.id !== article.id && a.status === 'published')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const handlePrint = () => {
    window.print();
  };

  // Text-to-Speech audio reader
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert(isBengali ? 'আপনার ব্রাউজারে অডিও প্লেব্যাক সমর্থিত নয়।' : currentLanguage === 'ja' ? 'お使いのブラウザは音声読み上げに対応していません。' : 'Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${displayTitle}. ${displaySummary}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      const langVoiceMap: Record<string, string> = {
        en: 'en-US',
        bn: 'bn-BD',
        ja: 'ja-JP',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        hi: 'hi-IN',
        ar: 'ar-SA',
        zh: 'zh-CN',
      };
      utterance.lang = langVoiceMap[currentLanguage] || 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Font size classes
  const getBodyTextClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm md:text-base leading-relaxed';
      case 'base':
        return 'text-base md:text-lg leading-relaxed';
      case 'lg':
        return 'text-lg md:text-xl leading-relaxed';
      case 'xl':
        return 'text-xl md:text-2xl leading-relaxed';
    }
  };

  // Reader theme container classes
  const getThemeClass = () => {
    switch (readerTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] p-4 sm:p-6 rounded-lg transition-colors';
      case 'dark':
        return 'bg-[#0f172a] text-slate-100 p-4 sm:p-6 rounded-lg transition-colors';
      default:
        return 'bg-transparent text-slate-900';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-6 ${getThemeClass()}`}>
      {/* Top Animated Reading Progress Bar Fixed at Top of Screen */}
      {/* Clean Top Reading Progress Bar Fixed at Top of Screen */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-slate-200/50 z-50 pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Sleek, Compact Floating Progress Pill - Unobtrusive, readable, with quick scroll-to-top */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          title={isBengali ? 'পড়ার অগ্রগতি - শীর্ষে যেতে ক্লিক করুন' : 'Reading progress - Click to jump to top'}
        >
          {/* Mini Circular Gauge */}
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={Math.round(readingProgress) >= 100 ? 'text-emerald-400' : 'text-amber-400'}
                strokeDasharray="100, 100"
                strokeDashoffset={100 - Math.round(readingProgress)}
                strokeLinecap="round"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Math.round(readingProgress) >= 100 ? (
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              ) : null}
            </div>
          </div>

          {/* Compact Percentage Text */}
          <span className="font-mono text-xs font-bold text-amber-300">
            {isBengali
              ? `${convertNumeralsToBengali(String(Math.round(readingProgress)))}%`
              : `${Math.round(readingProgress)}%`}
          </span>

          {/* Up arrow hint */}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Floating Save/Bookmark Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Utility: Back, Audio Narration, Font Size, Theme & Bookmarks */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-1 font-semibold text-slate-800 hover:text-red-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {getUIText('backToTopStories', currentLanguage)}
        </button>

        {/* Reader Customization Toolbar */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {/* Audio Listen */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-red-700 text-white animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
            }`}
            title="Listen to this article"
          >
            <span>{isPlayingAudio ? '⏹️' : '🔊'}</span>
            <span>
              {isPlayingAudio
                ? getUIText('stopAudio', currentLanguage)
                : getUIText('listen', currentLanguage)}
            </span>
          </button>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-[11px] font-bold text-slate-700">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${fontSize === 'sm' ? 'bg-white shadow-2xs text-slate-950 font-black' : 'hover:text-slate-950'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${fontSize === 'base' ? 'bg-white shadow-2xs text-slate-950 font-black' : 'hover:text-slate-950'}`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${fontSize === 'lg' ? 'bg-white shadow-2xs text-slate-950 font-black' : 'hover:text-slate-950'}`}
              title="Large text"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${fontSize === 'xl' ? 'bg-white shadow-2xs text-slate-950 font-black' : 'hover:text-slate-950'}`}
              title="Extra large text"
            >
              A++
            </button>
          </div>

          {/* Reader Theme Switcher: Zero hardcoded text, strictly dynamic per language */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-[10px] font-semibold text-slate-700">
            <button
              onClick={() => setReaderTheme('light')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${readerTheme === 'light' ? 'bg-white text-slate-950 shadow-2xs font-bold' : ''}`}
              title="Clean White paper"
            >
              {getUIText('day', currentLanguage)}
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${readerTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#433422] shadow-2xs font-bold' : ''}`}
              title="Sepia warm book"
            >
              {getUIText('sepia', currentLanguage)}
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2 py-0.5 rounded-full cursor-pointer ${readerTheme === 'dark' ? 'bg-slate-900 text-white shadow-2xs font-bold' : ''}`}
              title="Night comfort"
            >
              {getUIText('night', currentLanguage)}
            </button>
          </div>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold shadow-2xs'
                : 'hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title={getUIText('saveBookmarkStory', currentLanguage)}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-700 text-amber-700' : 'text-slate-600'}`} />
            <span>{isSaved ? getUIText('saved', currentLanguage) : getUIText('save', currentLanguage)}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 hover:text-slate-900 text-slate-500 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getUIText('print', currentLanguage)}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Column (8 cols) */}
        <article ref={articleRef} className="lg:col-span-8">
          {/* Category & Location Kicker */}
          <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
            <button
              onClick={() => viewCategory(article.category)}
              className="hover:underline cursor-pointer"
            >
              {getLocalizedCategory(article.category, currentLanguage)}
            </button>
            <span className="text-slate-300">&middot;</span>
            <span className="text-slate-600 font-normal normal-case flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {displayLocation}
            </span>
          </div>

          {/* Auto-Translation Live Status Indicator */}
          {translated.isTranslating && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs rounded-full animate-pulse mb-3">
              <Globe2 className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              <span className="font-medium">
                {SUPPORTED_LANGUAGES[currentLanguage]?.nativeName || currentLanguage}{' '}
                {getUIText('autoTranslating', currentLanguage)}
              </span>
            </div>
          )}

          {/* Headline */}
          <h1 className="font-serif-headline text-3xl md:text-5xl font-extrabold text-slate-950 leading-tight mb-4 tracking-tight">
            {displayTitle}
          </h1>

          {/* Lead Summary */}
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-serif italic mb-6">
            {displaySummary}
          </p>

          {/* Author Byline & Timestamps & Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 mb-6 bg-slate-50/50 px-3 rounded-xs">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={displayAuthorName}
                className="w-11 h-11 rounded-full object-cover border border-slate-300"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => viewAuthor(article.author.id)}
                    className="font-bold text-slate-950 text-sm hover:text-red-700 hover:underline cursor-pointer"
                  >
                    {displayAuthorName}
                  </button>
                  <span className="text-slate-300">&middot;</span>
                  {/* Estimated 'X minute read' duration next to the article byline */}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-amber-50/95 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-2xs"
                    title={`Estimated reading duration based on word count: ${readingStats.wordCount.toLocaleString()} words (~${DEFAULT_WORDS_PER_MINUTE} WPM)`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    <span>{readingStats.displayText}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {displayAuthorTitle}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end text-xs text-slate-500">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {getUIText('published', currentLanguage)} {formatRelativeTime(article.publishedAt, currentLanguage)}
                  </span>
                </div>
                <span className="text-slate-300">&middot;</span>
                <span
                  className="text-slate-500 text-[11px] font-normal"
                  title={`Exact word count: ${readingStats.wordCount} words`}
                >
                  {isBengali
                    ? `${convertNumeralsToBengali(String(readingStats.wordCount))} শব্দ`
                    : `${readingStats.wordCount.toLocaleString()} ${getUIText('words', currentLanguage)}`}
                </span>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <div className="text-[11px] text-amber-800 mt-0.5">
                  {getUIText('updated', currentLanguage)} {formatRelativeTime(article.updatedAt, currentLanguage)}
                </div>
              )}
            </div>

            {/* Adaptive Country-Based Language Switcher Button */}
            <div className="relative">
              <div className="flex items-center rounded-full overflow-hidden border border-amber-300 bg-amber-100 shadow-xs">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 hover:bg-amber-200 text-amber-950 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                  title={`Translate to ${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.name || 'Local Language'}`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>
                    {isEnglish
                      ? `${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.flag || '🌐'} ${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.translatePrompt || 'Translate'}`
                      : `🌐 ${SUPPORTED_LANGUAGES[currentLanguage]?.returnPrompt || 'Read in English'}`}
                  </span>
                </button>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="px-2 py-1.5 text-amber-900 hover:bg-amber-200 text-xs border-l border-amber-200 cursor-pointer font-bold"
                  title="Choose other languages"
                >
                  ▾
                </button>
              </div>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 text-slate-800 space-y-1 animate-in fade-in">
                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                    <span>Translate to Any Language</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Auto Engine</span>
                  </div>
                  {Object.values(SUPPORTED_LANGUAGES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                        currentLanguage === l.code ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </span>
                      {detectedVisitorLanguage === l.code && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-medium">Auto</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image with LCP priority */}
          <figure className="mb-8">
            <div className="aspect-16/9 overflow-hidden rounded-xs bg-slate-900 mb-2">
              <LazyImage
                src={article.featuredImage.url}
                alt={displayCaption}
                priority={true}
                aspectRatio="aspect-16/9"
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="text-xs text-slate-600 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <span>{displayCaption}</span>
              <span className="text-slate-400 font-medium shrink-0">
                {getUIText('photo', currentLanguage)} {article.featuredImage.credit}
              </span>
            </figcaption>
          </figure>

          {/* Share Bar */}
          <ShareBar article={article} />

          {/* Reader Engagement & Bookmark Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 my-5 bg-amber-50/70 border border-amber-200/90 rounded-md">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  isSaved
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600'
                    : 'bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 hover:border-amber-400'
                }`}
                title={getUIText('saveBookmarkStory', currentLanguage)}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-950 text-slate-950' : 'text-amber-700'}`} />
                <span>
                  {isSaved
                    ? getUIText('savedInBookmarks', currentLanguage)
                    : getUIText('saveBookmarkStory', currentLanguage)}
                </span>
              </button>

              {savedArticleIds.length > 0 && (
                <button
                  onClick={() => setIsBookmarksModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title={getUIText('savedArticles', currentLanguage)}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>{getUIText('savedArticles', currentLanguage)}</span>
                  <span className="bg-amber-200 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {savedArticleIds.length}
                  </span>
                </button>
              )}
            </div>

            {/* Live Reading Scroll Progress Indicator */}
            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-red-700 shrink-0" />
              <span className="hidden sm:inline font-semibold">{getUIText('readingProgress', currentLanguage)}</span>
              <span className="font-mono font-bold text-red-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs">
                {isBengali ? `${convertNumeralsToBengali(String(Math.round(readingProgress)))}%` : `${Math.round(readingProgress)}%`}
              </span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden md:block">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-[width] duration-150"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Corrections & Updates Box */}
          {article.corrections && article.corrections.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mb-6 rounded-r">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Corrections &amp; Updates Record</span>
              </div>
              {article.corrections.map((corr, idx) => (
                <p key={idx} className="text-xs text-amber-950 leading-relaxed">
                  <strong>{new Date(corr.timestamp).toLocaleTimeString()}:</strong>{' '}
                  {isEnglish
                    ? corr.note
                    : translateTextToTargetLanguage(corr.note, currentLanguage, corr.note_bn)}
                </p>
              ))}
            </div>
          )}

          {/* Article Blocks Body: Fully localized across all content types */}
          <div className="font-editorial-body text-slate-900 space-y-6 leading-relaxed">
            {translated.blocks.map((block) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={block.id} className={getBodyTextClass()}>
                    {block.text || ''}
                  </p>
                );
              }

              if (block.type === 'subheading') {
                return (
                  <h3
                    key={block.id}
                    className="font-serif-headline text-2xl font-bold text-slate-950 mt-8 mb-3"
                  >
                    {block.text || ''}
                  </h3>
                );
              }

              if (block.type === 'quote') {
                return (
                  <blockquote
                    key={block.id}
                    className="border-l-4 border-red-700 pl-4 py-2 my-6 font-serif italic text-lg md:text-xl text-slate-800 bg-slate-50/70"
                  >
                    <p>{block.text || ''}</p>
                    {block.quoteAuthor && (
                      <cite className="block text-xs font-sans not-italic text-slate-500 font-bold uppercase tracking-wider mt-2">
                        &mdash; {block.quoteAuthor}
                      </cite>
                    )}
                  </blockquote>
                );
              }

              if (block.type === 'image' && block.media) {
                const caption = block.media.caption || '';
                return (
                  <figure key={block.id} className="my-8">
                    <LazyImage
                      src={block.media.url}
                      alt={caption}
                      aspectRatio="aspect-16/10"
                      className="w-full rounded-xs object-cover"
                    />
                    <figcaption className="text-xs text-slate-500 mt-2 flex justify-between">
                      <span>{caption}</span>
                      <span>{block.media.credit}</span>
                    </figcaption>
                  </figure>
                );
              }

              if (block.type === 'video' && article.videos && article.videos.length > 0) {
                const video = article.videos[0];
                return (
                  <div key={block.id} className="my-8 bg-black rounded overflow-hidden">
                    <video src={video.url} controls className="w-full aspect-16/9" />
                    <div className="p-2.5 text-xs text-slate-300 bg-slate-950 flex justify-between">
                      <span>{video.caption}</span>
                      <span>{video.credit}</span>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* In-Article Sponsored Placement */}
          <AdBanner position="article_inline" className="my-6" />

          {/* Sources and Verifications Box */}
          <div className="mt-10 p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-900 mb-2">
              <FileText className="w-4 h-4 text-red-700" />
              <span>Institutional Attribution &amp; Source Verification</span>
            </div>
            <p className="leading-relaxed">
              <strong>Source wire:</strong> {article.source}
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Data points, international quotes, and treaties quoted in this dispatch were corroborated across bilateral communiqués and accredited news organizations.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {getUIText('topics', currentLanguage)}
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Post-Read Bookmark & Engagement Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 my-6 bg-slate-50 border border-slate-200 rounded-md">
            <div className="space-y-0.5">
              <h4 className="font-serif-headline text-sm font-bold text-slate-900">
                {getUIText('finishedReading', currentLanguage)}
              </h4>
              <p className="text-xs text-slate-500">
                {getUIText('finishedReadingSub', currentLanguage)}
              </p>
            </div>
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs ${
                isSaved
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600'
                  : 'bg-white hover:bg-amber-100 text-slate-800 border border-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-slate-950 text-slate-950' : 'text-amber-700'}`} />
              <span>
                {isSaved
                  ? getUIText('savedInBookmarks', currentLanguage)
                  : getUIText('saveBookmarkStory', currentLanguage)}
              </span>
            </button>
          </div>

          {/* Reactions Bar */}
          <ReactionsBar article={article} />

          {/* Dynamic Related Articles Widget */}
          <LazyBoundary minHeight="300px" rootMargin="200px">
            <RelatedArticlesWidget currentArticle={article} limit={4} />
          </LazyBoundary>

          {/* Comments Section with Lazy Loading */}
          <LazyBoundary minHeight="200px" rootMargin="150px">
            <CommentsSection articleId={article.id} />
          </LazyBoundary>
        </article>

        {/* Right Sidebar: Related News, Most Read, Bureau Desk (4 cols) */}
        <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8 space-y-10">
          {/* Author Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {getUIText('bureauBylines', currentLanguage)}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={article.author.avatar}
                alt={displayAuthorName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{displayAuthorName}</div>
                <div className="text-xs text-slate-500">{displayAuthorTitle}</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {displayAuthorBio}
            </p>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200">
              <span>{article.author.email}</span>
              <span className="font-semibold">{article.author.twitter}</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
              <span>
                {isBengali
                  ? `${convertNumeralsToBengali(String(readingStats.wordCount))} শব্দ`
                  : `${readingStats.wordCount.toLocaleString()} ${getUIText('words', currentLanguage)}`}
              </span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-red-700" />
                {readingStats.displayText}
              </span>
            </div>
          </div>

          {/* Sidebar Sponsor Banner */}
          <AdBanner position="article_sidebar" />

          {/* Related News */}
          <div>
            <div className="border-b-2 border-slate-900 pb-2 mb-4">
              <h3 className="font-serif-headline text-base font-bold uppercase tracking-wider text-slate-950">
                {getUIText('relatedNews', currentLanguage)}
              </h3>
            </div>
            <div className="space-y-4">
              {relatedArticles.map((rel) => {
                const title = getLocalizedHeadline(rel, currentLanguage);
                return (
                  <div
                    key={rel.id}
                    onClick={() => viewArticle(rel.id)}
                    className="group cursor-pointer flex gap-3 items-start"
                  >
                    <div className="w-18 h-14 shrink-0 rounded overflow-hidden bg-slate-100">
                      <LazyImage
                        src={rel.featuredImage.thumbnailUrl || rel.featuredImage.url}
                        alt={rel.title}
                        aspectRatio="aspect-16/10"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                        {getLocalizedCategory(rel.category, currentLanguage)}
                      </div>
                      <h4 className="font-serif-headline text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                        {title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {formatRelativeTime(rel.publishedAt, currentLanguage)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Read Across The World */}
          <div>
            <div className="border-b-2 border-slate-900 pb-2 mb-4">
              <h3 className="font-serif-headline text-base font-bold uppercase tracking-wider text-slate-950">
                {getUIText('mostRead', currentLanguage)}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {mostReadArticles.map((art, idx) => (
                <div
                  key={art.id}
                  onClick={() => viewArticle(art.id)}
                  className="py-3 first:pt-0 group cursor-pointer flex items-start gap-3"
                >
                  <span className="font-serif-headline text-xl font-bold text-slate-300 group-hover:text-red-700">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-serif-headline text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                      {getLocalizedHeadline(art, currentLanguage)}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {art.views.toLocaleString()} {getUIText('reads', currentLanguage)} &middot; {art.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
