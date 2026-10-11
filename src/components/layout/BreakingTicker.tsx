import React from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { getEditorialTerm, getLocalizedHeadline } from '../../utils/translation';

export const BreakingTicker: React.FC = () => {
  const { articles, currentLanguage, viewArticle } = useNews();

  const breakingArticles = articles.filter((a) => a.isBreaking && a.status === 'published');

  if (breakingArticles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white text-xs border-b border-red-700 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 shrink-0 bg-red-800/80 px-3 py-1 rounded-full font-bold tracking-wider uppercase text-[11px] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>{getEditorialTerm('Breaking News', currentLanguage)}</span>
        </div>

        {/* Ticker Headlines */}
        <div className="overflow-hidden whitespace-nowrap flex-1 flex items-center gap-6">
          {breakingArticles.map((art) => {
            const headline = getLocalizedHeadline(art, currentLanguage);
            return (
              <button
                key={art.id}
                onClick={() => viewArticle(art.id)}
                className="flex items-center gap-2 text-left hover:text-amber-200 transition-colors cursor-pointer group text-xs md:text-sm truncate"
              >
                <span className="font-semibold">{headline}</span>
                <span className="text-red-300 text-xs hidden sm:inline">
                  [{art.location}]
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-red-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
