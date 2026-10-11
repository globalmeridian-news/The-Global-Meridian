import React, { useState } from 'react';
import { X, Bookmark, Trash2, ArrowRight, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { formatRelativeTime } from '../../utils/translation';
import { getArticleReadingStats } from '../../utils/readingTime';
import { LazyImage } from '../common/LazyImage';

export const BookmarksModal: React.FC = () => {
  const {
    articles,
    savedArticleIds,
    toggleSaveArticle,
    viewArticle,
    currentLanguage,
    isBookmarksModalOpen,
    setIsBookmarksModalOpen,
  } = useNews();

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isBookmarksModalOpen) return null;

  const isBn = currentLanguage === 'bn';
  const savedArticles = articles.filter((a) => savedArticleIds.includes(a.id));

  const handleClearAll = () => {
    savedArticleIds.forEach((id) => toggleSaveArticle(id));
    setConfirmClear(false);
  };

  const handleOpenArticle = (id: string) => {
    viewArticle(id);
    setIsBookmarksModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Bookmark className="w-5 h-5 fill-amber-600 text-amber-600" />
            </div>
            <div>
              <h2 id="bookmarks-modal-title" className="font-serif-headline text-lg sm:text-xl font-bold text-slate-900">
                {isBn ? 'সংরক্ষিত সংবাদ ও বুকমার্ক' : 'Saved Articles & Bookmarks'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? `আপনার ডিভাইসের লোকাল স্টোরেজে ${savedArticles.length}টি সংবাদ সংরক্ষিত রয়েছে`
                  : `${savedArticles.length} article${savedArticles.length === 1 ? '' : 's'} stored in local storage for later reading`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBookmarksModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {savedArticles.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-200">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-headline text-base sm:text-lg font-bold text-slate-800">
                  {isBn ? 'কোনো সংবাদ সংরক্ষিত নেই' : 'No Bookmarked Articles Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {isBn
                    ? 'যেকোনো সংবাদের পাতার উপরে বা নিচে "Save" বা "বুকমার্ক" বাটনে ক্লিক করুন। এটি আপনার ব্রাউজারের লোকাল স্টোরেজে জমা থাকবে।'
                    : 'Click the "Save" or "Bookmark" button on any article to store it in local storage and read it anytime, even offline.'}
                </p>
              </div>
            </div>
          ) : (
            savedArticles.map((art) => {
              const title = isBn ? art.title_bn || art.title : art.title;
              const summary = isBn ? art.summary_bn || art.summary : art.summary;
              const readingStats = getArticleReadingStats(art, currentLanguage);

              return (
                <div
                  key={art.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start group"
                >
                  <div
                    onClick={() => handleOpenArticle(art.id)}
                    className="w-full sm:w-36 h-24 shrink-0 rounded overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    <LazyImage
                      src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                      alt={art.title}
                      aspectRatio="aspect-16/10"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span className="text-red-700">{art.category}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1 font-normal normal-case">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatRelativeTime(art.publishedAt, currentLanguage)}
                      </span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 normal-case bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <BookOpen className="w-3 h-3 text-red-700" />
                        {readingStats.displayText}
                      </span>
                    </div>

                    <h4
                      onClick={() => handleOpenArticle(art.id)}
                      className="font-serif-headline text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug cursor-pointer line-clamp-2 mb-1"
                    >
                      {title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {summary}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => handleOpenArticle(art.id)}
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-bold cursor-pointer"
                      >
                        <span>{isBn ? 'সম্পূর্ণ প্রতিবেদন পড়ুন' : 'Read Article'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleSaveArticle(art.id)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-red-700 transition-colors cursor-pointer text-xs"
                        title={isBn ? 'বুকমার্ক থেকে মুছুন' : 'Remove from bookmarks'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'মুছুন' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {savedArticles.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-xs font-semibold">
                  {isBn ? 'সবগুলো বুকমার্ক মুছে ফেলবেন?' : 'Clear all saved articles?'}
                </span>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 bg-red-700 text-white rounded text-xs font-bold hover:bg-red-800 cursor-pointer"
                >
                  {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Clear'}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-slate-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'সবগুলো বুকমার্ক মুছুন' : 'Clear All Bookmarks'}</span>
              </button>
            )}

            <button
              onClick={() => setIsBookmarksModalOpen(false)}
              className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
