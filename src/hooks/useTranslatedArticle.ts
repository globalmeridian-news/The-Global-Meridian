import { useState, useEffect } from 'react';
import { Article, ContentBlock, SupportedLanguage } from '../types/news';
import {
  getCachedTranslation,
  translateText,
  subscribeTranslation,
} from '../utils/translationService';

export interface TranslatedArticleResult {
  title: string;
  summary: string;
  location: string;
  caption: string;
  authorName: string;
  authorTitle: string;
  authorBio: string;
  blocks: ContentBlock[];
  isTranslating: boolean;
}

export function useTranslatedArticle(
  article: Article | undefined | null,
  lang: SupportedLanguage
): TranslatedArticleResult {
  const getInitialState = (): TranslatedArticleResult => {
    if (!article) {
      return {
        title: '',
        summary: '',
        location: '',
        caption: '',
        authorName: '',
        authorTitle: '',
        authorBio: '',
        blocks: [],
        isTranslating: false,
      };
    }

    if (lang === 'en') {
      return {
        title: article.title,
        summary: article.summary,
        location: article.location,
        caption: article.featuredImage?.caption || '',
        authorName: article.author?.name || '',
        authorTitle: article.author?.title || '',
        authorBio: article.author?.bio || '',
        blocks: article.blocks || [],
        isTranslating: false,
      };
    }

    if (lang === 'bn') {
      return {
        title: article.title_bn || article.title,
        summary: article.summary_bn || article.summary,
        location: article.location_bn || article.location,
        caption: article.featuredImage?.caption_bn || article.featuredImage?.caption || '',
        authorName: article.author?.name_bn || article.author?.name || '',
        authorTitle: article.author?.title_bn || article.author?.title || '',
        authorBio: article.author?.bio || '',
        blocks: (article.blocks || []).map((b) => ({
          ...b,
          text: b.text_bn || b.text,
          quoteAuthor: b.quoteAuthor_bn || b.quoteAuthor,
          media: b.media
            ? {
                ...b.media,
                caption: b.media.caption_bn || b.media.caption,
              }
            : undefined,
        })),
        isTranslating: false,
      };
    }

    // Check synchronous cache
    const cachedTitle = getCachedTranslation(article.title, lang);
    const cachedSummary = getCachedTranslation(article.summary, lang);
    const cachedLocation = getCachedTranslation(article.location, lang);
    const cachedCaption = article.featuredImage?.caption
      ? getCachedTranslation(article.featuredImage.caption, lang)
      : '';
    const cachedAuthorName = article.author?.name
      ? getCachedTranslation(article.author.name, lang)
      : '';
    const cachedAuthorTitle = article.author?.title
      ? getCachedTranslation(article.author.title, lang)
      : '';
    const cachedAuthorBio = article.author?.bio
      ? getCachedTranslation(article.author.bio, lang)
      : '';

    const cachedBlocks = (article.blocks || []).map((b) => ({
      ...b,
      text: b.text ? getCachedTranslation(b.text, lang) || b.text : '',
      quoteAuthor: b.quoteAuthor ? getCachedTranslation(b.quoteAuthor, lang) || b.quoteAuthor : undefined,
      media: b.media
        ? {
            ...b.media,
            caption: b.media.caption
              ? getCachedTranslation(b.media.caption, lang) || b.media.caption
              : b.media.caption,
          }
        : undefined,
    }));

    const isFullyCached =
      Boolean(cachedTitle) &&
      Boolean(cachedSummary) &&
      (article.blocks || []).every((b) => !b.text || Boolean(getCachedTranslation(b.text, lang)));

    return {
      title: cachedTitle || article.title,
      summary: cachedSummary || article.summary,
      location: cachedLocation || article.location,
      caption: cachedCaption || article.featuredImage?.caption || '',
      authorName: cachedAuthorName || article.author?.name || '',
      authorTitle: cachedAuthorTitle || article.author?.title || '',
      authorBio: cachedAuthorBio || article.author?.bio || '',
      blocks: cachedBlocks,
      isTranslating: !isFullyCached,
    };
  };

  const [state, setState] = useState<TranslatedArticleResult>(getInitialState);

  // Subscribe to live translations arriving via background requests
  useEffect(() => {
    if (!article || lang === 'en') return;

    const unsubscribe = subscribeTranslation((updatedLang) => {
      if (updatedLang === lang) {
        // Refresh with latest cache
        setState(getInitialState());
      }
    });

    return unsubscribe;
  }, [article?.id, lang]);

  // Execute active auto-translation if any part is uncached
  useEffect(() => {
    if (!article) return;

    if (lang === 'en') {
      setState({
        title: article.title,
        summary: article.summary,
        location: article.location,
        caption: article.featuredImage?.caption || '',
        authorName: article.author?.name || '',
        authorTitle: article.author?.title || '',
        authorBio: article.author?.bio || '',
        blocks: article.blocks || [],
        isTranslating: false,
      });
      return;
    }

    if (lang === 'bn') {
      setState({
        title: article.title_bn || article.title,
        summary: article.summary_bn || article.summary,
        location: article.location_bn || article.location,
        caption: article.featuredImage?.caption_bn || article.featuredImage?.caption || '',
        authorName: article.author?.name_bn || article.author?.name || '',
        authorTitle: article.author?.title_bn || article.author?.title || '',
        authorBio: article.author?.bio || '',
        blocks: (article.blocks || []).map((b) => ({
          ...b,
          text: b.text_bn || b.text,
          quoteAuthor: b.quoteAuthor_bn || b.quoteAuthor,
          media: b.media
            ? {
                ...b.media,
                caption: b.media.caption_bn || b.media.caption,
              }
            : undefined,
        })),
        isTranslating: false,
      });
      return;
    }

    let isCancelled = false;
    setState((prev) => ({ ...prev, isTranslating: true }));

    async function performLiveTranslation() {
      if (!article) return;
      try {
        const blocksList = article.blocks || [];
        const [
          transTitle,
          transSummary,
          transLocation,
          transCaption,
          transAuthorName,
          transAuthorTitle,
          transAuthorBio,
          ...translatedBlockTexts
        ] = await Promise.all([
          translateText(article.title, lang),
          translateText(article.summary, lang),
          translateText(article.location, lang),
          article.featuredImage?.caption
            ? translateText(article.featuredImage.caption, lang)
            : Promise.resolve(''),
          article.author?.name
            ? translateText(article.author.name, lang)
            : Promise.resolve(''),
          article.author?.title
            ? translateText(article.author.title, lang)
            : Promise.resolve(''),
          article.author?.bio
            ? translateText(article.author.bio, lang)
            : Promise.resolve(''),
          ...blocksList.map((b) =>
            b.text ? translateText(b.text, lang) : Promise.resolve('')
          ),
        ]);

        if (isCancelled) return;

        const updatedBlocks = blocksList.map((b, idx) => ({
          ...b,
          text: translatedBlockTexts[idx] || b.text,
        }));

        setState({
          title: transTitle,
          summary: transSummary,
          location: transLocation,
          caption: transCaption || article.featuredImage?.caption || '',
          authorName: transAuthorName || article.author?.name || '',
          authorTitle: transAuthorTitle || article.author?.title || '',
          authorBio: transAuthorBio || article.author?.bio || '',
          blocks: updatedBlocks,
          isTranslating: false,
        });
      } catch (err) {
        if (!isCancelled) {
          console.warn(`Translation to ${lang} encountered an issue:`, err);
          setState((prev) => ({ ...prev, isTranslating: false }));
        }
      }
    }

    performLiveTranslation();

    return () => {
      isCancelled = true;
    };
  }, [article?.id, lang]);

  return state;
}
