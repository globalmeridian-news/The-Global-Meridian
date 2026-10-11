/**
 * Google Rich Results JSON-LD Schema Validator & Injector
 * Validates structured data against Google Search & Google Discover Rich Results requirements
 * before safely injecting into document.head.
 */

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SchemaValidationResult {
  isValid: boolean;
  schemaType: string;
  errors: string[];
  warnings: string[];
  elementId: string;
  timestamp: string;
  data: any;
}

// Global registry of verified schemas for in-app SEO inspectability
class SchemaValidationStore {
  private reports: Map<string, SchemaValidationResult> = new Map();
  private listeners: Set<(reports: SchemaValidationResult[]) => void> = new Set();

  setReport(id: string, result: SchemaValidationResult) {
    this.reports.set(id, result);
    this.notify();
  }

  removeReport(id: string) {
    if (this.reports.has(id)) {
      this.reports.delete(id);
      this.notify();
    }
  }

  getAllReports(): SchemaValidationResult[] {
    return Array.from(this.reports.values());
  }

  getReport(id: string): SchemaValidationResult | undefined {
    return this.reports.get(id);
  }

  subscribe(listener: (reports: SchemaValidationResult[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const list = this.getAllReports();
    this.listeners.forEach((l) => l(list));
  }
}

export const schemaValidationStore = new SchemaValidationStore();

/**
 * Validates a schema object against Google's Rich Results specifications.
 */
export function validateRichResultsJsonLd(schema: any, elementId = 'schema'): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return {
      isValid: false,
      schemaType: 'Unknown',
      errors: ['Schema must be a valid non-empty JSON object.'],
      warnings: [],
      elementId,
      timestamp: new Date().toISOString(),
      data: schema,
    };
  }

  // 1. Context validation
  const context = schema['@context'];
  if (!context || !/^https?:\/\/schema\.org\/?$/.test(context)) {
    errors.push('The "@context" property must be "https://schema.org".');
  }

  // 2. Type validation
  const schemaType = schema['@type'];
  if (!schemaType) {
    errors.push('Missing required "@type" declaration.');
  }

  // 3. Type-specific Google Rich Results requirements
  if (schemaType === 'NewsArticle' || schemaType === 'Article') {
    // Headline
    if (!schema.headline || typeof schema.headline !== 'string' || schema.headline.trim() === '') {
      errors.push('NewsArticle requires a non-empty "headline".');
    } else if (schema.headline.length > 110) {
      warnings.push(`Headline is ${schema.headline.length} characters long. Google recommends headlines under 110 characters.`);
    }

    // Image (required for Google Discover & Rich Snippets)
    if (!schema.image) {
      errors.push('NewsArticle requires an "image" property with at least one high-resolution image URL.');
    } else {
      const images = Array.isArray(schema.image) ? schema.image : [schema.image];
      const validImages = images.filter((img: any) => {
        const url = typeof img === 'string' ? img : img?.url;
        return typeof url === 'string' && /^https?:\/\//.test(url);
      });
      if (validImages.length === 0) {
        errors.push('Images must contain valid absolute HTTP/HTTPS URLs.');
      }
    }

    // DatePublished
    if (!schema.datePublished || isNaN(Date.parse(schema.datePublished))) {
      errors.push('NewsArticle requires a valid ISO 8601 "datePublished" timestamp.');
    }

    // DateModified (recommended)
    if (!schema.dateModified) {
      warnings.push('Google strongly recommends "dateModified" for news articles.');
    }

    // Author
    if (!schema.author) {
      errors.push('NewsArticle requires an "author" object.');
    } else {
      const authors = Array.isArray(schema.author) ? schema.author : [schema.author];
      authors.forEach((auth: any, idx: number) => {
        if (!auth.name || typeof auth.name !== 'string') {
          errors.push(`Author #${idx + 1} must include a valid "name".`);
        }
        if (auth['@type'] && !['Person', 'Organization'].includes(auth['@type'])) {
          warnings.push(`Author #${idx + 1} type should be "Person" or "Organization".`);
        }
      });
    }

    // Publisher
    if (!schema.publisher) {
      errors.push('NewsArticle requires a "publisher" object.');
    } else {
      if (!schema.publisher.name) {
        errors.push('Publisher requires a "name".');
      }
      const logoUrl = schema.publisher.logo?.url || schema.publisher.logo;
      if (!logoUrl || !/^https?:\/\//.test(logoUrl)) {
        warnings.push('Google recommends a publisher logo with a valid absolute URL (recommended min 60px height).');
      }
    }

    // MainEntityOfPage
    if (!schema.mainEntityOfPage) {
      warnings.push('Google recommends "mainEntityOfPage" pointing to the canonical article URL.');
    }
  } else if (schemaType === 'BreadcrumbList') {
    if (!Array.isArray(schema.itemListElement) || schema.itemListElement.length === 0) {
      errors.push('BreadcrumbList requires a non-empty "itemListElement" array.');
    } else {
      schema.itemListElement.forEach((item: any, idx: number) => {
        if (typeof item.position !== 'number') {
          errors.push(`Breadcrumb item #${idx + 1} requires a numeric "position".`);
        }
        if (!item.name) {
          errors.push(`Breadcrumb item #${idx + 1} requires a "name".`);
        }
      });
    }
  } else if (schemaType === 'WebSite') {
    if (!schema.name) {
      errors.push('WebSite requires a "name".');
    }
    if (!schema.url || !/^https?:\/\//.test(schema.url)) {
      errors.push('WebSite requires a valid absolute "url".');
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    schemaType: schemaType || 'Unknown',
    errors,
    warnings,
    elementId,
    timestamp: new Date().toISOString(),
    data: schema,
  };
}

/**
 * Automated helper function that validates the generated JSON-LD scripts
 * against Google Rich Results test structure before injecting them into the document head.
 * 
 * Prevents injecting malformed JSON-LD that would harm Google Search rankings.
 */
export function injectValidatedJsonLd(elementId: string, schema: any): SchemaValidationResult {
  const result = validateRichResultsJsonLd(schema, elementId);
  schemaValidationStore.setReport(elementId, result);

  if (typeof document === 'undefined') {
    return result;
  }

  if (!result.isValid) {
    console.warn(
      `[Google Rich Results Validator] Blocked invalid JSON-LD schema (${elementId}):`,
      result.errors
    );
    // Remove stale script if previously present to avoid indexing broken schema
    const existing = document.getElementById(elementId);
    if (existing) existing.remove();
    return result;
  }

  // Schema is verified and complies with Google guidelines
  let scriptElement = document.getElementById(elementId) as HTMLScriptElement | null;
  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = elementId;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  scriptElement.text = JSON.stringify(schema, null, 2);

  if (result.warnings.length > 0) {
    console.info(
      `[Google Rich Results Validator] Injected schema (${elementId}) with warnings:`,
      result.warnings
    );
  }

  return result;
}

/**
 * Removes a validated JSON-LD schema from the document head and registry.
 */
export function removeValidatedJsonLd(elementId: string): void {
  schemaValidationStore.removeReport(elementId);
  if (typeof document !== 'undefined') {
    const script = document.getElementById(elementId);
    if (script) {
      script.remove();
    }
  }
}
