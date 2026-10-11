import { Article, SupportedLanguage } from '../types/news';
import { convertNumeralsToBengali } from './translation';

/**
 * Standard adult average reading speed in words per minute (WPM).
 * Journalistic industry standard is 200–225 words per minute.
 */
export const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Counts words in a string, stripping HTML tags, handling Unicode and Bengali scripts.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // Strip HTML tags if any
  const clean = text.replace(/<[^>]*>/g, ' ');
  // Split on whitespace characters (including multiple spaces, newlines, tabs)
  const tokens = clean
    .trim()
    .split(/\s+/)
    .filter((token) => {
      // Remove tokens that are purely punctuation or symbols
      return token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।॥]/g, '').length > 0;
    });

  return tokens.length;
}

/**
 * Extract clean text and calculate the precise word count of an article.
 * Handles English, Bengali, and all multilingual content blocks.
 */
export function calculateArticleWordCount(
  article: Partial<Article> | null | undefined,
  lang: SupportedLanguage = 'en'
): number {
  if (!article) return 0;

  const isBn = lang === 'bn';
  const textSegments: string[] = [];

  // Headline
  const title = (isBn ? article.title_bn || article.title : article.title) || '';
  if (title) textSegments.push(title);

  // Summary / Lead
  const summary = (isBn ? article.summary_bn || article.summary : article.summary) || '';
  if (summary) textSegments.push(summary);

  // Content Blocks (paragraphs, subheadings, quotes, captions)
  if (Array.isArray(article.blocks)) {
    for (const block of article.blocks) {
      if (!block) continue;
      const blockText = (isBn ? block.text_bn || block.text : block.text) || '';
      if (blockText) {
        textSegments.push(blockText);
      }
      if (block.quoteAuthor) {
        textSegments.push(block.quoteAuthor);
      }
      if (block.media?.caption) {
        textSegments.push(block.media.caption);
      }
    }
  }

  const combined = textSegments.join(' ');
  return countWords(combined);
}

/**
 * Estimates reading time in whole minutes based on word count calculations.
 * Minimum is 1 minute for any non-empty article.
 */
export function calculateReadingTimeMinutes(
  wordCount: number,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): number {
  if (wordCount <= 0) return 1;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

export interface ReadingTimeStats {
  wordCount: number;
  minutes: number;
  displayText: string; // e.g. "4 minute read" or "৪ মিনিট পড়ার সময়"
  shortText: string;   // e.g. "4 min read" or "৪ মিনিট পাঠ"
  isoDuration: string; // e.g. "PT4M" for Schema.org
}

/**
 * Formats reading time display string based on language/locale.
 * Produces standard journalistic 'X minute read' phrasing.
 */
export function formatReadingDuration(minutes: number, lang: SupportedLanguage = 'en'): string {
  const safeMinutes = Math.max(1, minutes);

  if (lang === 'bn') {
    const bnDigits = convertNumeralsToBengali(String(safeMinutes));
    return `${bnDigits} মিনিট পড়ার সময়`;
  }
  if (lang === 'es') {
    return `${safeMinutes} min de lectura`;
  }
  if (lang === 'fr') {
    return `${safeMinutes} min de lecture`;
  }
  if (lang === 'de') {
    return `${safeMinutes} Min. Lesezeit`;
  }
  if (lang === 'hi') {
    return `${safeMinutes} मिनट का पठन`;
  }
  if (lang === 'ar') {
    return `${safeMinutes} دقائق قراءة`;
  }
  if (lang === 'ja') {
    return `${safeMinutes}分で読める`;
  }
  if (lang === 'zh') {
    return `${safeMinutes}分钟阅读`;
  }

  // English default: standard journalistic "X minute read"
  return safeMinutes === 1 ? '1 minute read' : `${safeMinutes} minute read`;
}

/**
 * Short badge format (e.g. "4 min read", "৪ মিনিট পাঠ")
 */
export function formatReadingDurationShort(minutes: number, lang: SupportedLanguage = 'en'): string {
  const safeMinutes = Math.max(1, minutes);

  if (lang === 'bn') {
    return `${convertNumeralsToBengali(String(safeMinutes))} মিনিট পাঠ`;
  }
  return `${safeMinutes} min read`;
}

/**
 * Calculates comprehensive reading duration statistics for an article
 * based on live word count calculations and reading speed.
 */
export function getArticleReadingStats(
  article: Partial<Article> | null | undefined,
  lang: SupportedLanguage = 'en',
  wpm: number = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeStats {
  const wordCount = calculateArticleWordCount(article, lang);
  const minutes = calculateReadingTimeMinutes(wordCount, wpm);
  const displayText = formatReadingDuration(minutes, lang);
  const shortText = formatReadingDurationShort(minutes, lang);
  const isoDuration = `PT${minutes}M`;

  return {
    wordCount,
    minutes,
    displayText,
    shortText,
    isoDuration,
  };
}
