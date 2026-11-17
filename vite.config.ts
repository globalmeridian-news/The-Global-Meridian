import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {INITIAL_ARTICLES} from './src/data/initialNews.ts';
import type {Article} from './src/types/news.ts';

const SITE_URL = 'https://the-global-meridian.incognito120120.workers.dev';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function buildArticleCanonicalUrl(art: Article): string {
  return `${SITE_URL}/article/${encodeURIComponent(art.id)}`;
}

function buildCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

function buildCategoryCanonicalUrl(category: string): string {
  return `${SITE_URL}/category/${encodeURIComponent(buildCategorySlug(category))}`;
}

function replaceMetaAndCanonical(
  html: string,
  opts: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogType: 'website' | 'article';
    imageUrl: string;
    keywords?: string;
    extraSchemasJsonLd?: string;
    bodyShell: string;
  },
): string {
  const safeTitle = escapeHtml(opts.title);
  const safeDesc = escapeHtml(opts.description);
  const safeUrl = escapeHtml(opts.canonicalUrl);
  const safeImg = escapeHtml(opts.imageUrl);

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${safeDesc}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${safeUrl}" />`,
    )
    .replace(
      /(<link rel="alternate" hreflang="[^"]+" href=")[^"]*("\s*\/>)/g,
      `$1${safeUrl}$2`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${safeDesc}" />`,
    )
    .replace(
      /<meta property="og:type" content="[^"]*"\s*\/>/,
      `<meta property="og:type" content="${opts.ogType}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${safeImg}" />\n    <meta property="og:url" content="${safeUrl}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${safeDesc}" />`,
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${safeImg}" />`,
    );

  if (opts.keywords) {
    out = out.replace(
      /<meta name="news_keywords" content="[^"]*"\s*\/>/,
      `<meta name="news_keywords" content="${escapeHtml(opts.keywords)}" />`,
    );
  }

  if (opts.extraSchemasJsonLd) {
    out = out.replace(
      /<script type="application\/ld\+json" id="google-home-itemlist-schema">[\s\S]*?<\/script>/,
      opts.extraSchemasJsonLd,
    );
  }

  out = out.replace(
    /<!-- PRERENDERED_NEWS_SHELL -->[\s\S]*?<!-- \/PRERENDERED_NEWS_SHELL -->/,
    opts.bodyShell,
  );

  return out;
}

function buildNavHtml(): string {
  const cats = [
    'World',
    'Politics',
    'Business',
    'Technology',
    'Science',
    'Health',
    'Defense',
    'Environment',
    'Sports',
    'Entertainment',
    'Opinion',
  ];
  return [
    `<a href="${SITE_URL}/">Home</a>`,
    ...cats.map((c) => `<a href="${buildCategoryCanonicalUrl(c)}">${escapeHtml(c)}</a>`),
  ].join(' | ');
}

function buildFooterHtml(): string {
  return `<footer>
        <a href="${SITE_URL}/sitemap.xml">Sitemap</a> |
        <a href="${SITE_URL}/news-sitemap.xml">Google News Sitemap</a> |
        <a href="${SITE_URL}/rss.xml">RSS Feed</a> |
        <a href="${SITE_URL}/llms.txt">LLMs Index</a> |
        <a href="${SITE_URL}/policy/editorial-policy">Editorial Policy</a> |
        <a href="${SITE_URL}/policy/corrections-policy">Corrections Policy</a> |
        <a href="${SITE_URL}/policy/about-us">About Us</a> |
        <a href="${SITE_URL}/policy/privacy-policy">Privacy Policy</a>
      </footer>`;
}

