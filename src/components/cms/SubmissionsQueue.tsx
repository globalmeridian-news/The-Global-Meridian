import React from 'react';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { UserNewsSubmission } from '../../types/news';
import { formatRelativeTime } from '../../utils/translation';

interface Props {
  onEditSubmission?: (submission: UserNewsSubmission) => void;
}

export const SubmissionsQueue: React.FC<Props> = ({ onEditSubmission }) => {
  const {
    submissions,
    updateSubmissionStatus,
    convertSubmissionToArticle,
    viewArticle,
    currentRole,
    currentLanguage,
  } = useNews();

  const handleApproveAndPublish = (sub: UserNewsSubmission) => {
    const article = convertSubmissionToArticle(sub.id);
    alert(`Submission approved and published live: "${article.title}"`);
    viewArticle(article.id);
  };

  return (
    <div className="space-y-6">
      {/* Editorial review banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Editorial Review Protocol:</strong> All public citizen submissions must undergo dual-source verification by an accredited editor before publication. Submissions in this queue are not publicly visible until explicitly approved.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-red-700" />
          <h3 className="font-serif-headline text-lg font-bold text-slate-900">
            {currentLanguage === 'bn' ? 'পাঠকদের পাঠানো সংবাদ ও প্রতিবেদন' : 'Reader News Submissions & Reports'} ({submissions.length})
          </h3>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs">
          {currentLanguage === 'bn' ? 'কোনো নতুন সংবাদ জমা নেই। সকল সাবমিশন সম্পন্ন হয়েছে।' : 'No pending news submissions. All reader submissions have been processed.'}
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isPending = sub.status === 'pending';

            return (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Category: {sub.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted {formatRelativeTime(sub.submittedAt, currentLanguage)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif-headline text-lg font-bold text-slate-900 mb-1">
                    {sub.headline}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.location}</span>
                    <span>&middot;</span>
                    <span>Contributor: {sub.authorName} ({sub.authorEmail})</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                    {sub.content}
                  </p>
                </div>

                {/* Attached media from citizen contributor */}
                {sub.media.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Attached Media Assets ({sub.media.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sub.media.map((m) => (
                        <div key={m.id} className="relative rounded overflow-hidden aspect-16/10 border border-slate-200">
                          <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source note */}
                <div className="text-[11px] text-slate-500">
                  <strong>Verification reference provided:</strong> {sub.sourceReference}
                </div>

                {/* Editorial Action Bar */}
                {(currentRole === 'admin' || currentRole === 'editor') && isPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveAndPublish(sub)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve &amp; Publish Live
                      </button>

                      <button
                        onClick={() => updateSubmissionStatus(sub.id, 'changes_requested')}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        Request Changes
                      </button>

                      <button
                        onClick={() => updateSubmissionStatus(sub.id, 'rejected')}
                        className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>

                    {onEditSubmission && (
                      <button
                        onClick={() => onEditSubmission(sub)}
                        className="text-xs text-slate-700 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit in Newsroom CMS
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
