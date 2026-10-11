import React from 'react';
import { ShieldCheck, Rss, FileCode, CheckCircle2 } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { CategoryType } from '../../types/news';
import { getLocalizedCategory } from '../../utils/translation';

export const Footer: React.FC = () => {
  const { currentLanguage, viewCategory, viewPolicy, setActiveView, isAuthenticated } = useNews();

  const categories: CategoryType[] = [
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

  return (
    <footer className="bg-slate-950 text-slate-300 text-xs border-t-4 border-red-600 mt-16">
      {/* Editorial Principles & Transparency Banner */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">
                Commitment to Verified International Journalism
              </div>
              <div className="text-slate-400 text-xs">
                The Global Meridian enforces strict anti-misinformation safeguards. All reports are verified through accredited diplomatic bureaus, scientific registries, and institutional wire records.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-slate-400">
            <span className="flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Fact-Checked
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Dual-Sourced
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Transparent Corrections
            </span>
          </div>
        </div>
      </div>

      {/* Main Directory */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Identity */}
          <div className="col-span-2">
            <div className="font-serif-headline text-2xl font-black text-white tracking-tight">
              THE GLOBAL MERIDIAN
            </div>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-sm">
              An independent international news organization founded to deliver high-trust, fast, and analytical coverage of global geopolitics, climate adaptation, science breakthroughs, and economic developments.
            </p>
            {isAuthenticated && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setActiveView('seo')}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  <Rss className="w-3.5 h-3.5" />
                  {currentLanguage === 'bn' ? 'এডমিন: আরএসএস ও সাইটম্যাপ' : 'Admin: RSS Feeds & Sitemaps'}
                </button>
              </div>
            )}
          </div>

          {/* Col 2: News Desks */}
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Editorial Desks
            </div>
            <ul className="space-y-1.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => viewCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {getLocalizedCategory(cat, currentLanguage)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Specialized Coverage */}
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Global Coverage
            </div>
            <ul className="space-y-1.5">
              {categories.slice(5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => viewCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {getLocalizedCategory(cat, currentLanguage)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Editorial Governance */}
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Trust &amp; Governance
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => viewPolicy('editorial-policy')}
                  className="hover:text-white cursor-pointer"
                >
                  Editorial Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('fact-checking')}
                  className="hover:text-white cursor-pointer"
                >
                  Fact-Checking Standard
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('corrections-policy')}
                  className="hover:text-white cursor-pointer"
                >
                  Corrections &amp; Updates
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('privacy-policy')}
                  className="hover:text-white cursor-pointer"
                >
                  Privacy &amp; Data Rights
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('terms-of-service')}
                  className="hover:text-white cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('about-us')}
                  className="hover:text-white cursor-pointer"
                >
                  About the Newsroom
                </button>
              </li>
              <li>
                <button
                  onClick={() => viewPolicy('contact')}
                  className="hover:text-white cursor-pointer"
                >
                  Contact &amp; Press Bureau
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; 2026 The Global Meridian Publishing Group. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <button onClick={() => setActiveView('seo')} className="hover:text-slate-300 flex items-center gap-1 cursor-pointer">
                  <FileCode className="w-3 h-3" />
                  <span>Google News Sitemap (Admin)</span>
                </button>
                <span>&middot;</span>
              </>
            )}
            <button onClick={() => viewPolicy('cookie-policy')} className="hover:text-slate-300 cursor-pointer">
              Cookie Management
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
