/**
 * Core Web Vitals Logging Service
 * Batches, logs, and transmits Core Web Vitals telemetry to ensure Google search experience requirements are met.
 */

export interface MetricRating {
  status: 'good' | 'needs-improvement' | 'poor';
  scoreFormatted: string;
}

export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  timestamp: number;
  url: string;
  entries?: any[];
}

export interface VitalsSummary {
  lcp?: WebVitalMetric;
  fid?: WebVitalMetric;
  cls?: WebVitalMetric;
  inp?: WebVitalMetric;
  fcp?: WebVitalMetric;
  ttfb?: WebVitalMetric;
  overallHealth: 'passed' | 'warning' | 'failing';
  updatedAt: string;
}

const STORAGE_KEY = 'meridian_core_web_vitals_v1';

class VitalsLoggingService {
  private endpoint: string;
  private queue: WebVitalMetric[] = [];
  private flushTimeout: any = null;
  private listeners: Set<(summary: VitalsSummary) => void> = new Set();
  private currentSummary: VitalsSummary = {
    overallHealth: 'passed',
    updatedAt: new Date().toISOString(),
  };

  constructor(endpoint = '/api/vitals') {
    this.endpoint = endpoint;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentSummary = JSON.parse(stored);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentSummary));
    } catch {
      // Storage quota or private mode
    }
  }

  /**
   * Log a new Web Vital reading and queue for dispatch
   */
  public logMetric(metric: WebVitalMetric) {
    // Update local summary
    switch (metric.name) {
      case 'LCP':
        this.currentSummary.lcp = metric;
        break;
      case 'FID':
        this.currentSummary.fid = metric;
        break;
      case 'CLS':
        this.currentSummary.cls = metric;
        break;
      case 'INP':
        this.currentSummary.inp = metric;
        break;
      case 'FCP':
        this.currentSummary.fcp = metric;
        break;
      case 'TTFB':
        this.currentSummary.ttfb = metric;
        break;
    }

    // Evaluate overall Google Search Experience compliance
    const metrics = [
      this.currentSummary.lcp,
      this.currentSummary.fid || this.currentSummary.inp,
      this.currentSummary.cls,
    ].filter(Boolean) as WebVitalMetric[];

    const hasPoor = metrics.some((m) => m.rating === 'poor');
    const hasWarning = metrics.some((m) => m.rating === 'needs-improvement');

    this.currentSummary.overallHealth = hasPoor ? 'failing' : hasWarning ? 'warning' : 'passed';
    this.currentSummary.updatedAt = new Date().toISOString();

    this.saveToStorage();
    this.notifyListeners();

    // Queue for network transmission
    this.queue.push(metric);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimeout) return;
    this.flushTimeout = setTimeout(() => {
      this.flushTimeout = null;
      this.sendToLoggingService();
    }, 2500);
  }

  /**
   * Transmit queued metrics to the telemetry endpoint
   */
  public async sendToLoggingService(): Promise<void> {
    if (this.queue.length === 0 || typeof window === 'undefined') return;

    const payload = {
      appId: 'the-global-meridian',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: [...this.queue],
    };

    this.queue = [];

    const jsonString = JSON.stringify(payload);

    // 1. Try Beacon API first (non-blocking for page transitions)
    if (navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(this.endpoint, new Blob([jsonString], { type: 'application/json' }));
        if (sent) return;
      } catch {
        // Fallback to fetch
      }
    }

    // 2. Fetch with keepalive fallback
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
        keepalive: true,
      });
    } catch {
      // Graceful local logging if remote endpoint is unavailable
      // Keeps internal telemetry operational without errors
    }
  }

  public getSummary(): VitalsSummary {
    return this.currentSummary;
  }

  public subscribe(listener: (summary: VitalsSummary) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.currentSummary));
  }
}

export const vitalsLogger = new VitalsLoggingService();
