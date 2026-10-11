import React, { useState, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle,
  X,
  Eye,
  MousePointerClick,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { Advertisement, AdPosition } from '../../types/news';

export const AdsManager: React.FC = () => {
  const { ads, addAd, updateAd, deleteAd, currentLanguage } = useNews();

  const [isCreating, setIsCreating] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [position, setPosition] = useState<AdPosition>('header_top');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('https://');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBn = currentLanguage === 'bn';

  const resetForm = () => {
    setTitle('');
    setSponsorName('');
    setPosition('header_top');
    setImageUrl('');
    setTargetUrl('https://');
    setIsActive(true);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setEditingAdId(null);
    setIsCreating(false);
  };

  const handlePhotoUploadFromPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sponsorName.trim() || !imageUrl.trim()) {
      alert(isBn ? 'অনুগ্রহ করে শিরোনাম, স্পন্সর এবং ছবি পূরণ করুন।' : 'Please enter title, sponsor name, and banner image.');
      return;
    }

    if (editingAdId) {
      updateAd(editingAdId, {
        title,
        sponsorName,
        position,
        imageUrl,
        targetUrl,
        isActive,
        startDate,
        endDate,
      });
      setToastMessage(isBn ? 'বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!' : 'Advertisement updated successfully!');
    } else {
      addAd({
        title,
        sponsorName,
        position,
        imageUrl,
        targetUrl,
        isActive,
        startDate,
        endDate,
      });
      setToastMessage(isBn ? 'নতুন বিজ্ঞাপন সফলভাবে তৈরি হয়েছে!' : 'New advertisement created successfully!');
    }

    setTimeout(() => setToastMessage(null), 3000);
    resetForm();
  };

  const startEdit = (ad: Advertisement) => {
    setTitle(ad.title);
    setSponsorName(ad.sponsorName);
    setPosition(ad.position);
    setImageUrl(ad.imageUrl);
    setTargetUrl(ad.targetUrl);
    setIsActive(ad.isActive);
    setStartDate(ad.startDate || '');
    setEndDate(ad.endDate || '');
    setEditingAdId(ad.id);
    setIsCreating(true);
  };

  const getPositionLabel = (pos: AdPosition) => {
    switch (pos) {
      case 'header_top':
        return isBn ? 'হেডার শীর্ষ ব্যানার' : 'Top Header Leaderboard';
      case 'home_middle':
        return isBn ? 'হোমপেজ মাঝের ব্যানার' : 'Homepage Middle Banner';
      case 'article_sidebar':
        return isBn ? 'আর্টিকেল সাইডবার ব্যানার' : 'In-Article Sidebar MPU';
      case 'article_inline':
        return isBn ? 'আর্টিকেলের ভেতরের স্পন্সর কার্ড' : 'In-Article Sponsored Card';
      case 'footer_top':
        return isBn ? 'ফুটার ব্যানার' : 'Footer Banner';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Mobile Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUploadFromPhone}
        className="hidden"
      />

      {/* Header & New Ad Button */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {isBn ? 'বিজ্ঞাপন ও স্পন্সরশিপ ম্যানেজমেন্ট' : 'Monetization & Ads'}
            </span>
          </div>
          <h2 className="font-serif-headline text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-red-600" />
            <span>{isBn ? 'বিজ্ঞাপন পরিচালনা ও প্রচার' : 'Advertisement Campaigns Manager'}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {isBn
              ? 'ওয়েবসাইটের বিভিন্ন স্থানে (হেডার, আর্টিকেল, হোমপেজ) বিজ্ঞাপন যুক্ত করুন বা ফোন গ্যালারি থেকে ব্যানার আপলোড করুন।'
              : 'Deploy sponsor banners, leaderboard slots, and track clicks across desktop & mobile screens.'}
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? '+ নতুন বিজ্ঞাপন যোগ করুন' : '+ Create New Ad'}</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Create / Edit Form Modal / Card with Prominent ✕ Close Button */}
      {isCreating && (
        <div className="bg-white border-2 border-amber-400 rounded-lg p-5 shadow-lg relative animate-in fade-in">
          {/* Prominent Touch-Friendly Close ✕ Button */}
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title={isBn ? 'ফর্মটি বন্ধ করুন' : 'Close form'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {editingAdId ? (isBn ? 'বিজ্ঞাপন সম্পাদনা' : 'Edit Campaign') : (isBn ? 'নতুন বিজ্ঞাপন ফরম' : 'New Ad Campaign')}
            </span>
            <h3 className="text-lg font-bold text-slate-950 font-serif-headline">
              {editingAdId
                ? (isBn ? 'বিদ্যমান বিজ্ঞাপন তথ্য সংশোধন' : 'Modify Campaign Details')
                : (isBn ? 'নতুন বিজ্ঞাপনের তথ্য পূরণ করুন' : 'Setup Advertisement Slot')}
            </h3>
          </div>

          <form onSubmit={handleSaveAd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম *' : 'Ad Title / Campaign Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isBn ? 'যেমন: গ্লোবাল এয়ার ট্রানজিট ফোরাম ২০২৬' : 'e.g., Global Green Tech Summit 2026'}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'স্পন্সর / প্রতিষ্ঠানের নাম *' : 'Sponsor / Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder={isBn ? 'যেমন: Helvetia Financial Group' : 'e.g., Zurich Air Alliance'}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'বিজ্ঞাপনের অবস্থান (Slot / Placement) *' : 'Ad Slot Placement *'}
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as AdPosition)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden bg-white"
                >
                  <option value="header_top">{isBn ? '১. হেডার শীর্ষ ব্যানার (Top Leaderboard)' : '1. Top Header Leaderboard'}</option>
                  <option value="home_middle">{isBn ? '২. হোমপেজ মাঝের ব্যানার (Home Mid-Break)' : '2. Homepage Middle Banner'}</option>
                  <option value="article_inline">{isBn ? '৩. আর্টিকেলের ভেতর স্পন্সর কার্ড (In-Article)' : '3. In-Article Sponsored Card'}</option>
                  <option value="article_sidebar">{isBn ? '৪. আর্টিকেল সাইডবার ব্যানার (Article Sidebar)' : '4. In-Article Sidebar MPU'}</option>
                  <option value="footer_top">{isBn ? '৫. ফুটার ব্যানার (Footer Strip)' : '5. Footer Strip Banner'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ক্লিক করলে যে লিংকে যাবে (Target URL) *' : 'Target URL Destination *'}
                </label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com/sponsor-offer"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Banner Image - Phone Gallery Upload or Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'বিজ্ঞাপনের ছবি / ব্যানার *' : 'Banner Image Asset *'}
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={isBn ? 'ছবির লিংক দিন অথবা ফোনের গ্যালারি থেকে আপলোড করুন' : 'Paste image URL or upload from mobile gallery'}
                  className="flex-1 text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />

                {/* Mobile Gallery Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-black text-white px-3.5 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'গ্যালারি থেকে ছবি নিন' : 'Upload from Phone'}</span>
                </button>
              </div>

              {imageUrl && (
                <div className="mt-2 relative w-full h-32 rounded bg-slate-900 overflow-hidden border border-slate-200">
                  <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700"
                    title={isBn ? 'ছবি মুছুন' : 'Remove Image'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Campaign Duration & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'শেষ তারিখ (ঐচ্ছিক)' : 'End Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-800">
                  {isActive ? (isBn ? 'সক্রিয় বিজ্ঞাপন' : 'Active Ad') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Save & Close (✕) */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded text-xs cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isBn ? 'বাতিল করুন (✕)' : 'Cancel & Close'}</span>
              </button>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{editingAdId ? (isBn ? 'আপডেট সংরক্ষণ করুন' : 'Update Campaign') : (isBn ? 'বিজ্ঞাপন প্রকাশ করুন' : 'Deploy Ad')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            {isBn ? `মোট বিজ্ঞাপন তালিকা (${ads.length})` : `Campaigns Directory (${ads.length})`}
          </span>
          <span className="text-[11px] text-slate-500">
            {ads.filter((a) => a.isActive).length} {isBn ? 'সক্রিয়' : 'active'}
          </span>
        </div>

        {ads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {isBn ? 'বর্তমানে কোনো বিজ্ঞাপন চালু নেই। উপরের বোতামে ক্লিক করে নতুন বিজ্ঞাপন দিন।' : 'No ads registered. Click "+ Create New Ad" above to launch a campaign.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Ad Preview & Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-16 h-12 rounded object-cover border border-slate-200 shrink-0 bg-slate-900"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                        {getPositionLabel(ad.position)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          ad.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {ad.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Paused')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-950 text-sm truncate max-w-xs sm:max-w-md">
                      {ad.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{ad.sponsorName}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <MousePointerClick className="w-3 h-3 text-red-600" />
                        {ad.clicks || 0} {isBn ? 'ক্লিক' : 'clicks'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Toggle Active/Inactive */}
                  <button
                    onClick={() => updateAd(ad.id, { isActive: !ad.isActive })}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      ad.isActive
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                    title={ad.isActive ? 'Pause campaign' : 'Activate campaign'}
                  >
                    {ad.isActive ? (isBn ? 'সাময়িক বন্ধ' : 'Pause') : (isBn ? 'সক্রিয় করুন' : 'Activate')}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => startEdit(ad)}
                    className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded cursor-pointer"
                    title={isBn ? 'সম্পাদনা করুন' : 'Edit Ad'}
                  >
                    <Megaphone className="w-4 h-4 text-slate-700" />
                  </button>

                  {/* Delete */}
                  {confirmDeleteId === ad.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                      <span className="text-[10px] text-red-800 font-bold">{isBn ? 'নিশ্চিত?' : 'Confirm?'}</span>
                      <button
                        onClick={() => {
                          deleteAd(ad.id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-700"
                      >
                        {isBn ? 'হ্যাঁ, মুছুন' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-slate-600 text-[10px] px-1 hover:text-slate-950 cursor-pointer"
                      >
                        {isBn ? 'না' : 'No'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(ad.id)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      title={isBn ? 'বিজ্ঞাপন মুছে ফেলুন' : 'Delete Ad'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
