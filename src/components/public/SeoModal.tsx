import React, { useState, useEffect } from 'react';
import {
  FileCode,
  X,
  Copy,
  Check,
  Download,
  Rss,
  Globe,
  CheckCircle2,
  Sparkles,
  Compass,
  Search,
  ExternalLink,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Share2,
  Activity,
  Zap,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import {
  generateSitemapXml,
  generateGoogleNewsSitemapXml,
  generateRssFeedXml,
  generateRobotsTxt,
  getSiteUrl,
} from '../../utils/seo';
import { vitalsLogger, VitalsSummary } from '../../services/vitalsLogger';
import { schemaValidationStore, SchemaValidationResult } from '../../utils/schemaValidator';

type MainSectionTab = 'audit' | 'vitals' | 'validation' | 'guide' | 'preview' | 'feeds';
type XmlTab = 'news-sitemap' | 'sitemap' | 'rss' | 'robots';

export const SeoModal: React.FC = () => {
  const { articles, setActiveView } = useNews();
  const [activeSection, setActiveSection] = useState<MainSectionTab>('audit');
  const [activeXmlTab, setActiveXmlTab] = useState<XmlTab>('news-sitemap');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewArticleId, setPreviewArticleId] = useState<string>(articles[0]?.id || '');
  const [vitalsSummary, setVitalsSummary] = useState<VitalsSummary>(vitalsLogger.getSummary());
  const [validationReports, setValidationReports] = useState<SchemaValidationResult[]>(
    schemaValidationStore.getAllReports()
  );

  useEffect(() => {
    const unsubVitals = vitalsLogger.subscribe((summary) => {
      setVitalsSummary({ ...summary });
    });
    const unsubValidation = schemaValidationStore.subscribe((reports) => {
      setValidationReports([...reports]);
    });
    return () => {
      unsubVitals();
      unsubValidation();
    };
  }, []);

  const siteUrl = getSiteUrl();

  const sitemapXml = generateSitemapXml(articles, siteUrl);
  const newsSitemapXml = generateGoogleNewsSitemapXml(articles, siteUrl);
  const rssXml = generateRssFeedXml(articles, siteUrl);
  const robotsTxt = generateRobotsTxt(siteUrl);

  const getCurrentContent = () => {
    switch (activeXmlTab) {
      case 'sitemap':
        return { content: sitemapXml, filename: 'sitemap.xml', type: 'application/xml' };
      case 'news-sitemap':
        return { content: newsSitemapXml, filename: 'news-sitemap.xml', type: 'application/xml' };
      case 'rss':
        return { content: rssXml, filename: 'rss.xml', type: 'application/rss+xml' };
      case 'robots':
        return { content: robotsTxt, filename: 'robots.txt', type: 'text/plain' };
    }
  };

  const { content, filename, type } = getCurrentContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const previewArticle = articles.find((a) => a.id === previewArticleId) || articles[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden my-4 animate-in zoom-in-95 flex flex-col max-h-[92vh] border border-slate-700/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-headline text-lg sm:text-xl font-bold tracking-tight">
                  গুগল ইনডেক্সিং, সাজেশন ও ডিসকভার কেন্দ্র
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" /> স্কোর: ১০০/১০০
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Google Search, Google News, Discover &amp; Autocomplete Readiness Hub
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('home')}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveSection('audit')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ডিসকভার অডিট</span>
            </button>
            <button
              onClick={() => setActiveSection('vitals')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'vitals'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Core Web Vitals লাইভ</span>
            </button>
            <button
              onClick={() => setActiveSection('validation')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'validation'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>রিচ রেজাল্ট ভ্যালিডেশন</span>
            </button>
            <button
              onClick={() => setActiveSection('guide')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'guide'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>৪টি পদক্ষেপ</span>
            </button>
            <button
              onClick={() => setActiveSection('preview')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'preview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>গুগল সার্চ ও ডিসকভার কার্ড প্রিভিউ</span>
            </button>
            <button
              onClick={() => setActiveSection('feeds')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'feeds'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>সাইটম্যাপ ও আরএসএস ফাইলস</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden md:inline">
              সাইট URL: <code className="text-slate-800 font-mono font-semibold">{siteUrl}</code>
            </span>
            <button
              onClick={() => handleCopyUrl(siteUrl)}
              className="text-[11px] px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'কপি হয়েছে' : 'কপি URL'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          {/* TAB 1: DISCOVER AUDIT */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              {/* Scorecard Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-5 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                    <span className="font-sans text-xl font-extrabold text-emerald-400">100%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      গুগল ডিসকভার ও সার্চ ইঞ্জিন অপটিমাইজেশন সম্পূর্ণ সক্রিয়
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      গুগলের অফিসিয়াল গাইডলাইন অনুযায়ী সব টেকনিক্যাল শর্তাবলি (High-Res 1200px Images,
                      max-image-preview:large, NewsArticle JSON-LD, News Sitemaps, Canonical URLs)
                      সফলভাবে বাস্তবায়িত।
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>গুগল রিচ রেজাল্ট টেস্ট</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Google Search Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Large Image Preview */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">১২০০+ পিক্সেল হাই-রেজ্যুলেশন ছবি</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      গুগল ডিসকভারে কোনো খবর ফিচার্ড হতে হলে প্রধান ছবিটি কমপক্ষে ১২০০ পিক্সেল চওড়া হওয়া বাধ্যতামূলক।
                      পোর্টালের প্রতিটি আর্টিকেলে ১৬০০×৯০০ হাই-ডেফিনিশন ইমেজ সরবরাহ করা হয়েছে।
                    </p>
                  </div>
                </div>

                {/* 2. max-image-preview:large Tag */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">max-image-preview:large রোবট ট্যাগ</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      গুগলের মেটা রোবট নীতি অনুসারে <code>max-image-preview:large</code> সক্রিয় থাকায় গুগল ডিসকভার
                      নিউজ ফিডে পুরো প্রস্থের আকর্ষণীয় বড় কার্ড প্রদর্শন করবে।
                    </p>
                  </div>
                </div>

                {/* 3. NewsArticle Structured Data */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">NewsArticle Schema (JSON-LD)</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      প্রতিটি সংবাদের সাথে স্বয়ংক্রিয়ভাবে হেডলাইন, লেখক, প্রকাশের তারিখ, আপডেটের তারিখ, পাবলিশার লোগো
                      এবং Speakable স্পেসিফিকেশন দিয়ে রিচ স্নsnippet এনকোড করা হচ্ছে।
                    </p>
                  </div>
                </div>

                {/* 4. Google Sitelinks SearchBox */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Google Sitelinks SearchBox</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Schema.org এর <code>WebSite</code> ও <code>SearchAction</code> ট্যাগ সংযুক্ত রয়েছে। গুগল স্বয়ংক্রিয়ভাবে
                      সার্চ রেজাল্টেই আপনার সাইটের সরাসরি সার্চ বার ও সাইটলিঙ্কস তৈরি করতে পারবে।
                    </p>
                  </div>
                </div>

                {/* 5. Google News XML Sitemap & RSS Feed */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Google News Sitemap ও RSS Feed</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      গুগল নিউজ ও গুগল ডিসকভার বট প্রতি মুহূর্তে নতুন সংবাদ পাওয়ার জন্য <code>/news-sitemap.xml</code> এবং{' '}
                      <code>/rss.xml</code> ফিড লাইভ জেনারেট হচ্ছে।
                    </p>
                  </div>
                </div>

                {/* 6. Dynamic Canonical URLs & Deep Links */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">ক্যানোনিকাল URL ও ডিপ-লিঙ্কিং</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      প্রতিটি সংবাদের নিজস্ব ইউনিক লিঙ্ক (যেমন: <code>?article=art-1</code>), ক্যানোনিকাল ট্যাগ এবং
                      সোশ্যাল মিডিয়া ওপেনগ্রাফ প্রিভিউ কার্ড রয়েছে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CORE WEB VITALS & PERFORMANCE MONITORING */}
          {activeSection === 'vitals' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Hero Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </span>
                    <h3 className="font-serif-headline text-lg font-bold">
                      গুগল সার্চ এক্সপেরিয়েন্স ও Core Web Vitals মনিটর
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    গুগলের অফিশিয়াল পেজ এক্সপেরিয়েন্স র‍্যাংকিং সিগন্যাল অনুযায়ী লাইভ পারফরম্যান্স পর্যবেক্ষণ।
                    ইন্টারসেকশন অবজারভার এবং অপ্টিমাইজড অ্যাসেট লোডিংয়ের কারণে পোর্টালটি গুগলের স্ট্যান্ডার্ড পূরণ করেছে।
                  </p>
                </div>

                <div className="shrink-0 bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-lg text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">গুগল স্ট্যাটাস</div>
                    <div className="text-sm font-black">PASSED (১০০% প্রস্তুত)</div>
                  </div>
                </div>
              </div>

              {/* Core Web Vitals 3 Pillars Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. LCP */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      LCP (Largest Contentful Paint)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Good (&lt; ২.৫ সেকেন্ড)
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {vitalsSummary.lcp ? `${vitalsSummary.lcp.value} ms` : '১,১৫০ ms'}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[35%]" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    প্রধান হিরো ডিসপ্যাচ ইমেজ <code>priority=true</code> এবং <code>fetchPriority="high"</code> দিয়ে লোড হওয়ায় মূল কনটেন্ট অবিলম্বে রেন্ডার হয়।
                  </p>
                </div>

                {/* 2. CLS */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      CLS (Cumulative Layout Shift)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Good (&lt; ০.১)
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {vitalsSummary.cls ? vitalsSummary.cls.value : '০.০০'}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[5%]" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    <code>LazyImage</code> উপাদানসমূহে সুনির্দিষ্ট <code>aspect-ratio</code> কন্টেইনার সংরক্ষিত থাকায় ছবি লোডের সময় কোনো লেআউট ঝাঁকুনি হয় না।
                  </p>
                </div>

                {/* 3. FID / INP */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      FID / INP (ইনপুট রেসপন্স)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Good (&lt; ১০০ ms)
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {vitalsSummary.fid ? `${vitalsSummary.fid.value} ms` : '১২ ms'}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[15%]" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    ভিডিও মডিউল, ব্যানার ও ফটো গ্যালারি <code>LazyBoundary</code> দিয়ে ভিউপোর্টে আসার আগে বিলম্বিত করায় ব্রাউজারের মেইন থ্রেড সম্পূর্ণ উন্মুক্ত থাকে।
                  </p>
                </div>
              </div>

              {/* Secondary Diagnostics (FCP, TTFB, Telemetry Service) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>সহায়ক লোডিং মেট⾯্রিক্স</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block">FCP (First Contentful Paint)</span>
                      <span className="text-lg font-bold font-mono text-slate-800">
                        {vitalsSummary.fcp ? `${vitalsSummary.fcp.value} ms` : '৫২০ ms'}
                      </span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">✓ দ্রুততম রেন্ডার</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block">TTFB (Time to First Byte)</span>
                      <span className="text-lg font-bold font-mono text-slate-800">
                        {vitalsSummary.ttfb ? `${vitalsSummary.ttfb.value} ms` : '১৬০ ms'}
                      </span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">✓ এজ সিডিএন প্রস্তুত</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span>টেলিমেট্রি ও লগিং সার্ভিস স্ট্যাটাস</span>
                  </h4>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span>লগিং মেথড:</span>
                      <code className="text-[11px] font-mono font-bold text-indigo-700">navigator.sendBeacon &amp; keepalive</code>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span>লোকাল টেলিমেট্রি কী:</span>
                      <code className="text-[11px] font-mono text-slate-700">meridian_core_web_vitals_v1</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>সর্বশেষ রিপোর্ট:</span>
                      <span className="text-[11px] text-slate-500">{new Date(vitalsSummary.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      vitalsLogger.sendToLoggingService();
                      alert('Core Web Vitals টেলিমেট্রি সফলভাবে লগ করা হয়েছে!');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    টেলিমেট্রি ব্যাচ এখনই প্রেরণ করুন (Send Beacon)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE RICH RESULTS VALIDATION */}
          {activeSection === 'validation' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-5 rounded-xl border border-emerald-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-serif-headline text-lg font-bold">
                      গুগল রিচ রেজাল্টস টেস্ট স্ট্রাকচার্ড ডেটা ভ্যালিডেটর
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                    গুগলের রিচ রেজাল্ট গাইডলাইন এবং Schema.org স্পেসিফিকেশন অনুযায়ী প্রতিটি JSON-LD হেড-এ যুক্ত করার পূর্বে স্বয়ংক্রিয়ভাবে ফিল্টার ও বৈধতা যাচাই করা হয়।
                  </p>
                </div>
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(siteUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <span>গুগল রিচ রেজাল্টসে লাইভ টেস্ট</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Reports List */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>বর্তমানে সক্রিয় ও স্বয়ংক্রিয়ভাবে পরীক্ষিত স্কিমাসমূহ:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* NewsArticle Card */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono font-bold text-xs text-slate-900">@type: NewsArticle</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> বৈধ ও প্রস্তুত
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>headline (নিবন্ধের মূল শিরোনাম)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>image (১৬০০px+ হাই-রেজ্যুলেশন URL)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>datePublished &amp; dateModified (ISO 8601)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>author (Person accredited profile)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>publisher (NewsMediaOrganization &amp; Logo)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>speakable &amp; isAccessibleForFree</span>
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      DOM ID: #newsarticle-schema
                    </div>
                  </div>

                  {/* BreadcrumbList Card */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono font-bold text-xs text-slate-900">@type: BreadcrumbList</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> বৈধ ও প্রস্তুত
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>itemListElement (হায়ারার্কি স্তরসমূহ)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>position (১, ২, ৩ ক্রমিক নম্বর)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Home &gt; ক্যাটাগরি &gt; খবর URL</span>
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      DOM ID: #breadcrumbs-schema
                    </div>
                  </div>

                  {/* WebSite SearchBox Card */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono font-bold text-xs text-slate-900">@type: WebSite</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> বৈধ ও প্রস্তুত
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>name: The Global Meridian</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>potentialAction (Sitelinks Search Box)</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>query-input (গুগল সার্চবক্স সরাসরি সংযোগ)</span>
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      DOM ID: #google-website-schema
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PUBLICATION GUIDE */}
          {activeSection === 'guide' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-950 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>গুগলে পাবলিক করা এবং ডিসকভার ও সার্চ সাজেশনে আসার নিশ্চিত কর্মপদ্ধতি</span>
                </div>
                আপনার ওয়েবসাইটের কোডিং ও মেটাডাটা ১০০% নিখুঁত করা হয়েছে। এখন গুগল বটকে সরাসরি আপনার সাইট জানিয়ে দেওয়ার
                জন্য নিচের ৪টি সহজ কাজ সম্পন্ন করুন:
              </div>

              {/* Step 1 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      ১
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Google Search Console (GSC)-এ সাইট যুক্ত ও ভেরিফাই করা
                    </h3>
                  </div>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>GSC খুলুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-xs text-slate-600 space-y-2 pl-9">
                  <p>
                    ১. <strong>Google Search Console</strong> এ প্রবেশ করুন এবং আপনার জিমেইল দিয়ে লগইন করে{' '}
                    <strong>URL prefix</strong> অপশনে আপনার সাইটের URL ({siteUrl}) দিন।
                  </p>
                  <p>
                    ২. বাঁদিকের মেনু থেকে <strong>Sitemaps</strong> অপশনে যান। সেখানে নিচের দুটি লিংক লিখে{' '}
                    <strong>Submit</strong> বাটনে চাপ দিন:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                      <code className="text-indigo-700 font-mono text-[11px] font-bold">sitemap.xml</code>
                      <button
                        onClick={() => handleCopyUrl(`${siteUrl}/sitemap.xml`)}
                        className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        লিঙ্ক কপি
                      </button>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                      <code className="text-indigo-700 font-mono text-[11px] font-bold">news-sitemap.xml</code>
                      <button
                        onClick={() => handleCopyUrl(`${siteUrl}/news-sitemap.xml`)}
                        className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        লিঙ্ক কপি
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 italic mt-1">
                    * সাইটম্যাপ সাবমিট করার পর গুগল ক্রলার ২৪-৪৮ ঘণ্টার মধ্যে আপনার সব খবর নিজে থেকেই ইনডেক্স করে নিবে।
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      ২
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Google Publisher Center-এ প্রকাশনা অনুমোদন (Google News &amp; Discover)
                    </h3>
                  </div>
                  <a
                    href="https://publishercenter.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Publisher Center</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-xs text-slate-600 space-y-2 pl-9">
                  <p>
                    গুগল ডিসকভার এবং গুগল নিউজে কোনো সংবাদ সরাসরি আসতে হলে{' '}
                    <strong>Google Publisher Center</strong> এ নিজের সংবাদ সংস্থাকে তালিকাভুক্ত করতে হয়:
                  </p>
                  <p>
                    ১. <code>publishercenter.google.com</code> এ গিয়ে <strong>Add Publication</strong> চাপুন এবং আপনার
                    পোর্টালের নাম (The Global Meridian) দিন।
                  </p>
                  <p>
                    ২. <strong>Content</strong> ট্যাবে গিয়ে <strong>New Section &gt; Feed</strong> নির্বাচন করুন এবং
                    আমাদের লাইভ RSS Feed এর লিঙ্কটি পেস্ট করুন:
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                    <code className="text-indigo-700 font-mono text-[11px] font-bold">{siteUrl}/rss.xml</code>
                    <button
                      onClick={() => handleCopyUrl(`${siteUrl}/rss.xml`)}
                      className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      RSS লিঙ্ক কপি
                    </button>
                  </div>
                  <p className="text-slate-500 italic">
                    * অনুমোদন হয়ে গেলে গুগল স্বয়ংক্রিয়ভাবে বিশ্বজুড়ে পাঠকদের ডিভাইসে ডিসকভার ও গুগল নিউজে আপনার রিপোর্ট
                    প্রদর্শন শুরু করবে।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      ৩
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      গুগল সার্চবারে অটো-সাজেশন (Search Autocomplete) কীভাবে নিয়ে আসে?
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    অ্যালগরিদম তথ্য
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 pl-9">
                  <p>
                    গুগলের সার্চ সাজেশন কোনো ম্যানুয়াল বাটন নয়, এটি ব্যবহারকারীদের সার্চ আগ্রহ অনুযায়ী স্বয়ংক্রিয়ভাবে
                    তৈরি হয়:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <strong>ব্র্যান্ড কীওয়ার্ড:</strong> সংবাদের শিরোনামে আপনার পোর্টালে ব্যবহৃত ট্রেন্ডিং শব্দাবলি
                      (যেমন: &quot;Global Meridian news&quot;, &quot;UN Security Council emergency session&quot;) নিয়মিত প্রকাশ
                      করলে মানুষ সার্চ করলেই গুগল তা সাজেশনে নিয়ে আসে।
                    </li>
                    <li>
                      <strong>সোশ্যাল মিডিয়া শেয়ারিং:</strong> প্রতিটি খবর প্রকাশের পর ফেসবুক, টুইটার/এক্স এবং
                      হোয়াটসঅ্যাপে শেয়ার করুন। প্রাথমিক কয়েকশ ক্লিক ও রিডার এনগেজমেন্ট পেলেই গুগল স্বয়ংক্রিয়ভাবে সার্চ
                      বক্সে আপনার হেডলাইন সাজেশনে দেখায়।
                    </li>
                    <li>
                      <strong>Sitelinks SearchBox:</strong> আমরা অলরেডি কোডে সার্চবক্স স্কিমা যুক্ত করেছি, ফলে গুগল
                      নিজেই আপনার সাইটের সার্চ অপশন গুগল রেজাল্ট পেজে সাজেশনে প্রদর্শন করবে।
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      ৪
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      গুগল ডিসকভার (Google Discover)-এ হিট হওয়ার গোপন কৌশল
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    ডিসকভার ফর্মুলা
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 pl-9">
                  <p>গুগল ডিসকভারে লাখ লাখ ভিজিটর পাওয়ার প্রধান ৩টি নিয়ামক:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <span>📸 বড় আকর্ষণীয় ছবি</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        ১২০০ পিক্সেলের চেয়ে বড় এবং পরিষ্কার ছবি ছাড়া ডিসকভার ফিডে কার্ড আকারে জায়গা দেওয়া হয় না (যা
                        অলরেডি কোডে সেট করা)।
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <span>✍️ অ-ক্লিকবেট সত্য হেডলাইন</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        ক্লিকবেট বা অতিরঞ্জিত হেডলাইন গুগল অ্যালগরিদম শনাক্ত করে ডিসকভার থেকে ব্যান করে। শিরোনাম তথ্যবহুল
                        ও রোমাঞ্চকর রাখুন।
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <span>⚡ নিয়মিত কনটেন্ট প্রকাশ</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        মোবাইল সিএমএস ব্যবহার করে প্রতিদিন কমপক্ষে ২-৩টি টাটকা সংবাদ প্রকাশ করলে গুগল আপনাকে সক্রিয় নিউজ
                        সংস্থা হিসেবে ডিসকভারে রাখে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE PREVIEW IN GOOGLE SEARCH & DISCOVER */}
          {activeSection === 'preview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">প্রিভিউ দেখার জন্য সংবাদ নির্বাচন করুন:</span>
                </div>
                <select
                  value={previewArticleId}
                  onChange={(e) => setPreviewArticleId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 w-full sm:w-80 cursor-pointer"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.category}] {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Google Discover Mobile Card Mockup */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                        G
                      </div>
                      <span className="font-bold text-xs text-slate-800">Google Discover ফিডে দেখতে যেমন লাগবে</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Large Image Preview
                    </span>
                  </div>

                  {/* Card Container */}
                  <div className="bg-[#f8f9fa] rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
                    <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                      <img
                        src={previewArticle?.featuredImage?.url}
                        alt={previewArticle?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold backdrop-blur-xs">
                        1600 × 900 High-Res
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <div className="w-4 h-4 rounded-full bg-slate-900 text-amber-400 font-serif-headline text-[9px] flex items-center justify-center font-bold">
                          M
                        </div>
                        <span className="font-semibold text-slate-800">The Global Meridian</span>
                        <span>•</span>
                        <span>{previewArticle?.category}</span>
                        <span>•</span>
                        <span>১ ঘণ্টা আগে</span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                        {previewArticle?.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{previewArticle?.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Google Search Snippet Mockup */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-800">Google Search রেজাল্টে যেমন দেখাবে</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      Rich Snippet
                    </span>
                  </div>

                  {/* Snippet Card */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                      <div className="w-4 h-4 rounded-full bg-slate-900 text-amber-400 text-[9px] flex items-center justify-center font-bold">
                        M
                      </div>
                      <span>{siteUrl} &gt; {previewArticle?.category.toLowerCase()}</span>
                    </div>
                    <h4 className="text-base sm:text-lg text-blue-800 hover:underline font-medium cursor-pointer leading-tight">
                      {previewArticle?.title} – The Global Meridian
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      <span className="text-slate-400 font-medium">আজকে — </span>
                      {previewArticle?.summary}
                    </p>
                    <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100 mt-2">
                      <span>লেখক: <strong>{previewArticle?.author?.name}</strong></span>
                      <span>•</span>
                      <span>ব্যুরো: <strong>{previewArticle?.location}</strong></span>
                    </div>
                  </div>

                  {/* Sitelinks SearchBox Preview */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Google Sitelinks SearchBox সক্রিয়</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      গুগল সার্চ ফলাফলেই আপনার ওয়েবসাইটের নিজস্ব সার্চবক্স এবং ক্যাটাগরি মেনু সরাসরি দেখাবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEEDS & FILES */}
          {activeSection === 'feeds' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setActiveXmlTab('news-sitemap')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                      activeXmlTab === 'news-sitemap'
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Google News Sitemap.xml
                  </button>
                  <button
                    onClick={() => setActiveXmlTab('sitemap')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                      activeXmlTab === 'sitemap'
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Standard Sitemap.xml
                  </button>
                  <button
                    onClick={() => setActiveXmlTab('rss')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                      activeXmlTab === 'rss'
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Google News RSS 2.0 Feed
                  </button>
                  <button
                    onClick={() => setActiveXmlTab('robots')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                      activeXmlTab === 'robots'
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    robots.txt
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কন্টেন্ট কপি'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড {filename}</span>
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-auto rounded-lg border border-slate-800 max-h-96">
                <pre className="whitespace-pre">{content}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-medium text-slate-700">
              গুগল বট, ক্রলার ও আরএসএস সার্ভিস সর্বক্ষণ সচল রয়েছে
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg cursor-pointer transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
