"use client";

import { useEffect } from 'react';
import { 
  initPerformanceMonitoring, 
  reportPerformanceMetrics,
  preloadCriticalAssets,
  addResourceHints
} from '../../lib/utils/performance-monitoring';


/**
 * Performance monitoring component that initializes performance tracking
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Add resource hints for better loading
    addResourceHints();
    
    // Preload critical assets
    preloadCriticalAssets();
    
    // Register service worker for caching (guarded)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {/* swallow registration errors */});
    }
    
    // Report initial metrics after a delay
    const timer = setTimeout(() => {
      reportPerformanceMetrics();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // This component doesn't render anything
  return null;
}