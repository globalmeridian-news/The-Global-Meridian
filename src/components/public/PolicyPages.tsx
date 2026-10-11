import React from 'react';
import { ShieldCheck, Mail, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';
import { useNews } from '../../context/NewsContext';

export const PolicyPages: React.FC = () => {
  const { policyPageSlug, setActiveView, viewArticle, articles, selectedAuthorId, authors } = useNews();

  // If viewing an author profile
  if (selectedAuthorId) {
    const author = authors.find((a) => a.id === selectedAuthorId) || authors[0];
    const authorArticles = articles.filter(
      (a) => a.author.id === author.id && a.status === 'published'
    );

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-700 font-semibold mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Newsroom Home
        </button>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-28 h-28 rounded-full object-cover border-2 border-slate-200"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
              {author.role}
            </span>
            <h1 className="font-serif-headline text-2xl sm:text-3xl font-bold text-slate-900">
              {author.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{author.title}</p>
            <p className="text-xs text-slate-700 leading-relaxed max-w-xl">{author.bio}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{author.email}</span>
              <span>{author.twitter}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif-headline text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
            Authored Dispatches &amp; Investigative Reports ({authorArticles.length})
          </h2>
          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
            {authorArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => viewArticle(art.id)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex gap-4 items-center"
              >
                <img
                  src={art.featuredImage.thumbnailUrl || art.featuredImage.url}
                  alt={art.title}
                  className="w-20 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-red-700 uppercase">
                    {art.category} &middot; {art.location}
                  </div>
                  <h3 className="font-serif-headline text-sm font-bold text-slate-900 hover:text-red-700 leading-snug">
                    {art.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Institutional Trust & Policy Pages Content
  const renderPolicyContent = () => {
    switch (policyPageSlug) {
      case 'editorial-policy':
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              Editorial Policy &amp; Standards of Verification
            </h1>
            <p className="lead text-base text-slate-700 mb-6">
              The Global Meridian operates under strict non-partisan international journalistic independence. Our mandate is to chronicle multilateral treaties, scientific advancements, and geopolitical developments with uncompromising accuracy.
            </p>
            <h2 className="font-serif-headline text-xl font-bold text-slate-900 mt-6 mb-2">
              1. Prohibition on Synthetic and Unverified News
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              The newsroom maintains an absolute ban on AI-generated fake news, simulated quotes, synthetic timestamps, or unverified wire leaks. Every dispatch requires on-the-record or double-blind verified corroboration from recognized sovereign, multilateral, or academic institutions.
            </p>
            <h2 className="font-serif-headline text-xl font-bold text-slate-900 mt-6 mb-2">
              2. Sourcing Requirements
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              All quantitative metrics (economic growth, atmospheric parts-per-million, clinical vaccine efficacy) must reference the issuing regulatory body or peer-reviewed journal.
            </p>
          </>
        );

      case 'fact-checking':
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              Fact-Checking &amp; Verification Protocol
            </h1>
            <p className="lead text-base text-slate-700 mb-6">
              Our fact-checking team independently verifies claims, video provenance, and statistical claims prior to publication.
            </p>
            <h2 className="font-serif-headline text-xl font-bold text-slate-900 mt-6 mb-2">
              Verification Methodology
            </h2>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2 mb-4">
              <li><strong>Photogrammetry &amp; Video Metadata:</strong> All citizen and bureau videos undergo frame analysis to verify geospatial location, shadows, and timestamps.</li>
              <li><strong>Diplomatic Confirmation:</strong> Sovereign treaties require dual confirmation from participating delegations.</li>
              <li><strong>Scientific Integrity:</strong> Peer-reviewed datasets must be referenced directly with primary DOI or institute releases.</li>
            </ul>
          </>
        );

      case 'corrections-policy':
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              Corrections &amp; Updates Policy
            </h1>
            <p className="lead text-base text-slate-700 mb-6">
              Transparency is the bedrock of reader trust. When factual errors occur, they are corrected immediately and noted with full public visibility.
            </p>
            <h2 className="font-serif-headline text-xl font-bold text-slate-900 mt-6 mb-2">
              Correction Notices
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Every revised article displays a dedicated "Corrections &amp; Updates Record" banner at the top of the article detailing the date, time, and nature of the amendment. We do not stealth-edit stories.
            </p>
          </>
        );

      case 'about-us':
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              About The Global Meridian
            </h1>
            <p className="lead text-base text-slate-700 mb-6">
              Founded as an independent international wire and digital newsroom, The Global Meridian serves diplomats, scientists, policy leaders, and engaged global citizens across 190 countries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <div className="font-bold text-sm text-slate-900 mb-1">Geneva Bureau</div>
                <div className="text-xs text-slate-500">Palais des Nations Press Suite</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <div className="font-bold text-sm text-slate-900 mb-1">Tokyo Bureau</div>
                <div className="text-xs text-slate-500">Chiyoda Diplomatic Quarter</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <div className="font-bold text-sm text-slate-900 mb-1">Washington Bureau</div>
                <div className="text-xs text-slate-500">National Press Building</div>
              </div>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              Newsroom Contacts &amp; Editorial Bureaus
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              For official correspondence, press releases, diplomatic inquiries, or correction requests:
            </p>
            <div className="space-y-3 text-xs bg-slate-50 p-6 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-700" />
                <span className="font-bold text-slate-900">Editorial Wire Desk:</span>
                <span className="text-slate-600">editor@meridian-news.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-700" />
                <span className="font-bold text-slate-900">Corrections Desk:</span>
                <span className="text-slate-600">corrections@meridian-news.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-700" />
                <span className="font-bold text-slate-900">Encrypted Whistle-Blower Line:</span>
                <span className="text-slate-600">tips@meridian-news.org</span>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <h1 className="font-serif-headline text-3xl font-bold text-slate-950 mb-4">
              Privacy Policy &amp; Terms of Service
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              We respect your digital privacy. The Global Meridian does not track reader telemetry for third-party commercial sale. Cookies are utilized strictly for user language preferences, role security, and session authentication.
            </p>
          </>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 font-serif">
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-1 font-sans text-xs text-slate-600 hover:text-red-700 font-semibold mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Newsroom Home
      </button>

      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs leading-relaxed">
        {renderPolicyContent()}
      </div>
    </div>
  );
};
