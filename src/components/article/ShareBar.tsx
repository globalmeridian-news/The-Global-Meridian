import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Article } from '../../types/news';

interface Props {
  article: Article;
}

export const ShareBar: React.FC<Props> = ({ article }) => {
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : `https://meridian-news.org/world/${article.slug}`;
  const shareTitle = article.title;
  const shareSummary = article.summary;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: articleUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${shareTitle} via @TheGlobalMeridian`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareTitle} - ${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`The Global Meridian: ${shareTitle}`);
    const body = encodeURIComponent(`${shareTitle}\n\n${shareSummary}\n\nRead full report here: ${articleUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-y border-slate-200 my-6">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" />
        Share:
      </span>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
        title="Copy link to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>WhatsApp</span>
      </button>

      {/* X / Twitter */}
      <button
        onClick={handleTwitterShare}
        className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
        title="Share on X / Twitter"
      >
        <span className="font-bold">𝕏</span>
        <span>Post</span>
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookShare}
        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
        title="Share on Facebook"
      >
        <Send className="w-3.5 h-3.5 text-blue-600" />
        <span>Facebook</span>
      </button>

      {/* Email */}
      <button
        onClick={handleEmailShare}
        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
        title="Send via Email"
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Email</span>
      </button>

      {/* Native Mobile Share */}
      <button
        onClick={handleNativeShare}
        className="sm:hidden flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>More</span>
      </button>
    </div>
  );
};
