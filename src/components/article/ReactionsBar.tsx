import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Article, ReactionType } from '../../types/news';

interface Props {
  article: Article;
}

const REACTIONS_CONFIG: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'support', emoji: '👏', label: 'Support' },
];

export const ReactionsBar: React.FC<Props> = ({ article }) => {
  const { reactToArticle } = useNews();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
        Reader Reactions
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS_CONFIG.map(({ type, emoji, label }) => {
          const count = article.reactions[type] || 0;
          const isSelected = article.userReactions?.[type];

          return (
            <button
              key={type}
              onClick={() => reactToArticle(article.id, type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-100 border border-amber-400 text-amber-950 font-bold scale-105 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
              title={`React with ${label}`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span className="font-semibold">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
