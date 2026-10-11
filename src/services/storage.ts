import { Article, Comment, HomepageConfig, MediaItem, UserNewsSubmission, AuditLog, Advertisement, TeamUser, WeeklyReport } from '../types/news';
import { INITIAL_ARTICLES } from '../data/initialNews';

const ARTICLES_STORAGE_KEY = 'meridian_articles_v5';
const COMMENTS_STORAGE_KEY = 'meridian_comments_v1';
const SUBMISSIONS_STORAGE_KEY = 'meridian_submissions_v1';
const MEDIA_STORAGE_KEY = 'meridian_media_v1';
const HOMEPAGE_CONFIG_KEY = 'meridian_homepage_config_v4';
const AUDIT_LOGS_KEY = 'meridian_audit_logs_v1';
const ADS_STORAGE_KEY = 'meridian_ads_v1';
const TEAM_USERS_KEY = 'meridian_team_users_v1';
const ADMIN_CREDENTIALS_KEY = 'meridian_admin_credentials_v1';
const WEEKLY_REPORTS_KEY = 'meridian_weekly_reports_v1';

export interface AdminCredentials {
  username: string;
  email: string;
  password: string;
  recoveryEmail: string;
  updatedAt: string;
}

export const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Global Clean Energy Summit 2026 – Geneva & Zurich',
    sponsorName: 'World Green Technology Forum',
    position: 'header_top',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://example.com/energy-summit',
    isActive: true,
    clicks: 142,
    impressions: 3840,
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'ad-2',
    title: 'Swiss Private Wealth & International Asset Briefing',
    sponsorName: 'Helvetia Financial Intelligence',
    position: 'article_inline',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/swiss-wealth',
    isActive: true,
    clicks: 88,
    impressions: 2150,
    startDate: '2026-09-15',
    endDate: '2026-12-31',
    createdAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'ad-3',
    title: 'Oxford International Diplomatic Fellowship 2026-27',
    sponsorName: 'Oxford Global Institute',
    position: 'article_sidebar',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://example.com/diplomacy-fellowship',
    isActive: true,
    clicks: 65,
    impressions: 1980,
    startDate: '2026-08-01',
    endDate: '2026-12-01',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'ad-4',
    title: 'Global Air Transit & Aviation Forum 2026',
    sponsorName: 'AeroGlobal Alliance',
    position: 'home_middle',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://example.com/aeroglobal',
    isActive: true,
    clicks: 94,
    impressions: 2710,
    startDate: '2026-10-05',
    endDate: '2026-11-20',
    createdAt: '2026-10-05T00:00:00Z',
  },
];

