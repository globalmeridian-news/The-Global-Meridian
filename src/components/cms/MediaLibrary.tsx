import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  Check,
  FileCheck,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { MediaItem } from '../../types/news';

export const MediaLibrary: React.FC = () => {
  const { mediaLibrary, deleteMediaItem, updateMediaItem, addMediaItem, articles } = useNews();
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = mediaLibrary.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.filename.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        item.credit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMediaItem(editingItem.id, {
      caption: editingItem.caption,
      credit: editingItem.credit,
    });
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-serif-headline text-lg font-bold text-slate-900">
            Newsroom Media Library &amp; Assets ({mediaLibrary.length})
          </h3>
          <p className="text-xs text-slate-500">
            All photos and broadcast clips uploaded from mobile and desktops with metadata.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-3 py-1 rounded cursor-pointer ${
                filterType === 'image' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1 rounded cursor-pointer ${
                filterType === 'video' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search media by filename, caption, or agency credit..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-xs text-slate-800 bg-white"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => {
          const associatedArticle = articles.find((a) => a.id === item.articleId);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-slate-900">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {item.type}
                  </div>
                </div>

                <div className="p-3 space-y-1 text-xs">
                  <div className="font-semibold text-slate-900 truncate" title={item.filename}>
                    {item.filename}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {item.caption || 'No caption set'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Credit: {item.credit || 'Associated Wire'}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Size: {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB &middot;{' '}
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </div>
                  {associatedArticle && (
                    <div className="text-[10px] text-red-700 font-medium truncate pt-1">
                      Used in: {associatedArticle.title}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  title="Copy media URL"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setEditingItem(item)}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  title="Edit metadata"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Edit</span>
                </button>

                <button
                  onClick={() => deleteMediaItem(item.id)}
                  className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                  title="Delete media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Metadata Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMetadata}
            className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h4 className="font-serif-headline text-lg font-bold text-slate-900">
              Edit Photographic Metadata
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Editorial Caption
              </label>
              <textarea
                rows={2}
                value={editingItem.caption}
                onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Agency / Photo Credit
              </label>
              <input
                type="text"
                value={editingItem.credit}
                onChange={(e) => setEditingItem({ ...editingItem, credit: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-1.5 rounded text-xs font-bold"
              >
                Save Metadata
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
