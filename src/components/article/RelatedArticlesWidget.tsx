import React from 'react';
import {
  Sparkles,
  Bookmark,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag as TagIcon,
  BookOpen,
} from 'lucide-react';
import { Article } from '../../types/news';
import { useNews } from '../../context/NewsContext';
import {
  formatRelativeTime,
  getLocalizedHeadline,
  getLocalizedCategory,
  convertNumeralsToBengali,
  getUIText,
} from '../../utils/translation';
import { LazyImage } from '../common/LazyImage';
import { getArticleReadingStats } from '../../utils/readingTime';

interface RelatedArticlesWidgetProps {
  currentArticle: Article;
  limit?: number;
}

export const RelatedArticlesWidget: React.FC<RelatedArticlesWidgetProps> = ({
  currentArticle,
  limit = 4,
}) => {
  const {
    articles,
    currentLanguage,
    viewArticle,
    savedArticleIds,
    toggleSaveArticle,
  } = useNews();

  const isBn = currentLanguage === 'bn';

  // Dynamic recommendation algorithm based on shared tags, category, and recency
  const relatedArticles = React.useMemo(() => {
    const candidates = articles.filter(
      (a) => a.id !== currentArticle.id && a.status === 'published'
    );

    const scored = candidates.map((candidate) => {
      let score = 0;
      const sharedTags: string[] = [];

      // 1. Tag overlap (3 points per matching tag)
      if (candidate.tags && currentArticle.tags) {
        candidate.tags.forEach((tag) => {
          const match = currentArticle.tags.some(
            (ct) => ct.toLowerCase().trim() === tag.toLowerCase().trim()
          );
          if (match) {
            score += 3;
            sharedTags.push(tag);
          }
        });
      }

      // 2. Same Category (2 points)
      if (candidate.category === currentArticle.category) {
        score += 2;
      }

      // 3. Same Geographic Location/Region (1 point)
      if (
        candidate.location &&
        currentArticle.location &&
        candidate.location.toLowerCase() === currentArticle.location.toLowerCase()
      ) {
        score += 1;
      }

      // 4. Recency boost (fractional)
      const pubDate = new Date(candidate.publishedAt).getTime();
      const recencyBonus = pubDate / 10000000000000; // tiny tie-breaker
      const finalScore = score + recencyBonus;

      return {
        article: candidate,
        score: finalScore,
        sharedTags,
        hasSameCategory: candidate.category === currentArticle.category,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Take top matching articles
    const topPicks = scored.slice(0, limit);

    // If fewer than limit, backfill with most viewed / latest published
    if (topPicks.length < limit) {
      const existingIds = new Set([currentArticle.id, ...topPicks.map((p) => p.article.id)]);
      const remainingCandidates = candidates
        .filter((c) => !existingIds.has(c.id))
        .sort((a, b) => (b.views || 0) - (a.views || 0));

      for (const fill of remainingCandidates) {
        if (topPicks.length >= limit) break;
        topPicks.push({
          article: fill,
          score: 0,
          sharedTags: [],
          hasSameCategory: fill.category === currentArticle.category,
        });
      }
    }

    return topPicks;
  }, [articles, currentArticle, limit]);

  if (relatedArticles.length === 0) return null;

  const handleSelectStory = (articleId: string) => {
    viewArticle(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      aria-label={isBn ? 'সম্পর্কিত সংবাদ' : 'Related Stories'}
      className="my-10 pt-8 border-t-2 border-slate-900 bg-linear-to-b from-slate-50/70 to-transparent p-4 sm:p-6 rounded-lg border border-slate-200"
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 text-red-700 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isBn
                ? 'সম্পর্কিত গভীর প্রতিবেদন ও বিশ্লেষণ'
                : 'Related Intelligence & Deep Dives'}
            </span>
          </div>
          <h3 className="font-serif-headline text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {isBn ? 'এই খবরের সঙ্গে সম্পর্কিত আরও পড়ুন' : 'Stories Connected to This Dispatch'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? `ক্যাটাগরি "${getLocalizedCategory(currentArticle.category, currentLanguage)}" ও বিষয়ভিত্তিক ট্যাগের ভিত্তিতে বাছাইকৃত`
              : `Dynamically suggested based on #${currentArticle.tags.slice(0, 2).join(' #')} and editorial coverage`}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>
            {isBn
              ? `${convertNumeralsToBengali(String(relatedArticles.length))}টি নির্বাচিত প্রতিবেদন`
              : `${relatedArticles.length} Curated Stories`}
          </span>
        </div>
      </div>

      {/* Grid of Dynamic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {relatedArticles.map(({ article: story, sharedTags, hasSameCategory }) => {
          const headline = getLocalizedHeadline(story, currentLanguage);
          const isSaved = savedArticleIds.includes(story.id);
          const readingStats = getArticleReadingStats(story, currentLanguage);
          const summary =
            currentLanguage === 'bn' && story.summary_bn
              ? story.summary_bn
              : story.summary;

          return (
            <article
              key={story.id}
              onClick={() => handleSelectStory(story.id)}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail image with subtle hover zoom */}
                <div className="relative aspect-16/9 w-full rounded overflow-hidden bg-slate-100 mb-3">
                  <LazyImage
                    src={story.featuredImage.thumbnailUrl || story.featuredImage.url}
                    alt={headline}
                    aspectRatio="aspect-16/9"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top-right bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveArticle(story.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                      isSaved
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-black/60 text-white hover:bg-black/80'
                    }`}
                    title={isSaved ? 'Saved' : 'Save story'}
                    aria-label="Bookmark story"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isSaved ? 'fill-slate-950 text-slate-950' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Clean category indicator on top left */}
                  <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-xs text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {getLocalizedCategory(story.category, currentLanguage)}
                  </div>
                </div>

                {/* Metadata row with zero-pill discipline */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5 flex-wrap">
                  <span className="font-semibold text-red-700">
                    {story.location}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{formatRelativeTime(story.publishedAt, currentLanguage)}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    {readingStats.displayText}
                  </span>
                </div>

                {/* Headline */}
                <h4 className="font-serif-headline text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2 mb-2">
                  {headline}
                </h4>

                {/* Summary preview */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {summary}
                </p>
              </div>

              {/* Bottom tag & action row */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {/* Matching factor */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  {sharedTags.length > 0 ? (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <TagIcon className="w-3 h-3 text-red-600 shrink-0" />
                      <span>#{sharedTags[0]}</span>
                      {sharedTags.length > 1 && (
                        <span className="text-slate-400">+{sharedTags.length - 1}</span>
                      )}
                    </span>
                  ) : hasSameCategory ? (
                    <span className="text-slate-500">
                      {isBn ? 'একই ডেস্ক' : 'Same Desk'}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {isBn ? 'শীর্ষ পঠিত' : 'Top Story'}
                    </span>
                  )}
                </div>

                {/* Read story prompt */}
                <div className="flex items-center gap-1 font-semibold text-red-700 group-hover:text-red-800 text-[11px] shrink-0">
                  <span>{isBn ? 'পড়ুন' : 'Read'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