export const INITIAL_TEAM_USERS: TeamUser[] = [
  {
    id: 'user-admin-1',
    name: 'Editorial Desk Admin',
    email: 'admin@meridian-news.org',
    role: 'admin',
    title: 'Editor-in-Chief & Bureau Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-10-06T19:50:00Z',
  },
  {
    id: 'user-editor-1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@meridian-news.org',
    role: 'editor',
    title: 'Managing Editor (Europe & Americas)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
    lastLogin: '2026-10-06T17:30:00Z',
  },
  {
    id: 'user-reporter-1',
    name: 'Tariq Al-Mansoor',
    email: 't.mansoor@meridian-news.org',
    role: 'reporter',
    title: 'Foreign Correspondent (Middle East & Asia)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    isActive: true,
    createdAt: '2026-03-10T00:00:00Z',
    lastLogin: '2026-10-06T16:15:00Z',
  },
];

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'SuperAdmin',
  email: 'incognito120120@gmail.com',
  password: 'admin',
  recoveryEmail: 'incognito120120@gmail.com',
  updatedAt: '2026-10-07T00:00:00Z',
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroArticleId: 'art-21',
  breakingArticleIds: ['art-21', 'art-22', 'art-23', 'art-9', 'art-10'],
  sections: [
    { id: 'sec-world', name: 'World News', category: 'World', visible: true, order: 1, limit: 4 },
    { id: 'sec-tech', name: 'Technology & AI', category: 'Technology', visible: true, order: 2, limit: 4 },
    { id: 'sec-biz', name: 'Markets & Business', category: 'Business', visible: true, order: 3, limit: 4 },
    { id: 'sec-env', name: 'Environment & Climate', category: 'Environment', visible: true, order: 4, limit: 3 },
    { id: 'sec-science', name: 'Science & Space', category: 'Science', visible: true, order: 5, limit: 3 },
    { id: 'sec-defense', name: 'Defense & Geopolitics', category: 'Defense', visible: true, order: 6, limit: 3 },
    { id: 'sec-health', name: 'Global Health', category: 'Health', visible: true, order: 7, limit: 3 },
    { id: 'sec-sports', name: 'Sports', category: 'Sports', visible: true, order: 8, limit: 3 },
  ],
};

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    articleId: 'art-1',
    userName: 'Ambassador Carl Lindqvist',
    userEmail: 'c.lindqvist@diplomacy-watch.se',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    content: 'A genuinely pivotal precedent in international law. Retaining obligatory human command loops in defense algorithmic triggers was the only sustainable consensus position.',
    createdAt: '2026-10-06T19:15:00Z',
    likes: 24,
    status: 'approved',
    replies: [
      {
        id: 'comm-1-1',
        articleId: 'art-1',
        userName: 'Dr. Priya Raman',
        userEmail: 'priya.raman@tech-ethics.org',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        content: 'Agreed. The verification timetable will now be the real test. Having independent testing hubs in Geneva and Singapore provides strong neutral footing.',
        createdAt: '2026-10-06T19:25:00Z',
        likes: 11,
        status: 'approved',
      },
    ],
  },
  {
    id: 'comm-2',
    articleId: 'art-2',
    userName: 'Stefan Meier',
    userEmail: 's.meier@photonics-corp.de',
    content: 'The 80% thermal drop is revolutionary for ultra-dense compute clusters. Dresden’s cleanroom supply ecosystem is well primed for Indium Phosphide wafer handling.',
    createdAt: '2026-10-06T18:05:00Z',
    likes: 18,
    status: 'approved',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'PUBLISH_ARTICLE',
    actorName: 'Admin Desk',
    actorRole: 'admin',
    targetTitle: 'UN Delegates In Geneva Reach Landmark Accord On Sovereign AI Safeguards',
    timestamp: '2026-10-06T18:45:00Z',
    details: 'Published breaking story with bilateral verification protocols and live UNTV video embed.',
  },
  {
    id: 'log-2',
    action: 'EDITORIAL_REVIEW',
    actorName: 'Editor Desk',
    actorRole: 'editor',
    targetTitle: 'European and Asian Semiconductor Alliance Breaks Ground on $28B Photonic Chip Foundry',
    timestamp: '2026-10-06T17:15:00Z',
    details: 'Reviewed technical claims and verified Fraunhofer citation.',
  },
];

