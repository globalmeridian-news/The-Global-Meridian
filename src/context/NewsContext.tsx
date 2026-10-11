import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Article,
  CategoryType,
  Comment,
  HomepageConfig,
  MediaItem,
  ReactionType,
  UserNewsSubmission,
  UserRole,
  AuditLog,
  Author,
  SupportedLanguage,
  Advertisement,
  TeamUser,
} from '../types/news';
import { StorageService, AdminCredentials } from '../services/storage';
import { AUTHORS } from '../data/initialNews';
import {
  autoTranslateToBengali,
  autoTranslateToEnglish,
  detectVisitorLanguage,
} from '../utils/translation';
import { translateBatch } from '../utils/translationService';
import {
  calculateArticleWordCount,
  calculateReadingTimeMinutes,
} from '../utils/readingTime';

interface NewsContextType {
  articles: Article[];
  currentLanguage: SupportedLanguage;
  detectedVisitorLanguage: SupportedLanguage;
  setDetectedVisitorLanguage: (lang: SupportedLanguage) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;
  selectedCategory: CategoryType | 'All';
  setSelectedCategory: (cat: CategoryType | 'All') => void;
  activeView: 'home' | 'article' | 'cms' | 'submit' | 'search' | 'author' | 'policy' | 'seo';
  setActiveView: (view: 'home' | 'article' | 'cms' | 'submit' | 'search' | 'author' | 'policy' | 'seo') => void;
  policyPageSlug: string;
  setPolicyPageSlug: (slug: string) => void;
  selectedAuthorId: string | null;
  setSelectedAuthorId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  submissions: UserNewsSubmission[];
  comments: Comment[];
  mediaLibrary: MediaItem[];
  homepageConfig: HomepageConfig;
  auditLogs: AuditLog[];
  authors: Author[];

  // Advertisements Management
  ads: Advertisement[];
  addAd: (ad: Omit<Advertisement, 'id' | 'createdAt' | 'clicks' | 'impressions'>) => void;
  updateAd: (id: string, updates: Partial<Advertisement>) => void;
  deleteAd: (id: string) => void;
  recordAdClick: (id: string) => void;

  // Team & User Management (Make Anyone Admin)
  teamUsers: TeamUser[];
  addTeamUser: (user: Omit<TeamUser, 'id' | 'createdAt'>) => void;
  updateTeamUserRole: (id: string, newRole: UserRole) => void;
  deleteTeamUser: (id: string) => void;

  // Admin Credentials & Password Management
  adminCredentials: AdminCredentials;
  updateAdminCredentials: (creds: Partial<AdminCredentials>) => void;

  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (val: boolean) => void;

  // Authentication & Reader Mode
  isAuthenticated: boolean;
  loginUser: (role: UserRole, email?: string) => void;
  logoutUser: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (val: boolean) => void;

  // Clean Reading Controls
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  readerTheme: 'light' | 'sepia' | 'dark';
  setReaderTheme: (theme: 'light' | 'sepia' | 'dark') => void;
  savedArticleIds: string[];
  toggleSaveArticle: (articleId: string) => void;
  isBookmarksModalOpen: boolean;
  setIsBookmarksModalOpen: (val: boolean) => void;

  // Auto-updating live time tick
  liveTick: number;

  // Actions
  createArticle: (articleData: Partial<Article>) => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  publishArticle: (id: string) => void;
  unpublishArticle: (id: string) => void;
  toggleBreaking: (id: string) => void;
  toggleFeatured: (id: string) => void;

  addMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;

  addComment: (articleId: string, content: string, userName: string, userEmail: string, parentId?: string) => void;
  moderateComment: (commentId: string, status: 'approved' | 'flagged' | 'hidden' | 'deleted') => void;
  reactToArticle: (articleId: string, reaction: ReactionType) => void;

