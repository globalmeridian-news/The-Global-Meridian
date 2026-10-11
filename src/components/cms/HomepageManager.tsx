import React, { useState } from 'react';
import {
  Layout,
  Star,
  Flame,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { HomepageSection } from '../../types/news';

export const HomepageManager: React.FC = () => {
  const { homepageConfig, updateHomepageConfig, articles } = useNews();
  const [selectedHeroId, setSelectedHeroId] = useState(homepageConfig.heroArticleId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const publishedArticles = articles.filter((a) => a.status === 'published');

  const handleHeroChange = (articleId: string) => {
    setSelectedHeroId(articleId);
    updateHomepageConfig({
      ...homepageConfig,
      heroArticleId: articleId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toggleSectionVisibility = (secId: string) => {
    const updatedSections = homepageConfig.sections.map((s) =>
      s.id === secId ? { ...s, visible: !s.visible } : s
    );
    updateHomepageConfig({ ...homepageConfig, sections: updatedSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homepageConfig.sections.length) return;
    const copy = [...homepageConfig.sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    updateHomepageConfig({ ...homepageConfig, sections: copy });
  };

  const updateSectionLimit = (secId: string, limit: number) => {
    const updatedSections = homepageConfig.sections.map((s) =>
      s.id === secId ? { ...s, limit } : s
    );
    updateHomepageConfig({ ...homepageConfig, sections: updatedSections });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-serif-headline text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-red-700" />
            Visual Homepage Manager &amp; Curation Engine
          </h3>
          <p className="text-xs text-slate-500">
            Control lead hero dispatches, breaking alerts, and editorial desk ordering without code.
          </p>
        </div>
        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Homepage Updated Live
          </span>
        )}
      </div>

      {/* 1. Lead Hero Story Picker */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Current Lead Hero Dispatch
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Select the foremost international story displayed in the top banner of the front page.
        </p>

        <select
          value={selectedHeroId}
          onChange={(e) => handleHeroChange(e.target.value)}
          className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white text-slate-900 font-medium"
        >
          {publishedArticles.map((art) => (
            <option key={art.id} value={art.id}>
              [{art.category}] {art.title} &mdash; {art.location}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Front Page Desk Sections Ordering */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
          Editorial Desk Layout &amp; Reordering
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Drag or move sections up/down to curate the thematic hierarchy of the front page.
        </p>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {homepageConfig.sections.map((section, idx) => (
            <div
              key={section.id}
              className={`p-3.5 flex items-center justify-between gap-4 ${
                section.visible ? 'bg-white' : 'bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 w-6">
                  {idx + 1}.
                </span>
                <div>
                  <div className="font-bold text-xs text-slate-900">{section.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Category: {section.category || 'General'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Limit selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-[11px]">Display:</span>
                  <select
                    value={section.limit}
                    onChange={(e) => updateSectionLimit(section.id, Number(e.target.value))}
                    className="p-1 border border-slate-200 rounded text-xs bg-white"
                  >
                    <option value={2}>2 stories</option>
                    <option value={3}>3 stories</option>
                    <option value={4}>4 stories</option>
                    <option value={6}>6 stories</option>
                  </select>
                </div>

                {/* Visibility */}
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                  title={section.visible ? 'Hide from Front Page' : 'Show on Front Page'}
                >
                  {section.visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Reorder controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === homepageConfig.sections.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