export const StorageService = {
  getArticles(): Article[] {
    try {
      const stored = localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (stored) {
        const parsed: Article[] = JSON.parse(stored);
        const existingIds = new Set(parsed.map((a) => a.id));
        const missing = INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id));
        if (missing.length > 0) {
          const merged = [...missing, ...parsed];
          localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading articles from storage:', e);
    }
    // Default to verified initial articles
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
    return INITIAL_ARTICLES;
  },

  saveArticles(articles: Article[]): void {
    try {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
      console.error('Error saving articles to storage:', e);
    }
  },

  getComments(): Comment[] {
    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading comments:', e);
    }
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMENTS));
    return INITIAL_COMMENTS;
  },

  saveComments(comments: Comment[]): void {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      console.error('Error saving comments:', e);
    }
  },

  getSubmissions(): UserNewsSubmission[] {
    try {
      const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading submissions:', e);
    }
    const sampleSubmissions: UserNewsSubmission[] = [
      {
        id: 'sub-1',
        headline: 'International Renewable Consortium Connects 1.2GW Offshore Wind Array in North Sea',
        location: 'Esbjerg, Denmark',
        reportDate: '2026-10-06',
        category: 'Environment',
        sourceReference: 'Danish Energy Agency press briefing & grid telemetry records',
        content: 'The Hornsea North deep-water array achieved first synchronization to the continental transmission corridor this morning, supplying clean power to over 1.4 million homes.',
        authorName: 'Lars Nygård',
        authorEmail: 'l.nygard@nordic-wire.eu',
        authorPhone: '+45 75 12 34 56',
        status: 'pending',
        submittedAt: '2026-10-06T16:20:00Z',
        media: [
          {
            id: 'sub-media-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
            filename: 'offshore_wind_turbines_north_sea.jpg',
            sizeBytes: 2100000,
            caption: 'Turbine field installation vessels anchored off Esbjerg during line commissioning.',
            credit: 'Lars Nygård / Citizen Contributor',
            uploadedAt: '2026-10-06T16:20:00Z',
          },
        ],
        videos: [],
      },
    ];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(sampleSubmissions));
    return sampleSubmissions;
  },

  saveSubmissions(submissions: UserNewsSubmission[]): void {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Error saving submissions:', e);
    }
  },

  getMediaLibrary(): MediaItem[] {
    try {
      const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading media:', e);
    }
    // Extract media from initial articles
    const media: MediaItem[] = [];
    INITIAL_ARTICLES.forEach((art) => {
      if (art.featuredImage) {
        media.push({ ...art.featuredImage, articleId: art.id });
      }
      if (art.additionalImages) {
        art.additionalImages.forEach((img) => media.push({ ...img, articleId: art.id }));
      }
    });
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
    return media;
  },

  saveMediaLibrary(media: MediaItem[]): void {
    try {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
    } catch (e) {
      console.error('Error saving media:', e);
    }
  },

  getHomepageConfig(): HomepageConfig {
    try {
      const stored = localStorage.getItem(HOMEPAGE_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading homepage config:', e);
    }
    localStorage.setItem(HOMEPAGE_CONFIG_KEY, JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
    return DEFAULT_HOMEPAGE_CONFIG;
  },

  saveHomepageConfig(config: HomepageConfig): void {
    try {
      localStorage.setItem(HOMEPAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving homepage config:', e);
    }
  },

  getAuditLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading audit logs:', e);
    }
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    try {
      const existing = this.getAuditLogs();
      const newEntry: AuditLog = {
        ...log,
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
      };
      const updated = [newEntry, ...existing].slice(0, 100);
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error adding audit log:', e);
    }
  },

  getAds(): Advertisement[] {
    try {
      const stored = localStorage.getItem(ADS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading ads:', e);
    }
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(INITIAL_ADS));
    return INITIAL_ADS;
  },

  saveAds(ads: Advertisement[]): void {
    try {
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads));
    } catch (e) {
      console.error('Error saving ads:', e);
    }
  },

  getTeamUsers(): TeamUser[] {
    try {
      const stored = localStorage.getItem(TEAM_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading team users:', e);
    }
    localStorage.setItem(TEAM_USERS_KEY, JSON.stringify(INITIAL_TEAM_USERS));
    return INITIAL_TEAM_USERS;
  },

  saveTeamUsers(users: TeamUser[]): void {
    try {
      localStorage.setItem(TEAM_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving team users:', e);
    }
  },

  getAdminCredentials(): AdminCredentials {
    try {
      const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'admin@meridian-news.org') {
          parsed.email = 'incognito120120@gmail.com';
          localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading admin credentials:', e);
    }
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
    return DEFAULT_ADMIN_CREDENTIALS;
  },

  saveAdminCredentials(creds: AdminCredentials): void {
    try {
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
    } catch (e) {
      console.error('Error saving admin credentials:', e);
    }
  },

  getWeeklyReports(): WeeklyReport[] {
    try {
      const stored = localStorage.getItem(WEEKLY_REPORTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading weekly reports:', e);
    }
    localStorage.setItem(WEEKLY_REPORTS_KEY, JSON.stringify(INITIAL_WEEKLY_REPORTS));
    return INITIAL_WEEKLY_REPORTS;
  },

  saveWeeklyReports(reports: WeeklyReport[]): void {
    try {
      localStorage.setItem(WEEKLY_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Error saving weekly reports:', e);
    }
  },

  deleteWeeklyReport(id: string): WeeklyReport[] {
    const current = this.getWeeklyReports();
    const updated = current.filter((r) => r.id !== id);
    this.saveWeeklyReports(updated);
    return updated;
  },
};

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: 'wk-report-41',
    weekLabel: 'Week 41 (Oct 05 – Oct 11, 2026)',
    weekLabel_bn: 'সপ্তাহ ৪১ (০৫ অক্টোবর – ১১ অক্টোবর ২০২৬)',
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    totalVisitors: 528450, // কতজন প্রবেশ করেছে
    totalArticleViews: 1482900, // কতজন খবর দেখেছে
    avgDwellMinutes: 4, // কতক্ষণ ছিল (মিনিট)
    avgDwellSeconds: 38, // কতক্ষণ ছিল (সেকেন্ড)
    topCategory: 'World',
    topCategory_bn: 'আন্তর্জাতিক (World)',
    mostReadTitle: 'UN Security Council Reaches Historic Middle East Peace Accord in Geneva',
    mostReadTitle_bn: 'জেনেভায় জাতিসংঘ ও বৈশ্বিক দূতদের মধ্যস্থতায় ঐতিহাসিক মধ্যপ্রাচ্য শান্তি চুক্তি চূড়ান্ত',
    bounceRate: 24.8,
    mobileSharePercent: 76,
    desktopSharePercent: 24,
    createdAt: '2026-10-11T04:30:00Z',
    notes: 'Record readership driven by breaking diplomatic accords in Geneva and multilateral green grid agreements.',
    notes_bn: 'জেনেভা শান্তি চুক্তি ও ত্রিদেশীয় পরিবেশবান্ধব গ্রিড চুক্তির কারণে এই সপ্তাহে রেকর্ডসংখ্যক পাঠক প্রবেশ করেছেন।',
  },
  {
    id: 'wk-report-40',
    weekLabel: 'Week 40 (Sep 28 – Oct 04, 2026)',
    weekLabel_bn: 'সপ্তাহ ৪০ (২৮ সেপ্টেম্বর – ০৪ অক্টোবর ২০২৬)',
    startDate: '2026-09-28',
    endDate: '2026-10-04',
    totalVisitors: 491200,
    totalArticleViews: 1310400,
    avgDwellMinutes: 4,
    avgDwellSeconds: 15,
    topCategory: 'Technology',
    topCategory_bn: 'প্রযুক্তি (Technology)',
    mostReadTitle: 'International Quantum Network Achieves Intercontinental Entanglement Over 10,000 Kilometers',
    mostReadTitle_bn: '১০ হাজার কিমি দূরত্বে প্রথম সফল আন্তঃমহাদেশীয় কোয়ান্টাম স্যাটেলাইট সংযোগ স্থাপন',
    bounceRate: 26.2,
    mobileSharePercent: 74,
    desktopSharePercent: 26,
    createdAt: '2026-10-04T23:59:00Z',
    notes: 'Surge in scientific readers examining quantum telemetry standards.',
    notes_bn: 'কোয়ান্টাম ক্রিপ্টোগ্রাফি ও প্রযুক্তি বিশ্লেষণে বিশ্বব্যাপী গবেষকদের ব্যাপক আগ্রহ লক্ষ্য করা গেছে।',
  },
  {
    id: 'wk-report-39',
    weekLabel: 'Week 39 (Sep 21 – Sep 27, 2026)',
    weekLabel_bn: 'সপ্তাহ ৩৯ (২১ সেপ্টেম্বর – ২৭ সেপ্টেম্বর ২০২৬)',
    startDate: '2026-09-21',
    endDate: '2026-09-27',
    totalVisitors: 465800,
    totalArticleViews: 1195600,
    avgDwellMinutes: 3,
    avgDwellSeconds: 54,
    topCategory: 'Environment',
    topCategory_bn: 'পরিবেশ ও জলবায়ু (Environment)',
    mostReadTitle: 'Global Climate Summit in Nairobi Finalizes Landmark $100B Loss and Damage Compact',
    mostReadTitle_bn: 'নাইরোবিতে বিশ্ব জলবায়ু সম্মেলনে ১০০ বিলিয়ন ডলারের ক্ষতিপূরণ তহবিল চুক্তি চূড়ান্ত',
    bounceRate: 27.5,
    mobileSharePercent: 73,
    desktopSharePercent: 27,
    createdAt: '2026-09-27T23:59:00Z',
    notes: 'Strong engagement from South Asian and African coastal regions.',
    notes_bn: 'জলবায়ু ক্ষতিপূরণ চুক্তির খবরটি উপকূলীয় ও নদীমাতৃক অঞ্চলের পাঠকদের মাঝে সর্বাধিক পঠিত ছিল।',
  },
  {
    id: 'wk-report-38',
    weekLabel: 'Week 38 (Sep 14 – Sep 20, 2026)',
    weekLabel_bn: 'সপ্তাহ ৩৮ (১৪ সেপ্টেম্বর – ২০ সেপ্টেম্বর ২০২৬)',
    startDate: '2026-09-14',
    endDate: '2026-09-20',
    totalVisitors: 438100,
    totalArticleViews: 1080200,
    avgDwellMinutes: 3,
    avgDwellSeconds: 42,
    topCategory: 'Business',
    topCategory_bn: 'অর্থনীতি ও বাণিজ্য (Business)',
    mostReadTitle: 'Central Banks Coordinate Liquidity Facility to Counter Sovereign Debt Volatility',
    mostReadTitle_bn: 'ঋণ সংকট ও মুদ্রাস্ফীতি মোকাবিলায় বিশ্বব্যাপী কেন্দ্রীয় ব্যাংকগুলোর সমন্বিত পদক্ষেপ',
    bounceRate: 28.9,
    mobileSharePercent: 71,
    desktopSharePercent: 29,
    createdAt: '2026-09-20T23:59:00Z',
    notes: 'Financial stability announcements generated significant bookmarking.',
    notes_bn: 'আর্থিক বাজার ও বিনিয়োগকারীদের মাঝে কেন্দ্রীয় ব্যাংকের নীতিমালার প্রতিবেদন ব্যাপক সমাদৃত হয়।',
  },
];
