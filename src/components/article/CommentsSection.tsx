import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Flag,
  Reply,
  ShieldAlert,
  Trash2,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { Comment, SupportedLanguage } from '../../types/news';
import { formatRelativeTime } from '../../utils/translation';

interface Props {
  articleId: string;
}

export const CommentsSection: React.FC<Props> = ({ articleId }) => {
  const { comments, addComment, moderateComment, currentRole, currentLanguage } = useNews();

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Filter comments for this article
  const articleComments = comments.filter((c) => c.articleId === articleId);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(
      articleId,
      commentText.trim(),
      authorName.trim() || 'Verified Reader',
      authorEmail.trim() || 'reader@meridian-news.org'
    );

    setCommentText('');
    setAuthorName('');
    setAuthorEmail('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    addComment(
      articleId,
      replyText.trim(),
      authorName.trim() || 'Reader Contributor',
      authorEmail.trim() || 'reader@meridian-news.org',
      parentId
    );
    setReplyText('');
    setReplyingToId(null);
  };

  const handleReportComment = (commentId: string) => {
    moderateComment(commentId, 'flagged');
    setReportSuccess(commentId);
    setTimeout(() => setReportSuccess(null), 3000);
  };

  return (
    <section className="border-t border-slate-200 pt-8 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-700" />
          <h3 className="font-serif-headline text-xl font-bold text-slate-900">
            Reader Discussion ({articleComments.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500">Moderated Discussion Policy</span>
      </div>

      {/* Submission Form */}
      <form
        onSubmit={handleSubmitComment}
        className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8"
      >
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Add to the Discussion
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Your Name / Title (e.g., Diplomatic Analyst)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-700"
          />
          <input
            type="email"
            placeholder="Your Email (kept private for verification)"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-700"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Share your substantiated analysis or commentary on this dispatch..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
          className="w-full bg-white border border-slate-200 rounded p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-700 mb-3"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Adhere to civilized discourse standards. Unverified defamatory claims are auto-filtered.
          </span>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {articleComments.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No reader comments recorded yet. Be the first to add verified insight.
          </div>
        ) : (
          articleComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentRole={currentRole}
              currentLanguage={currentLanguage}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyText={replyText}
              setReplyText={setReplyText}
              handleSubmitReply={handleSubmitReply}
              handleReportComment={handleReportComment}
              moderateComment={moderateComment}
              reportSuccess={reportSuccess}
            />
          ))
        )}
      </div>
    </section>
  );
};

interface CardProps {
  comment: Comment;
  currentRole: string;
  currentLanguage: SupportedLanguage;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (txt: string) => void;
  handleSubmitReply: (id: string) => void;
  handleReportComment: (id: string) => void;
  moderateComment: (id: string, status: 'approved' | 'flagged' | 'hidden' | 'deleted') => void;
  reportSuccess: string | null;
}

const CommentCard: React.FC<CardProps> = ({
  comment,
  currentRole,
  currentLanguage,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  handleSubmitReply,
  handleReportComment,
  moderateComment,
  reportSuccess,
}) => {
  const isHidden = comment.status === 'hidden';
  const isFlagged = comment.status === 'flagged';

  return (
    <div className={`p-4 rounded-lg border ${isFlagged ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {comment.avatar ? (
            <img src={comment.avatar} alt={comment.userName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              {comment.userName.charAt(0)}
            </div>
          )}
          <span className="font-bold text-xs text-slate-900">{comment.userName}</span>
          <span className="text-slate-400">&middot;</span>
          <span className="text-[11px] text-slate-500">{formatRelativeTime(comment.createdAt, currentLanguage)}</span>
        </div>

        {/* Flag status indicator */}
        {isFlagged && (
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-700" /> Under Editorial Review
          </span>
        )}
      </div>

      <p className="text-xs text-slate-700 leading-relaxed mb-3">
        {isHidden ? <span className="italic text-slate-400">[This comment was hidden by newsroom moderators]</span> : comment.content}
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{comment.likes}</span>
          </button>
          <button
            onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
            className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
          <button
            onClick={() => handleReportComment(comment.id)}
            className="flex items-center gap-1 hover:text-red-700 cursor-pointer"
            title="Report inappropriate content"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{reportSuccess === comment.id ? 'Reported' : 'Report'}</span>
          </button>
        </div>

        {/* Admin/Editor Moderation Toolbar */}
        {(currentRole === 'admin' || currentRole === 'editor') && (
          <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded text-[11px]">
            <span className="font-bold text-slate-500 uppercase text-[9px]">Mod:</span>
            {comment.status !== 'approved' && (
              <button
                onClick={() => moderateComment(comment.id, 'approved')}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                title="Approve Comment"
              >
                <CheckCircle className="w-3 h-3" /> Approve
              </button>
            )}
            <button
              onClick={() => moderateComment(comment.id, isHidden ? 'approved' : 'hidden')}
              className="text-amber-700 hover:underline flex items-center gap-0.5"
              title="Hide / Unhide"
            >
              <EyeOff className="w-3 h-3" /> {isHidden ? 'Unhide' : 'Hide'}
            </button>
            <button
              onClick={() => moderateComment(comment.id, 'deleted')}
              className="text-red-700 hover:underline flex items-center gap-0.5"
              title="Permanently Delete"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Reply input */}
      {replyingToId === comment.id && (
        <div className="mt-3 pl-4 border-l-2 border-slate-300">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a concise reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs"
            />
            <button
              onClick={() => handleSubmitReply(comment.id)}
              className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-2">
          {comment.replies.map((rep) => (
            <div key={rep.id} className="bg-slate-50 p-2.5 rounded text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <span>{rep.userName}</span>
                <span className="text-slate-400 font-normal">&middot; {formatRelativeTime(rep.createdAt, currentLanguage)}</span>
              </div>
              <p className="text-slate-700">{rep.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
