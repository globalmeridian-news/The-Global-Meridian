/**
 * Multi-Language Global News Translation and Geolocation/Locale Detection Engine
 * Adapts automatically to the visitor's country, device, and browser locale.
 */

import { SupportedLanguage } from '../types/news';
import { getCachedTranslation, translateText } from './translationService';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  translatePrompt: string; // e.g., "বাংলায় পড়ুন", "Leer en Español", "हिंदी में पढ़ें"
  returnPrompt: string;    // e.g., "Read in English", "ইংরেজি সংস্করণে ফিরুন"
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English (Global)',
    flag: '🌐',
    translatePrompt: 'Read in English',
    returnPrompt: 'Original Edition',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা (বাংলাদেশ/ভারত)',
    flag: '🇧🇩',
    translatePrompt: 'বাংলায় অনুবাদ করুন',
    returnPrompt: 'Read in English',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी (भारत)',
    flag: '🇮🇳',
    translatePrompt: 'हिंदी में अनुवाद करें',
    returnPrompt: 'Read in English',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    translatePrompt: 'Traducir al Español',
    returnPrompt: 'Read in English',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    translatePrompt: 'Traduire en Français',
    returnPrompt: 'Read in English',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    translatePrompt: 'Auf Deutsch übersetzen',
    returnPrompt: 'Read in English',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية (الشرق الأوسط)',
    flag: '🇦🇪',
    translatePrompt: 'ترجمة إلى العربية',
    returnPrompt: 'Read in English',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский (Россия)',
    flag: '🇷🇺',
    translatePrompt: 'Читать на русском',
    returnPrompt: 'Read in English',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語 (日本)',
    flag: '🇯🇵',
    translatePrompt: '日本語に翻訳する',
    returnPrompt: 'Read in English',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어 (대한민국)',
    flag: '🇰🇷',
    translatePrompt: '한국어로 번역',
    returnPrompt: 'Read in English',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文 (中国)',
    flag: '🇨🇳',
    translatePrompt: '翻译为中文',
    returnPrompt: 'Read in English',
  },
};

/**
 * Automatically detects the visitor's native country / browser locale and timezone
 * Across target regions: Europe, Middle East, Americas, Russia, China, India, Africa, Japan, and South Korea
 */
export function detectVisitorLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en';

  // 1. Check browser timezone to detect visitor country even if browser OS is set to generic English
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (
      timeZone.includes('Moscow') ||
      timeZone.includes('St_Petersburg') ||
      timeZone.includes('Yekaterinburg') ||
      timeZone.includes('Novosibirsk') ||
      timeZone.includes('Samara')
    ) {
      return 'ru';
    }
    if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Mumbai')) {
      const userLangs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
      if (userLangs.includes('bn')) return 'bn';
      return 'hi';
    }
    if (
      timeZone.includes('Madrid') ||
      timeZone.includes('Buenos_Aires') ||
      timeZone.includes('Mexico') ||
      timeZone.includes('Bogota') ||
      timeZone.includes('Santiago') ||
      timeZone.includes('Lima')
    ) {
      return 'es';
    }
    if (
      timeZone.includes('Paris') ||
      timeZone.includes('Brussels') ||
      timeZone.includes('Montreal') ||
      timeZone.includes('Casablanca') ||
      timeZone.includes('Algiers') ||
      timeZone.includes('Abidjan') ||
      timeZone.includes('Dakar')
    ) {
      return 'fr';
    }
    if (timeZone.includes('Berlin') || timeZone.includes('Vienna') || timeZone.includes('Zurich')) return 'de';
    if (
      timeZone.includes('Riyadh') ||
      timeZone.includes('Dubai') ||
      timeZone.includes('Abu_Dhabi') ||
      timeZone.includes('Cairo') ||
      timeZone.includes('Baghdad') ||
      timeZone.includes('Doha') ||
      timeZone.includes('Kuwait') ||
      timeZone.includes('Amman')
    ) {
      return 'ar';
    }
    if (timeZone.includes('Tokyo')) return 'ja';
    if (timeZone.includes('Seoul')) return 'ko';
    if (
      timeZone.includes('Shanghai') ||
      timeZone.includes('Beijing') ||
      timeZone.includes('Shenzhen') ||
      timeZone.includes('Hong_Kong') ||
      timeZone.includes('Taipei')
    ) {
      return 'zh';
    }
    if (
      timeZone.includes('London') ||
      timeZone.includes('New_York') ||
      timeZone.includes('Los_Angeles') ||
      timeZone.includes('Chicago') ||
      timeZone.includes('Denver') ||
      timeZone.includes('Toronto') ||
      timeZone.includes('Johannesburg') ||
      timeZone.includes('Nairobi') ||
      timeZone.includes('Lagos') ||
      timeZone.includes('Accra') ||
      timeZone.includes('Addis_Ababa') ||
      timeZone.includes('Sydney')
    ) {
      return 'en';
    }
  } catch {
    // fallback to language preferences
  }

  // 2. Check browser declared language preferences (navigator.languages)
  const languages = navigator.languages || [navigator.language || ''];
  for (const lang of languages) {
    if (!lang) continue;
    const lower = lang.toLowerCase();

    if (lower.startsWith('ru')) return 'ru';
    if (lower.startsWith('hi')) return 'hi';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('fr')) return 'fr';
    if (lower.startsWith('de')) return 'de';
    if (lower.startsWith('ar')) return 'ar';
    if (lower.startsWith('ja') || lower.includes('jp')) return 'ja';
    if (lower.startsWith('ko') || lower.includes('kr')) return 'ko';
    if (lower.startsWith('zh') || lower.includes('cn')) return 'zh';
    if (lower.startsWith('bn')) return 'bn';
    if (lower.startsWith('en')) return 'en';
  }

  return 'en';
}

// Common numerals
const ENGLISH_TO_BENGALI_NUMERALS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BENGALI_TO_ENGLISH_NUMERALS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function convertNumeralsToBengali(text: string): string {
  return text.replace(/[0-9]/g, (digit) => ENGLISH_TO_BENGALI_NUMERALS[digit] || digit);
}

export function convertNumeralsToEnglish(text: string): string {
  return text.replace(/[০-৯]/g, (digit) => BENGALI_TO_ENGLISH_NUMERALS[digit] || digit);
}