function seoPrerenderPlugin(): Plugin {
  const outDir = path.resolve(import.meta.dirname || __dirname, 'dist');

  return {
    name: 'global-meridian-seo-prerender',
    transformIndexHtml(html) {
      const published = INITIAL_ARTICLES.filter((a) => a.status === 'published');

      const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Latest International News & Analysis – The Global Meridian',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: published.length,
        itemListElement: published.map((art, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildArticleCanonicalUrl(art),
          item: {
            '@type': 'NewsArticle',
            headline: art.title,
            alternativeHeadline: art.title_bn || art.title,
            description: art.summary,
            url: buildArticleCanonicalUrl(art),
            datePublished: art.publishedAt,
            dateModified: art.updatedAt || art.publishedAt,
            articleSection: art.category,
            image: art.featuredImage?.url,
            author: {
              '@type': 'Person',
              name: art.author.name,
            },
            publisher: {
              '@type': 'NewsMediaOrganization',
              name: 'The Global Meridian',
              url: SITE_URL,
            },
          },
        })),
      };

      const schemaTag = `<script type="application/ld+json" id="google-home-itemlist-schema">\n${escapeJsonScript(itemListJsonLd)}\n    </script>`;

      const articleMarkup = published
        .map((art) => {
          const leadParagraph = art.blocks.find((b) => b.type === 'paragraph');
          const leadEn = leadParagraph?.text ? `<p>${escapeHtml(leadParagraph.text)}</p>` : '';
          const leadBn = leadParagraph?.text_bn ? `<p lang="bn">${escapeHtml(leadParagraph.text_bn)}</p>` : '';
          const titleBn = art.title_bn ? `<h3 lang="bn">${escapeHtml(art.title_bn)}</h3>` : '';
          const summaryBn = art.summary_bn ? `<p lang="bn">${escapeHtml(art.summary_bn)}</p>` : '';
          const articleUrl = buildArticleCanonicalUrl(art);
          return `        <article>
          <h2><a href="${articleUrl}">${escapeHtml(art.title)}</a></h2>
          ${titleBn}
          <p><strong>${escapeHtml(art.category)}</strong> · ${escapeHtml(art.location)} · <time datetime="${escapeHtml(art.publishedAt)}">${escapeHtml(art.publishedAt.split('T')[0])}</time> · By ${escapeHtml(art.author.name)} · Source: ${escapeHtml(art.source)}</p>
          <p>${escapeHtml(art.summary)}</p>
          ${summaryBn}
          ${leadEn}
          ${leadBn}
        </article>`;
        })
        .join('\n');

      const prerenderedShell = `<!-- PRERENDERED_NEWS_SHELL -->
      <header>
        <h1>The Global Meridian – International Journal of Record</h1>
        <p>Verified international journalism covering Europe, the Middle East, the Americas, Russia, China, India, Japan, South Korea, and Africa across diplomacy, politics, economics, technology, defense, and science.</p>
        <nav aria-label="News Categories">
          ${buildNavHtml()}
        </nav>
      </header>
      <main>
        <section aria-label="Latest International Dispatches">
          <h2>Latest Verified International Dispatches &amp; Analysis</h2>
${articleMarkup}
        </section>
      </main>
      ${buildFooterHtml()}
      <!-- /PRERENDERED_NEWS_SHELL -->`;

      let output = html.replace('<!-- PRERENDERED_ITEMLIST_SCHEMA -->', schemaTag);
      output = output.replace(
        /<!-- PRERENDERED_NEWS_SHELL -->[\s\S]*?<!-- \/PRERENDERED_NEWS_SHELL -->/,
        prerenderedShell,
      );
      return output;
    },

    closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const baseHtml = fs.readFileSync(indexPath, 'utf8');
      const published = INITIAL_ARTICLES.filter((a) => a.status === 'published');

      // 1. Pre-render individual HTML pages for every published article (/article/:id)
      for (const art of published) {
        const canonicalUrl = buildArticleCanonicalUrl(art);
        const categoryUrl = buildCategoryCanonicalUrl(art.category);
        const imgUrl =
          art.featuredImage?.url ||
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=85';

        const newsArticleJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          mainEntityOfPage: {'@type': 'WebPage', '@id': canonicalUrl},
          headline: art.title,
          alternativeHeadline: art.title_bn || art.title,
          description: art.summary,
          image: [imgUrl],
          datePublished: art.publishedAt,
          dateModified: art.updatedAt || art.publishedAt,
          articleSection: art.category,
          keywords: art.tags.join(', '),
          dateline: art.location,
          inLanguage: art.originalLanguage === 'bn' ? 'bn-BD' : 'en-US',
          author: {
            '@type': 'Person',
            name: art.author.name,
            jobTitle: art.author.title,
            url: `${SITE_URL}/author/${encodeURIComponent(art.author.id)}`,
          },
          publisher: {
            '@type': 'NewsMediaOrganization',
            name: 'The Global Meridian',
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=600&q=80',
              width: 600,
              height: 60,
            },
          },
          isAccessibleForFree: 'True',
        };

        const breadcrumbJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {'@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/`},
            {'@type': 'ListItem', position: 2, name: art.category, item: categoryUrl},
            {'@type': 'ListItem', position: 3, name: art.title, item: canonicalUrl},
          ],
        };

        const leadParagraph = art.blocks.find((b) => b.type === 'paragraph');
        const faqJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What is the key news in "${art.title}"?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${art.summary} ${leadParagraph?.text || ''}`.trim(),
              },
            },
            {
              '@type': 'Question',
              name: `Where and when was this ${art.category} report filed?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Filed from ${art.location} on ${art.publishedAt.split('T')[0]} by ${art.author.name} (${art.author.title}) for The Global Meridian.`,
              },
            },
          ],
        };

        const schemasHtml = `<script type="application/ld+json" id="newsarticle-schema">${escapeJsonScript(newsArticleJsonLd)}</script>
    <script type="application/ld+json" id="breadcrumbs-schema">${escapeJsonScript(breadcrumbJsonLd)}</script>
    <script type="application/ld+json" id="faq-schema">${escapeJsonScript(faqJsonLd)}</script>`;

        const paragraphsHtml = art.blocks
          .filter((b) => b.type === 'paragraph' || b.type === 'subheading' || b.type === 'quote')
          .map((b) => {
            const en = b.text ? `<p>${escapeHtml(b.text)}</p>` : '';
            const bn = b.text_bn ? `<p lang="bn">${escapeHtml(b.text_bn)}</p>` : '';
            return `${en}\n          ${bn}`;
          })
          .join('\n          ');

        const relatedHtml = published
          .filter((r) => r.id !== art.id && r.category === art.category)
          .slice(0, 4)
          .map(
            (r) =>
              `<li><a href="${buildArticleCanonicalUrl(r)}">${escapeHtml(r.title)}</a></li>`,
          )
          .join('\n            ');

        const bodyShell = `<!-- PRERENDERED_NEWS_SHELL -->
      <header>
        <p><a href="${SITE_URL}/">The Global Meridian</a></p>
        <nav aria-label="News Categories">
          ${buildNavHtml()}
        </nav>
      </header>
      <main>
        <article>
          <p><a href="${categoryUrl}">${escapeHtml(art.category)}</a> · ${escapeHtml(art.location)} · <time datetime="${escapeHtml(art.publishedAt)}">${escapeHtml(art.publishedAt.split('T')[0])}</time></p>
          <h1>${escapeHtml(art.title)}</h1>
          ${art.title_bn ? `<h2 lang="bn">${escapeHtml(art.title_bn)}</h2>` : ''}
          <p>By ${escapeHtml(art.author.name)} (${escapeHtml(art.author.title)}) · Source: ${escapeHtml(art.source)}</p>
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(art.featuredImage?.caption || art.title)}" />
          <p class="article-lead-summary"><strong>${escapeHtml(art.summary)}</strong></p>
          ${art.summary_bn ? `<p lang="bn">${escapeHtml(art.summary_bn)}</p>` : ''}
          ${paragraphsHtml}
          <p>Topics: ${escapeHtml(art.tags.join(', '))}</p>
        </article>
        ${relatedHtml ? `<aside><h2>Related ${escapeHtml(art.category)} Reports</h2><ul>\n            ${relatedHtml}\n          </ul></aside>` : ''}
      </main>
      ${buildFooterHtml()}
      <!-- /PRERENDERED_NEWS_SHELL -->`;

        const pageHtml = replaceMetaAndCanonical(baseHtml, {
          title: `${art.seoTitle || art.title} – The Global Meridian`,
          description: art.seoDescription || art.summary,
          canonicalUrl,
          ogType: 'article',
          imageUrl: imgUrl,
          keywords: art.tags.join(', '),
          extraSchemasJsonLd: schemasHtml,
          bodyShell,
        });

        const dir = path.join(outDir, 'article', art.id);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), pageHtml, 'utf8');
      }

      // 2. Pre-render category landing pages (/category/:slug) for all 13 categories
      const categories = Array.from(
        new Set([
          'World',
          'Politics',
          'Business',
          'Technology',
          'Science',
          'Health',
          'Defense',
          'Environment',
          'Sports',
          'Entertainment',
          'Videos',
          'Photo Stories',
          'Opinion',
          ...published.map((a) => a.category),
        ]),
      );
      for (const cat of categories) {
        const slug = buildCategorySlug(cat);
        const canonicalUrl = buildCategoryCanonicalUrl(cat);
        const catArticles = published.filter((a) => a.category === cat);
        const catItemsHtml = catArticles
          .map(
            (art) => `        <article>
          <h2><a href="${buildArticleCanonicalUrl(art)}">${escapeHtml(art.title)}</a></h2>
          ${art.title_bn ? `<h3 lang="bn">${escapeHtml(art.title_bn)}</h3>` : ''}
          <p>${escapeHtml(art.location)} · <time datetime="${escapeHtml(art.publishedAt)}">${escapeHtml(art.publishedAt.split('T')[0])}</time></p>
          <p>${escapeHtml(art.summary)}</p>
        </article>`,
          )
          .join('\n');

        const bodyShell = `<!-- PRERENDERED_NEWS_SHELL -->
      <header>
        <p><a href="${SITE_URL}/">The Global Meridian</a></p>
        <nav aria-label="News Categories">
          ${buildNavHtml()}
        </nav>
      </header>
      <main>
        <section>
          <h1>${escapeHtml(cat)} World News &amp; Analysis – The Global Meridian</h1>
          <p>Latest verified ${escapeHtml(cat.toLowerCase())} dispatches across Europe, Middle East, Americas, Russia, China, India, Japan, South Korea, and Africa.</p>
