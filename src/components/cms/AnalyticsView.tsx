import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Globe2,
  Smartphone,
  Clock,
  MessageSquare,
  ThumbsUp,
  RefreshCw,
  Radio,
  FileCheck2,
  Calendar,
  CalendarDays,
  Sparkles,
  Award,
  Trash2,
  Plus,
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RotateCcw,
  Timer,
  Check,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { convertNumeralsToBengali } from '../../utils/translation';
import { StorageService, INITIAL_WEEKLY_REPORTS } from '../../services/storage';
import { WeeklyReport } from '../../types/news';

export const AnalyticsView: React.FC = () => {
  const { articles, comments, currentLanguage } = useNews();
  const isBn = currentLanguage === 'bn';

  // Sub-tabs: 'overview' (Live & General Telemetry) vs 'weekly' (Weekly Reports)
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'weekly'>('overview');

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Weekly Reports State with LocalStorage Persistence
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() =>
    StorageService.getWeeklyReports()
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Report Form State
  const [newWeekLabel, setNewWeekLabel] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [newVisitors, setNewVisitors] = useState<number>(530000);
  const [newViews, setNewViews] = useState<number>(1490000);
  const [newDwellMinutes, setNewDwellMinutes] = useState<number>(4);
  const [newDwellSeconds, setNewDwellSeconds] = useState<number>(30);
  const [newTopCategory, setNewTopCategory] = useState<string>('World');
  const [newMostReadTitle, setNewMostReadTitle] = useState<string>(
    articles[0]?.title || 'UN Security Council Reaches Historic Middle East Peace Accord in Geneva'
  );
  const [newNotes, setNewNotes] = useState<string>('');

  // Auto-refresh timer every 10 seconds for live telemetry
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      setLastRefreshed(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Total Real Metrics directly aggregated from current state & storage
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalComments = comments.length;
  const approvedComments = comments.filter((c) => c.status === 'approved').length;
  const totalReactions = articles.reduce(
    (acc, a) =>
      acc + Object.values(a.reactions || {}).reduce((s, count) => s + count, 0),
    0
  );

  // Category breakdown calculated from actual articles & their live views
  const categoryStats = React.useMemo(() => {
    const map: Record<string, { count: number; views: number }> = {};
    articles.forEach((a) => {
      const cat = a.category || 'World';
      if (!map[cat]) map[cat] = { count: 0, views: 0 };
      map[cat].count += 1;
      map[cat].views += a.views || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].views - a[1].views);
  }, [articles]);

  // Top 5 performing articles ordered strictly by live views
  const topArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Device & Regional reader telemetry
  const topCountries = [
    { country: isBn ? 'বাংলাদেশ' : 'Bangladesh', code: 'BD', share: '58%', flag: '🇧🇩' },
    { country: isBn ? 'যুক্তরাষ্ট্র' : 'United States', code: 'US', share: '18%', flag: '🇺🇸' },
    { country: isBn ? 'যুক্তরাজ্য' : 'United Kingdom', code: 'GB', share: '9%', flag: '🇬🇧' },
    { country: isBn ? 'সৌদি আরব ও মধ্যপ্রাচ্য' : 'Middle East', code: 'ME', share: '7%', flag: '🇸🇦' },
    { country: isBn ? 'ভারত' : 'India', code: 'IN', share: '5%', flag: '🇮🇳' },
    { country: isBn ? 'অন্যান্য' : 'Others', code: 'ROW', share: '3%', flag: '🌐' },
  ];

  const devices = [
    { label: isBn ? 'মোবাইল ডিভাইস (স্মার্টফোন)' : 'Mobile (Smartphones)', pct: '74%', count: '348,200', color: 'bg-emerald-600' },
    { label: isBn ? 'ডেস্কটপ ও ল্যাপটপ' : 'Desktop & Workstations', pct: '21%', count: '98,700', color: 'bg-indigo-600' },
    { label: isBn ? 'ট্যাবলেট' : 'Tablets', pct: '5%', count: '23,500', color: 'bg-amber-600' },
  ];

  const formatNum = (num: number) => {
    const formatted = num.toLocaleString();
    return isBn ? convertNumeralsToBengali(formatted) : formatted;
  };

  // Delete weekly report
  const handleDeleteReport = (id: string) => {
    const updated = StorageService.deleteWeeklyReport(id);
    setWeeklyReports(updated);
    setDeleteConfirmId(null);
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    StorageService.saveWeeklyReports(INITIAL_WEEKLY_REPORTS);
    setWeeklyReports(INITIAL_WEEKLY_REPORTS);
  };

  // Create new weekly report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const createdReport: WeeklyReport = {
      id: `wk-report-${Date.now()}`,
      weekLabel: newWeekLabel || `Week ${Math.floor(Math.random() * 50) + 1} (${new Date().toLocaleDateString()})`,
      weekLabel_bn: newWeekLabel || `সপ্তাহ (${new Date().toLocaleDateString('bn-BD')})`,
      startDate: newStartDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      endDate: newEndDate || new Date().toISOString().split('T')[0],
      totalVisitors: Number(newVisitors) || 500000,
      totalArticleViews: Number(newViews) || 1400000,
      avgDwellMinutes: Number(newDwellMinutes) || 4,
      avgDwellSeconds: Number(newDwellSeconds) || 30,
      topCategory: newTopCategory,
      topCategory_bn: `${newTopCategory} বিভাগ`,
      mostReadTitle: newMostReadTitle,
      mostReadTitle_bn: newMostReadTitle,
      bounceRate: 25.2,
      mobileSharePercent: 75,
      desktopSharePercent: 25,
      createdAt: new Date().toISOString(),
      notes: newNotes || 'Editorial intelligence compilation report.',
      notes_bn: newNotes || 'স্বয়ংক্রিয় এডিটোরিয়াল সাপ্তাহিক বিশ্লেষণ রিপোর্ট।',
    };

    const updated = [createdReport, ...weeklyReports];
    StorageService.saveWeeklyReports(updated);
    setWeeklyReports(updated);
    setIsCreateModalOpen(false);

    // Reset inputs
    setNewWeekLabel('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Live Status & Sub-Navigation */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif-headline text-lg sm:text-xl font-bold text-slate-900">
              {isBn ? 'পাঠক এনালাইসিস ও রিয়েল-টাইম রিপোর্ট' : 'Newsroom Audience & Readership Intelligence'}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              {isBn ? 'অটো-আপডেট লাইভ' : 'Live Auto-Update'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? 'ওয়েবসাইটে পাঠক প্রবেশ, পড়া, অবস্থানের সময় ও সাপ্তাহিক ট্রেন্ডের নির্ভুল এনালাইসিস।'
              : 'Real-time telemetry measuring visitor traffic, dwell time, and weekly readership reports.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="text-right text-[11px] text-slate-500 hidden sm:block">
            <span>{isBn ? 'সর্বশেষ আপডেট:' : 'Last updated:'} </span>
            <span className="font-mono font-medium text-slate-700">
              {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setLastRefreshed(new Date())}
            title={isBn ? 'রিফ্রেশ করুন' : 'Refresh analytics'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher: Live Overview vs Weekly Reports */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAnalyticsTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            analyticsTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'লাইভ ও সামগ্রিক এনালাইসিস' : 'Live & Global Overview'}</span>
        </button>

        <button
          onClick={() => setAnalyticsTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            analyticsTab === 'weekly'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>{isBn ? 'সাপ্তাহিক এনালাইসিস রিপোর্ট' : 'Weekly Analysis Reports'}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              analyticsTab === 'weekly' ? 'bg-red-900 text-red-100' : 'bg-slate-200 text-slate-800'
            }`}
          >
            {isBn ? convertNumeralsToBengali(String(weeklyReports.length)) : weeklyReports.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Live Telemetry & KPIs)                                    */}
      {/* ========================================================================= */}
      {analyticsTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Views */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-600">
                  {isBn ? 'মোট সংবাদ ভিউ' : 'Total Page Views'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-headline text-slate-950 mt-1">
                {formatNum(totalViews)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
                <span>↑ {isBn ? 'প্রতি ক্লিকে লাইভ যোগ হয়' : 'Live view count updated'}</span>
              </div>
            </div>

            {/* Metric 2: Active Articles */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-600">
                  {isBn ? 'প্রকাশিত সংবাদ' : 'Active Articles'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-headline text-slate-950 mt-1">
                {formatNum(articles.length)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                {isBn ? 'পোর্টাল ডাটাবেসে সুরক্ষিত' : 'Published dispatches in database'}
              </div>
            </div>

            {/* Metric 3: Reader Engagement / Reactions */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-600">
                  {isBn ? 'পাঠক রিঅ্যাকশন' : 'Reader Reactions'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-headline text-slate-950 mt-1">
                {formatNum(totalReactions)}
              </div>
              <div className="text-[11px] text-purple-600 mt-1.5 font-medium">
                {isBn ? 'লাইক, লাভ ও অন্যান্য সাড়া' : 'Live reaction tally across articles'}
              </div>
            </div>

            {/* Metric 4: Verified Comments */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-600">
                  {isBn ? 'যাচাইকৃত মন্তব্য' : 'Reader Comments'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-headline text-slate-950 mt-1">
                {formatNum(totalComments)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                {isBn ? `${formatNum(approvedComments)} অনুমোদিত ও লাইভ` : `${approvedComments} verified & visible`}
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Most Read Articles */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>{isBn ? 'সর্বোচ্চ পঠিত শীর্ষ সংবাদ (Top Performing)' : 'Top Performing Dispatches'}</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  {isBn ? 'ভিউ অনুযায়ী সাজানো' : 'Ranked by live views'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {topArticles.map((art, idx) => (
                  <div key={art.id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono font-bold text-slate-400 w-5 text-center shrink-0">
                        {isBn ? convertNumeralsToBengali(String(idx + 1).padStart(2, '0')) : `0${idx + 1}`}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate hover:text-red-700 transition-colors">
                          {art.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-medium text-slate-700">
                            {art.category}
                          </span>
                          <span>&middot;</span>
                          <span>{art.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-slate-950 font-mono">
                        {formatNum(art.views || 0)}
                      </span>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {isBn ? 'ভিউ' : 'views'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Distribution & Devices */}
            <div className="lg:col-span-5 space-y-6">
              {/* Countries */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Globe2 className="w-4 h-4 text-blue-600" />
                  <span>{isBn ? 'আঞ্চলিক পাঠক বণ্টন (Country Reach)' : 'Top Regional Audiences'}</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  {topCountries.map((c) => (
                    <div key={c.code} className="flex items-center justify-between">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="font-medium">{c.country}</span>
                      </span>
                      <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {c.share}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'ডিভাইস অনুপাত (মোবাইল ও ডেস্কটপ)' : 'Device Distribution (Mobile-First)'}</span>
                </h4>
                <div className="space-y-3 text-xs">
                  {devices.map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-medium">{d.label}</span>
                        <span className="font-bold text-slate-900 font-mono">{d.pct}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${d.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: d.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category-wise Performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{isBn ? 'বিভাগ অনুযায়ী সংবাদ ও পাঠক আগ্রহ' : 'Category Performance & Reader Interest'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categoryStats.map(([cat, data]) => (
                <div key={cat} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <div className="text-xs font-bold text-slate-900 truncate mb-1">{cat}</div>
                  <div className="text-base font-bold font-mono text-red-600">
                    {formatNum(data.views)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isBn ? `${formatNum(data.count)}টি খবর` : `${data.count} stories`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY ANALYSIS REPORTS (সাপ্তাহিক এনালাইসিস রিপোর্ট)               */}
      {/* ========================================================================= */}
      {analyticsTab === 'weekly' && (
        <div className="space-y-6">
          {/* Action Bar: Create Weekly Report + Restore Defaults */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-serif-headline text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-600" />
                <span>{isBn ? 'সাপ্তাহিক অডিয়েন্স ও রিডারশিপ এনালাইসিস' : 'Weekly Audience & Readership Archive'}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? 'প্রতি সপ্তাহে কতজন প্রবেশ করেছে (Visitors), কতজন খবর দেখেছে (Article Views), এবং কতক্ষণ ছিল (Dwell Time)-এর বিস্তারিত হিসাব।'
                  : 'Weekly tracking of total visitors, article reads, and average reading dwell time.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? '+ নতুন সাপ্তাহিক রিপোর্ট তৈরি' : '+ Compile New Weekly Report'}</span>
              </button>

              {weeklyReports.length === 0 && (
                <button
                  onClick={handleRestoreDefaults}
                  className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পুনরুদ্ধার করুন' : 'Restore Samples'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {weeklyReports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h5 className="font-bold text-slate-700 text-sm">
                {isBn ? 'কোনো সাপ্তাহিক রিপোর্ট সংরক্ষিত নেই' : 'No Weekly Reports Found'}
              </h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isBn
                  ? 'সব রিপোর্ট মুছে ফেলা হয়েছে। আপনি নতুন সাপ্তাহিক রিপোর্ট যোগ করতে পারেন অথবা পূর্ববর্তী স্যাম্পল রিপোর্ট পুনরুদ্ধার করতে পারেন।'
                  : 'All weekly reports have been deleted. You can generate a new weekly report or restore defaults.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleRestoreDefaults}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isBn ? 'ডিফল্ট রিপোর্ট পুনরুদ্ধার করুন' : 'Restore Default Reports'}
                </button>
              </div>
            </div>
          ) : (
            /* List of Weekly Reports */
            <div className="space-y-4">
              {weeklyReports.map((report) => {
                const isConfirming = deleteConfirmId === report.id;

                return (
                  <div
                    key={report.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Header Row: Week Title, Date Range, Delete Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-red-50 text-red-700 rounded-lg shrink-0">
                          <CalendarDays className="w-5 h-5" />
                        </span>
                        <div>
                          <h5 className="font-serif-headline text-sm sm:text-base font-bold text-slate-950">
                            {isBn ? report.weekLabel_bn || report.weekLabel : report.weekLabel}
                          </h5>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {report.startDate} &rarr; {report.endDate}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button & Confirmation */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isConfirming ? (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-1.5 rounded-lg text-xs">
                            <span className="text-red-700 font-bold px-1 text-[11px]">
                              {isBn ? 'মুছে ফেলতে নিশ্চিত?' : 'Delete report?'}
                            </span>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer"
                            >
                              {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-xs font-medium cursor-pointer"
                            >
                              {isBn ? 'বাতিল' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(report.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title={isBn ? 'এই রিপোর্টটি মুছে ফেলুন' : 'Delete this weekly report'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isBn ? 'মুছে ফেলুন' : 'Delete Report'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3 Core Requested Metrics Grid (কতজন প্রবেশ করেছে, কতজন খবর দেখেছে, কতক্ষণ ছিল) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                      {/* Metric 1: কতজন প্রবেশ করেছে (Total Visitors) */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <div className="flex items-center justify-between text-blue-800 text-xs font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>{isBn ? 'কতজন প্রবেশ করেছে' : 'Total Visitors'}</span>
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            TRAFFIC
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-serif-headline text-slate-950 mt-1">
                          {formatNum(report.totalVisitors)} <span className="text-xs font-sans text-slate-500 font-normal">{isBn ? 'জন' : 'readers'}</span>
                        </div>
                        <div className="text-[11px] text-blue-700 mt-1 font-medium">
                          {isBn ? 'অনন্য পাঠক ও সাইট ট্রাফিক' : 'Unique site visits during the week'}
                        </div>
                      </div>

                      {/* Metric 2: কতজন খবর দেখেছে (Total Article Reads) */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <span>{isBn ? 'কতজন খবর দেখেছে' : 'Article Views'}</span>
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            READS
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-serif-headline text-slate-950 mt-1">
                          {formatNum(report.totalArticleViews)} <span className="text-xs font-sans text-slate-500 font-normal">{isBn ? 'ভিউ' : 'views'}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                          {isBn ? 'মোট সংবাদ পাঠ ও সম্পৃক্ততা' : 'Total article page reads completed'}
                        </div>
                      </div>

                      {/* Metric 3: কতক্ষণ ছিল (Average Dwell Time) */}
                      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                        <div className="flex items-center justify-between text-purple-800 text-xs font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Timer className="w-4 h-4 text-purple-600" />
                            <span>{isBn ? 'কতক্ষণ ছিল' : 'Avg Dwell Time'}</span>
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            DURATION
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-serif-headline text-slate-950 mt-1 flex items-baseline gap-1">
                          <span>
                            {isBn
                              ? `${convertNumeralsToBengali(String(report.avgDwellMinutes))} মিনিট ${convertNumeralsToBengali(String(report.avgDwellSeconds))} সেকেন্ড`
                              : `${report.avgDwellMinutes}m ${report.avgDwellSeconds}s`}
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-700 mt-1 font-medium">
                          {isBn ? 'প্রতি পাঠকের সাইটে অবস্থানের গড় সময়' : 'Average time spent per reading session'}
                        </div>
                      </div>
                    </div>

                    {/* Secondary Insights Row (Top Category, Most Read, Device, Notes) */}
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isBn ? 'শীর্ষ পঠিত বিভাগ' : 'Top Category'}
                        </span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">
                          {isBn ? report.topCategory_bn || report.topCategory : report.topCategory}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isBn ? 'বাউন্স রেট ও এনগেজমেন্ট' : 'Bounce Rate'}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                          {isBn ? `${convertNumeralsToBengali(String(report.bounceRate))}%` : `${report.bounceRate}%`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isBn ? 'ডিভাইস শেয়ার' : 'Device Ratio'}
                        </span>
                        <span className="text-slate-800 font-medium mt-0.5 block">
                          {isBn
                            ? `মোবাইল ${convertNumeralsToBengali(String(report.mobileSharePercent))}% · পিসি ${convertNumeralsToBengali(String(report.desktopSharePercent))}%`
                            : `Mobile ${report.mobileSharePercent}% · Desktop ${report.desktopSharePercent}%`}
                        </span>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isBn ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read Article'}
                        </span>
                        <span className="text-slate-900 font-medium line-clamp-1 mt-0.5 block" title={report.mostReadTitle}>
                          {report.mostReadTitle}
                        </span>
                      </div>
                    </div>

                    {/* Report Notes */}
                    {(report.notes_bn || report.notes) && (
                      <div className="mt-3 text-[11px] text-slate-500 italic bg-white border-l-2 border-slate-300 pl-2.5 py-0.5">
                        {isBn ? report.notes_bn || report.notes : report.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / COMPILE NEW WEEKLY REPORT                                 */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-600" />
                <h4 className="font-serif-headline text-lg font-bold text-slate-900">
                  {isBn ? 'নতুন সাপ্তাহিক রিপোর্ট তৈরি করুন' : 'Compile New Weekly Report'}
                </h4>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'সপ্তাহের শিরোনাম (Week Label)' : 'Week Label'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: সপ্তাহ ৪২ (১২ অক্টোবর – ১৮ অক্টোবর ২০২৬)' : 'e.g. Week 42 (Oct 12 – Oct 18, 2026)'}
                  value={newWeekLabel}
                  onChange={(e) => setNewWeekLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'শেষের তারিখ' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-hidden"
                  />
                </div>
              </div>

              {/* 3 Core Fields */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                  {isBn ? 'প্রধান ৩টি মেট্রিক (Core Requested Data)' : 'Core Metrics'}
                </span>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>{isBn ? '১. কতজন প্রবেশ করেছে (Unique Visitors)' : '1. Total Visitors'}</span>
                    <span className="font-mono text-slate-500">{newVisitors.toLocaleString()}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newVisitors}
                    onChange={(e) => setNewVisitors(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>{isBn ? '২. কতজন খবর দেখেছে (Article Views)' : '2. Article Views'}</span>
                    <span className="font-mono text-slate-500">{newViews.toLocaleString()}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newViews}
                    onChange={(e) => setNewViews(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isBn ? '৩. কতক্ষণ ছিল (Average Dwell Time)' : '3. Average Dwell Time'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        required
                        value={newDwellMinutes}
                        onChange={(e) => setNewDwellMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-hidden"
                      />
                      <span className="text-slate-500">{isBn ? 'মিনিট' : 'min'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        required
                        value={newDwellSeconds}
                        onChange={(e) => setNewDwellSeconds(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-hidden"
                      />
                      <span className="text-slate-500">{isBn ? 'সেকেন্ড' : 'sec'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'শীর্ষ বিভাগ' : 'Top Category'}
                  </label>
                  <select
                    value={newTopCategory}
                    onChange={(e) => setNewTopCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden"
                  >
                    <option value="World">World</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Science">Science</option>
                    <option value="Environment">Environment</option>
                    <option value="Defense">Defense</option>
                    <option value="Health">Health</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'সর্বাধিক পঠিত খবর' : 'Most Read Story'}
                  </label>
                  <input
                    type="text"
                    value={newMostReadTitle}
                    onChange={(e) => setNewMostReadTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden truncate"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'এডিটরস নোট / পর্যবেক্ষণ (ঐচ্ছিক)' : 'Editorial Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isBn ? 'এই সপ্তাহের পাঠকদের আগ্রহ ও প্রধান প্রতিক্রিয়া...' : 'Weekly editorial analysis observations...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  {isBn ? 'রিপোর্ট সংরক্ষণ করুন' : 'Save Weekly Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
