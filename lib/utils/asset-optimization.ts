/**
 * Asset optimization utilities for better performance
 */

/**
 * Preload critical resources
 */
export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/jetbrains-mono.woff2',
  ];

  fontPreloads.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload critical images
  const imagePreloads = [
    '/images/logo.svg',
    '/images/avatar-placeholder.svg',
  ];

  imagePreloads.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with intersection observer
 */
export const createLazyImage = (
  src: string,
  options: {
    placeholder?: string;
    threshold?: number;
    rootMargin?: string;
  } = {}
) => {
  const { placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=', threshold = 0.1, rootMargin = '50px' } = options;

  return {
    src: placeholder,
    'data-src': src,
    loading: 'lazy' as const,
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const dataSrc = img.getAttribute('data-src');
      
      if (dataSrc && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const target = entry.target as HTMLImageElement;
                target.src = dataSrc;
                target.removeAttribute('data-src');
                observer.unobserve(target);
              }
            });
          },
          { threshold, rootMargin }
        );
        
        observer.observe(img);
      } else if (dataSrc) {
        // Fallback for browsers without IntersectionObserver
        img.src = dataSrc;
      }
    },
  };
};

/**
 * Optimize image loading with Next.js Image component props
 */
export const getOptimizedImageProps = (
  src: string,
  options: {
    priority?: boolean;
    quality?: number;
    sizes?: string;
  } = {}
) => {
  const { priority = false, quality = 85, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' } = options;

  return {
    src,
    quality,
    sizes,
    priority,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  };
};

/**
 * Resource hints for better loading performance
 */
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
  ];

  dnsPrefetchDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectOrigins.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Service Worker registration for caching
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

/**
 * Critical CSS inlining utility
 */
export const inlineCriticalCSS = (css: string) => {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};