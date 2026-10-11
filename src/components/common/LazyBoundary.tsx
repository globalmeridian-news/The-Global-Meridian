import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: string;
  className?: string;
  onVisible?: () => void;
}

/**
 * LazyBoundary: Defers rendering of below-the-fold or non-critical components
 * (such as video modules, photo galleries, ad banners, and comment sections)
 * using IntersectionObserver. Improves initial bundle execution and Core Web Vitals.
 */
export const LazyBoundary: React.FC<LazyBoundaryProps> = ({
  children,
  fallback,
  rootMargin = '200px',
  minHeight = '120px',
  className = '',
  onVisible,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onVisible) onVisible();
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      }
    );

    const currentElem = containerRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
      observer.disconnect();
    };
  }, [isVisible, rootMargin, onVisible]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div
            className="w-full flex items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/40 rounded border border-slate-100 dark:border-slate-800/60 animate-pulse"
            style={{ height: minHeight }}
          >
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
              <span>Optimizing component for viewport...</span>
            </div>
          </div>
        )
      )}
    </div>
  );
};