// Category translations by language
export const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  World: {
    bn: 'আন্তর্জাতিক',
    hi: 'अंतरराष्ट्रीय',
    es: 'Mundo',
    fr: 'Monde',
    de: 'Welt',
    ar: 'العالم',
    ru: 'Мир',
    ja: '国際',
    ko: '국제',
    zh: '国际',
  },
  Politics: {
    bn: 'রাজনীতি',
    hi: 'राजनीति',
    es: 'Política',
    fr: 'Politique',
    de: 'Politik',
    ar: 'سياسة',
    ru: 'Политика',
    ja: '政治',
    ko: '정치',
    zh: '政治',
  },
  Business: {
    bn: 'বাণিজ্য ও অর্থনীতি',
    hi: 'व्यापार',
    es: 'Economía y Negocios',
    fr: 'Économie',
    de: 'Wirtschaft',
    ar: 'اقتصاد',
    ru: 'Бизнес и Экономика',
    ja: 'ビジネス',
    ko: '경제·비즈니스',
    zh: '商业',
  },
  Technology: {
    bn: 'প্রযুক্তি',
    hi: 'प्रौद्योगिकी',
    es: 'Tecnología',
    fr: 'Technologie',
    de: 'Technologie',
    ar: 'تكنولوجيا',
    ru: 'Технологии',
    ja: 'テクノロジー',
    ko: '기술·AI',
    zh: '科技',
  },
  Science: {
    bn: 'বিজ্ঞান',
    hi: 'विज्ञान',
    es: 'Ciencia',
    fr: 'Science',
    de: 'Wissenschaft',
    ar: 'علوم',
    ru: 'Наука',
    ja: '科学',
    ko: '과학',
    zh: '科学',
  },
  Health: {
    bn: 'স্বাস্থ্য',
    hi: 'स्वास्थ्य',
    es: 'Salud',
    fr: 'Santé',
    de: 'Gesundheit',
    ar: 'صحة',
    ru: 'Здоровье',
    ja: '健康',
    ko: '건강',
    zh: '健康',
  },
  Defense: {
    bn: 'প্রতিরক্ষা ও নিরাপত্তা',
    hi: 'रक्षा',
    es: 'Defensa y Seguridad',
    fr: 'Défense',
    de: 'Verteidigung',
    ar: 'دفاع',
    ru: 'Оборона',
    ja: '防衛',
    ko: '국방·안보',
    zh: '国防',
  },
  Environment: {
    bn: 'পরিবেশ ও জলবায়ু',
    hi: 'पर्यावरण',
    es: 'Medio Ambiente',
    fr: 'Environnement',
    de: 'Umwelt',
    ar: 'بيئة',
    ru: 'Экология',
    ja: '環境',
    ko: '환경·기후',
    zh: '环境',
  },
  Sports: {
    bn: 'খেলাধুলা',
    hi: 'खेल',
    es: 'Deportes',
    fr: 'Sports',
    de: 'Sport',
    ar: 'رياضة',
    ru: 'Спорт',
    ja: 'スポーツ',
    ko: '스포츠',
    zh: '体育',
  },
  Entertainment: {
    bn: 'বিনোদন ও সংস্কৃতি',
    hi: 'मनोरंजन',
    es: 'Entretenimiento',
    fr: 'Divertissement',
    de: 'Unterhaltung',
    ar: 'ترفيه',
    ru: 'Культура',
    ja: 'エンタメ',
    ko: '문화·연예',
    zh: '娱乐',
  },
  Videos: {
    bn: 'ভিডিও প্রতিবেদন',
    hi: 'वीडियो',
    es: 'Vídeos',
    fr: 'Vidéos',
    de: 'Videos',
    ar: 'فيديو',
    ru: 'Видео',
    ja: '動画',
    ko: '영상',
    zh: '视频',
  },
  'Photo Stories': {
    bn: 'ছবিতে বিশ্ব',
    hi: 'चित्र कथाएं',
    es: 'Foto Reportajes',
    fr: 'Reportages Photo',
    de: 'Fotostorys',
    ar: 'قصص مصورة',
    ru: 'Фоторепортажи',
    ja: 'フォトストーリー',
    ko: '포토 뉴스',
    zh: '图片故事',
  },
  Opinion: {
    bn: 'মতামত',
    hi: 'राय',
    es: 'Opinión',
    fr: 'Opinion',
    de: 'Meinung',
    ar: 'رأي',
    ru: 'Мнения',
    ja: 'オピニオン',
    ko: '오피니언',
    zh: '观点',
  },
};

export function getLocalizedCategory(category: string, lang: SupportedLanguage): string {
  if (lang === 'en') return category;
  const match = CATEGORY_TRANSLATIONS[category];
  if (match && match[lang]) return match[lang];
  return category;
}

export function getUserTimeZoneInfo(): { timeZone: string; shortName: string } {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const shortName = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;
    return { timeZone, shortName };
  } catch {
    return { timeZone: 'UTC', shortName: 'UTC' };
  }
}

// Live date and time formatting
export function formatLiveDate(date: Date, lang: SupportedLanguage = 'en', timeZone?: string): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    bn: 'bn-IN',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-AE',
    ru: 'ru-RU',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
  };

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (timeZone) {
    options.timeZone = timeZone;
  }

  const formatted = date.toLocaleDateString(localeMap[lang] || 'en-US', options);
  if (lang === 'bn') {
    return convertNumeralsToBengali(formatted);
  }
  return formatted;
}

