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
    nativeName: 'العربية',
    flag: '🇸🇦',
    translatePrompt: 'ترجمة إلى العربية',
    returnPrompt: 'Read in English',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    translatePrompt: '日本語に翻訳する',
    returnPrompt: 'Read in English',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    translatePrompt: '翻译为中文',
    returnPrompt: 'Read in English',
  },
};

/**
 * Automatically detects the visitor's native country / browser locale and timezone
 */
export function detectVisitorLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en';

  // 1. Check browser timezone to detect visitor country even if browser OS is set to generic English
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Dhaka')) return 'bn';
    if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta')) {
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
    if (timeZone.includes('Paris') || timeZone.includes('Brussels') || timeZone.includes('Montreal')) return 'fr';
    if (timeZone.includes('Berlin') || timeZone.includes('Vienna') || timeZone.includes('Zurich')) return 'de';
    if (
      timeZone.includes('Riyadh') ||
      timeZone.includes('Dubai') ||
      timeZone.includes('Cairo') ||
      timeZone.includes('Baghdad') ||
      timeZone.includes('Doha') ||
      timeZone.includes('Kuwait')
    ) {
      return 'ar';
    }
    if (timeZone.includes('Tokyo')) return 'ja';
    if (
      timeZone.includes('Shanghai') ||
      timeZone.includes('Beijing') ||
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

    // Bengali (Bangladesh / West Bengal)
    if (lower.startsWith('bn') || lower.includes('bd')) return 'bn';
    // Hindi (India)
    if (lower.startsWith('hi')) return 'hi';
    // Spanish
    if (lower.startsWith('es')) return 'es';
    // French
    if (lower.startsWith('fr')) return 'fr';
    // German
    if (lower.startsWith('de')) return 'de';
    // Arabic
    if (lower.startsWith('ar')) return 'ar';
    // Japanese
    if (lower.startsWith('ja') || lower.includes('jp')) return 'ja';
    // Chinese
    if (lower.startsWith('zh') || lower.includes('cn')) return 'zh';
    // English
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
    ja: '国際',
    zh: '国际',
  },
  Politics: {
    bn: 'রাজনীতি',
    hi: 'राजनीति',
    es: 'Política',
    fr: 'Politique',
    de: 'Politik',
    ar: 'سياسة',
    ja: '政治',
    zh: '政治',
  },
  Business: {
    bn: 'বাণিজ্য ও অর্থনীতি',
    hi: 'व्यापार',
    es: 'Economía y Negocios',
    fr: 'Économie',
    de: 'Wirtschaft',
    ar: 'اقتصاد',
    ja: 'ビジネス',
    zh: '商业',
  },
  Technology: {
    bn: 'প্রযুক্তি',
    hi: 'प्रौद्योगिकी',
    es: 'Tecnología',
    fr: 'Technologie',
    de: 'Technologie',
    ar: 'تكنولوجيا',
    ja: 'テクノロジー',
    zh: '科技',
  },
  Science: {
    bn: 'বিজ্ঞান',
    hi: 'विज्ञान',
    es: 'Ciencia',
    fr: 'Science',
    de: 'Wissenschaft',
    ar: 'علوم',
    ja: '科学',
    zh: '科学',
  },
  Health: {
    bn: 'স্বাস্থ্য',
    hi: 'स्वास्थ्य',
    es: 'Salud',
    fr: 'Santé',
    de: 'Gesundheit',
    ar: 'صحة',
    ja: '健康',
    zh: '健康',
  },
  Defense: {
    bn: 'প্রতিরক্ষা ও নিরাপত্তা',
    hi: 'रक्षा',
    es: 'Defensa y Seguridad',
    fr: 'Défense',
    de: 'Verteidigung',
    ar: 'دفاع',
    ja: '防衛',
    zh: '国防',
  },
  Environment: {
    bn: 'পরিবেশ ও জলবায়ু',
    hi: 'पर्यावरण',
    es: 'Medio Ambiente',
    fr: 'Environnement',
    de: 'Umwelt',
    ar: 'بيئة',
    ja: '環境',
    zh: '环境',
  },
  Sports: {
    bn: 'খেলাধুলা',
    hi: 'खेल',
    es: 'Deportes',
    fr: 'Sports',
    de: 'Sport',
    ar: 'رياضة',
    ja: 'スポーツ',
    zh: '体育',
  },
  Entertainment: {
    bn: 'বিনোদন ও সংস্কৃতি',
    hi: 'मनोरंजन',
    es: 'Entretenimiento',
    fr: 'Divertissement',
    de: 'Unterhaltung',
    ar: 'ترفيه',
    ja: 'エンタメ',
    zh: '娱乐',
  },
  Videos: {
    bn: 'ভিডিও প্রতিবেদন',
    hi: 'वीडियो',
    es: 'Vídeos',
    fr: 'Vidéos',
    de: 'Videos',
    ar: 'فيديو',
    ja: '動画',
    zh: '视频',
  },
  'Photo Stories': {
    bn: 'ছবিতে বিশ্ব',
    hi: 'चित्र कथाएं',
    es: 'Foto Reportajes',
    fr: 'Reportages Photo',
    de: 'Fotostorys',
    ar: 'قصص مصورة',
    ja: 'フォトストーリー',
    zh: '图片故事',
  },
  Opinion: {
    bn: 'মতামত',
    hi: 'राय',
    es: 'Opinión',
    fr: 'Opinion',
    de: 'Meinung',
    ar: 'رأي',
    ja: 'オピニオン',
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
    bn: 'bn-BD',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    ja: 'ja-JP',
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
    bn: 'bn-BD',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    ja: 'ja-JP',
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
    { name: 'Geneva', name_bn: 'জেনেভা', timeZone: 'Europe/Zurich' },
    { name: 'London', name_bn: 'লন্ডন', timeZone: 'Europe/London' },
    { name: 'Washington', name_bn: 'ওয়াশিংটন', timeZone: 'America/New_York' },
    { name: 'Tokyo', name_bn: 'টোকিও', timeZone: 'Asia/Tokyo' },
    { name: 'New Delhi', name_bn: 'নয়াদিল্লি', timeZone: 'Asia/Kolkata' },
    { name: 'Dhaka', name_bn: 'ঢাকা', timeZone: 'Asia/Dhaka' },
  ];

  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    bn: 'bn-BD',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    ja: 'ja-JP',
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
    if (lang === 'ja') return 'たった今';
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
    if (lang === 'ja') return `${diffInMinutes}分前`;
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
    if (lang === 'ja') return `${diffInHours}時間前`;
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
    if (lang === 'ja') return `${diffInDays}日前`;
    if (lang === 'zh') return `${diffInDays}天前`;
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
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
    ja: '速報',
    zh: '快讯',
  },
  'Latest News': {
    bn: 'সর্বশেষ সংবাদ',
    hi: 'नवीनतम समाचार',
    es: 'Últimas Noticias',
    fr: 'Dernières Nouvelles',
    de: 'Neueste Nachrichten',
    ar: 'آخر الأخبار',
    ja: '最新ニュース',
    zh: '最新消息',
  },
  'Submit News': {
    bn: 'নিউ সাবমিট',
    hi: 'समाचार भेजें',
    es: 'Enviar Noticia',
    fr: 'Soumettre Infos',
    de: 'Nachricht einreichen',
    ar: 'إرسال خبر',
    ja: 'ニュース送信',
    zh: '提交新闻',
  },
};

