import React from 'react';
import { Clock, MapPin, BookOpen, Globe, ArrowRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import {
  formatRelativeTime,
  getLocalizedHeadline,
  getLocalizedSummary,
  getLocalizedCategory,
} from '../../utils/translation';
import { getArticleReadingStats } from '../../utils/readingTime';
import { LazyImage } from '../common/LazyImage';

export const HeroGrid: React.FC = () => {
  const { articles, currentLanguage, viewArticle, homepageConfig, liveTick } = useNews();

  const isBn = currentLanguage === 'bn';

  const publishedArticles = articles.filter((a) => a.status === 'published');
  if (publishedArticles.length === 0) return null;

  // Find hero article
  const heroArticle =
    publishedArticles.find((a) => a.id === homepageConfig.heroArticleId) ||
    publishedArticles.find((a) => a.isFeatured) ||
    publishedArticles[0];

  // Secondary stories (excluding hero)
  const secondaryStories = publishedArticles
    .filter((a) => a.id !== heroArticle.id)
    .slice(0, 3);

  // Developing column stories
  const developingStories = publishedArticles
    .filter((a) => a.id !== heroArticle.id && !secondaryStories.some((s) => s.id === a.id))
    .slice(0, 4);

  const heroTitle = getLocalizedHeadline(heroArticle, currentLanguage);
  const heroSummary = getLocalizedSummary(heroArticle, currentLanguage);

  return (
    <section className="border-b border-slate-200 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left & Middle: Hero Feature + 2-col sub-features (9 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Main Hero Card (Accurately Designed from Image 1) */}
          <article
            onClick={() => viewArticle(heroArticle.id)}
            className="group cursor-pointer border-b border-slate-200 pb-6 mb-6"
          >
            <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-slate-900 mb-4 shadow-sm group-hover:shadow-md transition-shadow">
              <LazyImage
                src={heroArticle.featuredImage.url}
                alt={heroArticle.featuredImage.caption}
                priority={true}
                aspectRatio="aspect-16/9"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />

              {/* Top Badges Floating Over Image (Matching Image 1) */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10 pointer-events-none flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bright Green Category Badge */}
                  <span className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {getLocalizedCategory(heroArticle.category, currentLanguage)}
                  </span>

                  {/* Earth 3D Globe / Location / Tag Badge */}
                  {heroArticle.tags && heroArticle.tags.length > 0 && (
                    <span className="bg-sky-600/90 backdrop-blur-xs text-white font-semibold px-2.5 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5 border border-sky-400/30">
                      <Globe className="w-3.5 h-3.5 text-sky-200" />
                      <span>{heroArticle.tags[0]}</span>
                    </span>
                  )}
                </div>

                {/* Read Time Pill Badge */}
                <div className="bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium border border-white/10">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>{getArticleReadingStats(heroArticle, currentLanguage).displayText}</span>
                </div>
              </div>

              {/* Bottom Credit & Lead Label */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs z-10 pointer-events-none">
                <span className="text-slate-300 text-[11px] font-medium drop-shadow-xs">
                  {heroArticle.featuredImage.credit}
                </span>
                <span className="bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider shadow-xs">
                  {isBn ? 'প্রধান খবর' : 'Lead Dispatch'}
                </span>
              </div>
            </div>

            {/* Category, Location and Timestamp Metadata Row */}
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex-wrap">
              <span className="text-red-700 font-bold">
                {getLocalizedCategory(heroArticle.category, currentLanguage)}
              </span>
              <span className="text-slate-300">&middot;</span>
              <span className="text-slate-600 flex items-center gap-1 normal-case tracking-normal font-normal">
                <MapPin className="w-3 h-3 text-slate-400" />
                {heroArticle.location}
              </span>
              <span className="text-slate-300">&middot;</span>
              <span className="text-slate-500 font-normal normal-case flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatRelativeTime(heroArticle.publishedAt, currentLanguage)}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-headline text-2xl md:text-4xl font-bold text-slate-950 group-hover:text-red-600 transition-colors leading-tight mb-3">
              {heroTitle}
            </h1>

            {/* Summary Text */}
            <p className="text-slate-700 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
              {heroSummary}
            </p>

            {/* Bottom Row: Author details & Prominent RED Rounded Pill 'Read More' Button */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <img
                  src={heroArticle.author.avatar}
                  alt={heroArticle.author.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="font-semibold text-slate-900">{heroArticle.author.name}</span>
                <span className="text-slate-400">&middot;</span>
                <span className="text-slate-500">{heroArticle.author.role}</span>
              </div>

              {/* Red Rounded Pill 'Read More' Button from Image 1 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  viewArticle(heroArticle.id);
                }}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-5 py-2 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer group/btn"
              >
                <span>{isBn ? 'আরও পড়ুন' : 'Read Full Story'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>

          {/* Sub-hero secondary row (3 items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {secondaryStories.map((art) => {
              const title = getLocalizedHeadline(art, currentLanguage);
              return (
                <article
                  key={art.id}
                  onClick={() => viewArticle(art.id)}
                  className="group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-16/10 overflow-hidden rounded-lg bg-slate-100 mb-2.5">
                      <LazyImage
                        src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                        alt={art.title}
                        aspectRatio="aspect-16/10"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {getLocalizedCategory(art.category, currentLanguage)} &middot; {art.location.split(',')[0]}
                    </div>
                    <h2 className="font-serif-headline text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-3 leading-snug">
                      {title}
                    </h2>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 flex-wrap">
                    <span>{formatRelativeTime(art.publishedAt, currentLanguage)}</span>
                    <span>&middot;</span>
                    <span className="text-slate-600 font-medium">
                      {getArticleReadingStats(art, currentLanguage).displayText}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right column: Developing Intelligence & Fast Feed (4 cols) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6">
          <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-slate-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {currentLanguage === 'bn' ? 'আলোচিত খবর' : currentLanguage === 'ja' ? 'グローバル速報' : 'Global Developing Wire'}
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="divide-y divide-slate-200">
            {developingStories.map((art, idx) => {
              const title = getLocalizedHeadline(art, currentLanguage);
              return (
                <div
                  key={art.id}
                  onClick={() => viewArticle(art.id)}
                  className="py-3.5 group cursor-pointer first:pt-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-serif-headline text-2xl font-bold text-slate-300 group-hover:text-red-600 transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-0.5">
                        {getLocalizedCategory(art.category, currentLanguage)}
                      </div>
                      <h3 className="font-serif-headline text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {title}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{art.location}</span>
                        <span>&middot;</span>
                        <span>{formatRelativeTime(art.publishedAt, currentLanguage)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editorial Trust Statement in Sidebar */}
          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span>Standard of Verification</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              The Meridian Bureau strictly attributes all data points. Unconfirmed rumors and AI hallucinated copy are barred from this publication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