export function formatLiveTime(date: Date, lang: SupportedLanguage = 'en', timeZone?: string): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    bn: 'bn-IN',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-AE',
    ru: 'ru-RU',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
  };

  try {
    const timeFormatter = new Intl.DateTimeFormat(localeMap[lang] || 'en-US', {
      timeZone: timeZone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const formatted = timeFormatter.format(date);
    if (lang === 'bn') {
      return convertNumeralsToBengali(formatted);
    }
    return formatted;
  } catch {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const isPM = hours >= 12;
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');

    if (lang === 'bn') {
      const period = isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
      const timeStr = `${displayHours}:${minutes}:${seconds}`;
      return `${convertNumeralsToBengali(timeStr)} ${period}`;
    }

    if (lang === 'hi') {
      const period = isPM ? 'अपराह्न' : 'पूर्वाह्न';
      return `${displayHours}:${minutes}:${seconds} ${period}`;
    }

    if (lang === 'ar') {
      const period = isPM ? 'م' : 'ص';
      return `${displayHours}:${minutes}:${seconds} ${period}`;
    }

    const period = isPM ? 'PM' : 'AM';
    return `${displayHours}:${minutes}:${seconds} ${period}`;
  }
}

export interface BureauClock {
  name: string;
  name_bn: string;
  timeZone: string;
  time: string;
}

export function getBureauClocks(date: Date, lang: SupportedLanguage = 'en'): BureauClock[] {
  const bureaus = [
    { name: 'London (EU)', name_bn: 'লন্ডন (ইউরোপ)', timeZone: 'Europe/London' },
    { name: 'Brussels (EU)', name_bn: 'ব্রাসেলস (ইউরোপ)', timeZone: 'Europe/Brussels' },
    { name: 'Washington (US)', name_bn: 'ওয়াশিংটন (আমেরিকা)', timeZone: 'America/New_York' },
    { name: 'Moscow (RU)', name_bn: 'মস্কো (রাশিয়া)', timeZone: 'Europe/Moscow' },
    { name: 'Dubai (ME)', name_bn: 'দুবাই (মধ্যপ্রাচ্য)', timeZone: 'Asia/Dubai' },
    { name: 'Beijing (CN)', name_bn: 'বেইজিং (চীন)', timeZone: 'Asia/Shanghai' },
    { name: 'Tokyo (JP)', name_bn: 'টোকিও (জাপান)', timeZone: 'Asia/Tokyo' },
    { name: 'Seoul (KR)', name_bn: 'সিউল (দক্ষিণ কোরিয়া)', timeZone: 'Asia/Seoul' },
    { name: 'New Delhi (IN)', name_bn: 'নয়াদিল্লি (ভারত)', timeZone: 'Asia/Kolkata' },
    { name: 'Nairobi (AF)', name_bn: 'নাইরোবি (আফ্রিকা)', timeZone: 'Africa/Nairobi' },
  ];

  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    bn: 'bn-IN',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-AE',
    ru: 'ru-RU',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
  };

  return bureaus.map((b) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat(localeMap[lang] || 'en-US', {
        timeZone: b.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return {
        ...b,
        time: timeFormatter.format(date),
      };
    } catch {
      return {
        ...b,
        time: formatLiveTime(date, lang),
      };
    }
  });
}

