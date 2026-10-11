import React from 'react';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { CategoryType } from '../../types/news';
import {
  getLocalizedCategory,
  formatRelativeTime,
  getLocalizedHeadline,
  getLocalizedSummary,
} from '../../utils/translation';
import { getArticleReadingStats } from '../../utils/readingTime';
import { LazyImage } from '../common/LazyImage';

interface Props {
  category: CategoryType;
  limit?: number;
}

export const CategorySection: React.FC<Props> = ({ category, limit = 4 }) => {
  const { articles, currentLanguage, viewArticle, viewCategory, liveTick } = useNews();

  const categoryArticles = articles.filter(
    (a) => a.category === category && a.status === 'published'
  );

  if (categoryArticles.length === 0) return null;

  const leadStory = categoryArticles[0];
  const otherStories = categoryArticles.slice(1, limit);

  const localizedCategory = getLocalizedCategory(category, currentLanguage);

  const leadTitle = getLocalizedHeadline(leadStory, currentLanguage);
  const leadSummary = getLocalizedSummary(leadStory, currentLanguage);

  return (
    <section className="py-8 border-b border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-6 border-b-2 border-slate-900">
        <h2 className="font-serif-headline text-xl font-bold uppercase tracking-tight text-slate-950">
          {localizedCategory}
        </h2>
        <button
          onClick={() => viewCategory(category)}
          className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
        >
          View Desk <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lead story (7 cols) */}
        <div className="lg:col-span-7">
          <article
            onClick={() => viewArticle(leadStory.id)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-slate-100 mb-3 shadow-xs">
              <LazyImage
                src={leadStory.featuredImage.url}
                alt={leadStory.title}
                aspectRatio="aspect-16/10"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2.5 py-0.5 rounded-full z-10 pointer-events-none">
                {leadStory.location}
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 flex-wrap">
              <span>{leadStory.source}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1 font-normal normal-case">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(leadStory.publishedAt, currentLanguage)}
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1 font-normal normal-case text-slate-600">
                <BookOpen className="w-3 h-3 text-red-600" />
                {getArticleReadingStats(leadStory, currentLanguage).displayText}
              </span>
            </div>

            <h3 className="font-serif-headline text-xl md:text-2xl font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-tight mb-2">
              {leadTitle}
            </h3>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-3">
              {leadSummary}
            </p>
          </article>
        </div>

        {/* Companion Stories (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6">
          {otherStories.map((art) => {
            const title = getLocalizedHeadline(art, currentLanguage);
            return (
              <article
                key={art.id}
                onClick={() => viewArticle(art.id)}
                className="py-3 first:pt-0 group cursor-pointer flex gap-4 items-center"
              >
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {getLocalizedCategory(art.category, currentLanguage)} &middot; {art.location.split(',')[0]} &middot; {formatRelativeTime(art.publishedAt, currentLanguage)}
                  </div>
                  <h4 className="font-serif-headline text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                    {title}
                  </h4>
                </div>
                <div className="w-20 h-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <LazyImage
                    src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                    alt={art.title}
                    aspectRatio="aspect-16/10"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