export function getEditorialTerm(term: string, lang: SupportedLanguage): string {
  if (lang === 'en') return term;
  const match = EDITORIAL_TERMS[term];
  if (match && match[lang]) return match[lang];
  return term;
}

// UI Strings Dictionary across all 9 supported languages
export const UI_STRINGS: Record<string, Record<SupportedLanguage, string>> = {
  backToTopStories: {
    en: 'Back to Top Stories',
    bn: 'প্রধান পাতায় ফিরুন',
    ja: 'トップニュースに戻る',
    es: 'Volver a Portada',
    fr: 'Retour à la Une',
    de: 'Zurück zur Übersicht',
    hi: 'मुख्य पृष्ठ पर वापस जाएँ',
    ar: 'العودة إلى الأخبار الرئيسية',
    zh: '返回头条新闻',
  },
  listen: {
    en: 'Listen',
    bn: 'খবর শুনুন',
    ja: '音声で聴く',
    es: 'Escuchar',
    fr: 'Écouter',
    de: 'Anhören',
    hi: 'सुनें',
    ar: 'استمع',
    zh: '收听报道',
  },
  stopAudio: {
    en: 'Stop Audio',
    bn: 'পড়া বন্ধ করুন',
    ja: '音声停止',
    es: 'Detener audio',
    fr: 'Arrêter l\'audio',
    de: 'Audio stoppen',
    hi: 'ऑडियो रोकें',
    ar: 'إيقاف الصوت',
    zh: '停止播放',
  },
  day: {
    en: '☀️ Day',
    bn: '☀️ দিন',
    ja: '☀️ 昼',
    es: '☀️ Día',
    fr: '☀️ Jour',
    de: '☀️ Tag',
    hi: '☀️ दिन',
    ar: '☀️ نهار',
    zh: '☀️ 白天',
  },
  sepia: {
    en: '📜 Sepia',
    bn: '📜 বই',
    ja: '📜 セピア',
    es: '📜 Sepia',
    fr: '📜 Sépia',
    de: '📜 Sepia',
    hi: '📜 सेपिया',
    ar: '📜 بني داكن',
    zh: '📜 羊皮纸',
  },
  night: {
    en: '🌙 Night',
    bn: '🌙 রাত',
    ja: '🌙 夜',
    es: '🌙 Noche',
    fr: '🌙 Nuit',
    de: '🌙 Nacht',
    hi: '🌙 रात',
    ar: '🌙 ليل',
    zh: '🌙 夜间',
  },
  save: {
    en: 'Save',
    bn: 'সংরক্ষণ',
    ja: '保存',
    es: 'Guardar',
    fr: 'Enregistrer',
    de: 'Speichern',
    hi: 'सहेजें',
    ar: 'حفظ',
    zh: '保存',
  },
  saved: {
    en: 'Saved',
    bn: 'সংরক্ষিত',
    ja: '保存済み',
    es: 'Guardado',
    fr: 'Enregistré',
    de: 'Gespeichert',
    hi: 'सहेजा गया',
    ar: 'تم الحفظ',
    zh: '已保存',
  },
  print: {
    en: 'Print',
    bn: 'প্রিন্ট',
    ja: '印刷',
    es: 'Imprimir',
    fr: 'Imprimer',
    de: 'Drucken',
    hi: 'प्रिंट करें',
    ar: 'طباعة',
    zh: '打印',
  },
  published: {
    en: 'Published',
    bn: 'প্রকাশিত',
    ja: '公開',
    es: 'Publicado',
    fr: 'Publié',
    de: 'Veröffentlicht',
    hi: 'प्रकाशित',
    ar: 'نُشر',
    zh: '发布于',
  },
  updated: {
    en: 'Updated',
    bn: 'হালনাগাদ',
    ja: '更新',
    es: 'Actualizado',
    fr: 'Mis à jour',
    de: 'Aktualisiert',
    hi: 'अपडेट किया गया',
    ar: 'تم التحديث',
    zh: '更新于',
  },
  words: {
    en: 'words',
    bn: 'শব্দ',
    ja: '語',
    es: 'palabras',
    fr: 'mots',
    de: 'Wörter',
    hi: 'शब्द',
    ar: 'كلمة',
    zh: '字',
  },
  saveBookmarkStory: {
    en: 'Save / Bookmark Story',
    bn: 'সংবাদটি সংরক্ষণ করুন',
    ja: '記事を保存 / ブックマーク',
    es: 'Guardar / Marcar Noticia',
    fr: 'Enregistrer l\'article',
    de: 'Artikel speichern',
    hi: 'समाचार सहेजें / बुकमार्क',
    ar: 'حفظ / إشارة مرجعية للخبر',
    zh: '保存 / 书签收藏报道',
  },
  savedInBookmarks: {
    en: 'Saved in Bookmarks ✓',
    bn: 'বুকমার্কে সংরক্ষিত ✓',
    ja: 'ブックマークに保存済み ✓',
    es: 'Guardado en Marcadores ✓',
    fr: 'Enregistré dans les favoris ✓',
    de: 'Gespeichert ✓',
    hi: 'बुकमार्क में सहेजा गया ✓',
    ar: 'محفوظ في الإشارات المرجعية ✓',
    zh: '已收藏至书签 ✓',
  },
  savedArticles: {
    en: 'Saved Articles',
    bn: 'সংরক্ষিত সংবাদ',
    ja: '保存した記事',
    es: 'Artículos Guardados',
    fr: 'Articles Enregistrés',
    de: 'Gespeicherte Artikel',
    hi: 'सहेजे गए लेख',
    ar: 'المقالات المحفوظة',
    zh: '已保存的文章',
  },
  readingProgress: {
    en: 'Reading Progress:',
    bn: 'পড়ার অগ্রগতি:',
    ja: '読了進捗:',
    es: 'Progreso de lectura:',
    fr: 'Progression de lecture :',
    de: 'Lesefortschritt:',
    hi: 'पढ़ने की प्रगति:',
    ar: 'تقدم القراءة:',
    zh: '阅读进度：',
  },
  readingCompleted: {
    en: 'Reading completed (100%)',
    bn: 'পড়া সম্পূর্ণ (১০০%)',
    ja: '読了完了 (100%)',
    es: 'Lectura completada (100%)',
    fr: 'Lecture terminée (100%)',
    de: 'Gelesen (100%)',
    hi: 'पढ़ना पूरा हुआ (100%)',
    ar: 'اكتملت القراءة (100%)',
    zh: '阅读完毕 (100%)',
  },
  scrollToTop: {
    en: 'Scroll to top',
    bn: 'শীর্ষে ফিরে যান',
    ja: 'トップに戻る',
    es: 'Volver arriba',
    fr: 'Haut de page',
    de: 'Nach oben',
    hi: 'शीर्ष पर जाएं',
    ar: 'العودة إلى الأعلى',
    zh: '返回顶部',
  },
  finishedReading: {
    en: 'Finished reading? Save to your archive',
    bn: 'পড়া শেষ করলেন? প্রতিবেদনটি সংরক্ষণ করুন',
    ja: '読了しましたか？アーカイブに保存',
    es: '¿Terminaste de leer? Guárdalo en tu archivo',
    fr: 'Lecture terminée ? Enregistrez dans vos archives',
    de: 'Fertig gelesen? In Ihrem Archiv speichern',
    hi: 'पढ़ना समाप्त किया? अपने संग्रह में सहेजें',
    ar: 'أنهيت القراءة؟ احفظ في أرشيفك',
    zh: '阅读完毕？保存至个人档案',
  },
  finishedReadingSub: {
    en: 'Bookmark this dispatch to local storage to revisit anytime.',
    bn: 'পরবর্তীতে পুনরায় পড়তে লোকাল স্টোরেজে বুকমার্ক করুন।',
    ja: 'ローカルストレージにブックマークして、いつでも再読できます。',
    es: 'Guarda este despacho en el almacenamiento local para volver a leerlo.',
    fr: 'Enregistrez cette dépêche dans la mémoire locale pour la relire plus tard.',
    de: 'Speichern Sie diesen Bericht lokal, um ihn jederzeit wiederzulesen.',
    hi: 'किसी भी समय दोबारा पढ़ने के लिए इसे स्थानीय स्टोरेज में सहेजें।',
    ar: 'احفظ هذا التقرير في التخزين المحلي لإعادة زيارته في أي وقت.',
    zh: '将此报道保存到本地存储，以便随时重温。',
  },
  topics: {
    en: 'Topics:',
    bn: 'টপিক:',
    ja: 'トピック:',
    es: 'Temas:',
    fr: 'Thèmes :',
    de: 'Themen:',
    hi: 'विषय:',
    ar: 'المواضيع:',
    zh: '专题：',
  },
  photo: {
    en: 'Photo:',
    bn: 'ছবি:',
    ja: '写真:',
    es: 'Foto:',
    fr: 'Photo :',
    de: 'Foto:',
    hi: 'फ़ोटो:',
    ar: 'صورة:',
    zh: '图片：',
  },
  bureauBylines: {
    en: 'Bureau Bylines',
    bn: 'ব্যুরো বাইলাইন',
    ja: '特派員署名 (バイライン)',
    es: 'Firma de Corresponsalía',
    fr: 'Signature du Bureau',
    de: 'Korrespondenten-Profil',
    hi: 'ब्यूरो बायलाइन',
    ar: 'توقيع المراسل',
    zh: '分社特派署名',
  },
  relatedNews: {
    en: 'Related News & Intelligence',
    bn: 'সম্পর্কিত সংবাদ ও বিশ্লেষণ',
    ja: '関連ニュース・インテリジェンス',
    es: 'Noticias e Inteligencia Relacionadas',
    fr: 'Actualités et Analyses Liées',
    de: 'Verwandte Berichte & Analysen',
    hi: 'संबंधित समाचार व विश्लेषण',
    ar: 'الأخبار والتحليلات ذات الصلة',
    zh: '相关新闻与深度分析',
  },
  mostRead: {
    en: 'Most Read Worldwide',
    bn: 'বিশ্বজুড়ে সর্বাধিক পঠিত',
    ja: '世界で最も読まれている記事',
    es: 'Lo Más Leído en el Mundo',
    fr: 'Le Plus Lu dans le Monde',
    de: 'Weltweit meistgelesen',
    hi: 'दुनिया भर में सबसे ज्यादा पढ़ा गया',
    ar: 'الأكثر قراءة عالمياً',
    zh: '全球热读文章',
  },
  reads: {
    en: 'reads',
    bn: 'বার পঠিত',
    ja: '閲覧',
    es: 'lecturas',
    fr: 'lectures',
    de: 'Aufrufe',
    hi: 'बार पढ़ा गया',
    ar: 'قراءة',
    zh: '次阅读',
  },
  autoTranslating: {
    en: 'Translating...',
    bn: 'অনুবাদ হচ্ছে...',
    ja: '自動翻訳中...',
    es: 'Traduciendo...',
    fr: 'Traduction en cours...',
    de: 'Wird übersetzt...',
    hi: 'अनुवाद हो रहा है...',
    ar: 'جارٍ الترجمة...',
    zh: '正在翻译中...',
  },
  globalEdition: {
    en: 'Global Edition',
    bn: 'আন্তর্জাতিক সংস্করণ',
    ja: '国際エディション',
    es: 'Edición Global',
    fr: 'Édition Mondiale',
    de: 'Globale Ausgabe',
    hi: 'वैश्विक संस्करण',
    ar: 'النسخة العالمية',
    zh: '国际版',
  },
  bureausAndZones: {
    en: 'Bureaus & Zones',
    bn: 'ব্যুরো সময় ও জোন',
    ja: '支局とタイムゾーン',
    es: 'Oficinas y Zonas',
    fr: 'Bureaux et Fuseaux',
    de: 'Büros & Zeitzonen',
    hi: 'ब्यूरो और क्षेत्र',
    ar: 'المكاتب والمناطق',
    zh: '分社与时区',
  },
  activeTimezoneAndCountry: {
    en: 'Active Timezone & Country',
    bn: 'টাইম জোন ও দেশ নির্বাচন',
    ja: '有効なタイムゾーンと地域',
    es: 'Zona Horaria y País',
    fr: 'Fuseau Horaire et Pays',
    de: 'Zeitzone & Land',
    hi: 'सक्रिय समय क्षेत्र और देश',
    ar: 'المنطقة الزمنية والبلد',
    zh: '当前时区与地区',
  },
  liveAuto: {
    en: 'Live Auto',
    bn: 'লাইভ অটো রূপান্তর',
    ja: 'ライブ自動変換',
    es: 'Auto en Vivo',
    fr: 'Auto en Direct',
    de: 'Live-Auto',
    hi: 'लाइव ऑटो',
    ar: 'تلقائي مباشر',
    zh: '实时自动',
  },
  yourDeviceAutoDetect: {
    en: 'Your Device Auto-Detect',
    bn: 'আপনার নিজস্ব ডিভাইস সময়',
    ja: 'お使いの端末の自動検出',
    es: 'Detección de dispositivo',
    fr: 'Détection automatique de l\'appareil',
    de: 'Geräte-Zeitzone automatisch',
    hi: 'डिवाइस का स्वतः पता लगाएं',
    ar: 'الكشف التلقائي لجهازك',
    zh: '设备自动检测时间',
  },
  worldBureausLiveClocks: {
    en: 'World Bureaus Live Clocks',
    bn: 'বিশ্ব ব্যুরো লাইভ ঘড়ি (রিয়েল-টাইম)',
    ja: '世界主要支局のリアルタイム時計',
    es: 'Relojes en Vivo de Corresponsalías',
    fr: 'Horloges des Bureaux Mondiaux',
    de: 'Live-Uhren der Weltbüros',
    hi: 'विश्व ब्यूरो लाइव घड़ियाँ',
    ar: 'ساعات المكاتب العالمية المباشرة',
    zh: '全球分社实时时钟',
  },
  submitNews: {
    en: 'Submit News',
    bn: 'সংবাদ পাঠান',
    ja: '情報提供・投稿',
    es: 'Enviar Noticia',
    fr: 'Soumettre une Info',
    de: 'Nachricht einreichen',
    hi: 'समाचार भेजें',
    ar: 'إرسال خبر',
    zh: '报料投稿',
  },
  adminLogin: {
    en: 'Admin Login',
    bn: 'এডমিন লগইন',
    ja: '管理者ログイン',
    es: 'Acceso Admin',
    fr: 'Connexion Admin',
    de: 'Admin-Login',
    hi: 'व्यवस्थापक लॉगिन',
    ar: 'دخول المسؤول',
    zh: '管理员登录',
  },
  viewAsReader: {
    en: 'View as Reader',
    bn: 'দর্শক হিসেবে দেখুন',
    ja: '読者表示モード',
    es: 'Ver como Lector',
    fr: 'Mode Lecteur',
    de: 'Leseransicht',
    hi: 'पाठक के रूप में देखें',
    ar: 'عرض كقارئ',
    zh: '读者视角浏览',
  },
  adminCMS: {
    en: 'Admin CMS',
    bn: 'এডমিন প্যানেল',
    ja: '管理CMS',
    es: 'Panel Admin',
    fr: 'CMS Admin',
    de: 'Admin-CMS',
    hi: 'एडमिन पैनल',
    ar: 'لوحة التحكم',
    zh: '管理后台',
  },
  home: {
    en: 'Home',
    bn: 'হোম',
    ja: 'ホーム',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Start',
    hi: 'होम',
    ar: 'الرئيسية',
    zh: '首页',
  },
  frontPage: {
    en: 'Front Page',
    bn: 'প্রধান পাতা',
    ja: 'トップページ',
    es: 'Portada',
    fr: 'Une',
    de: 'Titelseite',
    hi: 'मुख्य पृष्ठ',
    ar: 'الصفحة الأولى',
    zh: '头版',
  },
  signOut: {
    en: 'Sign Out / Logout',
    bn: 'লগআউট করুন',
    ja: 'ログアウト',
    es: 'Cerrar Sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    hi: 'লগ আউট',
    ar: 'تسجيل الخروج',
    zh: '退出登录',
  },
};

export function getUIText(key: string, lang: SupportedLanguage): string {
  if (UI_STRINGS[key] && UI_STRINGS[key][lang]) {
    return UI_STRINGS[key][lang];
  }
  if (UI_STRINGS[key] && UI_STRINGS[key]['en']) {
    return UI_STRINGS[key]['en'];
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
    zh: [
      [/\bUnited Nations\b/gi, '联合国'],
      [/\bSecurity Council\b/gi, '安全理事会'],
      [/\bGeneva\b/gi, '日内瓦'],
      [/\bArtificial Intelligence\b/gi, '人工智能'],
      [/\bSemiconductor\b/gi, '半导体'],
      [/\bHistoric\b/gi, '历史性'],
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