${catItemsHtml}
        </section>
      </main>
      ${buildFooterHtml()}
      <!-- /PRERENDERED_NEWS_SHELL -->`;

        const catHtml = replaceMetaAndCanonical(baseHtml, {
          title: `${cat} World News & Analysis – The Global Meridian`,
          description: `Latest verified ${cat} news, analysis, and breaking dispatches from The Global Meridian across global bureaus.`,
          canonicalUrl,
          ogType: 'website',
          imageUrl:
            catArticles[0]?.featuredImage?.url ||
            'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
          bodyShell,
        });

        const dir = path.join(outDir, 'category', slug);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), catHtml, 'utf8');
      }

      // 3. Pre-render editorial policy pages (/policy/:slug)
      const policies = [
        {
          slug: 'editorial-policy',
          title: 'Editorial Policy & Verification Standards – The Global Meridian',
          desc: 'Multi-source verification standards, independence charter, and newsroom ethics at The Global Meridian.',
        },
        {
          slug: 'corrections-policy',
          title: 'Corrections & Accuracy Policy – The Global Meridian',
          desc: 'Transparent correction guidelines and editorial accountability practices at The Global Meridian.',
        },
        {
          slug: 'about-us',
          title: 'About The Global Meridian – International Newsroom',
          desc: 'Independent multilingual journalism covering Europe, Middle East, Americas, Russia, China, India, Japan, South Korea, and Africa.',
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy – The Global Meridian',
          desc: 'Reader privacy, cookie transparency, and local storage policy of The Global Meridian.',
        },
      ];

      for (const pol of policies) {
        const canonicalUrl = `${SITE_URL}/policy/${pol.slug}`;
        const bodyShell = `<!-- PRERENDERED_NEWS_SHELL -->
      <header>
        <p><a href="${SITE_URL}/">The Global Meridian</a></p>
        <nav aria-label="News Categories">
          ${buildNavHtml()}
        </nav>
      </header>
      <main>
        <section>
          <h1>${escapeHtml(pol.title)}</h1>
          <p>${escapeHtml(pol.desc)}</p>
        </section>
      </main>
      ${buildFooterHtml()}
      <!-- /PRERENDERED_NEWS_SHELL -->`;

        const polHtml = replaceMetaAndCanonical(baseHtml, {
          title: pol.title,
          description: pol.desc,
          canonicalUrl,
          ogType: 'website',
          imageUrl:
            'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
          bodyShell,
        });

        const dir = path.join(outDir, 'policy', pol.slug);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), polHtml, 'utf8');
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), seoPrerenderPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || __dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
