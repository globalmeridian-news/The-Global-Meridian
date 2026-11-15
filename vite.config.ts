import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {INITIAL_ARTICLES} from './src/data/initialNews.ts';

const SITE_URL = 'https://the-global-meridian.incognito120120.workers.dev';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function seoPrerenderPlugin(): Plugin {
  return {
    name: 'global-meridian-seo-prerender',
    transformIndexHtml(html) {
      const published = INITIAL_ARTICLES.filter((a) => a.status === 'published').slice(0, 18);

      const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Latest International News & Analysis – The Global Meridian',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: published.length,
        itemListElement: published.map((art, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/?article=${art.id}`,
          item: {
            '@type': 'NewsArticle',
            headline: art.title,
            alternativeHeadline: art.title_bn || art.title,
            description: art.summary,
            url: `${SITE_URL}/?article=${art.id}`,
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

      const schemaTag = `<script type="application/ld+json" id="google-home-itemlist-schema">\n${JSON.stringify(itemListJsonLd)}\n    </script>`;

      const articleMarkup = published
        .map((art) => {
          const leadParagraph = art.blocks.find((b) => b.type === 'paragraph');
          const leadEn = leadParagraph?.text ? `<p>${escapeHtml(leadParagraph.text)}</p>` : '';
          const leadBn = leadParagraph?.text_bn ? `<p lang="bn">${escapeHtml(leadParagraph.text_bn)}</p>` : '';
          const titleBn = art.title_bn ? `<h3 lang="bn">${escapeHtml(art.title_bn)}</h3>` : '';
          const summaryBn = art.summary_bn ? `<p lang="bn">${escapeHtml(art.summary_bn)}</p>` : '';
          const articleUrl = `${SITE_URL}/?article=${encodeURIComponent(art.id)}`;
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
        <p>Verified international journalism covering world diplomacy, politics, global economics, technology, defense, science, climate, and South Asian affairs in English and Bengali.</p>
        <nav aria-label="News Categories">
          <a href="${SITE_URL}/">Home</a> |
          <a href="${SITE_URL}/?cat=World">World</a> |
          <a href="${SITE_URL}/?cat=Politics">Politics</a> |
          <a href="${SITE_URL}/?cat=Business">Business</a> |
          <a href="${SITE_URL}/?cat=Technology">Technology</a> |
          <a href="${SITE_URL}/?cat=Science">Science</a> |
          <a href="${SITE_URL}/?cat=Health">Health</a> |
          <a href="${SITE_URL}/?cat=Defense">Defense</a> |
          <a href="${SITE_URL}/?cat=Environment">Environment</a> |
          <a href="${SITE_URL}/?cat=Sports">Sports</a> |
          <a href="${SITE_URL}/?cat=Entertainment">Entertainment</a> |
          <a href="${SITE_URL}/?cat=Opinion">Opinion</a>
        </nav>
      </header>
      <main>
        <section aria-label="Latest International Dispatches">
          <h2>Latest Verified International Dispatches &amp; Analysis</h2>
${articleMarkup}
        </section>
      </main>
      <footer>
        <a href="${SITE_URL}/sitemap.xml">Sitemap</a> |
        <a href="${SITE_URL}/news-sitemap.xml">Google News Sitemap</a> |
        <a href="${SITE_URL}/rss.xml">RSS Feed</a> |
        <a href="${SITE_URL}/llms.txt">LLMs Index</a> |
        <a href="${SITE_URL}/?policy=editorial-policy">Editorial Policy</a> |
        <a href="${SITE_URL}/?policy=about-us">About Us</a>
      </footer>
      <!-- /PRERENDERED_NEWS_SHELL -->`;

      let output = html.replace('<!-- PRERENDERED_ITEMLIST_SCHEMA -->', schemaTag);
      output = output.replace(
        /<!-- PRERENDERED_NEWS_SHELL -->[\s\S]*?<!-- \/PRERENDERED_NEWS_SHELL -->/,
        prerenderedShell,
      );
      return output;
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