// Relative time formatting across languages
export function formatRelativeTime(dateString: string, lang: SupportedLanguage = 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    if (lang === 'bn') return 'কয়েক মুহূর্ত আগে';
    if (lang === 'es') return 'Hace un momento';
    if (lang === 'fr') return 'À l\'instant';
    if (lang === 'de') return 'Gerade eben';
    if (lang === 'hi') return 'अभी-अभी';
    if (lang === 'ar') return 'منذ لحظات';
    if (lang === 'ru') return 'Только что';
    if (lang === 'ja') return 'たった今';
    if (lang === 'ko') return '방금 전';
    if (lang === 'zh') return '刚刚';
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (lang === 'bn') return `${convertNumeralsToBengali(String(diffInMinutes))} মিনিট আগে`;
    if (lang === 'es') return `Hace ${diffInMinutes} min`;
    if (lang === 'fr') return `Il y a ${diffInMinutes} min`;
    if (lang === 'de') return `Vor ${diffInMinutes} Min`;
    if (lang === 'hi') return `${diffInMinutes} मिनट पहले`;
    if (lang === 'ar') return `منذ ${diffInMinutes} دقيقة`;
    if (lang === 'ru') return `${diffInMinutes} мин. назад`;
    if (lang === 'ja') return `${diffInMinutes}分前`;
    if (lang === 'ko') return `${diffInMinutes}분 전`;
    if (lang === 'zh') return `${diffInMinutes}分钟前`;
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (lang === 'bn') return `${convertNumeralsToBengali(String(diffInHours))} ঘণ্টা আগে`;
    if (lang === 'es') return `Hace ${diffInHours} horas`;
    if (lang === 'fr') return `Il y a ${diffInHours} heures`;
    if (lang === 'de') return `Vor ${diffInHours} Std`;
    if (lang === 'hi') return `${diffInHours} घंटे पहले`;
    if (lang === 'ar') return `منذ ${diffInHours} ساعة`;
    if (lang === 'ru') return `${diffInHours} ч. назад`;
    if (lang === 'ja') return `${diffInHours}時間前`;
    if (lang === 'ko') return `${diffInHours}시간 전`;
    if (lang === 'zh') return `${diffInHours}小时前`;
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    if (lang === 'bn') return `${convertNumeralsToBengali(String(diffInDays))} দিন আগে`;
    if (lang === 'es') return `Hace ${diffInDays} días`;
    if (lang === 'fr') return `Il y a ${diffInDays} jours`;
    if (lang === 'de') return `Vor ${diffInDays} Tagen`;
    if (lang === 'hi') return `${diffInDays} दिन पहले`;
    if (lang === 'ar') return `منذ ${diffInDays} يوم`;
    if (lang === 'ru') return `${diffInDays} дн. назад`;
    if (lang === 'ja') return `${diffInDays}日前`;
    if (lang === 'ko') return `${diffInDays}일 전`;
    if (lang === 'zh') return `${diffInDays}天前`;
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Editorial dictionary for various languages
const EDITORIAL_TERMS: Record<string, Record<string, string>> = {
  'Breaking News': {
    bn: 'ব্রেকিং নিউজ',
    hi: 'ताज़ा ख़बर',
    es: 'Última Hora',
    fr: 'Dernière Minute',
    de: 'Eilmeldung',
    ar: 'عاجل',
    ru: 'Срочно',
    ja: '速報',
    ko: '속보',
    zh: '快讯',
  },
  'Latest News': {
    bn: 'সর্বশেষ সংবাদ',
    hi: 'नवीनतम समाचार',
    es: 'Últimas Noticias',
    fr: 'Dernières Nouvelles',
    de: 'Neueste Nachrichten',
    ar: 'آخر الأخبار',
    ru: 'Последние новости',
    ja: '最新ニュース',
    ko: '최신 뉴스',
    zh: '最新消息',
  },
  'Submit News': {
    bn: 'নিউ সাবমিট',
    hi: 'समाचार भेजें',
    es: 'Enviar Noticia',
    fr: 'Soumettre Infos',
    de: 'Nachricht einreichen',
    ar: 'إرسال خبر',
    ru: 'Прислать новость',
    ja: 'ニュース送信',
    ko: '뉴스 제보',
    zh: '提交新闻',
  },
};

export function getEditorialTerm(term: string, lang: SupportedLanguage): string {
  if (lang === 'en') return term;
  const match = EDITORIAL_TERMS[term];
  if (match && match[lang]) return match[lang];
  return term;
}

// UI Strings Dictionary across all 11 supported languages
export const UI_STRINGS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  backToTopStories: {
    en: 'Back to Top Stories',
    bn: 'প্রধান পাতায় ফিরুন',
    ja: 'トップニュースに戻る',
    ko: '주요 뉴스로 돌아가기',
    es: 'Volver a Portada',
    fr: 'Retour à la Une',
    de: 'Zurück zur Übersicht',
    hi: 'मुख्य पृष्ठ पर वापस जाएँ',
    ar: 'العودة إلى الأخبار الرئيسية',
    ru: 'К главным новостям',
    zh: '返回头条新闻',
  },
  listen: {
    en: 'Listen',
    bn: 'খবর শুনুন',
    ja: '音声で聴く',
    ko: '음성 듣기',
    es: 'Escuchar',
    fr: 'Écouter',
    de: 'Anhören',
    hi: 'सुनें',
    ar: 'استمع',
    ru: 'Слушать',
    zh: '收听报道',
  },
  stopAudio: {
    en: 'Stop Audio',
    bn: 'পড়া বন্ধ করুন',
    ja: '音声停止',
    ko: '음성 중지',
    es: 'Detener audio',
    fr: 'Arrêter l\'audio',
    de: 'Audio stoppen',
    hi: 'ऑडियो रोकें',
    ar: 'إيقاف الصوت',
    ru: 'Остановить аудио',
    zh: '停止播放',
  },
  day: {
    en: '☀️ Day',
    bn: '☀️ দিন',
    ja: '☀️ 昼',
    ko: '☀️ 낮',
    es: '☀️ Día',
    fr: '☀️ Jour',
    de: '☀️ Tag',
    hi: '☀️ दिन',
    ar: '☀️ نهار',
    ru: '☀️ День',
    zh: '☀️ 白天',
  },
  sepia: {
    en: '📜 Sepia',
    bn: '📜 বই',
    ja: '📜 セピア',
    ko: '📜 세피아',
    es: '📜 Sepia',
    fr: '📜 Sépia',
    de: '📜 Sepia',
    hi: '📜 सेपिया',
    ar: '📜 بني داكن',
    ru: '📜 Сепия',
    zh: '📜 羊皮纸',
  },
  night: {
    en: '🌙 Night',
    bn: '🌙 রাত',
    ja: '🌙 夜',
    ko: '🌙 밤',
    es: '🌙 Noche',
    fr: '🌙 Nuit',
    de: '🌙 Nacht',
    hi: '🌙 रात',
    ar: '🌙 ليل',
    ru: '🌙 Ночь',
    zh: '🌙 夜间',
  },
  save: {
    en: 'Save',
    bn: 'সংরক্ষণ',
    ja: '保存',
    ko: '저장',
    es: 'Guardar',
    fr: 'Enregistrer',
    de: 'Speichern',
    hi: 'सहेजें',
    ar: 'حفظ',
    ru: 'Сохранить',
    zh: '保存',
  },
  saved: {
    en: 'Saved',
    bn: 'সংরক্ষিত',
    ja: '保存済み',
    ko: '저장됨',
    es: 'Guardado',
    fr: 'Enregistré',
    de: 'Gespeichert',
    hi: 'सहेजा गया',
    ar: 'تم الحفظ',
    ru: 'Сохранено',
    zh: '已保存',
  },
  print: {
    en: 'Print',
    bn: 'প্রিন্ট',
    ja: '印刷',
    ko: '인쇄',
    es: 'Imprimir',
    fr: 'Imprimer',
    de: 'Drucken',
    hi: 'प्रिंट करें',
    ar: 'طباعة',
    ru: 'Печать',
    zh: '打印',
  },
  published: {
    en: 'Published',
    bn: 'প্রকাশিত',
    ja: '公開',
    ko: '발행',
    es: 'Publicado',
    fr: 'Publié',
    de: 'Veröffentlicht',
    hi: 'प्रकाशित',
    ar: 'نُشر',
    ru: 'Опубликовано',
    zh: '发布于',
  },
  updated: {
    en: 'Updated',
    bn: 'হালনাগাদ',
    ja: '更新',
    ko: '업데이트',
    es: 'Actualizado',
    fr: 'Mis à jour',
    de: 'Aktualisiert',
    hi: 'अपडेट किया गया',
    ar: 'تم التحديث',
    ru: 'Обновлено',
    zh: '更新于',
  },
  words: {
    en: 'words',
    bn: 'শব্দ',
    ja: '語',
    ko: '단어',
    es: 'palabras',
    fr: 'mots',
    de: 'Wörter',
    hi: 'शब्द',
    ar: 'كلمة',
    ru: 'слов',
    zh: '字',
  },
  saveBookmarkStory: {
    en: 'Save / Bookmark Story',
    bn: 'সংবাদটি সংরক্ষণ করুন',
    ja: '記事を保存 / ブックマーク',
    ko: '기사 저장 / 북마크',
    es: 'Guardar / Marcar Noticia',
    fr: 'Enregistrer l\'article',
    de: 'Artikel speichern',
    hi: 'समाचार सहेजें / बुकमार्क',
    ar: 'حفظ / إشارة مرجعية للخبر',
    ru: 'В закладки',
    zh: '保存 / 书签收藏报道',
  },
  savedInBookmarks: {
    en: 'Saved in Bookmarks ✓',
    bn: 'বুকমার্কে সংরক্ষিত ✓',
    ja: 'ブックマークに保存済み ✓',
    ko: '북마크에 저장됨 ✓',
    es: 'Guardado en Marcadores ✓',
    fr: 'Enregistré dans les favoris ✓',
    de: 'Gespeichert ✓',
    hi: 'बुकमार्क में सहेजा गया ✓',
    ar: 'محفوظ في الإشارات المرجعية ✓',
    ru: 'В закладках ✓',
    zh: '已收藏至书签 ✓',
  },
  savedArticles: {
    en: 'Saved Articles',
    bn: 'সংরক্ষিত সংবাদ',
    ja: '保存した記事',
    ko: '저장한 기사',
    es: 'Artículos Guardados',
    fr: 'Articles Enregistrés',
    de: 'Gespeicherte Artikel',
    hi: 'सहेजे गए लेख',
    ar: 'المقالات المحفوظة',
    ru: 'Сохранённые статьи',
    zh: '已保存的文章',
  },
  readingProgress: {
    en: 'Reading Progress:',
    bn: 'পড়ার অগ্রগতি:',
    ja: '読了進捗:',
    ko: '읽기 진행률:',
    es: 'Progreso de lectura:',
    fr: 'Progression de lecture :',
    de: 'Lesefortschritt:',
    hi: 'पढ़ने की प्रगति:',
    ar: 'تقدم القراءة:',
    ru: 'Прогресс чтения:',
    zh: '阅读进度：',
  },
  readingCompleted: {
    en: 'Reading completed (100%)',
    bn: 'পড়া সম্পূর্ণ (১০০%)',
    ja: '読了完了 (100%)',
    ko: '읽기 완료 (100%)',
    es: 'Lectura completada (100%)',
    fr: 'Lecture terminée (100%)',
    de: 'Gelesen (100%)',
    hi: 'पढ़ना पूरा हुआ (100%)',
    ar: 'اكتملت القراءة (100%)',
    ru: 'Чтение завершено (100%)',
    zh: '阅读完毕 (100%)',
  },
  scrollToTop: {
    en: 'Scroll to top',
    bn: 'শীর্ষে ফিরে যান',
    ja: 'トップに戻る',
    ko: '맨 위로',
    es: 'Volver arriba',
    fr: 'Haut de page',
    de: 'Nach oben',
    hi: 'शीर्ष पर जाएं',
    ar: 'العودة إلى الأعلى',
    ru: 'Наверх',
    zh: '返回顶部',
  },
  finishedReading: {
    en: 'Finished reading? Save to your archive',
    bn: 'পড়া শেষ করলেন? প্রতিবেদনটি সংরক্ষণ করুন',
    ja: '読了しましたか？アーカイブに保存',
    ko: '다 읽으셨나요? 아카이브에 저장',
    es: '¿Terminaste de leer? Guárdalo en tu archivo',
    fr: 'Lecture terminée ? Enregistrez dans vos archives',
    de: 'Fertig gelesen? In Ihrem Archiv speichern',
    hi: 'पढ़ना समाप्त किया? अपने संग्रह में सहेजें',
    ar: 'أنهيت القراءة؟ احفظ في أرشيفك',
    ru: 'Дочитали? Сохраните в архив',
    zh: '阅读完毕？保存至个人档案',
  },
  finishedReadingSub: {
    en: 'Bookmark this dispatch to local storage to revisit anytime.',
    bn: 'পরবর্তীতে পুনরায় পড়তে লোকাল স্টোরেজে বুকমার্ক করুন।',
    ja: 'ローカルストレージにブックマークして、いつでも再読できます。',
    ko: '로컬 저장소에 북마크하여 언제든 다시 읽으세요.',
    es: 'Guarda este despacho en el almacenamiento local para volver a leerlo.',
    fr: 'Enregistrez cette dépêche dans la mémoire locale pour la relire plus tard.',
    de: 'Speichern Sie diesen Bericht lokal, um ihn jederzeit wiederzulesen.',
    hi: 'किसी भी समय दोबारा पढ़ने के लिए इसे स्थानीय स्टोरेज में सहेजें।',
    ar: 'احفظ هذا التقرير في التخزين المحلي لإعادة زيارته في أي وقت.',
    ru: 'Сохраните материал в закладках, чтобы вернуться позже.',
    zh: '将此报道保存到本地存储，以便随时重温。',
  },
  topics: {
    en: 'Topics:',
    bn: 'টপিক:',
    ja: 'トピック:',
    ko: '주제:',
    es: 'Temas:',
    fr: 'Thèmes :',
    de: 'Themen:',
    hi: 'विषय:',
    ar: 'المواضيع:',
    ru: 'Темы:',
    zh: '专题：',
  },
  photo: {
    en: 'Photo:',
    bn: 'ছবি:',
    ja: '写真:',
    ko: '사진:',
    es: 'Foto:',
    fr: 'Photo :',
    de: 'Foto:',
    hi: 'फ़ोटो:',
    ar: 'صورة:',
    ru: 'Фото:',
    zh: '图片：',
  },
  bureauBylines: {
    en: 'Bureau Bylines',
    bn: 'ব্যুরো বাইলাইন',
    ja: '特派員署名 (バイライン)',
    ko: '지국 기자 정보',
    es: 'Firma de Corresponsalía',
    fr: 'Signature du Bureau',
    de: 'Korrespondenten-Profil',
    hi: 'ब्यूरो बायलाइन',
    ar: 'توقيع المراسل',
    ru: 'Корреспонденты бюро',
    zh: '分社特派署名',
  },
  relatedNews: {
    en: 'Related News & Intelligence',
    bn: 'সম্পর্কিত সংবাদ ও বিশ্লেষণ',
    ja: '関連ニュース・インテリジェンス',
    ko: '관련 뉴스 및 심층 분석',
    es: 'Noticias e Inteligencia Relacionadas',
    fr: 'Actualités et Analyses Liées',
    de: 'Verwandte Berichte & Analysen',
    hi: 'संबंधित समाचार व विश्लेषण',
    ar: 'الأخبار والتحليلات ذات الصلة',
    ru: 'Похожие новости и аналитика',
    zh: '相关新闻与深度分析',
  },
  mostRead: {
    en: 'Most Read Worldwide',
    bn: 'বিশ্বজুড়ে সর্বাধিক পঠিত',
    ja: '世界で最も読まれている記事',
    ko: '세계에서 가장 많이 읽힌 기사',
    es: 'Lo Más Leído en el Mundo',
    fr: 'Le Plus Lu dans le Monde',
    de: 'Weltweit meistgelesen',
    hi: 'दुनिया भर में सबसे ज्यादा पढ़ा गया',
    ar: 'الأكثر قراءة عالمياً',
    ru: 'Самое читаемое в мире',
    zh: '全球热读文章',
  },
  reads: {
    en: 'reads',
    bn: 'বার পঠিত',
    ja: '閲覧',
    ko: '조회',
    es: 'lecturas',
    fr: 'lectures',
    de: 'Aufrufe',
    hi: 'बार पढ़ा गया',
    ar: 'قراءة',
    ru: 'просмотров',
    zh: '次阅读',
  },
  autoTranslating: {
    en: 'Translating...',
    bn: 'অনুবাদ হচ্ছে...',
    ja: '自動翻訳中...',
    ko: '번역 중...',
    es: 'Traduciendo...',
    fr: 'Traduction en cours...',
    de: 'Wird übersetzt...',
    hi: 'अनुवाद हो रहा है...',
    ar: 'جارٍ الترجمة...',
    ru: 'Перевод...',
    zh: '正在翻译中...',
  },
  globalEdition: {
    en: 'Global Edition',
    bn: 'আন্তর্জাতিক সংস্করণ',
    ja: '国際エディション',
    ko: '글로벌 에디션',
    es: 'Edición Global',
    fr: 'Édition Mondiale',
    de: 'Globale Ausgabe',
    hi: 'वैश्विक संस्करण',
    ar: 'النسخة العالمية',
    ru: 'Международное издание',
    zh: '国际版',
  },
  bureausAndZones: {
    en: 'Bureaus & Zones',
    bn: 'ব্যুরো সময় ও জোন',
    ja: '支局とタイムゾーン',
    ko: '지국 및 시간대',
    es: 'Oficinas y Zonas',
    fr: 'Bureaux et Fuseaux',
    de: 'Büros & Zeitzonen',
    hi: 'ब्यूरो और क्षेत्र',
    ar: 'المكاتب والمناطق',
    ru: 'Бюро и часовые пояса',
    zh: '分社与时区',
  },
  activeTimezoneAndCountry: {
    en: 'Active Timezone & Country',
    bn: 'টাইম জোন ও দেশ নির্বাচন',
    ja: '有効なタイムゾーンと地域',
    ko: '현재 시간대 및 국가',
    es: 'Zona Horaria y País',
    fr: 'Fuseau Horaire et Pays',
    de: 'Zeitzone & Land',
    hi: 'सक्रिय समय क्षेत्र और देश',
    ar: 'المنطقة الزمنية والبلد',
    ru: 'Часовой пояс и регион',
    zh: '当前时区与地区',
  },
  liveAuto: {
    en: 'Live Auto',
    bn: 'লাইভ অটো রূপান্তর',
    ja: 'ライブ自動変換',
    ko: '실시간 자동',
    es: 'Auto en Vivo',
    fr: 'Auto en Direct',
    de: 'Live-Auto',
    hi: 'लाइव ऑटो',
    ar: 'تلقائي مباشر',
    ru: 'Авто',
    zh: '实时自动',
  },
  yourDeviceAutoDetect: {
    en: 'Your Device Auto-Detect',
    bn: 'আপনার নিজস্ব ডিভাইস সময়',
    ja: 'お使いの端末の自動検出',
    ko: '기기 시간대 자동 감지',
    es: 'Detección de dispositivo',
    fr: 'Détection automatique de l\'appareil',
    de: 'Geräte-Zeitzone automatisch',
    hi: 'डिवाइस का स्वतः पता लगाएं',
    ar: 'الكشف التلقائي لجهازك',
    ru: 'Автоопределение устройства',
    zh: '设备自动检测时间',
  },
  worldBureausLiveClocks: {
    en: 'World Bureaus Live Clocks',
    bn: 'বিশ্ব ব্যুরো লাইভ ঘড়ি (রিয়েল-টাইম)',
    ja: '世界主要支局のリアルタイム時計',
    ko: '세계 지국 실시간 시계',
    es: 'Relojes en Vivo de Corresponsalías',
    fr: 'Horloges des Bureaux Mondiaux',
    de: 'Live-Uhren der Weltbüros',
    hi: 'विश्व ब्यूरो लाइव घड़ियाँ',
    ar: 'ساعات المكاتب العالمية المباشرة',
    ru: 'Время мировых бюро',
    zh: '全球分社实时时钟',
  },
  submitNews: {
    en: 'Submit News',
    bn: 'সংবাদ পাঠান',
    ja: '情報提供・投稿',
    ko: '뉴스 제보',
    es: 'Enviar Noticia',
    fr: 'Soumettre une Info',
    de: 'Nachricht einreichen',
    hi: 'समाचार भेजें',
    ar: 'إرسال خبر',
    ru: 'Прислать новость',
    zh: '报料投稿',
  },
  adminLogin: {
    en: 'Admin Login',
    bn: 'এডমিন লগইন',
    ja: '管理者ログイン',
    ko: '관리자 로그인',
    es: 'Acceso Admin',
    fr: 'Connexion Admin',
    de: 'Admin-Login',
    hi: 'व्यवस्थापक लॉगिन',
    ar: 'دخول المسؤول',
    ru: 'Вход в редакцию',
    zh: '管理员登录',
  },
  viewAsReader: {
    en: 'View as Reader',
    bn: 'দর্শক হিসেবে দেখুন',
    ja: '読者表示モード',
    ko: '독자 모드로 보기',
    es: 'Ver como Lector',
    fr: 'Mode Lecteur',
    de: 'Leseransicht',
    hi: 'पाठक के रूप में देखें',
    ar: 'عرض كقارئ',
    ru: 'Режим читателя',
    zh: '读者视角浏览',
  },
  adminCMS: {
    en: 'Admin CMS',
    bn: 'এডমিন প্যানেল',
    ja: '管理CMS',
    ko: '관리자 CMS',
    es: 'Panel Admin',
    fr: 'CMS Admin',
    de: 'Admin-CMS',
    hi: 'एडमिन पैनल',
    ar: 'لوحة التحكم',
    ru: 'CMS панель',
    zh: '管理后台',
  },
  home: {
    en: 'Home',
    bn: 'হোম',
    ja: 'ホーム',
    ko: '홈',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Start',
    hi: 'होम',
    ar: 'الرئيسية',
    ru: 'Главная',
    zh: '首页',
  },
  frontPage: {
    en: 'Front Page',
    bn: 'প্রধান পাতা',
    ja: 'トップページ',
    ko: '1면',
    es: 'Portada',
    fr: 'Une',
    de: 'Titelseite',
    hi: 'मुख्य पृष्ठ',
    ar: 'الصفحة الأولى',
    ru: 'Передовица',
    zh: '头版',
  },
  signOut: {
    en: 'Sign Out / Logout',
    bn: 'লগআউট করুন',
    ja: 'ログアウト',
    ko: '로그아웃',
    es: 'Cerrar Sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    hi: 'लॉग आउट',
    ar: 'تسجيل الخروج',
    ru: 'Выйти',
    zh: '退出登录',
  },
};

