import React, { useState } from 'react';
import { Search, X, Filter, Calendar, MapPin, User, ArrowRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { CategoryType } from '../../types/news';
import { formatRelativeTime } from '../../utils/translation';
import { getArticleReadingStats } from '../../utils/readingTime';

const CATEGORIES: (CategoryType | 'All')[] = [
  'All',
  'World',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Health',
  'Defense',
  'Environment',
  'Sports',
  'Entertainment',
];

export const SearchModal: React.FC = () => {
  const { articles, setActiveView, viewArticle, currentLanguage } = useNews();

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');

  const results = articles.filter((art) => {
    if (art.status !== 'published') return false;

    // Category filter
    if (selectedCat !== 'All' && art.category !== selectedCat) return false;

    // Location filter
    if (locationFilter.trim() && !art.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    // Author filter
    if (authorFilter.trim() && !art.author.name.toLowerCase().includes(authorFilter.toLowerCase())) {
      return false;
    }

    // Query text match across headline, summary, tags, content
    if (query.trim()) {
      const q = query.toLowerCase();
      const inTitle = art.title.toLowerCase().includes(q) || (art.title_bn && art.title_bn.includes(q));
      const inSummary = art.summary.toLowerCase().includes(q);
      const inTags = art.tags.some((t) => t.toLowerCase().includes(q));
      const inSource = art.source.toLowerCase().includes(q);
      return inTitle || inSummary || inTags || inSource;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Search header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif-headline text-lg font-bold">
              Global International News Index &amp; Archive
            </h2>
          </div>
          <button
            onClick={() => setActiveView('home')}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input & Filters Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords, treaties, geopolitical events, technologies..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded focus:border-red-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Category dropdown */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Category
              </label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value as CategoryType | 'All')}
                className="w-full p-1.5 border border-slate-200 rounded bg-white text-slate-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Location input */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Location / Dateline
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Geneva, Tokyo..."
                className="w-full p-1.5 border border-slate-200 rounded bg-white text-slate-800"
              />
            </div>

            {/* Author input */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Accredited Correspondent
              </label>
              <input
                type="text"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                placeholder="e.g. Elena Rostova..."
                className="w-full p-1.5 border border-slate-200 rounded bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          <div className="text-xs text-slate-500 font-semibold mb-3">
            Showing {results.length} verified news dispatches
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No dispatches match the query. Try broader keywords or reset filters.
            </div>
          ) : (
            results.map((art) => (
              <article
                key={art.id}
                onClick={() => {
                  viewArticle(art.id);
                  setActiveView('article');
                }}
                className="py-3 group cursor-pointer flex gap-4 items-start"
              >
                <img
                  src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                  alt={art.title}
                  className="w-24 h-16 object-cover rounded bg-slate-100 shrink-0"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-700 uppercase">
                    <span>{art.category}</span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="text-slate-500 font-normal flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {art.location}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="text-slate-400 font-normal">
                      {formatRelativeTime(art.publishedAt, currentLanguage)}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="text-slate-600 font-medium normal-case">
                      {getArticleReadingStats(art, currentLanguage).displayText}
                    </span>
                  </div>

                  <h3 className="font-serif-headline text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                    {currentLanguage === 'bn' ? art.title_bn || art.title : art.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {art.summary}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-700 shrink-0 self-center" />
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
