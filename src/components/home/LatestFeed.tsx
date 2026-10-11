import React from 'react';
import { Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import {
  formatRelativeTime,
  getLocalizedHeadline,
  getLocalizedCategory,
} from '../../utils/translation';
import { getArticleReadingStats } from '../../utils/readingTime';
import { LazyImage } from '../common/LazyImage';

export const LatestFeed: React.FC = () => {
  const { articles, currentLanguage, viewArticle, liveTick } = useNews();

  // Sort by publishedAt descending
  const sortedArticles = [...articles]
    .filter((a) => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <section className="py-8 border-b border-slate-200">
      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-950 font-serif-headline">
            {currentLanguage === 'bn' ? 'সর্বশেষ সংবাদ প্রবাহ' : currentLanguage === 'ja' ? 'リアルタイム最新ニュース' : 'Chronological Wire & Latest News'}
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">Real-Time Dispatch</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedArticles.slice(0, 8).map((art) => {
          const title = getLocalizedHeadline(art, currentLanguage);
          return (
            <article
              key={art.id}
              onClick={() => viewArticle(art.id)}
              className="group cursor-pointer flex flex-col justify-between border-b md:border-b-0 pb-4 md:pb-0"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-slate-100 mb-3 shadow-2xs group-hover:shadow-xs transition-shadow">
                  <LazyImage
                    src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                    alt={art.title}
                    aspectRatio="aspect-16/10"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10 pointer-events-none backdrop-blur-xs border border-white/10">
                    {getLocalizedCategory(art.category, currentLanguage)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {art.location.split(',')[0]}
                  </span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(art.publishedAt, currentLanguage)}
                  </span>
                </div>

                <h3 className="font-serif-headline text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-3">
                  {title}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-slate-700">{art.author.name}</span>
                  <span>&middot;</span>
                  <span className="text-slate-500 font-normal">
                    {getArticleReadingStats(art, currentLanguage).displayText}
                  </span>
                </div>
                <span className="flex items-center gap-0.5 text-slate-400 group-hover:text-red-600 font-medium">
                  Read <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
