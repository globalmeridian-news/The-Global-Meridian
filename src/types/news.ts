export type CategoryType =
  | 'World'
  | 'Politics'
  | 'Business'
  | 'Technology'
  | 'Science'
  | 'Health'
  | 'Defense'
  | 'Environment'
  | 'Sports'
  | 'Entertainment'
  | 'Videos'
  | 'Photo Stories'
  | 'Opinion';

export type ArticleStatus = 'published' | 'draft' | 'pending_review' | 'scheduled';

export type SupportedLanguage = 'en' | 'bn' | 'hi' | 'es' | 'fr' | 'de' | 'ar' | 'ja' | 'zh';

export type UserRole = 'admin' | 'editor' | 'reporter' | 'reader';

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'support';

export interface Author {
  id: string;
  name: string;
  name_bn?: string;
  title: string;
  title_bn?: string;
  role: 'Bureau Chief' | 'Senior Diplomatic Correspondent' | 'Technology Editor' | 'Economics Correspondent' | 'Science & Defense Analyst' | 'Investigative Reporter';
  avatar: string;
  bio: string;
  email: string;
  twitter?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  sizeBytes: number;
  caption: string;
  caption_bn?: string;
  credit: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  duration?: string;
  articleId?: string;
}

export interface MediaVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  caption_bn?: string;
  credit: string;
  duration: string;
  sizeBytes: number;
  format: string;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'subheading' | 'image' | 'video' | 'quote' | 'gallery';
  text?: string;
  text_bn?: string;
  media?: MediaItem;
  galleryImages?: MediaItem[];
  quoteAuthor?: string;
  quoteAuthor_bn?: string;
}

export interface ArticleCorrection {
  timestamp: string;
  note: string;
  note_bn?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  title_bn: string;
  summary: string;
  summary_bn: string;
  category: CategoryType;
  location: string;
  location_bn?: string;
  tags: string[];
  author: Author;
  source: string;
  featuredImage: MediaItem;
  additionalImages?: MediaItem[];
  videos?: MediaVideo[];
  blocks: ContentBlock[];
  isBreaking: boolean;
  isFeatured: boolean;
  status: ArticleStatus;
  publishedAt: string;
  updatedAt: string;
  scheduledFor?: string;
  views: number;
  readingTimeMinutes: number;
  reactions: Record<ReactionType, number>;
  userReactions?: Partial<Record<ReactionType, boolean>>;
  commentsCount: number;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  corrections?: ArticleCorrection[];
  submittedBy?: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    isPublic: boolean;
  };
  originalLanguage: 'en' | 'bn';
}

export interface Comment {
  id: string;
  articleId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  status: 'approved' | 'pending' | 'flagged' | 'hidden';
  replies?: Comment[];
}

export interface UserNewsSubmission {
  id: string;
  headline: string;
  location: string;
  reportDate: string;
  content: string;
  category: CategoryType;
  sourceReference: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  media: MediaItem[];
  videos: MediaVideo[];
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  submittedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: UserRole;
  targetTitle: string;
  timestamp: string;
  details: string;
}

export interface HomepageSection {
  id: string;
  name: string;
  category?: CategoryType;
  visible: boolean;
  order: number;
  limit: number;
}

export interface HomepageConfig {
  heroArticleId: string;
  breakingArticleIds: string[];
  sections: HomepageSection[];
}

export type AdPosition =
  | 'header_top'
  | 'home_middle'
  | 'article_sidebar'
  | 'article_inline'
  | 'footer_top';

export interface Advertisement {
  id: string;
  title: string;
  sponsorName: string;
  position: AdPosition;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface WeeklyReport {
  id: string;
  weekLabel: string;
  weekLabel_bn?: string;
  startDate: string;
  endDate: string;
  totalVisitors: number; // কতজন প্রবেশ করেছে (Unique Visitors)
  totalArticleViews: number; // কতজন খবর দেখেছে (Article Reads)
  avgDwellMinutes: number; // কতক্ষণ ছিল মিনিট
  avgDwellSeconds: number; // কতক্ষণ ছিল সেকেন্ড
  topCategory: string;
  topCategory_bn?: string;
  mostReadTitle: string;
  mostReadTitle_bn?: string;
  bounceRate: number;
  mobileSharePercent: number;
  desktopSharePercent: number;
  createdAt: string;
  notes?: string;
  notes_bn?: string;
}
