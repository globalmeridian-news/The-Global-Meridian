import { useEffect, useState } from 'react';
import { vitalsLogger, WebVitalMetric, VitalsSummary } from '../services/vitalsLogger';

interface UseCoreWebVitalsOptions {
  onReport?: (metric: WebVitalMetric) => void;
  reportAllChanges?: boolean;
}

export function useCoreWebVitals(options: UseCoreWebVitalsOptions = {}) {
  const [vitalsSummary, setVitalsSummary] = useState<VitalsSummary>(vitalsLogger.getSummary());

  useEffect(() => {
    const unsubscribe = vitalsLogger.subscribe((summary) => {
      setVitalsSummary({ ...summary });
    });

    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return unsubscribe;
    }

    const reportMetric = (
      name: WebVitalMetric['name'],
      value: number,
      rating: 'good' | 'needs-improvement' | 'poor',
      entries?: any[]
    ) => {
      const metric: WebVitalMetric = {
        name,
        value: Math.round(value * 100) / 100,
        rating,
        id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        url: window.location.href,
        entries,
      };

      vitalsLogger.logMetric(metric);
      if (options.onReport) {
        options.onReport(metric);
      }
    };

    // 1. Largest Contentful Paint (LCP)
    try {
      let lcpCandidate: any = null;
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcpCandidate = lastEntry;
          const value = lastEntry.startTime;
          const rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
          reportMetric('LCP', value, rating, [lastEntry]);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Entry type not supported
    }

    // 2. Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      let sessionEntries: any[] = [];
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          // Only count shifts that were NOT triggered by user interactions within 500ms
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            sessionEntries.push(entry);

            const rating = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor';
            reportMetric('CLS', clsValue, rating, sessionEntries);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Entry type not supported
    }

    // 3. First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0] as any;
        if (firstInput) {
          const value = firstInput.processingStart - firstInput.startTime;
          const rating = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
          reportMetric('FID', value, rating, [firstInput]);
          fidObserver.disconnect();
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {
      // Entry type not supported
    }

    // 4. First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime;
            const rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
            reportMetric('FCP', value, rating, [entry]);
            fcpObserver.disconnect();
            break;
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // Entry type not supported
    }

    // 5. Time To First Byte (TTFB)
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        const value = nav.responseStart;
        if (value > 0) {
          const rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
          reportMetric('TTFB', value, rating, [nav]);
        }
      }
    } catch {
      // Navigation timing not available
    }

    // Send final batch when page hides/unloads
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        vitalsLogger.sendToLoggingService();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, []);

  return vitalsSummary;
}
