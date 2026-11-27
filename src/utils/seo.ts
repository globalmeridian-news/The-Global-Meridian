import { Article } from '../types/news';
import { calculateArticleWordCount, getArticleReadingStats } from './readingTime';

export function getSiteUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://the-global-meridian.incognito120120.workers.dev';
}

export function resolveAbsoluteImageUrl(url: string, customSiteUrl?: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (customSiteUrl || getSiteUrl()).replace(/\/+$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function generateNewsArticleJsonLd(article: Article, customSiteUrl?: string): object {
  const siteUrl = customSiteUrl || getSiteUrl();
  const permalink = `${siteUrl}/article/${encodeURIComponent(article.id)}`;

  const rawImg = article.featuredImage?.url || '/assets/news/art-141-spacex-starmind-orbital-ai.jpg';
  const baseImg = resolveAbsoluteImageUrl(rawImg, siteUrl);
  const isUnsplash = baseImg.includes('images.unsplash.com');

  // Google Discover requires high-resolution images (min 1200px wide)
  const imageUrls = [
    baseImg,
    ...(isUnsplash
      ? [
          baseImg.includes('?') ? `${baseImg}&ar=16:9&fit=crop` : `${baseImg}?ar=16:9&fit=crop`,
          baseImg.includes('?') ? `${baseImg}&ar=4:3&fit=crop` : `${baseImg}?ar=4:3&fit=crop`,
          baseImg.includes('?') ? `${baseImg}&ar=1:1&fit=crop` : `${baseImg}?ar=1:1&fit=crop`,
        ]
      : []),
    ...(article.additionalImages || []).map((img) => resolveAbsoluteImageUrl(img.url, siteUrl)),
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': permalink,
    },
    headline: article.title,
    alternativeHeadline: article.title_bn || article.title,
    description: article.summary,
    image: imageUrls,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.title,
      url: `${siteUrl}/author/${encodeURIComponent(article.author.id)}`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'The Global Meridian',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 600,
        height: 60,
      },
      publishingPrinciples: `${siteUrl}/policy/editorial-policy`,
      correctionsPolicy: `${siteUrl}/policy/corrections-policy`,
      areaServed: ['Europe', 'Middle East', 'Americas', 'Russia', 'China', 'India', 'Japan', 'South Korea', 'Africa'],
      availableLanguage: ['English', 'Arabic', 'French', 'German', 'Spanish', 'Russian', 'Chinese', 'Hindi', 'Japanese', 'Korean', 'Bengali'],
      sameAs: [
        'https://twitter.com/GlobalMeridian',
        'https://facebook.com/GlobalMeridian',
        'https://news.google.com',
      ],
    },
    isAccessibleForFree: 'True',
    articleSection: article.category,
    keywords: article.tags.join(', '),
    inLanguage: article.originalLanguage === 'bn' ? 'bn-BD' : 'en-US',
    dateline: article.location,
    wordCount: calculateArticleWordCount(article, article.originalLanguage),
    timeRequired: getArticleReadingStats(article, article.originalLanguage).isoDuration,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-lead-summary'],
    },
  };
}

export function generateBreadcrumbJsonLd(article: Article, customSiteUrl?: string): object {
  const siteUrl = customSiteUrl || getSiteUrl();
  const categorySlug = article.category.toLowerCase().replace(/\s+/g, '-');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: `${siteUrl}/category/${encodeURIComponent(categorySlug)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${siteUrl}/article/${encodeURIComponent(article.id)}`,
      },
    ],
  };
}

