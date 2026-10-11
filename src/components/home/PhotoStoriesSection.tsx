import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { MediaItem } from '../../types/news';
import { LazyImage } from '../common/LazyImage';
import { getLocalizedHeadline, getLocalizedSummary } from '../../utils/translation';

export const PhotoStoriesSection: React.FC = () => {
  const { articles, currentLanguage, viewArticle } = useNews();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Extract all articles with additional images
  const photoArticles = articles.filter(
    (a) => a.status === 'published' && a.additionalImages && a.additionalImages.length > 0
  );

  if (photoArticles.length === 0) return null;

  const currentStory = photoArticles[activeGalleryIndex % photoArticles.length];
  const allImages: MediaItem[] = [
    currentStory.featuredImage,
    ...(currentStory.additionalImages || []),
  ];

  return (
    <section className="py-8 border-b border-slate-200">
      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-red-700" />
          <h2 className="font-serif-headline text-lg sm:text-xl font-bold tracking-tight text-slate-950 uppercase">
            {currentLanguage === 'bn' ? 'ছবিতে আন্তর্জাতিক সংবাদ' : 'Visual Journalism & Photo Essays'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setActiveGalleryIndex(
                (prev) => (prev - 1 + photoArticles.length) % photoArticles.length
              )
            }
            className="p-1 rounded border border-slate-300 hover:bg-slate-100 cursor-pointer"
            aria-label="Previous photo story"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setActiveGalleryIndex((prev) => (prev + 1) % photoArticles.length)
            }
            className="p-1 rounded border border-slate-300 hover:bg-slate-100 cursor-pointer"
            aria-label="Next photo story"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gallery Image Display (8 cols) */}
        <div className="lg:col-span-8">
          <div
            onClick={() => viewArticle(currentStory.id)}
            className="group cursor-pointer relative aspect-16/10 rounded overflow-hidden bg-slate-900"
          >
            <LazyImage
              src={allImages[0].url}
              alt={allImages[0].caption}
              aspectRatio="aspect-16/10"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4 text-white text-xs z-10 pointer-events-none">
              <div className="font-medium">{allImages[0].caption}</div>
              <div className="text-slate-400 text-[11px] mt-1">Photo: {allImages[0].credit}</div>
            </div>
          </div>
        </div>

        {/* Story details & thumbnails (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
              Visual Essay &middot; {currentStory.category}
            </div>
            <h3
              onClick={() => viewArticle(currentStory.id)}
              className="font-serif-headline text-xl font-bold text-slate-900 hover:text-red-700 cursor-pointer transition-colors leading-tight mb-2"
            >
              {getLocalizedHeadline(currentStory, currentLanguage)}
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4">
              {getLocalizedSummary(currentStory, currentLanguage)}
            </p>
          </div>

          {/* Mini thumbnails preview */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Gallery Frames ({allImages.length})
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allImages.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  className="aspect-16/10 rounded overflow-hidden bg-slate-100 border border-slate-200"
                >
                  <LazyImage
                    src={img.thumbnailUrl || img.url}
                    alt={img.caption}
                    aspectRatio="aspect-16/10"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
