import React, { useState } from 'react';
import { Play, Film, X } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { MediaVideo } from '../../types/news';
import { LazyImage } from '../common/LazyImage';
import { getLocalizedHeadline } from '../../utils/translation';

export const VideoReportsSection: React.FC = () => {
  const { articles, currentLanguage, viewArticle } = useNews();
  const [activeVideoModal, setActiveVideoModal] = useState<MediaVideo | null>(null);

  // Extract all articles with videos
  const videoArticles = articles.filter((a) => a.videos && a.videos.length > 0 && a.status === 'published');

  if (videoArticles.length === 0) return null;

  return (
    <section className="py-8 bg-slate-950 text-white -mx-4 px-4 sm:mx-0 sm:px-6 sm:rounded-lg my-8">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="font-serif-headline text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
            {currentLanguage === 'bn' ? 'আন্তর্জাতিক ভিডিও প্রতিবেদন' : currentLanguage === 'ja' ? '国際ビデオ特派レポート' : 'Meridian Video Dispatch & Field Broadcasts'}
          </h2>
        </div>
        <span className="text-xs text-slate-400">Accredited Video Feeds</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoArticles.map((art) => {
          const video = art.videos![0];
          const headline = getLocalizedHeadline(art, currentLanguage);
          const caption = currentLanguage === 'bn' ? video.caption_bn || video.caption : video.caption;

          return (
            <div key={art.id} className="group">
              {/* Video Thumbnail with Play Button */}
              <div
                onClick={() => setActiveVideoModal(video)}
                className="relative aspect-16/9 bg-slate-900 rounded overflow-hidden cursor-pointer mb-3 border border-slate-800 group-hover:border-red-600 transition-colors"
              >
                <LazyImage
                  src={video.thumbnailUrl || art.featuredImage.url}
                  alt={headline}
                  aspectRatio="aspect-16/9"
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration & Format Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded z-10 pointer-events-none">
                  {video.duration || '03:42'} &middot; {video.format}
                </div>
              </div>

              {/* Title & metadata */}
              <div
                onClick={() => viewArticle(art.id)}
                className="cursor-pointer"
              >
                <div className="text-[11px] text-red-400 font-bold uppercase tracking-wider mb-1">
                  {art.category} &middot; {art.location}
                </div>
                <h3 className="font-serif-headline text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                  {headline}
                </h3>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {caption}
                </p>
                <div className="text-[10px] text-slate-500 mt-2">
                  Credit: {video.credit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 truncate">
                {activeVideoModal.caption}
              </span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-16/9 bg-black">
              <video
                src={activeVideoModal.url}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
            <div className="p-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Credit: {activeVideoModal.credit}</span>
              <span>Format: {activeVideoModal.format}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