export function getUIText(key: string, lang: SupportedLanguage): string {
  if (UI_STRINGS[key] && UI_STRINGS[key][lang]) {
    return UI_STRINGS[key][lang] as string;
  }
  if (UI_STRINGS[key] && UI_STRINGS[key]['en']) {
    return UI_STRINGS[key]['en'] as string;
  }
  return key;
}

/**
 * Returns localized article headline for any language (en, bn, ja, es, fr, de, hi, ar, zh)
 */
export function getLocalizedHeadline(
  article: { title: string; title_bn?: string } | null | undefined,
  lang: SupportedLanguage
): string {
  if (!article) return '';
  if (lang === 'en') return article.title;
  if (lang === 'bn') return article.title_bn || article.title;

  const cached = getCachedTranslation(article.title, lang);
  if (cached) return cached;

  // Fire background translation so subsequent renders update
  translateText(article.title, lang).catch(() => {});
  return translateTextToTargetLanguage(article.title, lang);
}

/**
 * Returns localized article summary for any language
 */
export function getLocalizedSummary(
  article: { summary: string; summary_bn?: string } | null | undefined,
  lang: SupportedLanguage
): string {
  if (!article) return '';
  if (lang === 'en') return article.summary;
  if (lang === 'bn') return article.summary_bn || article.summary;

  const cached = getCachedTranslation(article.summary, lang);
  if (cached) return cached;

  translateText(article.summary, lang).catch(() => {});
  return translateTextToTargetLanguage(article.summary, lang);
}