  submitUserNews: (sub: Omit<UserNewsSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  updateSubmissionStatus: (id: string, status: 'pending' | 'approved' | 'rejected' | 'changes_requested') => void;
  convertSubmissionToArticle: (submissionId: string) => Article;

  updateHomepageConfig: (cfg: HomepageConfig) => void;
  viewArticle: (articleId: string) => void;
  viewCategory: (cat: CategoryType | 'All') => void;
  viewPolicy: (slug: string) => void;
  viewAuthor: (authorId: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(() => StorageService.getArticles());
  const [detectedVisitorLanguage, setDetectedVisitorLanguage] = useState<SupportedLanguage>(() => detectVisitorLanguage());
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  // Authentication & Reader Mode State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('meridian_auth') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const isAuth = localStorage.getItem('meridian_auth') === 'true';
    if (!isAuth) return 'reader';
    const saved = localStorage.getItem('meridian_role') as UserRole;
    return saved || 'admin';
  });
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [activeView, setActiveView] = useState<'home' | 'article' | 'cms' | 'submit' | 'search' | 'author' | 'policy' | 'seo'>('home');
  const [policyPageSlug, setPolicyPageSlug] = useState<string>('editorial-policy');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [submissions, setSubmissions] = useState<UserNewsSubmission[]>(() => StorageService.getSubmissions());
  const [comments, setComments] = useState<Comment[]>(() => StorageService.getComments());
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => StorageService.getMediaLibrary());
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [authors] = useState<Author[]>(AUTHORS);
  const [ads, setAds] = useState<Advertisement[]>(() => StorageService.getAds());
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>(() => StorageService.getTeamUsers());
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => StorageService.getAdminCredentials());
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Clean Reader Settings
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('meridian_saved_articles');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState<boolean>(false);

  const loginUser = (role: UserRole = 'admin', email?: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('meridian_auth', 'true');
    localStorage.setItem('meridian_role', role);
    StorageService.addAuditLog({
      action: 'USER_LOGIN',
      actorName: email || `${role.toUpperCase()} User`,
      actorRole: role,
      targetTitle: 'Newsroom Authentication',
      details: `User signed in with ${role} permissions.`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const logoutUser = () => {
    setCurrentRole('reader');
    setIsAuthenticated(false);
    localStorage.removeItem('meridian_auth');
    localStorage.removeItem('meridian_role');
    setActiveView('home');
  };

  const toggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const updated = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem('meridian_saved_articles', JSON.stringify(updated));
      return updated;
    });
  };

  // Live timer tick every 15 seconds to auto-update relative timestamps
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Pre-fetch translations for all articles when user switches language
  useEffect(() => {
    if (currentLanguage === 'en' || currentLanguage === 'bn') return;

    const titles = articles.map((a) => a.title).filter(Boolean);
    const summaries = articles.slice(0, 6).map((a) => a.summary).filter(Boolean);

    Promise.all([
      translateBatch(titles, currentLanguage),
      translateBatch(summaries, currentLanguage),
    ])
      .then(() => {
        setLiveTick((t) => t + 1);
      })
      .catch((err) => {
        console.warn('Background translation prefetch error:', err);
      });
  }, [currentLanguage, articles]);

  // Sync articles
  useEffect(() => {
    StorageService.saveArticles(articles);
  }, [articles]);

  // Sync comments
  useEffect(() => {
    StorageService.saveComments(comments);
  }, [comments]);

  // Sync submissions
  useEffect(() => {
    StorageService.saveSubmissions(submissions);
  }, [submissions]);

  // Sync media
  useEffect(() => {
    StorageService.saveMediaLibrary(mediaLibrary);
  }, [mediaLibrary]);

  // Sync homepage config
  useEffect(() => {
    StorageService.saveHomepageConfig(homepageConfig);
  }, [homepageConfig]);

  // Sync ads
  useEffect(() => {
    StorageService.saveAds(ads);
  }, [ads]);

  // Sync team users
  useEffect(() => {
    StorageService.saveTeamUsers(teamUsers);
  }, [teamUsers]);

  // Sync admin credentials
  useEffect(() => {
    StorageService.saveAdminCredentials(adminCredentials);
  }, [adminCredentials]);

  // Ads actions
  const addAd = (adData: Omit<Advertisement, 'id' | 'createdAt' | 'clicks' | 'impressions'>) => {
    const newAd: Advertisement = {
      ...adData,
      id: 'ad-' + Date.now(),
      clicks: 0,
      impressions: 0,
      createdAt: new Date().toISOString(),
    };
    setAds((prev) => [newAd, ...prev]);
    StorageService.addAuditLog({
      action: 'CREATE_AD',
      actorName: 'Admin Desk',
      actorRole: currentRole,
      targetTitle: newAd.title,
      details: `Created advertisement for sponsor "${newAd.sponsorName}" in placement "${newAd.position}".`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateAd = (id: string, updates: Partial<Advertisement>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const recordAdClick = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a)));
  };

  // Team users actions (Make anyone Admin / Editor / Reporter)
  const addTeamUser = (userData: Omit<TeamUser, 'id' | 'createdAt'>) => {
    const newUser: TeamUser = {
      ...userData,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTeamUsers((prev) => [...prev, newUser]);
    StorageService.addAuditLog({
      action: 'ADD_TEAM_USER',
      actorName: 'Admin Desk',
      actorRole: currentRole,
      targetTitle: newUser.name,
      details: `Added new user ${newUser.email} with role "${newUser.role}".`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateTeamUserRole = (id: string, newRole: UserRole) => {
    setTeamUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    StorageService.addAuditLog({
      action: 'PROMOTE_USER_ROLE',
      actorName: 'Admin Desk',
      actorRole: currentRole,
      targetTitle: 'User Role Update',
      details: `Updated user ${id} role to "${newRole}".`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteTeamUser = (id: string) => {
    setTeamUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Admin credentials update
  const updateAdminCredentials = (creds: Partial<AdminCredentials>) => {
    setAdminCredentials((prev) => {
      const updated = { ...prev, ...creds, updatedAt: new Date().toISOString() };
      StorageService.saveAdminCredentials(updated);
      return updated;
    });
    StorageService.addAuditLog({
      action: 'UPDATE_ADMIN_CREDENTIALS',
      actorName: 'Admin Desk',
      actorRole: currentRole,
      targetTitle: 'Admin Security Credentials',
      details: 'Administrator credentials / password updated successfully.',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'en' ? detectedVisitorLanguage : 'en'));
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  const viewArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveView('article');
    // Increment view count
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, views: (a.views || 0) + 1 } : a))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewCategory = (cat: CategoryType | 'All') => {
    setSelectedCategory(cat);
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewPolicy = (slug: string) => {
    setPolicyPageSlug(slug);
    setActiveView('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setActiveView('author');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createArticle = (articleData: Partial<Article>): Article => {
    const id = 'art-' + Date.now();
    const title = articleData.title || 'Untitled Report';
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `report-${Date.now()}`;

    const originalLang = articleData.originalLanguage || 'en';
    const title_bn = articleData.title_bn || (originalLang === 'en' ? autoTranslateToBengali(title) : title);
    const title_en = originalLang === 'bn' ? autoTranslateToEnglish(title) : title;

    const summary = articleData.summary || '';
    const summary_bn = articleData.summary_bn || (originalLang === 'en' ? autoTranslateToBengali(summary) : summary);

    const now = new Date().toISOString();

    const newArticle: Article = {
      id,
      slug,
      title: title_en,
      title_bn: title_bn,
      summary,
      summary_bn,
      category: articleData.category || 'World',
      location: articleData.location || 'Geneva, Switzerland',
      location_bn: autoTranslateToBengali(articleData.location || ''),
      tags: articleData.tags && articleData.tags.length > 0 ? articleData.tags : ['World News', 'Meridian Dispatch'],
      author: articleData.author || AUTHORS[0],
      source: articleData.source || 'Meridian Newsroom Wire',
      featuredImage: articleData.featuredImage || {
        id: 'img-' + Date.now(),
        type: 'image',
        url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80',
        filename: 'meridian_wire_news.jpg',
        sizeBytes: 1540000,
        caption: 'News reporting in progress at international bureau.',
        credit: 'The Global Meridian / Editorial Desk',
        uploadedAt: now,
      },
      additionalImages: articleData.additionalImages || [],
      videos: articleData.videos || [],
      blocks: articleData.blocks || [
        {
          id: 'b-' + Date.now(),
          type: 'paragraph',
          text: articleData.summary || 'Editorial report ongoing.',
          text_bn: summary_bn,
        },
      ],
      isBreaking: !!articleData.isBreaking,
      isFeatured: !!articleData.isFeatured,
      status: articleData.status || 'published',
      publishedAt: articleData.publishedAt || now,
      updatedAt: now,
      views: 1,
      readingTimeMinutes: calculateReadingTimeMinutes(
        calculateArticleWordCount(
          {
            title,
            title_bn,
            summary,
            summary_bn,
            blocks: articleData.blocks || [],
          },
          originalLang
        )
      ),
      reactions: { like: 0, love: 0, wow: 0, sad: 0, angry: 0, support: 0 },
      commentsCount: 0,
      seoTitle: articleData.seoTitle || title,
      seoDescription: articleData.seoDescription || summary,
      originalLanguage: originalLang,
    };

    setArticles((prev) => [newArticle, ...prev]);

    // Also register media item in library if exists
    if (newArticle.featuredImage) {
      addMediaItem({ ...newArticle.featuredImage, articleId: newArticle.id });
    }

    // Add Audit Log
    StorageService.addAuditLog({
      action: newArticle.status === 'published' ? 'PUBLISH_ARTICLE' : 'CREATE_DRAFT',
      actorName: currentRole === 'admin' ? 'Editorial Director (Admin)' : 'Reporter Desk',
      actorRole: currentRole,
      targetTitle: newArticle.title,
      details: `Article created directly via mobile/web CMS. Status: ${newArticle.status}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = {
            ...a,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          updated.readingTimeMinutes = calculateReadingTimeMinutes(
            calculateArticleWordCount(updated, updated.originalLanguage)
          );
          return updated;
        }
        return a;
      })
    );

    StorageService.addAuditLog({
      action: 'UPDATE_ARTICLE',
      actorName: currentRole === 'admin' ? 'Editorial Director' : 'Editor Desk',
      actorRole: currentRole,
      targetTitle: updates.title || id,
      details: 'Article content/media modified in newsroom CMS.',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const deleteArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    setArticles((prev) => prev.filter((a) => a.id !== id));

    StorageService.addAuditLog({
      action: 'DELETE_ARTICLE',
      actorName: 'Editorial Director',
      actorRole: currentRole,
      targetTitle: target?.title || id,
      details: 'Article permanently excised from live indices.',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const publishArticle = (id: string) => {
    const now = new Date().toISOString();
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'published', publishedAt: now, updatedAt: now } : a))
    );

    const target = articles.find((a) => a.id === id);
    StorageService.addAuditLog({
      action: 'ONE_CLICK_PUBLISH',
      actorName: 'Newsroom Chief',
      actorRole: currentRole,
      targetTitle: target?.title || id,
      details: 'Article published live to international news wire immediately.',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const unpublishArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'draft', updatedAt: new Date().toISOString() } : a))
    );
  };

  const toggleBreaking = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = !a.isBreaking;
          // Update breaking ticker in homepage config
          setHomepageConfig((cfg) => {
            const nextList = next
              ? [...new Set([...cfg.breakingArticleIds, id])]
              : cfg.breakingArticleIds.filter((bid) => bid !== id);
            return { ...cfg, breakingArticleIds: nextList };
          });
          return { ...a, isBreaking: next };
        }
        return a;
      })
    );
  };

  const toggleFeatured = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
    );
  };

  const addMediaItem = (item: MediaItem) => {
    setMediaLibrary((prev) => {
      const exists = prev.some((m) => m.id === item.id || m.url === item.url);
      if (exists) return prev;
      return [item, ...prev];
    });
  };

  const deleteMediaItem = (id: string) => {
    setMediaLibrary((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaLibrary((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const addComment = (
    articleId: string,
    content: string,
    userName: string,
    userEmail: string,
    parentId?: string
  ) => {
    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      articleId,
      userName: userName || 'Verified Reader',
      userEmail: userEmail || 'reader@meridian-news.org',
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      status: 'approved', // Live moderation filter enabled
      replies: [],
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          return c;
        })
      );
    } else {
      setComments((prev) => [newComment, ...prev]);
    }

    // Update article comment counter
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, commentsCount: (a.commentsCount || 0) + 1 } : a))
    );
  };

  const moderateComment = (
    commentId: string,
    status: 'approved' | 'flagged' | 'hidden' | 'deleted'
  ) => {
    if (status === 'deleted') {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status } : c))
      );
    }
  };

  const reactToArticle = (articleId: string, reaction: ReactionType) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          const userReactions = { ...a.userReactions };
          const currentVal = !!userReactions[reaction];
          const newCount = (a.reactions[reaction] || 0) + (currentVal ? -1 : 1);
          userReactions[reaction] = !currentVal;
          return {
            ...a,
            reactions: {
              ...a.reactions,
              [reaction]: Math.max(0, newCount),
            },
            userReactions,
          };
        }
        return a;
      })
    );
  };

  const submitUserNews = (sub: Omit<UserNewsSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const newSub: UserNewsSubmission = {
      ...sub,
      id: 'sub-' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setSubmissions((prev) => [newSub, ...prev]);

    StorageService.addAuditLog({
      action: 'PUBLIC_SUBMISSION',
      actorName: sub.authorName || 'Citizen Contributor',
      actorRole: 'reader',
      targetTitle: sub.headline,
      details: 'News tip received and sent to Editorial Review Queue.',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateSubmissionStatus = (
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );

    const target = submissions.find((s) => s.id === id);
    StorageService.addAuditLog({
      action: `SUBMISSION_${status.toUpperCase()}`,
      actorName: currentRole === 'admin' ? 'Editor in Chief' : 'Review Editor',
      actorRole: currentRole,
      targetTitle: target?.headline || id,
      details: `Submission status transitioned to ${status}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const convertSubmissionToArticle = (submissionId: string): Article => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const created = createArticle({
      title: sub.headline,
      summary: sub.content.slice(0, 160) + '...',
      category: sub.category,
      location: sub.location,
      source: `User Submitted (Verified): ${sub.sourceReference}`,
      status: 'published',
      featuredImage: sub.media[0] || undefined,
      additionalImages: sub.media.slice(1),
      videos: sub.videos,
      blocks: [
        {
          id: 'b-sub-1',
          type: 'paragraph',
          text: sub.content,
        },
      ],
      submittedBy: {
        name: sub.authorName,
        email: sub.authorEmail,
        phone: sub.authorPhone,
        location: sub.location,
        isPublic: true,
      },
    });

    updateSubmissionStatus(submissionId, 'approved');
    return created;
  };

  const updateHomepageConfig = (cfg: HomepageConfig) => {
    setHomepageConfig(cfg);
    StorageService.saveHomepageConfig(cfg);
  };

  return (
    <NewsContext.Provider
      value={{
        articles,
        currentLanguage,
        detectedVisitorLanguage,
        setDetectedVisitorLanguage,
        setLanguage,
        toggleLanguage,
        currentRole,
        setCurrentRole,
        selectedArticleId,
        setSelectedArticleId,
        selectedCategory,
        setSelectedCategory,
        activeView,
        setActiveView,
        policyPageSlug,
        setPolicyPageSlug,
        selectedAuthorId,
        setSelectedAuthorId,
        searchQuery,
        setSearchQuery,
        submissions,
        comments,
        mediaLibrary,
        homepageConfig,
        auditLogs,
        authors,
        ads,
        addAd,
        updateAd,
        deleteAd,
        recordAdClick,
        teamUsers,
        addTeamUser,
        updateTeamUserRole,
        deleteTeamUser,
        adminCredentials,
        updateAdminCredentials,
        twoFactorEnabled,
        setTwoFactorEnabled,
        isAuthenticated,
        loginUser,
        logoutUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        fontSize,
        setFontSize,
        readerTheme,
        setReaderTheme,
        savedArticleIds,
        toggleSaveArticle,
        isBookmarksModalOpen,
        setIsBookmarksModalOpen,
        liveTick,
        createArticle,
        updateArticle,
        deleteArticle,
        publishArticle,
        unpublishArticle,
        toggleBreaking,
        toggleFeatured,
        addMediaItem,
        deleteMediaItem,
        updateMediaItem,
        addComment,
        moderateComment,
        reactToArticle,
        submitUserNews,
        updateSubmissionStatus,
        convertSubmissionToArticle,
        updateHomepageConfig,
        viewArticle,
        viewCategory,
        viewPolicy,
        viewAuthor,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) throw new Error('useNews must be used within a NewsProvider');
  return context;
};
