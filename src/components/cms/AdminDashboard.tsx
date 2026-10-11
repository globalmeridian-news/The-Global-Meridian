import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Inbox,
  Image as ImageIcon,
  Layout,
  BarChart3,
  Shield,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Flame,
  CheckCircle,
  AlertCircle,
  Calendar,
  Lock,
  Megaphone,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  User,
  Users,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { Article, ArticleStatus } from '../../types/news';
import { NewsEditor } from './NewsEditor';
import { SubmissionsQueue } from './SubmissionsQueue';
import { MediaLibrary } from './MediaLibrary';
import { HomepageManager } from './HomepageManager';
import { AnalyticsView } from './AnalyticsView';
import { AuditLogsView } from './AuditLogsView';
import { AdsManager } from './AdsManager';
import { TeamManager } from './TeamManager';
import { SecuritySettings } from './SecuritySettings';
import { formatRelativeTime } from '../../utils/translation';

type CmsTab =
  | 'articles'
  | 'create'
  | 'submissions'
  | 'ads'
  | 'team'
  | 'media'
  | 'homepage'
  | 'analytics'
  | 'audit'
  | 'security';

export const AdminDashboard: React.FC = () => {
  const {
    articles,
    currentRole,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    toggleBreaking,
    viewArticle,
    submissions,
    currentLanguage,
    twoFactorEnabled,
    setTwoFactorEnabled,
    setActiveView,
    isAuthenticated,
    setIsLoginModalOpen,
  } = useNews();

  const [activeTab, setActiveTab] = useState<CmsTab>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setActiveTab('create');
  };

  const handleStartCreate = () => {
    setEditingArticle(undefined);
    setActiveTab('create');
  };

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    if (statusFilter !== 'all' && art.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-serif-headline text-slate-900">
            {currentLanguage === 'bn' ? 'এডমিন অনুমোদন প্রয়োজন' : 'Admin Access Required'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {currentLanguage === 'bn'
              ? 'নিউজ রুম ম্যানেজমেন্ট, নতুন সংবাদ প্রকাশ এবং সম্পাদকীয় ড্যাশবোর্ড ব্যবহারের জন্য অনুমোদিত এডমিন অ্যাকাউন্ট দিয়ে প্রবেশ করুন।'
              : 'Sign in with your authorized newsroom credentials to access publishing, draft queues, and editorial tools.'}
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{currentLanguage === 'bn' ? 'এডমিন লগইন করুন' : 'Sign In as Admin'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-xs cursor-pointer transition-colors text-center"
            >
              {currentLanguage === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Return to Front Page'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* CMS Top Header */}
      <div className="bg-slate-900 text-white rounded-lg p-5 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {currentRole.toUpperCase()} NEWSROOM CONSOLE
            </span>
            <span className="text-slate-400 text-xs">· Production Wire</span>
          </div>
          <h1 className="font-serif-headline text-2xl md:text-3xl font-bold">
            Editorial Management &amp; Mobile Dispatch
          </h1>
        </div>

        {/* Action Buttons: View as Reader & Create News */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Direct View as Public Reader button */}
          <button
            onClick={() => setActiveView('home')}
            className="flex-1 md:flex-none bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
            title="Switch immediately to public reader mode to view the website as visitors see it"
          >
            <span>👀</span>
            <span>{currentLanguage === 'bn' ? 'দর্শক হিসেবে দেখুন' : 'View as Reader'}</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{currentLanguage === 'bn' ? '+ নতুন খবর তৈরি (ফোন/কম্পিউটার)' : '+ Create News (Phone/Web)'}</span>
          </button>
        </div>
      </div>

      {/* Quick Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {currentLanguage === 'bn' ? 'মোট প্রকাশিত খবর' : 'Published Articles'}
          </div>
          <div className="text-xl font-bold font-serif-headline text-slate-900 mt-0.5">
            {articles.filter((a) => a.status === 'published').length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            {currentLanguage === 'bn' ? 'সক্রিয় ব্রেকিং নিউজ' : 'Active Breaking'}
          </div>
          <div className="text-xl font-bold font-serif-headline text-red-700 mt-0.5">
            {articles.filter((a) => a.isBreaking && a.status === 'published').length}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('submissions')}
          className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            {currentLanguage === 'bn' ? 'পাঠকের পাঠানো সংবাদ' : 'Pending News Submissions'}
          </div>
          <div className="text-xl font-bold font-serif-headline text-amber-900 mt-0.5">
            {pendingSubmissionsCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('media')}
          className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {currentLanguage === 'bn' ? 'মিডিয়া গ্যালারি সম্পদ' : 'Media Library'}
          </div>
          <div className="text-xl font-bold font-serif-headline text-slate-900 mt-0.5">
            {articles.reduce((acc, a) => acc + (a.additionalImages?.length || 0) + (a.videos?.length || 0) + 1, 0)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Mobile-friendly horizontal scrollbar) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'articles'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{currentLanguage === 'bn' ? `সকল খবর (${articles.length})` : `Articles (${articles.length})`}</span>
        </button>

        {/* Ads Manager Tab */}
        {currentRole === 'admin' && (
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'ads'
                ? 'border-red-700 text-red-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <Megaphone className="w-4 h-4 text-red-600" />
            <span>{currentLanguage === 'bn' ? 'বিজ্ঞাপন পরিচালনা (Ads)' : 'Ads Manager'}</span>
          </button>
        )}

        {/* Team & Make Anyone Admin Tab */}
        {currentRole === 'admin' && (
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'team'
                ? 'border-red-700 text-red-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>{currentLanguage === 'bn' ? 'টিম ও এডমিন তৈরি (Team)' : 'Team & Roles'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'submissions'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{currentLanguage === 'bn' ? 'পাঠকের পাঠানো সংবাদ' : 'Public News Submissions'}</span>
          {pendingSubmissionsCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'media'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{currentLanguage === 'bn' ? 'মিডিয়া গ্যালারি' : 'Media Library'}</span>
        </button>

        {currentRole === 'admin' && (
          <button
            onClick={() => setActiveTab('homepage')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'homepage'
                ? 'border-red-700 text-red-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{currentLanguage === 'bn' ? 'হোমপেজ সাজানো' : 'Homepage Builder'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'analytics'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{currentLanguage === 'bn' ? 'পাঠক রিপোর্ট' : 'Analytics'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'audit'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{currentLanguage === 'bn' ? 'অডিট লগ' : 'Audit Logs'}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'security'
              ? 'border-red-700 text-red-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950'
          }`}
        >
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>{currentLanguage === 'bn' ? 'পাসওয়ার্ড ও সিকিউরিটি' : 'Password & Security'}</span>
        </button>

        <button
          onClick={() => setActiveView('seo')}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-900 rounded-md text-xs font-bold whitespace-nowrap cursor-pointer transition-all shadow-2xs ml-auto"
          title="Google Discover, Search Suggest & Sitemaps Hub"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{currentLanguage === 'bn' ? 'গুগল ডিসকভার ও এসইও' : 'Google Discover & SEO'}</span>
        </button>
      </div>

      {/* Tab 1: Create or Edit News */}
      {activeTab === 'create' && (
        <NewsEditor
          editingArticle={editingArticle}
          onClose={() => setActiveTab('articles')}
          onPublished={(id) => {
            // After publishing, can remain or view
          }}
        />
      )}

      {/* Tab 2: Articles List */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search headlines, category, or dateline..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs p-2 border border-slate-200 rounded w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                All ({articles.length})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'published'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'draft'
                    ? 'bg-amber-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setStatusFilter('pending_review')}
                className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'pending_review'
                    ? 'bg-indigo-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Review
              </button>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-200">
              {filteredArticles.map((art) => {
                const isPublished = art.status === 'published';

                return (
                  <div
                    key={art.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                        alt={art.title}
                        className="w-20 h-14 object-cover rounded bg-slate-100 shrink-0"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isPublished
                                ? 'bg-emerald-100 text-emerald-800'
                                : art.status === 'draft'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {art.status}
                          </span>

                          <span className="text-[11px] font-bold text-red-700 uppercase">
                            {art.category}
                          </span>

                          {art.isBreaking && (
                            <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Flame className="w-3 h-3" /> BREAKING
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {art.location} &middot; {formatRelativeTime(art.publishedAt, currentLanguage)}
                          </span>
                        </div>

                        <h3 className="font-serif-headline text-base font-bold text-slate-900 leading-snug">
                          {art.title}
                        </h3>

                        <div className="text-[11px] text-slate-500">
                          By {art.author.name} &middot; {art.views.toLocaleString()} reads &middot;{' '}
                          {art.commentsCount} comments
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                      {/* View live */}
                      <button
                        onClick={() => viewArticle(art.id)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        title="View Live Article"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(art)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Toggle Breaking */}
                      <button
                        onClick={() => toggleBreaking(art.id)}
                        className={`p-1.5 rounded cursor-pointer ${
                          art.isBreaking
                            ? 'text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-slate-400 hover:text-red-600'
                        }`}
                        title={art.isBreaking ? 'Remove from Breaking Wire' : 'Set as Breaking News'}
                      >
                        <Flame className="w-4 h-4" />
                      </button>

                      {/* Publish / Unpublish */}
                      {isPublished ? (
                        <button
                          onClick={() => unpublishArticle(art.id)}
                          className="text-xs text-amber-700 hover:bg-amber-50 px-2 py-1 rounded font-medium cursor-pointer"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => publishArticle(art.id)}
                          className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded font-bold cursor-pointer hover:bg-emerald-700"
                        >
                          Publish Now
                        </button>
                      )}

                      {/* Delete */}
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Permanently excise article "${art.title}"?`)) {
                              deleteArticle(art.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Submissions */}
      {activeTab === 'submissions' && (
        <SubmissionsQueue
          onEditSubmission={(sub) => {
            setEditingArticle({
              id: 'temp-' + Date.now(),
              slug: 'user-sub',
              title: sub.headline,
              title_bn: '',
              summary: sub.content.slice(0, 160),
              summary_bn: '',
              category: sub.category,
              location: sub.location,
              tags: ['Citizen Journalism', 'Verified News'],
              author: {
                id: 'sub-author',
                name: sub.authorName,
                title: 'Citizen Reporter',
                role: 'Investigative Reporter',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                bio: 'Independent citizen report received via The Global Meridian news desk.',
                email: sub.authorEmail,
              },
              source: `Citizen Report / ${sub.sourceReference}`,
              featuredImage: sub.media[0] || {
                id: 'sub-img',
                type: 'image',
                url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
                filename: 'tip.jpg',
                sizeBytes: 1200000,
                caption: 'Verification dispatch',
                credit: sub.authorName,
                uploadedAt: new Date().toISOString(),
              },
              blocks: [{ id: 'b1', type: 'paragraph', text: sub.content }],
              isBreaking: false,
              isFeatured: false,
              status: 'pending_review',
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              views: 0,
              readingTimeMinutes: 3,
              reactions: { like: 0, love: 0, wow: 0, sad: 0, angry: 0, support: 0 },
              commentsCount: 0,
              seoTitle: sub.headline,
              seoDescription: sub.content.slice(0, 160),
              originalLanguage: 'en',
            });
            setActiveTab('create');
          }}
        />
      )}

      {/* Tab: Ads Manager */}
      {activeTab === 'ads' && currentRole === 'admin' && <AdsManager />}

      {/* Tab: Team & Make Anyone Admin */}
      {activeTab === 'team' && currentRole === 'admin' && <TeamManager />}

      {/* Tab 4: Media Library */}
      {activeTab === 'media' && <MediaLibrary />}

      {/* Tab 5: Homepage Manager */}
      {activeTab === 'homepage' && currentRole === 'admin' && <HomepageManager />}

      {/* Tab 6: Analytics */}
      {activeTab === 'analytics' && <AnalyticsView />}

      {/* Tab 7: Audit */}
      {activeTab === 'audit' && <AuditLogsView />}

      {/* Tab 8: Security & Credentials */}
      {activeTab === 'security' && <SecuritySettings />}
    </div>
  );
};