/**
 * Intelligent multilingual translator for text based on target language
 */
export function translateTextToTargetLanguage(
  text: string,
  targetLang: SupportedLanguage,
  bengaliFallback?: string
): string {
  if (!text) return '';
  if (targetLang === 'en') return text;
  if (targetLang === 'bn' && bengaliFallback) return bengaliFallback;

  // Bengali translation engine
  if (targetLang === 'bn') {
    return autoTranslateToBengali(text);
  }

  // Check translation service cache (in-memory, pre-seeded, or localStorage)
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;

  // Trigger background translation so it is available on subsequent tick
  translateText(text, targetLang).catch(() => {});

  // Multi-language geopolitical keyword replacement dictionaries (fallback)
  const dicts: Record<string, [RegExp, string][]> = {
    es: [
      [/\bUnited Nations\b/gi, 'Naciones Unidas'],
      [/\bSecurity Council\b/gi, 'Consejo de Seguridad'],
      [/\bGeneva\b/gi, 'Ginebra'],
      [/\bArtificial Intelligence\b/gi, 'Inteligencia Artificial'],
      [/\bSemiconductor\b/gi, 'Semiconductores'],
      [/\bWorld Health Organization\b/gi, 'Organización Mundial de la Salud'],
      [/\bHistoric\b/gi, 'Histórico'],
      [/\bAccord\b/gi, 'Acuerdo'],
      [/\bTreaty\b/gi, 'Tratado'],
    ],
    fr: [
      [/\bUnited Nations\b/gi, 'Nations Unies'],
      [/\bSecurity Council\b/gi, 'Conseil de Sécurité'],
      [/\bGeneva\b/gi, 'Genève'],
      [/\bArtificial Intelligence\b/gi, 'Intelligence Artificielle'],
      [/\bSemiconductor\b/gi, 'Semi-conducteurs'],
      [/\bWorld Health Organization\b/gi, 'Organisation Mondiale de la Santé'],
      [/\bHistoric\b/gi, 'Historique'],
      [/\bAccord\b/gi, 'Accord'],
      [/\bTreaty\b/gi, 'Traité'],
    ],
    de: [
      [/\bUnited Nations\b/gi, 'Vereinte Nationen'],
      [/\bSecurity Council\b/gi, 'Sicherheitsrat'],
      [/\bGeneva\b/gi, 'Genf'],
      [/\bArtificial Intelligence\b/gi, 'Künstliche Intelligenz'],
      [/\bSemiconductor\b/gi, 'Halbleiter'],
      [/\bWorld Health Organization\b/gi, 'Weltgesundheitsorganisation'],
      [/\bHistoric\b/gi, 'Historisches'],
      [/\bAccord\b/gi, 'Abkommen'],
      [/\bTreaty\b/gi, 'Vertrag'],
    ],
    hi: [
      [/\bUnited Nations\b/gi, 'संयुक्त राष्ट्र'],
      [/\bSecurity Council\b/gi, 'सुरक्षा परिषद'],
      [/\bGeneva\b/gi, 'जिनेवा'],
      [/\bArtificial Intelligence\b/gi, 'आर्टिफिशियल इंटेलिजेंस'],
      [/\bSemiconductor\b/gi, 'सेमीकंडक्टर'],
      [/\bWorld Health Organization\b/gi, 'विश्व स्वास्थ्य संगठन'],
      [/\bHistoric\b/gi, 'ऐतिहासिक'],
      [/\bAccord\b/gi, 'समझौता'],
    ],
    ar: [
      [/\bUnited Nations\b/gi, 'الأمم المتحدة'],
      [/\bSecurity Council\b/gi, 'مجلس الأمن'],
      [/\bGeneva\b/gi, 'جنيف'],
      [/\bArtificial Intelligence\b/gi, 'الذكاء الاصطناعي'],
      [/\bWorld Health Organization\b/gi, 'منظمة الصحة العالمية'],
      [/\bHistoric\b/gi, 'تاريخي'],
    ],
    ja: [
      [/\bUnited Nations\b/gi, '国際連合'],
      [/\bSecurity Council\b/gi, '安全保障理事会'],
      [/\bGeneva\b/gi, 'ジュネーブ'],
      [/\bArtificial Intelligence\b/gi, '人工知能 (AI)'],
      [/\bSemiconductor\b/gi, '半導体'],
      [/\bHistoric\b/gi, '歴史的'],
    ],
    ko: [
      [/\bUnited Nations\b/gi, '유엔(UN)'],
      [/\bSecurity Council\b/gi, '안전보장이사회'],
      [/\bSeoul\b/gi, '서울'],
      [/\bTokyo\b/gi, '도쿄'],
      [/\bArtificial Intelligence\b/gi, '인공지능(AI)'],
      [/\bSemiconductor\b/gi, '반도체'],
      [/\bHistoric\b/gi, '역사적'],
      [/\bSummit\b/gi, '정상회담'],
    ],
    zh: [
      [/\bUnited Nations\b/gi, '联合国'],
      [/\bSecurity Council\b/gi, '安全理事会'],
      [/\bGeneva\b/gi, '日内瓦'],
      [/\bArtificial Intelligence\b/gi, '人工智能'],
      [/\bSemiconductor\b/gi, '半导体'],
      [/\bHistoric\b/gi, '历史性'],
    ],
    ru: [
      [/\bUnited Nations\b/gi, 'ООН'],
      [/\bSecurity Council\b/gi, 'Совет Безопасности'],
      [/\bGeneva\b/gi, 'Женева'],
      [/\bArtificial Intelligence\b/gi, 'Искусственный интеллект'],
      [/\bWorld Health Organization\b/gi, 'Всемирная организация здравоохранения'],
      [/\bHistoric\b/gi, 'Исторический'],
      [/\bSummit\b/gi, 'Саммит'],
    ],
  };

  const currentDict = dicts[targetLang];
  if (currentDict) {
    let res = text;
    for (const [pattern, replacement] of currentDict) {
      res = res.replace(pattern, replacement);
    }
    return res;
  }

  return text;
}

