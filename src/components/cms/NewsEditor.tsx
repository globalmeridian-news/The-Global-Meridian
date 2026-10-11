import React, { useState, useRef } from 'react';
import {
  Camera,
  Video,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  X,
  Languages,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import {
  Article,
  CategoryType,
  ContentBlock,
  MediaItem,
  MediaVideo,
} from '../../types/news';
import { autoTranslateToBengali } from '../../utils/translation';

interface Props {
  editingArticle?: Article;
  onClose?: () => void;
  onPublished?: (articleId: string) => void;
}

const CATEGORIES: CategoryType[] = [
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
  'Videos',
  'Photo Stories',
  'Opinion',
];

export const NewsEditor: React.FC<Props> = ({ editingArticle, onClose, onPublished }) => {
  const {
    createArticle,
    updateArticle,
    publishArticle,
    unpublishArticle,
    deleteArticle,
    authors,
    currentRole,
    viewArticle,
    addMediaItem,
    currentLanguage,
  } = useNews();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const isBn = currentLanguage === 'bn';

  // Form State
  const [title, setTitle] = useState(editingArticle?.title || '');
  const [titleBn, setTitleBn] = useState(editingArticle?.title_bn || '');
  const [summary, setSummary] = useState(editingArticle?.summary || '');
  const [summaryBn, setSummaryBn] = useState(editingArticle?.summary_bn || '');
  const [category, setCategory] = useState<CategoryType>(editingArticle?.category || 'World');
  const [location, setLocation] = useState(editingArticle?.location || 'Geneva, Switzerland');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingArticle?.tags || ['World News', 'Meridian Wire']);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(
    editingArticle?.author.id || authors[0].id
  );
  const [source, setSource] = useState(editingArticle?.source || 'Meridian Newsroom Wire & Bureau Dispatches');
  const [isBreaking, setIsBreaking] = useState(editingArticle?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(editingArticle?.isFeatured || false);
  const [scheduledDate, setScheduledDate] = useState(editingArticle?.scheduledFor || '');
  const [seoTitle, setSeoTitle] = useState(editingArticle?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(editingArticle?.seoDescription || '');

  // Media state
  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(
    editingArticle?.featuredImage || null
  );
  const [additionalImages, setAdditionalImages] = useState<MediaItem[]>(
    editingArticle?.additionalImages || []
  );
  const [videos, setVideos] = useState<MediaVideo[]>(editingArticle?.videos || []);

  // Upload progress / states
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string>('');

  // Blocks for full article body
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    editingArticle?.blocks || [
      {
        id: 'block-' + Date.now(),
        type: 'paragraph',
        text: '',
        text_bn: '',
      },
    ]
  );

  // Status & notifications
  const [publishedArticleId, setPublishedArticleId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Hidden native file inputs for phone gallery
  const photoInputRef = useRef<HTMLInputElement>(null);
  const multiPhotoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const inlinePhotoInputRef = useRef<HTMLInputElement>(null);
  const activeBlockForInlinePhoto = useRef<string | null>(null);

  // Handle Photo Upload from Phone Gallery
  const handleFeaturedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImageUploadProgress(20);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUploadProgress(70);
      const dataUrl = event.target?.result as string;

      const newMedia: MediaItem = {
        id: 'img-' + Date.now(),
        type: 'image',
        url: dataUrl,
        thumbnailUrl: dataUrl,
        filename: file.name,
        sizeBytes: file.size,
        caption: `Bureau photographic coverage: ${title || 'News event'}`,
        credit: 'The Global Meridian Photo Desk',
        uploadedAt: new Date().toISOString(),
      };

      setFeaturedImage(newMedia);
      addMediaItem(newMedia);
      setImageUploadProgress(100);
      setTimeout(() => setImageUploadProgress(null), 800);
    };
    reader.readAsDataURL(file);
  };

  // Handle Multiple Photo Upload
  const handleMultiplePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newMedia: MediaItem = {
          id: `img-add-${Date.now()}-${index}`,
          type: 'image',
          url: dataUrl,
          thumbnailUrl: dataUrl,
          filename: file.name,
          sizeBytes: file.size,
          caption: `Supplementary dispatch photo ${index + 1}`,
          credit: 'Meridian Wire Field Contributor',
          uploadedAt: new Date().toISOString(),
        };
        setAdditionalImages((prev) => [...prev, newMedia]);
        addMediaItem(newMedia);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Video Upload from Phone Gallery
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setVideoUploadProgress(15);
    setVideoUploadStatus('Analyzing video stream & generating thumbnail...');

    // Generate thumbnail via video element and canvas
    const videoUrl = URL.createObjectURL(file);
    const videoElem = document.createElement('video');
    videoElem.src = videoUrl;
    videoElem.currentTime = 1;
    videoElem.muted = true;

    videoElem.onloadeddata = () => {
      setVideoUploadProgress(50);
      setVideoUploadStatus('Encoding frames...');

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoElem, 0, 0, 640, 360);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg');

      setVideoUploadProgress(85);
      setVideoUploadStatus('Finalizing media asset...');

      // Convert format name
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MP4';
      const durationFormatted = videoElem.duration
        ? `${Math.floor(videoElem.duration / 60)}:${Math.floor(videoElem.duration % 60).toString().padStart(2, '0')}`
        : '02:15';

      const newVideo: MediaVideo = {
        id: 'vid-' + Date.now(),
        url: videoUrl,
        thumbnailUrl: thumbnailDataUrl,
        caption: `On-the-ground video report: ${title || 'Special Broadcast'}`,
        credit: 'Meridian News Broadcast Unit',
        duration: durationFormatted,
        sizeBytes: file.size,
        format: `${ext} / HD`,
      };

      setVideos((prev) => [newVideo, ...prev]);
      setVideoUploadProgress(100);
      setVideoUploadStatus('Uploaded successfully');
      setTimeout(() => {
        setVideoUploadProgress(null);
        setVideoUploadStatus('');
      }, 1000);
    };

    videoElem.onerror = () => {
      // Fallback
      const newVideo: MediaVideo = {
        id: 'vid-' + Date.now(),
        url: videoUrl,
        thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80',
        caption: `Broadcast: ${file.name}`,
        credit: 'Meridian Newsroom Wire',
        duration: '02:30',
        sizeBytes: file.size,
        format: 'MP4 / HD',
      };
      setVideos((prev) => [newVideo, ...prev]);
      setVideoUploadProgress(null);
      setVideoUploadStatus('');
    };
  };

  // Block manipulation
  const addBlock = (type: ContentBlock['type'], index?: number) => {
    const newBlock: ContentBlock = {
      id: 'b-' + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      text: '',
      text_bn: '',
      quoteAuthor: type === 'quote' ? 'Spokesperson' : undefined,
    };

    if (index !== undefined) {
      const copy = [...blocks];
      copy.splice(index + 1, 0, newBlock);
      setBlocks(copy);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlockText = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text, text_bn: autoTranslateToBengali(text) } : b))
    );
  };

  const updateBlockQuoteAuthor = (id: string, author: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, quoteAuthor: author } : b))
    );
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const copy = [...blocks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setBlocks(copy);
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Smart bilingual generator
  const handleAutoTranslateFields = () => {
    if (title && !titleBn) {
      setTitleBn(autoTranslateToBengali(title));
    }
    if (summary && !summaryBn) {
      setSummaryBn(autoTranslateToBengali(summary));
    }
  };

  // Save / Publish
  const handleSave = (targetStatus: 'published' | 'draft' | 'pending_review' | 'scheduled') => {
    if (!title.trim()) {
      alert('Please provide an article headline.');
      return;
    }

    const selectedAuthor = authors.find((a) => a.id === selectedAuthorId) || authors[0];

    const articlePayload: Partial<Article> = {
      title: title.trim(),
      title_bn: titleBn.trim() || autoTranslateToBengali(title.trim()),
      summary: summary.trim(),
      summary_bn: summaryBn.trim() || autoTranslateToBengali(summary.trim()),
      category,
      location,
      tags,
      author: selectedAuthor,
      source,
      isBreaking,
      isFeatured,
      status: targetStatus,
      blocks,
      additionalImages,
      videos,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || summary,
      scheduledFor: targetStatus === 'scheduled' ? scheduledDate : undefined,
    };

    if (featuredImage) {
      articlePayload.featuredImage = featuredImage;
    }

    let resultId = '';
    if (editingArticle) {
      updateArticle(editingArticle.id, articlePayload);
      if (targetStatus === 'published') {
        publishArticle(editingArticle.id);
      }
      resultId = editingArticle.id;
    } else {
      const created = createArticle(articlePayload);
      resultId = created.id;
    }

    if (targetStatus === 'published') {
      setPublishedArticleId(resultId);
      setStatusMessage('Published successfully to live international newsroom!');
      if (onPublished) onPublished(resultId);
    } else {
      setStatusMessage(`Saved successfully as ${targetStatus.replace('_', ' ')}!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto my-4">
      {/* Hidden Mobile Native Photo Pickers */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleFeaturedPhotoUpload}
        className="hidden"
      />
      <input
        ref={multiPhotoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleMultiplePhotoUpload}
        className="hidden"
      />
      {/* Hidden Mobile Native Video Picker */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={inlinePhotoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0 || !activeBlockForInlinePhoto.current) return;
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            const newMedia: MediaItem = {
              id: 'inline-' + Date.now(),
              type: 'image',
              url: dataUrl,
              filename: file.name,
              sizeBytes: file.size,
              caption: 'Mid-paragraph field photograph',
              credit: 'Meridian Wire Dispatch',
              uploadedAt: new Date().toISOString(),
            };
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === activeBlockForInlinePhoto.current ? { ...b, media: newMedia } : b
              )
            );
            addMediaItem(newMedia);
          };
          reader.readAsDataURL(file);
        }}
        className="hidden"
      />

      {/* Editor Header Bar */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
            Mobile Newsroom CMS &middot; {currentRole.toUpperCase()}
          </span>
          <h2 className="font-serif-headline text-lg sm:text-xl font-bold">
            {editingArticle ? 'Edit Dispatched Article' : 'Compose News Article'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                if (title.trim() && !publishedArticleId) {
                  setExitConfirmOpen(true);
                } else {
                  onClose();
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer font-bold border border-slate-700"
              title={isBn ? 'ফর্ম থেকে বের হয়ে যান (✕)' : 'Close Form (✕)'}
            >
              <X className="w-4 h-4 text-red-400" />
              <span>{isBn ? 'বাতিল ও প্রস্থান (✕)' : 'Exit (✕)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* One-Click Published Success Banner */}
      {publishedArticleId && (
        <div className="bg-emerald-600 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Published successfully to live international wire!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                viewArticle(publishedArticleId);
                if (onClose) onClose();
              }}
              className="bg-white text-emerald-900 font-bold px-4 py-1.5 rounded text-xs shadow-xs hover:bg-emerald-50 cursor-pointer"
            >
              View Article Live
            </button>
            <button
              onClick={() => setPublishedArticleId(null)}
              className="text-white hover:text-emerald-200 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {statusMessage && !publishedArticleId && (
        <div className="bg-slate-800 text-amber-300 p-3 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Form Body - Mobile Optimized Single Column Flow */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Step 1: Article Headline */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Article Headline (English) *
            </label>
            <span className="text-[11px] text-slate-400">Large font, authoritative</span>
          </div>
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. UN Security Council Adopts Multilateral Framework on Critical Infrastructure..."
            className="w-full font-serif-headline text-lg sm:text-2xl font-bold p-3 border border-slate-300 rounded focus:border-red-700 focus:ring-1 focus:ring-red-700 focus:outline-none text-slate-950"
          />

          {/* Bengali Headline translation */}
          <div className="mt-2 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-amber-600" />
              বাংলা শিরোনাম (Bengali Headline)
            </label>
            <button
              type="button"
              onClick={handleAutoTranslateFields}
              className="text-[11px] text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
            >
              Auto-generate Bengali
            </button>
          </div>
          <input
            type="text"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            placeholder="বাংলায় শিরোনাম লিখুন বা স্বয়ংক্রিয় অনুবাদের জন্য ক্লিক করুন..."
            className="w-full text-sm p-2 border border-slate-200 rounded mt-1 text-slate-800"
          />
        </div>

        {/* Step 2: Short Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            2. Short Summary (1–3 sentences) *
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief executive summary describing the core findings, location, and global significance..."
            className="w-full text-sm p-3 border border-slate-300 rounded focus:border-red-700 focus:outline-none text-slate-800 leading-relaxed"
          />
          <input
            type="text"
            value={summaryBn}
            onChange={(e) => setSummaryBn(e.target.value)}
            placeholder="বাংলা সারসংক্ষেপ (Bengali Summary)..."
            className="w-full text-xs p-2 border border-slate-200 rounded mt-1 text-slate-700"
          />
        </div>

        {/* Step 3: Native Photo Picker from Phone Gallery */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                3. Featured Photo &amp; Photo Gallery
              </span>
              <span className="text-[11px] text-slate-500">
                Direct phone gallery picker for iOS &amp; Android
              </span>
            </div>
            {featuredImage && (
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Primary Photo Ready
              </span>
            )}
          </div>

          {/* Action Buttons for Mobile Phone Gallery */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>UPLOAD FROM GALLERY</span>
            </button>

            <button
              type="button"
              onClick={() => multiPhotoInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Multiple Photos ({additionalImages.length})</span>
            </button>
          </div>

          {/* Upload Progress Bar */}
          {imageUploadProgress !== null && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                <span>Uploading high-resolution photographic asset...</span>
                <span>{imageUploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${imageUploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Featured Image Preview */}
          {featuredImage && (
            <div className="border border-slate-200 bg-white p-3 rounded mb-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <img
                  src={featuredImage.url}
                  alt="Featured preview"
                  className="w-full sm:w-36 h-24 object-cover rounded bg-slate-100"
                />
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold truncate">{featuredImage.filename}</span>
                    <span className="text-[11px] text-slate-400">
                      {(featuredImage.sizeBytes / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <input
                    type="text"
                    value={featuredImage.caption}
                    onChange={(e) =>
                      setFeaturedImage({ ...featuredImage, caption: e.target.value })
                    }
                    placeholder="Enter editorial caption for this photograph..."
                    className="w-full text-xs p-1.5 border border-slate-200 rounded"
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={featuredImage.credit}
                      onChange={(e) =>
                        setFeaturedImage({ ...featuredImage, credit: e.target.value })
                      }
                      placeholder="Photo credit (e.g. Associated Press / Correspondent)"
                      className="text-[11px] p-1 border border-slate-200 rounded w-2/3"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage(null)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Images Preview */}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
              {additionalImages.map((img, idx) => (
                <div key={img.id} className="relative group rounded overflow-hidden border border-slate-200 bg-white">
                  <img src={img.url} alt={img.caption} className="w-full h-20 object-cover" />
                  <button
                    type="button"
                    onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-[10px] hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Native Video Upload from Phone Gallery */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                4. Video Upload from Gallery
              </span>
              <span className="text-[11px] text-slate-500">
                Direct phone gallery picker (MP4, MOV, WEBM)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Video className="w-4 h-4" />
              <span>UPLOAD VIDEO FROM GALLERY</span>
            </button>
          </div>

          {/* Video Upload Progress */}
          {videoUploadProgress !== null && (
            <div className="mb-3 bg-white p-3 rounded border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>{videoUploadStatus || 'Uploading Video...'}</span>
                <span>{videoUploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-300"
                  style={{ width: `${videoUploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Video Items List */}
          {videos.length > 0 && (
            <div className="space-y-3">
              {videos.map((vid, vIdx) => (
                <div
                  key={vid.id}
                  className="border border-slate-200 bg-white p-3 rounded flex flex-col sm:flex-row gap-3 items-start"
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full sm:w-36 h-20 object-cover rounded bg-black"
                  />
                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {vid.format} &middot; {vid.duration}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {(vid.sizeBytes / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <input
                      type="text"
                      value={vid.caption}
                      onChange={(e) => {
                        const copy = [...videos];
                        copy[vIdx].caption = e.target.value;
                        setVideos(copy);
                      }}
                      placeholder="Video broadcast caption..."
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={vid.credit}
                        onChange={(e) => {
                          const copy = [...videos];
                          copy[vIdx].credit = e.target.value;
                          setVideos(copy);
                        }}
                        placeholder="Video credit"
                        className="text-[11px] p-1 border border-slate-200 rounded w-2/3"
                      />
                      <button
                        type="button"
                        onClick={() => setVideos(videos.filter((_, i) => i !== vIdx))}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 5: Full Article Body Blocks (Paragraphs, Mid-article images & videos) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              5. Full Article Body &amp; Multimedia Blocks
            </label>
            <span className="text-[11px] text-slate-500">
              Reorderable blocks (Paragraphs, Images, Quotes)
            </span>
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="border border-slate-200 bg-white p-3 rounded-lg shadow-2xs space-y-2"
              >
                {/* Block header & controls */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700 uppercase text-[10px]">
                    Block {index + 1}: {block.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1 hover:text-red-600 rounded cursor-pointer"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Paragraph input */}
                {block.type === 'paragraph' && (
                  <textarea
                    rows={3}
                    value={block.text || ''}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="Write authoritative paragraph text here..."
                    className="w-full text-sm p-2 border border-slate-200 rounded focus:border-red-700 focus:outline-none leading-relaxed"
                  />
                )}

                {/* Subheading input */}
                {block.type === 'subheading' && (
                  <input
                    type="text"
                    value={block.text || ''}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="Enter section subheading..."
                    className="w-full font-serif font-bold text-base p-2 border border-slate-200 rounded"
                  />
                )}

                {/* Quote input */}
                {block.type === 'quote' && (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={block.text || ''}
                      onChange={(e) => updateBlockText(block.id, e.target.value)}
                      placeholder='"Insert high-impact diplomatic or official quote here..."'
                      className="w-full font-serif italic text-sm p-2 border border-slate-200 rounded"
                    />
                    <input
                      type="text"
                      value={block.quoteAuthor || ''}
                      onChange={(e) => updateBlockQuoteAuthor(block.id, e.target.value)}
                      placeholder="Attribution (e.g., Ambassador, Ministry Official)"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded font-semibold"
                    />
                  </div>
                )}

                {/* Mid-paragraph image */}
                {block.type === 'image' && (
                  <div>
                    {block.media ? (
                      <div className="flex gap-3 items-center">
                        <img
                          src={block.media.url}
                          alt="Mid-article"
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 text-xs">
                          <input
                            type="text"
                            value={block.media.caption}
                            onChange={(e) => {
                              const copy = [...blocks];
                              if (copy[index].media) copy[index].media!.caption = e.target.value;
                              setBlocks(copy);
                            }}
                            placeholder="Inline image caption"
                            className="w-full p-1 border border-slate-200 rounded text-xs mb-1"
                          />
                          <input
                            type="text"
                            value={block.media.credit}
                            onChange={(e) => {
                              const copy = [...blocks];
                              if (copy[index].media) copy[index].media!.credit = e.target.value;
                              setBlocks(copy);
                            }}
                            placeholder="Credit"
                            className="w-full p-1 border border-slate-200 rounded text-[11px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          activeBlockForInlinePhoto.current = block.id;
                          inlinePhotoInputRef.current?.click();
                        }}
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded text-xs font-semibold text-slate-600 hover:border-slate-400 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-500" />
                        Select Inline Photo from Phone Gallery
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Block Toolbar */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => addBlock('paragraph')}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Paragraph
            </button>
            <button
              type="button"
              onClick={() => addBlock('subheading')}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Subheading
            </button>
            <button
              type="button"
              onClick={() => addBlock('quote')}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Quote
            </button>
            <button
              type="button"
              onClick={() => addBlock('image')}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" /> + Mid-Article Photo
            </button>
          </div>
        </div>

        {/* Step 6: Metadata (Category, Location, Author, Source) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white text-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Dateline / Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Geneva, Switzerland / Tokyo, Japan"
              className="w-full text-xs p-2.5 border border-slate-300 rounded text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Accredited Author *
            </label>
            <select
              value={selectedAuthorId}
              onChange={(e) => setSelectedAuthorId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white text-slate-900"
            >
              {authors.map((auth) => (
                <option key={auth.id} value={auth.id}>
                  {auth.name} — {auth.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Source Attribution *
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. UN Information Service / Reuters Wire"
              className="w-full text-xs p-2.5 border border-slate-300 rounded text-slate-900"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Tags &amp; Keywords
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag and press Enter..."
              className="flex-1 text-xs p-2 border border-slate-300 rounded"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-slate-800 text-white px-3 py-2 rounded text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-600 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Editorial flags (Breaking News & Lead Featured) */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-red-700">Mark as BREAKING NEWS</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <span>Set as Featured Lead Story</span>
          </label>
        </div>

        {/* Step 7: SEO Meta settings */}
        <div className="border border-slate-200 p-4 rounded-lg">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
            SEO &amp; Google News Search Optimization
          </span>
          <div className="space-y-2">
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="SEO Title (defaults to Headline if empty)"
              className="w-full text-xs p-2 border border-slate-200 rounded"
            />
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Meta Description (defaults to Summary if empty)"
              className="w-full text-xs p-2 border border-slate-200 rounded"
            />
          </div>
        </div>

        {/* Scheduled publication (optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Scheduled Publishing (Optional)
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="text-xs p-2 border border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Editor Actions Bottom Bar (SAVE DRAFT, PREVIEW, SCHEDULE, PUBLISH, DELETE, UNPUBLISH) */}
      <div className="bg-slate-900 text-white p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cancel / Exit */}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                if (title.trim() && !publishedArticleId) {
                  setExitConfirmOpen(true);
                } else {
                  onClose();
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-2.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
            </button>
          )}

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded text-xs transition-colors cursor-pointer"
          >
            {isBn ? 'ড্রাফট সংরক্ষণ' : 'SAVE DRAFT'}
          </button>

          {/* Unpublish if currently published */}
          {editingArticle && editingArticle.status === 'published' && (
            <button
              type="button"
              onClick={() => {
                unpublishArticle(editingArticle.id);
                setStatusMessage(isBn ? 'নিউজটি সফলভাবে আনপাবলিশ করে ড্রাফটে নেওয়া হয়েছে।' : 'Article unpublished and reverted to draft.');
                setTimeout(() => {
                  if (onClose) onClose();
                }, 1200);
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-3 py-2.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Take off live portal immediately"
            >
              <span>{isBn ? 'আনপাবলিশ করুন' : 'UNPUBLISH'}</span>
            </button>
          )}

          {/* Delete Article if editing */}
          {editingArticle && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800 px-3 py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title="Delete this article permanently"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>{isBn ? 'মুছে ফেলুন' : 'DELETE'}</span>
            </button>
          )}

          {/* Reporter Submit to Editor */}
          {currentRole === 'reporter' && (
            <button
              type="button"
              onClick={() => handleSave('pending_review')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded text-xs transition-colors cursor-pointer"
            >
              SUBMIT TO EDITOR
            </button>
          )}

          {/* Schedule */}
          {scheduledDate && (currentRole === 'admin' || currentRole === 'editor') && (
            <button
              type="button"
              onClick={() => handleSave('scheduled')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded text-xs transition-colors cursor-pointer"
            >
              SCHEDULE
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? (isBn ? 'প্রিভিউ বন্ধ' : 'Hide Preview') : (isBn ? 'প্রিভিউ দেখুন' : 'PREVIEW')}</span>
          </button>

          {/* ONE-CLICK PUBLISH BUTTON */}
          {(currentRole === 'admin' || currentRole === 'editor') && (
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBn ? 'সরাসরি প্রকাশ (পাবলিশ)' : 'PUBLISH NOW'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {exitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl border border-slate-300 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-900">
                {isBn ? 'ফর্ম থেকে বের হতে চান?' : 'Discard Unsaved Changes?'}
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isBn
                ? 'আপনি এই ফর্মটি কেটে দিলে যেকোনো অসংরক্ষিত তথ্য বা খসড়া মুছে যেতে পারে।'
                : 'Closing without saving will discard your recent edits in this form.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExitConfirmOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {isBn ? 'এডিট চালিয়ে যান' : 'Keep Editing'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitConfirmOpen(false);
                  if (onClose) onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-bold cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, বের হন (✕)' : 'Yes, Exit (✕)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation Dialog */}
      {confirmDeleteOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl border border-red-300 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-sm text-slate-900">
                {isBn ? 'নিউজটি স্থায়ীভাবে মুছবেন?' : 'Delete Article Permanently?'}
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isBn
                ? `"${editingArticle.title}" নিউজটি পোর্টাল থেকে সম্পূর্ণ মুছে ফেলা হবে। এই কাজ আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`
                : `Are you sure you want to permanently delete "${editingArticle.title}"? This action cannot be undone.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteArticle(editingArticle.id);
                  setConfirmDeleteOpen(false);
                  if (onClose) onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-bold cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live In-Editor Preview Drawer */}
      {showPreview && (
        <div className="border-t-2 border-amber-500 bg-[#fdfcf9] p-6">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
            [Live Reader Preview Mode]
          </div>
          <div className="text-xs font-bold text-red-700 uppercase mb-2">
            {category} &middot; {location}
          </div>
          <h1 className="font-serif-headline text-2xl sm:text-3xl font-bold text-slate-950 mb-3">
            {title || 'Untitled Report'}
          </h1>
          <p className="font-serif italic text-slate-700 mb-4 text-base">
            {summary}
          </p>
          {featuredImage && (
            <img
              src={featuredImage.url}
              alt="Preview"
              className="w-full aspect-16/9 object-cover rounded mb-4"
            />
          )}
          <div className="space-y-4 font-serif text-slate-800">
            {blocks.map((b) => (
              <p key={b.id}>{b.text}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
