import React, { useState, useRef } from 'react';
import {
  Send,
  X,
  Camera,
  Video,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  Lock,
  ArrowLeft,
  Trash2,
  Upload,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { CategoryType, MediaItem, MediaVideo } from '../../types/news';

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
];

const CATEGORY_NAMES_BN: Record<CategoryType, string> = {
  World: 'বাংলাদেশ ও বিশ্ব (World)',
  Politics: 'রাজনীতি (Politics)',
  Business: 'বাণিজ্য ও অর্থনীতি (Business)',
  Technology: 'তথ্যপ্রযুক্তি (Technology)',
  Science: 'বিজ্ঞান ও গবেষণা (Science)',
  Health: 'স্বাস্থ্য ও চিকিৎসা (Health)',
  Defense: 'প্রতিরক্ষা ও নিরাপত্তা (Defense)',
  Environment: 'পরিবেশ ও জলবায়ু (Environment)',
  Sports: 'খেলাধুলা (Sports)',
  Entertainment: 'বিনোদন ও সংস্কৃতি (Entertainment)',
  Videos: 'ভিডিও রিপোর্ট (Videos)',
  'Photo Stories': 'ছবি ও চিত্রনাট্য (Photo Stories)',
  Opinion: 'মতামত ও সম্পাদকীয় (Opinion)',
};

