/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Measure Core Web Vitals
 */
export const measureCoreWebVitals = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics = {};

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      const firstEntry = entries[0];
      if (firstEntry && 'processingStart' in firstEntry) {
        metrics.fid = firstEntry.processingStart - firstEntry.startTime;
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value;
        }
      }
      metrics.cls = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    // Resolve after a delay to collect metrics
    setTimeout(() => {
      resolve(metrics);
    }, 3000);
  });
};

/**
 * Measure component render time
 */
export const measureComponentRender = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'component_render', {
          component_name: componentName,
          render_time: Math.round(renderTime),
        });
      }
      
      return renderTime;
    },
  };
};

/**
 * Measure bundle loading time
 */
export const measureBundleLoad = (bundleName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${bundleName} load time: ${loadTime.toFixed(2)}ms`);
      }
      
      return loadTime;
    },
  };
};

/**
 * Monitor memory usage
 */
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !(performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory) {
    return null;
  }
  
  const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
};

/**
 * Performance observer for long tasks
 */
export const observeLongTasks = (callback: (duration: number) => void) => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) { // Tasks longer than 50ms
        callback(entry.duration);
      }
    }
  });
  
  observer.observe({ entryTypes: ['longtask'] });
  
  return observer;
};

/**
 * Report performance metrics to analytics
 */
export const reportPerformanceMetrics = async () => {
  try {
    const metrics = await measureCoreWebVitals();
    const memoryUsage = monitorMemoryUsage();
    
    // Send to your analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      // Google Analytics 4
      window.gtag('event', 'web_vitals', {
        fcp: metrics.fcp ? Math.round(metrics.fcp) : undefined,
        lcp: metrics.lcp ? Math.round(metrics.lcp) : undefined,
        fid: metrics.fid ? Math.round(metrics.fid) : undefined,
        cls: metrics.cls ? Math.round(metrics.cls * 1000) / 1000 : undefined,
        ttfb: metrics.ttfb ? Math.round(metrics.ttfb) : undefined,
      });
      
      if (memoryUsage) {
        window.gtag('event', 'memory_usage', {
          used_heap_size: Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024), // MB
          usage_percentage: Math.round(memoryUsage.usagePercentage),
        });
      }
    }
    
    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          metrics,
          memoryUsage,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail - don't block the app
      });
    }
  } catch (error) {
    console.error('Failed to report performance metrics:', error);
  }
};

/**
 * Performance budget checker
 */
export const checkPerformanceBudget = (metrics: PerformanceMetrics) => {
  const budgets = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600, // 600ms
  };
  
  const violations: string[] = [];
  
  Object.entries(budgets).forEach(([metric, budget]) => {
    const value = metrics[metric as keyof PerformanceMetrics];
    if (value && value > budget) {
      violations.push(`${metric.toUpperCase()}: ${value} > ${budget}`);
    }
  });
  
  return {
    passed: violations.length === 0,
    violations,
  };
};

// Global performance monitoring setup
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(reportPerformanceMetrics, 1000);
  });
  
  // Monitor long tasks
  observeLongTasks((duration) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Long task detected: ${duration.toFixed(2)}ms`);
    }
  });
  
  // Monitor memory usage periodically
  setInterval(() => {
    const memoryUsage = monitorMemoryUsage();
    if (memoryUsage && memoryUsage.usagePercentage > 80) {
      console.warn('High memory usage detected:', memoryUsage);
    }
  }, 30000); // Check every 30 seconds
};
/**
 * A
dd resource hints for better loading performance
 */
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // DNS prefetch for external domains
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const criticalOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  criticalOrigins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Preload critical assets
 */
export const preloadCriticalAssets = () => {
  if (typeof document === 'undefined') return;

  // Preload critical CSS
  const criticalCSS = [
    '/fonts/inter.woff2',
  ];

  criticalCSS.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    
    if (asset.endsWith('.woff2') || asset.endsWith('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (asset.endsWith('.css')) {
      link.as = 'style';
    } else if (asset.endsWith('.js')) {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Register service worker for caching
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Worker registered:', registration);
    }
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Type declarations for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}