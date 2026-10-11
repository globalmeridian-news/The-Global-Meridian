import { Article } from '../types/news';
import { calculateArticleWordCount, getArticleReadingStats } from './readingTime';

export function getSiteUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://meridian-news.org';
}

export function generateNewsArticleJsonLd(article: Article, customSiteUrl?: string): object {
  const siteUrl = customSiteUrl || getSiteUrl();
  const permalink = `${siteUrl}/?article=${article.id}`;

  const baseImg = article.featuredImage?.url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=85';
  
  // Google Discover requires high-resolution images with 16x9, 4x3, and 1x1 aspect ratios (min 1200px wide)
  const imageUrls = [
    baseImg,
    baseImg.includes('?') ? `${baseImg}&ar=16:9&fit=crop` : `${baseImg}?ar=16:9&fit=crop`,
    baseImg.includes('?') ? `${baseImg}&ar=4:3&fit=crop` : `${baseImg}?ar=4:3&fit=crop`,
    baseImg.includes('?') ? `${baseImg}&ar=1:1&fit=crop` : `${baseImg}?ar=1:1&fit=crop`,
    ...(article.additionalImages || []).map((img) => img.url),
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
      url: `${siteUrl}/?author=${article.author.id}`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'The Global Meridian',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        width: 600,
        height: 60,
      },
      publishingPrinciples: `${siteUrl}/?policy=editorial-policy`,
      correctionsPolicy: `${siteUrl}/?policy=corrections-policy`,
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
        item: `${siteUrl}/?cat=${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${siteUrl}/?article=${article.id}`,
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
    description: 'Trusted international journalism delivering verified breaking world news, geopolitical diplomacy, economics, and science.',
    url: siteUrl,
    inLanguage: ['en', 'bn'],
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

export function generateSitemapXml(articles: Article[], customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  const published = articles.filter((a) => a.status === 'published');
  const urls = published
    .map(
      (a) => `  <url>
    <loc>${siteUrl}/?article=${a.id}</loc>
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
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
}

export function generateGoogleNewsSitemapXml(articles: Article[], customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();
  const published = articles.filter((a) => a.status === 'published');
  const items = published
    .map(
      (a) => `  <url>
    <loc>${siteUrl}/?article=${a.id}</loc>
    <news:news>
      <news:publication>
        <news:name>The Global Meridian</news:name>
        <news:language>${a.originalLanguage === 'bn' ? 'bn' : 'en'}</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
      <news:keywords>${a.tags.join(', ')}</news:keywords>
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
      <link>${siteUrl}/?article=${a.id}</link>
      <guid isPermaLink="true">${siteUrl}/?article=${a.id}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category><![CDATA[${a.category}]]></category>
      <description><![CDATA[${a.summary}]]></description>
      <author>${a.author.email} (${a.author.name})</author>
      <enclosure url="${a.featuredImage.url}" type="image/jpeg" length="${a.featuredImage.sizeBytes || 1200000}" />
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>The Global Meridian – International News Wire</title>
    <link>${siteUrl}</link>
    <description>Authoritative, verified global journalism from international news bureaus across Geneva, Tokyo, Washington, London, New Delhi, and Dhaka.</description>
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

# Google Discover, Googlebot, and Google News directives
User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml
`;
}