export function generateArticleFaqJsonLd(article: Article): object {
  const publishedDate = article.publishedAt.split('T')[0];
  const leadParagraph = article.blocks.find((b) => b.type === 'paragraph');
  const keyContext = leadParagraph?.text || article.summary;
  const sourceNote = article.source
    ? `This dispatch cites ${article.source} and covers ${article.tags.join(', ')}.`
    : `Verified by The Global Meridian ${article.category} desk across ${article.tags.join(', ')}.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the core development in "${article.title}"?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${article.summary} ${keyContext}`.trim(),
        },
      },
      {
        '@type': 'Question',
        name: `When and where was this ${article.category} report filed?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Filed from ${article.location} on ${publishedDate} by ${article.author.name} (${article.author.title}) for The Global Meridian.`,
        },
      },
      {
        '@type': 'Question',
        name: `What sources verify this report?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: sourceNote,
        },
      },
    ],
  };
}

export function generateWebSiteJsonLd(customSiteUrl?: string): object {
  const siteUrl = customSiteUrl || getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Global Meridian',
    alternateName: [
      'The Global Meridian News',
      'Global Meridian',
      'দ্য গ্লোবাল মেরিডিয়ান',
      'Meridian News Wire',
    ],
    description: 'Authoritative international journalism covering Europe, the Middle East, the Americas, Russia, China, India, Japan, South Korea, and Africa.',
    url: siteUrl,
    inLanguage: ['en', 'ar', 'fr', 'de', 'es', 'ru', 'zh', 'hi', 'ja', 'ko', 'bn'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

const SITEMAP_CATEGORIES = [
  'world',
  'politics',
  'business',
  'technology',
  'science',
  'health',
  'defense',
  'environment',
  'sports',
  'entertainment',
  'videos',
  'photo-stories',
  'opinion',
];

const SITEMAP_POLICIES = [
  'editorial-policy',
  'fact-checking',
  'corrections-policy',
  'about-us',
  'privacy-policy',
  'terms-of-service',
  'contact',
  'cookie-policy',
];

export function generateSitemapXml(articles: Article[], customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  const published = articles.filter((a) => a.status === 'published');
  const latestDate = published[0]
    ? (published[0].updatedAt || published[0].publishedAt).split('T')[0]
    : new Date().toISOString().split('T')[0];

  const categoryUrls = SITEMAP_CATEGORIES.map(
    (slug) => `  <url>
    <loc>${siteUrl}/category/${encodeURIComponent(slug)}</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`
  ).join('\n');

  const authorIds = Array.from(new Set(published.map((a) => a.author?.id).filter(Boolean)));
  const authorUrls = authorIds
    .map(
      (id) => `  <url>
    <loc>${siteUrl}/author/${encodeURIComponent(id)}</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n');

  const policyUrls = SITEMAP_POLICIES.map(
    (slug) => `  <url>
    <loc>${siteUrl}/policy/${encodeURIComponent(slug)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
  ).join('\n');

  const urls = published
    .map(
      (a) => `  <url>
    <loc>${siteUrl}/article/${encodeURIComponent(a.id)}</loc>
    <lastmod>${(a.updatedAt || a.publishedAt).split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${a.isFeatured ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${categoryUrls}
${urls}
${authorUrls}
${policyUrls}
</urlset>`;
}

export function generateGoogleNewsSitemapXml(articles: Article[], customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  const published = articles
    .filter((a) => a.status === 'published')
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  // Google News Sitemap guidelines require articles published within the last 48 hours
  const newestTimestamp = published[0] ? Date.parse(published[0].publishedAt) : Date.now();
  const cutoffTimestamp = newestTimestamp - 48 * 60 * 60 * 1000;
  const recentNews = published.filter((a) => Date.parse(a.publishedAt) >= cutoffTimestamp);
  const newsEntries = recentNews.length > 0 ? recentNews : published.slice(0, 15);

  const items = newsEntries
    .map(
      (a) => `  <url>
    <loc>${siteUrl}/article/${encodeURIComponent(a.id)}</loc>
    <news:news>
      <news:publication>
        <news:name>The Global Meridian</news:name>
        <news:language>${a.originalLanguage === 'bn' ? 'bn' : 'en'}</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt.split('T')[0]}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;
}

export function generateRssFeedXml(articles: Article[], customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  const published = articles.filter((a) => a.status === 'published');
  const items = published
    .map(
      (a) => `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/article/${encodeURIComponent(a.id)}</link>
      <guid isPermaLink="true">${siteUrl}/article/${encodeURIComponent(a.id)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category><![CDATA[${a.category}]]></category>
      <description><![CDATA[${a.summary}]]></description>
      <author>${a.author.email} (${a.author.name})</author>
      <enclosure url="${resolveAbsoluteImageUrl(a.featuredImage.url, siteUrl)}" type="image/jpeg" length="${a.featuredImage.sizeBytes || 1200000}" />
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>The Global Meridian – International News Wire</title>
    <link>${siteUrl}</link>
    <description>Authoritative, verified global journalism from international news bureaus across London, Brussels, Washington, Dubai, Moscow, Beijing, Tokyo, Seoul, New Delhi, and Nairobi.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function generateRobotsTxt(customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /*?view=cms
Disallow: /*?view=seo
Disallow: /*?view=submit

# Google Discover, Googlebot, and Google News directives
User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml
`;
}