export function autoTranslateToBengali(text: string): string {
  if (!text || text.trim() === '') return '';

  const terms: [RegExp, string][] = [
    [/\bUnited Nations\b/gi, 'জাতিসংঘ'],
    [/\bSecurity Council\b/gi, 'নিরাপত্তা পরিষদ'],
    [/\bGeneva\b/gi, 'জেনেভা'],
    [/\bWorld Health Organization\b/gi, 'বিশ্ব স্বাস্থ্য সংস্থা'],
    [/\bInternational Atomic Energy Agency\b/gi, 'আন্তর্জাতিক পরমাণু শক্তি সংস্থা'],
    [/\bEuropean Union\b/gi, 'ইউরোপীয় ইউনিয়ন'],
    [/\bWhite House\b/gi, 'হোয়াইট হাউস'],
    [/\bPresident\b/gi, 'রাষ্ট্রপতি'],
    [/\bPrime Minister\b/gi, 'প্রধানমন্ত্রী'],
    [/\bSummit\b/gi, 'শীর্ষ সম্মেলন'],
    [/\bAccord\b/gi, 'চুক্তি'],
    [/\bTreaty\b/gi, 'চুক্তি'],
    [/\bClimate Change\b/gi, 'জলবায়ু পরিবর্তন'],
    [/\bClean Energy\b/gi, 'পরিচ্ছন্ন জ্বালানি'],
    [/\bArtificial Intelligence\b/gi, 'কৃত্রিম বুদ্ধিমত্তা'],
    [/\bSemiconductor\b/gi, 'সেমিকন্ডাক্টর'],
    [/\bGlobal Economy\b/gi, 'বিশ্ব অর্থনীতি'],
    [/\bInflation\b/gi, 'মুদ্রাস্ফীতি'],
    [/\bInterest Rates\b/gi, 'সুদের হার'],
    [/\bStock Market\b/gi, 'শেয়ার বাজার'],
    [/\bSpace Exploration\b/gi, 'মহাকাশ অনুসন্ধান'],
    [/\bEarthquake\b/gi, 'ভূমিকম্প'],
    [/\bDiplomats\b/gi, 'কূটনীতিকগণ'],
    [/\bAgreement\b/gi, 'সমঝোতা'],
    [/\bDefense\b/gi, 'প্রতিরক্ষা'],
    [/\bCybersecurity\b/gi, 'সাইবার নিরাপত্তা'],
    [/\bHealth\b/gi, 'স্বাস্থ্য'],
    [/\bTechnology\b/gi, 'প্রযুক্তি'],
    [/\bScience\b/gi, 'বিজ্ঞান'],
    [/\bEnvironment\b/gi, 'পরিবেশ'],
    [/\bPolitics\b/gi, 'রাজনীতি'],
    [/\bWorld\b/gi, 'বিশ্ব'],
  ];

  let result = text;
  for (const [pattern, bengali] of terms) {
    result = result.replace(pattern, bengali);
  }

  return convertNumeralsToBengali(result);
}

export function autoTranslateToEnglish(text: string): string {
  if (!text || text.trim() === '') return '';

  const bnTerms: [RegExp, string][] = [
    [/জাতিসংঘ/g, 'United Nations'],
    [/নিরাপত্তা পরিষদ/g, 'Security Council'],
    [/জেনেভা/g, 'Geneva'],
    [/বিশ্ব স্বাস্থ্য সংস্থা/g, 'World Health Organization'],
    [/আন্তর্জাতিক/g, 'International'],
    [/জলবায়ু পরিবর্তন/g, 'Climate Change'],
    [/কৃত্রিম বুদ্ধিমত্তা/g, 'Artificial Intelligence'],
    [/বাণিজ্য/g, 'Business'],
    [/প্রযুক্তি/g, 'Technology'],
    [/বিজ্ঞান/g, 'Science'],
    [/স্বাস্থ্য/g, 'Health'],
    [/প্রতিরক্ষা/g, 'Defense'],
    [/পরিবেশ/g, 'Environment'],
  ];

  let result = text;
  for (const [pattern, eng] of bnTerms) {
    result = result.replace(pattern, eng);
  }

  return convertNumeralsToEnglish(result);
}
