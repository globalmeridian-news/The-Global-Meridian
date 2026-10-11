import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe2,
  Menu,
  X,
  Shield,
  Send,
  FileCode2,
  Lock,
  Clock,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { CategoryType, UserRole } from '../../types/news';
import {
  getLocalizedCategory,
  getEditorialTerm,
  getUIText,
  formatLiveDate,
  formatLiveTime,
  getBureauClocks,
  getUserTimeZoneInfo,
  SUPPORTED_LANGUAGES,
} from '../../utils/translation';

const CATEGORIES: CategoryType[] = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Health',
  'Defense',
  'Environment',
  'Sports',
  'Entertainment',
  'Videos',
  'Photo Stories',
];

export const Header: React.FC = () => {
  const {
    currentLanguage,
    detectedVisitorLanguage,
    setDetectedVisitorLanguage,
    setLanguage,
    toggleLanguage,
    currentRole,
    setCurrentRole,
    selectedCategory,
    viewCategory,
    setActiveView,
    activeView,
    twoFactorEnabled,
    setTwoFactorEnabled,
    isAuthenticated,
    logoutUser,
    setIsLoginModalOpen,
    savedArticleIds,
    setIsBookmarksModalOpen,
  } = useNews();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [bureauClockOpen, setBureauClockOpen] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('local');

  // Auto-update date and time every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isBn = currentLanguage === 'bn';
  const userTzInfo = getUserTimeZoneInfo();

  // Active timezone configuration
  const activeTz = selectedTimeZone === 'local' ? undefined : selectedTimeZone;
  const activeTzBadge =
    selectedTimeZone === 'local'
      ? userTzInfo.shortName
      : selectedTimeZone === 'America/New_York'
      ? 'EDT'
      : selectedTimeZone === 'America/Los_Angeles'
      ? 'PDT'
      : selectedTimeZone === 'Asia/Kolkata'
      ? 'IST'
      : selectedTimeZone === 'Asia/Dhaka'
      ? 'BST'
      : selectedTimeZone === 'Europe/London'
      ? 'GMT'
      : selectedTimeZone === 'Europe/Paris'
      ? 'CET'
      : selectedTimeZone === 'Asia/Tokyo'
      ? 'JST'
      : selectedTimeZone === 'Asia/Riyadh'
      ? 'AST'
      : selectedTimeZone === 'UTC'
      ? 'UTC'
      : 'LOCAL';

  const liveDateString = formatLiveDate(currentTime, currentLanguage, activeTz);
  const liveTimeString = formatLiveTime(currentTime, currentLanguage, activeTz);
  const bureauClocks = getBureauClocks(currentTime, currentLanguage);

  const simulateVisitorCountry = (tz: string, lang: import('../../types/news').SupportedLanguage) => {
    setSelectedTimeZone(tz);
    setDetectedVisitorLanguage(lang);
    setBureauClockOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setRoleMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* 1. Top Global Intelligence Wire Bar with Dynamic Auto Date & Time */}
      <div className="bg-[#06172F] text-slate-200 text-xs px-3 sm:px-4 py-1.5 border-b border-slate-800/90 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Live Date and Time */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden">
            <span className="font-bold text-amber-400 tracking-wider uppercase text-[10px] sm:text-[11px] shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {getUIText('globalEdition', currentLanguage)}
            </span>
            <span className="text-slate-600 hidden xs:inline">·</span>
            
            {/* Auto-updating Date - clearly visible */}
            <span className="text-slate-200 font-medium text-[11px] sm:text-xs truncate">
              {liveDateString}
            </span>
            <span className="text-slate-600">·</span>

            {/* Auto-updating Live Clock with Detected Timezone */}
            <div className="flex items-center gap-1 bg-slate-950/90 px-1.5 sm:px-2 py-0.5 rounded border border-slate-700 text-[10px] sm:text-[11px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Clock className="w-3 h-3 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-300 tracking-wider">
                {liveTimeString}
              </span>
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-mono font-bold bg-slate-900 px-1 py-0.2 rounded border border-slate-700">
                {activeTzBadge}
              </span>
            </div>

            {/* World Bureau Clocks Ticker / Dropdown */}
            <div className="relative hidden lg:inline-block">
              <button
                onClick={() => setBureauClockOpen(!bureauClockOpen)}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer hover:underline"
                title="View live bureau clocks or select timezone"
              >
                <span>{getUIText('bureausAndZones', currentLanguage)} ▾</span>
              </button>

              {bureauClockOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-3 z-50 text-slate-200 space-y-3 animate-in fade-in">
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                      <span>{getUIText('activeTimezoneAndCountry', currentLanguage)}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{getUIText('liveAuto', currentLanguage)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        onClick={() => {
                          setSelectedTimeZone('local');
                          setBureauClockOpen(false);
                        }}
                        className={`text-left p-1.5 rounded cursor-pointer col-span-2 ${
                          selectedTimeZone === 'local' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'hover:bg-slate-800'
                        }`}
                      >
                        📍 {getUIText('yourDeviceAutoDetect', currentLanguage)} ({userTzInfo.shortName})
                      </button>

                      {/* India Test Option */}
                      <button
                        onClick={() => simulateVisitorCountry('Asia/Kolkata', 'hi')}
                        className={`text-left p-1.5 rounded cursor-pointer ${
                          selectedTimeZone === 'Asia/Kolkata' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'hover:bg-slate-800'
                        }`}
                        title="India Standard Time (UTC+5:30) & Hindi"
                      >
                        🇮🇳 {isBn ? 'ভারত (IST)' : 'India (IST)'}
                      </button>

                      {/* USA Test Option */}
                      <button
                        onClick={() => simulateVisitorCountry('America/New_York', 'en')}
                        className={`text-left p-1.5 rounded cursor-pointer ${
                          selectedTimeZone === 'America/New_York' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'hover:bg-slate-800'
                        }`}
                        title="US Eastern Time (UTC-4) & English"
                      >
                        🇺🇸 {isBn ? 'আমেরিকা NY (EDT)' : 'USA / NY (EDT)'}
                      </button>

                      {/* Bangladesh Option */}
                      <button
                        onClick={() => simulateVisitorCountry('Asia/Dhaka', 'bn')}
                        className={`text-left p-1.5 rounded cursor-pointer ${
                          selectedTimeZone === 'Asia/Dhaka' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'hover:bg-slate-800'
                        }`}
                        title="Bangladesh Standard Time (UTC+6) & Bengali"
                      >
                        🇧🇩 {isBn ? 'বাংলাদেশ (BST)' : 'Bangladesh (BST)'}
                      </button>

                      {/* UK Option */}
                      <button
                        onClick={() => simulateVisitorCountry('Europe/London', 'en')}
                        className={`text-left p-1.5 rounded cursor-pointer ${
                          selectedTimeZone === 'Europe/London' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'hover:bg-slate-800'
                        }`}
                        title="UK London Time (GMT/BST) & English"
                      >
                        🇬🇧 {isBn ? 'যুক্তরাজ্য (GMT)' : 'UK London (GMT)'}
                      </button>

                      {/* International UTC Option */}
                      <button
                        onClick={() => {
                          setSelectedTimeZone('UTC');
                          setBureauClockOpen(false);
                        }}
                        className={`text-left p-1.5 rounded cursor-pointer col-span-2 ${
                          selectedTimeZone === 'UTC' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:bg-slate-800'
                        }`}
                      >
                        🌐 {isBn ? 'আন্তর্জাতিক প্রমাণ সময় (UTC / GMT)' : 'International Time (UTC / GMT)'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase pb-1 mb-1">
                      {getUIText('worldBureausLiveClocks', currentLanguage)}
                    </div>
                    {bureauClocks.map((b) => (
                      <div key={b.name} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-400">{isBn ? b.name_bn : b.name}:</span>
                        <span className="font-mono font-semibold text-emerald-300">{b.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
            {/* Adaptive Country-Based Language Switcher & Selector */}
            <div className="relative">
              <div className="flex items-center rounded overflow-hidden border border-slate-700 bg-slate-800">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 sm:gap-1.5 hover:bg-slate-700 text-amber-300 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
                  title={`Translate to ${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.name || 'Local Language'}`}
                >
                  <Globe2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>
                    {currentLanguage === 'en'
                      ? `${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.flag || '🌐'} ${SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.translatePrompt || 'Translate'}`
                      : `🌐 ${SUPPORTED_LANGUAGES[currentLanguage]?.returnPrompt || 'Read in English'}`}
                  </span>
                </button>
                <button
                  onClick={() => setLangPickerOpen(!langPickerOpen)}
                  className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700 text-xs border-l border-slate-700 cursor-pointer"
                  title="Choose from all world languages"
                >
                  ▾
                </button>
              </div>

              {langPickerOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-2 z-50 text-slate-200 animate-in fade-in space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                    <span>World Languages</span>
                    <span className="text-[9px] text-slate-400">Auto-Detect: {SUPPORTED_LANGUAGES[detectedVisitorLanguage]?.flag}</span>
                  </div>
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangPickerOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                        currentLanguage === lang.code ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {detectedVisitorLanguage === lang.code && (
                        <span className="text-[9px] bg-slate-800 text-emerald-400 font-mono px-1 py-0.2 rounded">Your Region</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bookmarks / Saved Articles Button */}
            <button
              onClick={() => setIsBookmarksModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs transition-colors cursor-pointer"
              title={isBn ? 'সংরক্ষিত সংবাদসমূহ দেখুন' : 'View Saved / Bookmarked Articles'}
            >
              <Bookmark className={`w-3 h-3 ${savedArticleIds.length > 0 ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span className="font-semibold hidden xs:inline">
                {getUIText('saved', currentLanguage)}
              </span>
              {savedArticleIds.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                  {savedArticleIds.length}
                </span>
              )}
            </button>

            {/* If NOT Authenticated: Prominent RED Admin Login Button */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3 py-1 rounded-full text-[11px] sm:text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                title={isBn ? 'নিউজ রুম ও সম্পাদকীয় এডমিন লগইন' : 'Newsroom & Editorial Admin Login'}
              >
                <Lock className="w-3 h-3 text-white" />
                <span>{getUIText('adminLogin', currentLanguage)}</span>
              </button>
            ) : (
              /* If Authenticated: Show Visitor Mode Toggle & CMS Switcher */
              <div className="flex items-center gap-2">

                {/* 1. View as Public Reader Toggle */}
                {activeView === 'cms' ? (
                  <button
                    onClick={() => {
                      setActiveView('home');
                    }}
                    className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                    title={getUIText('viewAsReader', currentLanguage)}
                  >
                    <span>👀</span>
                    <span className="hidden sm:inline">{getUIText('viewAsReader', currentLanguage)}</span>
                    <span className="sm:hidden">Reader</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView('cms')}
                    className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer shadow-xs"
                    title={getUIText('adminCMS', currentLanguage)}
                  >
                    <Shield className="w-3 h-3" />
                    <span>{getUIText('adminCMS', currentLanguage)}</span>
                  </button>
                )}

                {/* Role Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                    title="Change Role"
                  >
                    <span className="capitalize">{currentRole}</span>
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1 border-b border-slate-100 mb-1">
                        {isBn ? 'নিউজ রুম ভূমিকা পরিবর্তন' : 'Newsroom Role Switcher'}
                      </div>
                      <button
                        onClick={() => handleRoleChange('admin')}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between ${
                          currentRole === 'admin' ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{isBn ? 'এডমিন (পূর্ণ নিয়ন্ত্রণ)' : 'Admin (Full Control)'}</div>
                          <div className="text-[10px] text-slate-500">Publish, Manage, Review Tips</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRoleChange('editor')}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between ${
                          currentRole === 'editor' ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{isBn ? 'সম্পাদক' : 'Editor'}</div>
                          <div className="text-[10px] text-slate-500">Edit, Publish &amp; Moderate</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRoleChange('reporter')}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between ${
                          currentRole === 'reporter' ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{isBn ? 'প্রতিবেদক' : 'Reporter'}</div>
                          <div className="text-[10px] text-slate-500">Write, Upload &amp; Draft</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logoutUser();
                            setRoleMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1 text-xs text-red-600 font-semibold hover:bg-red-50 rounded"
                        >
                          {isBn ? 'লগআউট করুন' : 'Sign Out / Logout'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Desktop Masthead: 3-column architectural grid with structured Ear cards & flanking editorial wings */}
        <div className="hidden md:grid grid-cols-[250px_1fr_250px] lg:grid-cols-[270px_1fr_270px] xl:grid-cols-[290px_1fr_290px] items-center gap-3 lg:gap-4 py-4 md:py-5">
          {/* Left Column: Structured Newspaper Ear Card (Bureau & Edition) */}
          <div className="flex flex-col text-left justify-center p-2.5 rounded-lg border border-slate-200/90 bg-slate-50/70 shadow-2xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="font-bold text-red-700 uppercase tracking-wider text-[11px]">
                  {isBn ? 'আন্তর্জাতিক সংস্করণ' : 'International Edition'}
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded font-mono">
                LIVE WIRE
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'সত্যতা যাচাইকৃত সাংবাদিকতা' : 'Verified Wire & Record'}
            </span>
            <div className="text-xs text-slate-800 font-semibold mt-1.5 flex items-center gap-1.5 pt-1 border-t border-slate-200/70">
              <Clock className="w-3.5 h-3.5 text-red-600 inline shrink-0" />
              <span className="truncate">{liveDateString}</span>
            </div>
          </div>

          {/* Center Column: Perfectly Centered, Prestigious Newspaper Masthead Title */}
          <div
            onClick={() => {
              viewCategory('All');
              setActiveView('home');
            }}
            className="cursor-pointer text-center select-none py-1 group px-2 sm:px-4"
          >
            {/* World-Class Newspaper Nameplate */}
            <h1 className="font-masthead text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-black text-slate-950 group-hover:text-red-700 transition-colors tracking-tight leading-none drop-shadow-2xs inline-block">
              The Global Meridian
            </h1>

            {/* Editorial Subtitle & Motto */}
            <div className="mt-2 flex flex-col items-center justify-center">
              {isBn ? (
                <div className="text-xs sm:text-sm font-serif font-medium text-slate-700 tracking-wide flex items-center justify-center gap-2">
                  <span className="w-4 sm:w-10 h-px bg-slate-300"></span>
                  <span className="text-red-700 font-bold">দ্য গ্লোবাল মেরিডিয়ান</span>
                  <span className="text-slate-400">·</span>
                  <span>আন্তর্জাতিক জার্নাল অব রেকর্ড · প্রতিষ্ঠিত ২০২৪</span>
                  <span className="w-4 sm:w-10 h-px bg-slate-300"></span>
                </div>
              ) : (
                <div className="text-[10px] sm:text-xs font-serif italic text-slate-600 tracking-wider flex items-center justify-center gap-2">
                  <span className="w-6 sm:w-12 h-px bg-slate-300"></span>
                  <span className="truncate">The International Journal of Record · Truth, Perspective & Clarity · Est. 2024</span>
                  <span className="w-6 sm:w-12 h-px bg-slate-300"></span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Structured Newspaper Ear Card (Newsroom & Public Submission) */}
          <div className="flex flex-col items-end justify-center p-2.5 rounded-lg border border-slate-200/90 bg-slate-50/70 shadow-2xs gap-1.5">
            <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>{isBn ? 'নাগরিক ডেস্ক' : 'Newsroom Desk'}</span>
              <span className="text-red-700 font-semibold">{isBn ? 'পাবলিক সাবমিশন' : 'Public Tips'}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Public News Submission Button */}
              <button
                onClick={() => setActiveView('submit')}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-sm whitespace-nowrap shrink-0 group"
                title={isBn ? 'নিউ সাবমিট করুন' : 'Submit News for Verification'}
              >
                <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span>{isBn ? 'নিউ সাবমিট' : 'Submit News'}</span>
              </button>


              <button
                onClick={() => setActiveView('search')}
                className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-full text-xs transition-colors cursor-pointer border border-slate-200 shrink-0"
                title="Search news"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Masthead: Clean, stacked, centered title with accessible buttons */}
        <div className="md:hidden py-3">
          {/* Centered Newspaper Name */}
          <div
            onClick={() => {
              viewCategory('All');
              setActiveView('home');
            }}
            className="cursor-pointer text-center select-none pb-2.5 border-b border-slate-100"
          >
            <h1 className="font-masthead text-3xl sm:text-4xl font-black text-slate-950 hover:text-red-700 transition-colors tracking-tight leading-none drop-shadow-2xs">
              The Global Meridian
            </h1>
            {isBn && (
              <div className="text-xs font-serif font-semibold text-red-700 tracking-wide mt-1">
                দ্য গ্লোবাল মেরিডিয়ান
              </div>
            )}
            <div className="text-[10px] font-medium text-slate-600 mt-1.5 flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3 text-red-600 shrink-0" />
              <span className="font-semibold text-slate-800">{liveDateString}</span>
              <span>·</span>
              <span className="font-mono text-slate-700 font-bold">{liveTimeString}</span>
            </div>
          </div>

          {/* Quick Action Row on Mobile: Unified 3-Part Command Strip (Menu + Search + Submit) */}
          <div className="flex items-center gap-2 pt-2.5 pb-0.5 px-0.5">
            {/* 1. Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 border transition-all shadow-2xs ${
                mobileMenuOpen
                  ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border-slate-200/90'
              }`}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-3.5 h-3.5 text-red-600" /> : <Menu className="w-3.5 h-3.5 text-red-600" />}
              <span>{isBn ? 'মেনু' : 'Menu'}</span>
            </button>

            {/* 2. Interactive Search Pill - Elegantly fills the middle gap */}
            <button
              onClick={() => setActiveView('search')}
              className="flex-1 flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300/70 px-3.5 py-1.5 rounded-full text-slate-500 text-xs border border-slate-200/90 transition-all cursor-pointer shadow-2xs group min-w-0"
              title={isBn ? 'সংবাদ খুঁজুন...' : 'Search news...'}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
              <span className="truncate text-slate-500 group-hover:text-slate-800 transition-colors font-normal text-xs">
                {isBn ? 'সংবাদ খুঁজুন...' : 'Search news...'}
              </span>
            </button>

            {/* 3. News Submission Button - Prominent RED Pill */}
            <button
              onClick={() => setActiveView('submit')}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap shrink-0 transition-all group"
              title={isBn ? 'নিউ সাবমিট' : 'Submit News'}
            >
              <Send className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              <span>{isBn ? 'নিউ সাবমিট' : 'Submit News'}</span>
            </button>
          </div>
        </div>
        {/* Authentic International Editorial Double Hairline Rules */}
        <div className="border-b-2 border-slate-900 mt-2 sm:mt-3" />
        <div className="border-b border-slate-300 mt-0.5" />
      </div>

      {/* 3. Single Unified Category Navigation Bar (একক সুসংহত ক্যাটাগরি ন্যাভিগেশন বার) */}
      <nav className="border-b border-slate-200 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-3.5 overflow-x-auto scrollbar-none py-1.5 sm:py-0 text-xs whitespace-nowrap">
            <button
              onClick={() => viewCategory('All')}
              className={`transition-all cursor-pointer shrink-0 uppercase tracking-wider font-bold text-xs ${
                selectedCategory === 'All' && activeView === 'home'
                  ? 'text-red-600 sm:border-b-2 sm:border-red-600 sm:pb-2.5 sm:pt-2 sm:-mb-px px-3 py-1 rounded-full sm:rounded-none bg-red-50 sm:bg-transparent shadow-xs sm:shadow-none'
                  : 'text-slate-700 hover:text-red-600 font-semibold sm:pb-2.5 sm:pt-2 sm:-mb-px sm:border-b-2 sm:border-transparent sm:hover:border-red-300 px-2.5 py-1'
              }`}
            >
              {getUIText('home', currentLanguage)}
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => viewCategory(cat)}
                className={`transition-all cursor-pointer shrink-0 uppercase tracking-wider text-[11px] sm:text-xs font-semibold ${
                  selectedCategory === cat && activeView === 'home'
                    ? 'text-red-600 font-bold sm:border-b-2 sm:border-red-600 sm:pb-2.5 sm:pt-2 sm:-mb-px px-3 py-1 rounded-full sm:rounded-none bg-red-50 sm:bg-transparent shadow-xs sm:shadow-none'
                    : 'text-slate-700 hover:text-red-600 sm:pb-2.5 sm:pt-2 sm:-mb-px sm:border-b-2 sm:border-transparent sm:hover:border-red-300 px-2.5 py-1'
                }`}
              >
                {getLocalizedCategory(cat, currentLanguage)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-300 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setActiveView('search');
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-800 py-2 rounded text-xs font-medium"
            >
              <Search className="w-4 h-4" />
              Search News &amp; Topics
            </button>
            <button
              onClick={() => {
                setIsBookmarksModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-2 rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
              title="Saved Articles"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700" />
              <span>{getUIText('saved', currentLanguage)}</span>
              {savedArticleIds.length > 0 && (
                <span className="bg-amber-700 text-white font-bold px-1.5 py-0.2 text-[9px] rounded-full">
                  {savedArticleIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveView('submit');
                setMobileMenuOpen(false);
              }}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBn ? 'নিউ সাবমিট' : 'Submit News'}</span>
            </button>
          </div>

          {/* Quick Staff / Admin Access Card right at top of menu */}
          <div className="mb-3 p-2 bg-slate-100 rounded-md border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>{isBn ? 'নিউজ রুম ও সম্পাদকীয়' : 'Newsroom & Editorial'}</span>
            </div>
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1 rounded text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>{getUIText('adminLogin', currentLanguage)}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setActiveView('cms');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                >
                  CMS
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-slate-600 hover:text-red-600 font-semibold text-[11px] px-1 cursor-pointer"
                >
                  Exit
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              onClick={() => {
                viewCategory('All');
                setMobileMenuOpen(false);
              }}
              className="text-left px-2 py-2 hover:bg-slate-100 rounded font-semibold text-red-700"
            >
              {getUIText('frontPage', currentLanguage)}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  viewCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-2 py-2 hover:bg-slate-100 rounded ${
                  selectedCategory === cat ? 'font-bold text-red-700' : 'text-slate-800'
                }`}
              >
                {getLocalizedCategory(cat, currentLanguage)}
              </button>
            ))}
          </div>

          {/* Mobile Admin & Reader Switcher */}
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded text-xs text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{getUIText('adminLogin', currentLanguage)}</span>
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setActiveView('cms');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-700 text-white font-bold py-2 rounded text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{getUIText('adminCMS', currentLanguage)}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-emerald-700 text-white font-semibold py-2 rounded text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>👀</span>
                  <span>{getUIText('viewAsReader', currentLanguage)}</span>
                </button>

                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-100 text-slate-700 py-1.5 rounded text-xs text-center font-medium cursor-pointer"
                >
                  {getUIText('signOut', currentLanguage)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
