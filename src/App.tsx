import React, { useEffect } from 'react';
import { NewsProvider, useNews } from './context/NewsContext';
import { Header } from './components/layout/Header';
import { BreakingTicker } from './components/layout/BreakingTicker';
import { Footer } from './components/layout/Footer';
import { HeroGrid } from './components/home/HeroGrid';
import { LatestFeed } from './components/home/LatestFeed';
import { CategorySection } from './components/home/CategorySection';
import { VideoReportsSection } from './components/home/VideoReportsSection';
import { PhotoStoriesSection } from './components/home/PhotoStoriesSection';
import { ArticleView } from './components/article/ArticleView';
import { AdminDashboard } from './components/cms/AdminDashboard';
import { SubmitNewsModal } from './components/public/SubmitNewsModal';
import { SearchModal } from './components/public/SearchModal';
import { PolicyPages } from './components/public/PolicyPages';
import { SeoModal } from './components/public/SeoModal';
import { BookmarksModal } from './components/public/BookmarksModal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { AdminFloatingBar } from './components/layout/AdminFloatingBar';
import { AdBanner } from './components/public/AdBanner';
import { LazyBoundary } from './components/common/LazyBoundary';
import { generateNewsArticleJsonLd, generateBreadcrumbJsonLd, generateWebSiteJsonLd, getSiteUrl } from './utils/seo';
import { injectValidatedJsonLd, removeValidatedJsonLd } from './utils/schemaValidator';
import { useCoreWebVitals } from './hooks/useCoreWebVitals';

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonicalTag(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    homepageConfig,
    selectedArticleId,
    setSelectedArticleId,
    policyPageSlug,
    selectedAuthorId,
    viewArticle,
    viewCategory,
    viewPolicy,
    viewAuthor,
    articles,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAuthenticated,
    currentLanguage,
  } = useNews();

  // Track Core Web Vitals (LCP, FID/INP, CLS, FCP, TTFB) & report to logging service
  useCoreWebVitals();

  // 1. Initial URL routing from Query Params / Deep Link on Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const articleParam = params.get('article');
    const catParam = params.get('cat');
    const viewParam = params.get('view');
    const policyParam = params.get('policy');
    const authorParam = params.get('author');

    if (articleParam) {
      const art = articles.find((a) => a.id === articleParam || a.slug === articleParam);
      if (art) {
        viewArticle(art.id);
        return;
      }
    }
    if (catParam) {
      viewCategory(catParam as any);
      return;
    }
    if (policyParam) {
      viewPolicy(policyParam);
      return;
    }
    if (authorParam) {
      viewAuthor(authorParam);
      return;
    }
    if (viewParam === 'seo') {
      setActiveView('seo');
      return;
    }
    if (viewParam === 'cms') {
      setActiveView('cms');
      return;
    }
    if (viewParam === 'submit') {
      setActiveView('submit');
      return;
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const artP = p.get('article');
      const viewP = p.get('view');
      if (artP) {
        setSelectedArticleId(artP);
        setActiveView('article');
      } else if (viewP === 'submit') {
        setActiveView('submit');
      } else if (viewP === 'cms') {
        setActiveView('cms');
      } else if (viewP === 'seo') {
        setActiveView('seo');
      } else {
        const catP = p.get('cat');
        if (catP) {
          setSelectedCategory(catP as any);
        } else {
          setSelectedCategory('All');
        }
        setActiveView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Browser URL Synchronization for Deep Linking & Googlebot Indexing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let newPath = window.location.pathname;

    if (activeView === 'article' && selectedArticleId) {
      newPath += `?article=${encodeURIComponent(selectedArticleId)}`;
    } else if (activeView === 'home' && selectedCategory !== 'All') {
      newPath += `?cat=${encodeURIComponent(selectedCategory)}`;
    } else if (activeView === 'seo') {
      newPath += '?view=seo';
    } else if (activeView === 'cms') {
      newPath += '?view=cms';
    } else if (activeView === 'submit') {
      newPath += '?view=submit';
    } else if (activeView === 'policy' && policyPageSlug) {
      newPath += `?policy=${encodeURIComponent(policyPageSlug)}`;
    } else if (activeView === 'author' && selectedAuthorId) {
      newPath += `?author=${encodeURIComponent(selectedAuthorId)}`;
    }

    const currentSearch = window.location.search;
    const targetSearch = newPath.includes('?') ? newPath.slice(newPath.indexOf('?')) : '';
    if (currentSearch !== targetSearch) {
      window.history.replaceState({ activeView, selectedArticleId, selectedCategory }, '', newPath);
    }
  }, [activeView, selectedArticleId, selectedCategory, policyPageSlug, selectedAuthorId]);

  // 3. Dynamic Full Head SEO, OpenGraph, Twitter Cards & JSON-LD Schemas for Google Discover
  useEffect(() => {
    const siteUrl = getSiteUrl();

    if (activeView === 'article' && selectedArticleId) {
      const art = articles.find((a) => a.id === selectedArticleId);
      if (art) {
        const pageTitle = `${art.title} – The Global Meridian`;
        const canonicalUrl = `${siteUrl}/?article=${art.id}`;
        const heroImg = art.featuredImage?.url || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80';

        document.title = pageTitle;
        setMetaTag('description', art.summary);
        setMetaTag('og:title', pageTitle, true);
        setMetaTag('og:description', art.summary, true);
        setMetaTag('og:image', heroImg, true);
        setMetaTag('og:url', canonicalUrl, true);
        setMetaTag('og:type', 'article', true);
        setMetaTag('twitter:title', pageTitle);
        setMetaTag('twitter:description', art.summary);
        setMetaTag('twitter:image', heroImg);
        setCanonicalTag(canonicalUrl);

        // Inject validated dynamic JSON-LD NewsArticle & Breadcrumbs schemas (Google Rich Results test compliant)
        injectValidatedJsonLd('newsarticle-schema', generateNewsArticleJsonLd(art, siteUrl));
        injectValidatedJsonLd('breadcrumbs-schema', generateBreadcrumbJsonLd(art, siteUrl));
        return;
      }
    }

    // Default Homepage & Category Meta
    const defaultTitle = selectedCategory && selectedCategory !== 'All'
      ? `${selectedCategory} World News & Analysis – The Global Meridian`
      : 'The Global Meridian – International News & Newsroom CMS';
    const defaultDesc = 'Trusted international journalism delivering breaking world news, in-depth geopolitical analysis, business, technology, defense, and mobile newsroom CMS.';
    const defaultCanonical = selectedCategory && selectedCategory !== 'All'
      ? `${siteUrl}/?cat=${encodeURIComponent(selectedCategory)}`
      : `${siteUrl}/`;
    const defaultImg = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80';

    document.title = defaultTitle;
    setMetaTag('description', defaultDesc);
    setMetaTag('og:title', defaultTitle, true);
    setMetaTag('og:description', defaultDesc, true);
    setMetaTag('og:image', defaultImg, true);
    setMetaTag('og:url', defaultCanonical, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('twitter:title', defaultTitle);
    setMetaTag('twitter:description', defaultDesc);
    setMetaTag('twitter:image', defaultImg);
    setCanonicalTag(defaultCanonical);

    // Inject validated WebSite schema for SearchBox rich snippets
    injectValidatedJsonLd('google-website-schema', generateWebSiteJsonLd(siteUrl));

    removeValidatedJsonLd('newsarticle-schema');
    removeValidatedJsonLd('breadcrumbs-schema');
  }, [activeView, selectedArticleId, selectedCategory, articles]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-100 selection:text-red-950">
      {/* 1. Masthead and Navigation Header */}
      <Header />

      {/* Top Header Leaderboard Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-2 mb-1 w-full">
        <AdBanner position="header_top" />
      </div>

      {/* 2. Breaking News Ticker */}
      <BreakingTicker />

      {/* 3. Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {selectedCategory === 'All' ? (
              <>
                {/* Hero section */}
                <HeroGrid />

                {/* Latest Real-Time Feed */}
                <LatestFeed />

                {/* Mid-Homepage Sponsor Banner with Lazy Loading */}
                <LazyBoundary minHeight="90px" rootMargin="150px">
                  <AdBanner position="home_middle" className="my-8" />
                </LazyBoundary>

                {/* Curated Thematic Sections from Homepage Manager */}
                {homepageConfig.sections
                  .filter((sec) => sec.visible && sec.category)
                  .map((sec) => (
                    <LazyBoundary key={sec.id} minHeight="300px" rootMargin="200px">
                      <CategorySection
                        category={sec.category!}
                        limit={sec.limit}
                      />
                    </LazyBoundary>
                  ))}

                {/* Video Dispatch & Broadcasts (Lazy Loaded) */}
                <LazyBoundary minHeight="350px" rootMargin="250px">
                  <VideoReportsSection />
                </LazyBoundary>

                {/* Visual Photo Stories (Lazy Loaded) */}
                <LazyBoundary minHeight="320px" rootMargin="250px">
                  <PhotoStoriesSection />
                </LazyBoundary>
              </>
            ) : (
              /* Specific Category Filter View */
              <div className="py-4">
                <CategorySection category={selectedCategory} limit={12} />
              </div>
            )}
          </div>
        )}

        {/* Article Reader Page */}
        {activeView === 'article' && <ArticleView />}

        {/* Newsroom CMS Studio */}
        {activeView === 'cms' && <AdminDashboard />}

        {/* Policy & About & Author Pages */}
        {(activeView === 'policy' || activeView === 'author') && <PolicyPages />}
      </main>

      {/* Modals & Overlays */}
      {activeView === 'submit' && <SubmitNewsModal />}
      {activeView === 'search' && <SearchModal />}
      {activeView === 'seo' && (
        isAuthenticated ? (
          <SeoModal />
        ) : (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="w-14 h-14 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-100 text-2xl">
                🔒
              </div>
              <h3 className="font-serif-headline text-xl font-bold text-slate-900">
                {currentLanguage === 'bn' ? 'এডমিন অনুমোদন প্রয়োজন' : 'Admin Access Required'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentLanguage === 'bn'
                  ? 'গুগল সার্চ কনসোল, সাইটম্যাপ ও এসইও ইন্টারনাল ম্যানেজমেন্ট শুধুমাত্র অনুমোদিত এডমিন ও গুগল ক্রলারের জন্য সংরক্ষিত। সাধারণ দর্শকদের জন্য এটি উন্মুক্ত নয়।'
                  : 'Google Search Console, Discover, and Sitemap internals are reserved for authorized newsroom administrators and search engine bots.'}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setActiveView('home')}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                >
                  {currentLanguage === 'bn' ? 'প্রধান পাতায় ফিরুন' : 'Back to News'}
                </button>
                <button
                  onClick={() => {
                    setActiveView('home');
                    setIsLoginModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs bg-red-700 hover:bg-red-800 text-white rounded font-bold cursor-pointer"
                >
                  {currentLanguage === 'bn' ? 'এডমিন লগইন' : 'Admin Login'}
                </button>
              </div>
            </div>
          </div>
        )
      )}

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Reader Saved Articles / Bookmarks Modal */}
      <BookmarksModal />

      {/* Floating Reader / Admin Mode Switcher */}
      <AdminFloatingBar />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <NewsProvider>
      <MainLayout />
    </NewsProvider>
  );
}
