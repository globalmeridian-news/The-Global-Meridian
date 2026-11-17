interface AssetsFetcher {
  fetch(input: Request | string): Promise<Response>;
}

interface Env {
  ASSETS: AssetsFetcher;
}

const SEO_ROBOTS_HEADER =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function withSeoHeaders(response: Response): Response {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', SEO_ROBOTS_HEADER);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cleanPath = url.pathname.replace(/\/+$/, '') || '/';

    // Handle legacy query-parameter article, category, and policy URLs
    // by serving the corresponding pre-rendered static HTML directly (HTTP 200)
    // so Googlebot always receives full unique metadata, JSON-LD, and canonical tags.
    if (cleanPath === '/') {
      const articleParam = url.searchParams.get('article');
      if (articleParam) {
        const target = new URL(`/article/${encodeURIComponent(articleParam)}`, url.origin);
        const res = await env.ASSETS.fetch(new Request(target.toString(), request));
        if (res.ok) return withSeoHeaders(res);
      }

      const catParam = url.searchParams.get('cat');
      if (catParam) {
        const slug = catParam.toLowerCase().replace(/\s+/g, '-');
        const target = new URL(`/category/${encodeURIComponent(slug)}`, url.origin);
        const res = await env.ASSETS.fetch(new Request(target.toString(), request));
        if (res.ok) return withSeoHeaders(res);
      }

      const policyParam = url.searchParams.get('policy');
      if (policyParam) {
        const target = new URL(`/policy/${encodeURIComponent(policyParam)}`, url.origin);
        const res = await env.ASSETS.fetch(new Request(target.toString(), request));
        if (res.ok) return withSeoHeaders(res);
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withSeoHeaders(assetResponse);
  },
};
