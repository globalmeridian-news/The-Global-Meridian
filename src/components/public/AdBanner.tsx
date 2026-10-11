import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { AdPosition } from '../../types/news';

interface Props {
  position: AdPosition;
  className?: string;
}

export const AdBanner: React.FC<Props> = ({ position, className = '' }) => {
  const { ads, recordAdClick, currentLanguage } = useNews();

  // Find active ad for this position
  const activeAd = ads.find((a) => a.position === position && a.isActive);

  if (!activeAd) return null;

  const isBn = currentLanguage === 'bn';

  const handleClick = () => {
    recordAdClick(activeAd.id);
    if (activeAd.targetUrl) {
      window.open(activeAd.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded border border-slate-200/90 bg-slate-50 transition-all hover:border-amber-400 group ${className}`}
    >
      {/* Small Sponsored Disclaimer Badge */}
      <div className="absolute top-1.5 right-2 z-10 bg-slate-900/80 backdrop-blur-xs text-[9px] font-bold uppercase tracking-wider text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
        <span>{isBn ? 'বিজ্ঞাপন' : 'Sponsored'}</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </div>

      <div
        onClick={handleClick}
        className="cursor-pointer block overflow-hidden"
        title={activeAd.title}
      >
        {position === 'header_top' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 sm:p-3.5 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white min-h-[64px] border border-emerald-700/40 rounded-lg shadow-xs">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              {activeAd.imageUrl && (
                <img
                  src={activeAd.imageUrl}
                  alt={activeAd.title}
                  className="w-16 h-12 sm:w-20 sm:h-12 object-cover rounded-md shadow-sm shrink-0 border border-emerald-500/30"
                />
              )}
              <div className="min-w-0 pr-16 sm:pr-0">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                  {activeAd.sponsorName}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-emerald-200 transition-colors">
                  {activeAd.title}
                </h4>
              </div>
            </div>
            <span className="hidden md:inline-flex bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors shrink-0 shadow-xs">
              {isBn ? 'বিস্তারিত জানুন' : 'Learn More'} &rarr;
            </span>
          </div>
        )}

        {position === 'home_middle' && (
          <div className="relative aspect-21/9 sm:aspect-16/5 w-full bg-slate-900 overflow-hidden">
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {activeAd.sponsorName}
              </span>
              <h3 className="font-serif-headline text-base sm:text-xl md:text-2xl font-bold group-hover:text-amber-300 transition-colors line-clamp-1">
                {activeAd.title}
              </h3>
            </div>
          </div>
        )}

        {position === 'article_inline' && (
          <div className="my-6 p-4 rounded-lg bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-center gap-4">
            {activeAd.imageUrl && (
              <img
                src={activeAd.imageUrl}
                alt={activeAd.title}
                className="w-full sm:w-40 h-28 object-cover rounded-md shadow-2xs"
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block mb-1">
                {isBn ? 'স্পন্সরড অংশীদার' : 'Sponsored Feature'} &middot; {activeAd.sponsorName}
              </span>
              <h4 className="font-bold text-slate-950 text-base leading-snug group-hover:text-red-700 transition-colors mb-2">
                {activeAd.title}
              </h4>
              <span className="inline-block text-xs font-bold text-red-700 group-hover:underline">
                {isBn ? 'বিজ্ঞাপন দেখুন' : 'Visit Sponsor'} &rarr;
              </span>
            </div>
          </div>
        )}

        {position === 'article_sidebar' && (
          <div className="bg-slate-900 text-white rounded overflow-hidden">
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              className="w-full aspect-16/10 object-cover"
            />
            <div className="p-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">
                {activeAd.sponsorName}
              </span>
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                {activeAd.title}
              </h4>
              <span className="text-[11px] text-amber-400 font-semibold group-hover:underline">
                {isBn ? 'বিস্তারিত দেখুন' : 'Explore'} &rarr;
              </span>
            </div>
          </div>
        )}

        {position === 'footer_top' && (
          <div className="p-3 bg-slate-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{activeAd.sponsorName}:</span>
              <span className="truncate">{activeAd.title}</span>
            </div>
            <span className="text-red-700 font-bold shrink-0">{isBn ? 'ভিজিট' : 'Visit'} &rarr;</span>
          </div>
        )}
      </div>
    </div>
  );
};
