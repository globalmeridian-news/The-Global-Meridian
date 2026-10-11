import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g., 'aspect-16/9', 'aspect-4/3', 'aspect-1/1'
  placeholderColor?: string;
  priority?: boolean; // For above-the-fold hero images (LCP optimization)
  fallbackSrc?: string;
  onLoaded?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-16/9',
  placeholderColor = 'bg-slate-800',
  priority = false,
  fallbackSrc = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  className = '',
  onLoaded,
  ...props
}) => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(priority);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (priority || isIntersecting) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '250px', // Preload 250px before entering viewport for smooth UX
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [priority, isIntersecting]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoaded) onLoaded();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const currentSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${aspectRatio} ${placeholderColor} ${className}`}
      style={{ contain: 'paint' }}
    >
      {/* Subtle pulse placeholder while loading to prevent Cumulative Layout Shift (CLS) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse pointer-events-none" />
      )}

      {/* Render image when intersecting or if priority */}
      {isIntersecting && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