export const SubmitNewsModal: React.FC = () => {
  const { setActiveView, submitUserNews, currentLanguage } = useNews();
  const isBn = currentLanguage === 'bn';

  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CategoryType>('World');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const newMedia: MediaItem = {
          id: 'sub-p-' + Date.now() + '-' + idx,
          type: 'image',
          url: dataUrl,
          thumbnailUrl: dataUrl,
          filename: file.name,
          sizeBytes: file.size,
          caption: 'Contributor uploaded photo',
          credit: authorName || 'Citizen Contributor',
          uploadedAt: new Date().toISOString(),
        };
        setPhotos((prev) => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const videoUrl = URL.createObjectURL(file);

    const newVideo: MediaVideo = {
      id: 'sub-v-' + Date.now(),
      url: videoUrl,
      thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80',
      caption: 'Contributor footage: ' + file.name,
      credit: authorName || 'Citizen Contributor',
      duration: '01:30',
      sizeBytes: file.size,
      format: 'MP4',
    };
    setVideos((prev) => [...prev, newVideo]);
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !content.trim()) return;

    submitUserNews({
      headline: headline.trim(),
      location: location.trim() || 'Global',
      reportDate,
      category,
      sourceReference: sourceReference.trim() || 'First-hand observation',
      content: content.trim(),
      authorName: authorName.trim() || 'Anonymous Contributor',
      authorEmail: authorEmail.trim() || 'tip@meridian-news.org',
      authorPhone: authorPhone.trim(),
      media: photos,
      videos,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs overflow-y-auto overscroll-contain">
      {/* Hidden inputs for native mobile phone gallery pickers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Responsive layout container: Full-width on mobile without desktop mode, elegant modal on tablet/desktop */}
      <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6">
        <div className="bg-white w-full sm:max-w-2xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col my-0 sm:my-8 animate-in zoom-in-95 duration-150">
          
          {/* Sticky Header: Always accessible on mobile without desktop mode */}
          <div className="sticky top-0 z-30 bg-slate-950 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-full transition-colors cursor-pointer"
                title={isBn ? 'প্রধান পাতায় ফিরুন' : 'Back to News'}
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-amber-400" />
              </button>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 block leading-tight">
                  {isBn ? 'নাগরিক সাংবাদিকতা ডেস্ক · সুরক্ষিত সাবমিশন' : 'Citizen Reporting Desk · Secure Submission'}
                </span>
                <h2 className="font-serif-headline text-lg sm:text-xl font-bold leading-tight text-white">
                  {isBn ? 'নিউজ সাবমিট করুন' : 'Submit News / Eyewitness Report'}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 active:bg-slate-700 rounded-full transition-colors cursor-pointer"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mandatory Editorial Review Warning Box */}
          <div className="bg-amber-50 border-b border-amber-200/90 px-4 py-3 sm:px-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="font-bold text-amber-900">
                {isBn ? 'সম্পাদকীয় যাচাই ও সত্যতা নিশ্চিতকরণ:' : 'Mandatory Fact-Checking:'}
              </strong>{' '}
              {isBn
                ? 'আন্তর্জাতিক সাংবাদিকতার মান ও বস্তুনিষ্ঠতা বজায় রাখতে আপনার পাঠানো সংবাদ সম্পাদকীয় প্যানেলে ফ্যাক্ট-চেক ও তথ্য যাচাইয়ের পর মূল পোর্টালে প্রকাশিত হবে।'
                : 'To maintain international credibility, citizen submissions undergo fact-checking by Meridian bureau editors before public release.'}
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-6 sm:p-10 text-center space-y-4 my-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif-headline text-2xl font-bold text-slate-900">
                {isBn ? 'সংবাদ সফলভাবে জমা হয়েছে!' : 'News Report Received!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {isBn
                  ? 'জনস্বার্থে তথ্য প্রদানের জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার পাঠানো প্রতিবেদনটি বার্তা কক্ষে পৌঁছেছে। সম্পাদকীয় প্যানেলের যাচাই শেষে যথাযথ ক্রেডিট সহকারে এটি প্রকাশ করা হবে।'
                  : 'Thank you for contributing to public-interest journalism. Your report has been dispatched to our review desk. If verification succeeds, our editors will publish it with proper attribution.'}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 active:bg-slate-800 text-white font-bold px-8 py-3 rounded-lg text-sm shadow-md transition-all cursor-pointer"
                >
                  {isBn ? 'প্রধান পাতায় ফিরে যান' : 'Return to Front Page'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-slate-800">
              
              {/* 1. Headline */}
              <div>
                <label className="block font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>{isBn ? 'সংবাদের শিরোনাম / কী ঘটেছে? *' : 'Headline / What Happened? *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={
                    isBn
                      ? 'ঘটনা বা সংবাদের সারসংক্ষেপ স্পষ্টভাবে লিখুন...'
                      : 'Clear, factual summary of the event or discovery...'
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg font-serif-headline font-bold text-base text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden transition-all"
                />
              </div>

              {/* 2. Category, Location, Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-800 text-xs uppercase mb-1">
                    {isBn ? 'বিভাগ / ক্যাটাগরি *' : 'Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg bg-white text-base sm:text-xs text-slate-900 font-medium focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {isBn ? CATEGORY_NAMES_BN[cat] : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-slate-800 text-xs uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    <span>{isBn ? 'স্থান (শহর, দেশ) *' : 'Location *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isBn ? 'যেমন: ঢাকা, বাংলাদেশ' : 'e.g. Geneva, Switzerland'}
                    className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block font-bold text-slate-800 text-xs uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>{isBn ? 'ঘটনার তারিখ' : 'Date of Event'}</span>
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                  />
                </div>
              </div>

              {/* 3. Full Story / Eyewitness Details */}
              <div>
                <label className="block font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider mb-1.5">
                  {isBn ? 'বিস্তারিত সংবাদ বিবরণী / চাক্ষুষ প্রতিবেদন *' : 'Full Eyewitness Report / Details *'}
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isBn
                      ? 'ঘটনাটি কীভাবে ঘটল, কারা জড়িত ছিলেন, প্রত্যক্ষদর্শীর বিবরণ ও প্রাসঙ্গিক সমস্ত তথ্য বিস্তারিত লিখুন...'
                      : 'Describe what occurred, who was involved, official statements witnessed, and corroborating circumstances...'
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 leading-relaxed placeholder:text-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden transition-all"
                />
              </div>

              {/* 4. Photo & Video Upload directly from Phone Gallery / Camera */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-red-600" />
                    <span>{isBn ? 'ছবি ও ভিডিও সংযুক্ত করুন (গ্যালারি / ক্যামেরা)' : 'Upload Media from Phone / Camera'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {photos.length + videos.length > 0 && `${photos.length + videos.length} টি ফাইল`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black active:bg-slate-800 text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isBn
                        ? `গ্যালারি থেকে ছবি যোগ করুন (${photos.length})`
                        : `Upload Photos from Gallery (${photos.length})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Video className="w-4 h-4 text-white shrink-0" />
                    <span>
                      {isBn
                        ? `ভিডিও যোগ করুন (${videos.length})`
                        : `Upload Video from Gallery (${videos.length})`}
                    </span>
                  </button>
                </div>

                {/* Uploaded Photos Preview */}
                {photos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                      {isBn ? 'সংযুক্ত ছবিসমূহ:' : 'Attached Photos:'}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {photos.map((p) => (
                        <div key={p.id} className="relative aspect-16/10 rounded-lg overflow-hidden border border-slate-300 group shadow-xs">
                          <img src={p.url} alt="Uploaded" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(p.id)}
                            className="absolute top-1 right-1 bg-black/75 hover:bg-red-700 text-white p-1 rounded-full transition-colors cursor-pointer"
                            title={isBn ? 'মুছে ফেলুন' : 'Remove photo'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded Videos Preview */}
                {videos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                      {isBn ? 'সংযুক্ত ভিডিও:' : 'Attached Videos:'}
                    </span>
                    <div className="space-y-1.5">
                      {videos.map((v) => (
                        <div key={v.id} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Video className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="truncate text-slate-700 font-medium">{v.caption}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(v.id)}
                            className="text-red-600 hover:text-red-800 p-1 cursor-pointer shrink-0"
                            title={isBn ? 'মুছে ফেলুন' : 'Remove video'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Source Reference */}
              <div>
                <label className="block font-bold text-slate-800 text-xs uppercase mb-1">
                  {isBn ? 'তথ্যসূত্র / দলিলপত্র বা প্রমাণ (ঐচ্ছিক)' : 'Corroborating Source / Reference (Optional)'}
                </label>
                <input
                  type="text"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  placeholder={
                    isBn
                      ? 'যেমন: প্রত্যক্ষদর্শী, সরকারি প্রেস ব্রিফিং বা প্রকাশিত নথি...'
                      : 'e.g. Municipal public records, municipal authority press briefing...'
                  }
                  className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                />
              </div>

              {/* 6. Contact info */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase block mb-2.5">
                  {isBn ? 'প্রতিবেদক / প্রেরকের তথ্য (গোপনীয় রাখা হবে)' : 'Contributor Contact Info (Confidential)'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{isBn ? 'আপনার পুরো নাম *' : 'Your Full Name *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={isBn ? 'নাম লিখুন' : 'Jane Doe'}
                      className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{isBn ? 'ইমেইল (গোপনীয়) *' : 'Contact Email *'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder={isBn ? 'আপনার ইমেইল' : 'jane@example.com'}
                      className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{isBn ? 'ফোন নম্বর (ঐচ্ছিক)' : 'Phone (Optional)'}</span>
                    </label>
                    <input
                      type="tel"
                      value={authorPhone}
                      onChange={(e) => setAuthorPhone(e.target.value)}
                      placeholder="+880 1..."
                      className="w-full p-2.5 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Action Bar: Touch-friendly on mobile phone without desktop mode */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 sm:py-0">
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">
                    {isBn
                      ? 'হুইসलब्লোয়ার ও নাগরিক তথ্য সুরক্ষা নীতি দ্বারা সুরক্ষিত।'
                      : 'Protected by newsroom whistle-blower safeguards.'}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-6 py-3 rounded-full uppercase tracking-wider text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'সংবাদ সাবমিট করুন' : 'Submit News for Verification'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
