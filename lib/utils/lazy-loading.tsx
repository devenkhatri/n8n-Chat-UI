/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { lazy, Suspense, ComponentType } from 'react';
import LoadingState from '../../components/ui/loading-state';

/**
 * Utility for creating lazy-loaded components with loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingState variant="spinner" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 */
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>) {
  return importFn();
}

/**
 * Create a lazy component with custom loading state
 */
export function createLazyComponentWithSkeleton<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  skeletonVariant: 'spinner' | 'skeleton' | 'message-skeleton' = 'skeleton'
) {
  return createLazyComponent(
    importFn,
    <LoadingState variant={skeletonVariant} />
  );
}

/**
 * Intersection Observer based lazy loading for components
 */
export function createIntersectionLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const LazyComponent = lazy(importFn);
  
  return function IntersectionLazyWrapper(props: React.ComponentProps<T>) {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        options
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => observer.disconnect();
    }, []);
    
    return (
      <div ref={ref}>
        {isVisible ? (
          <Suspense fallback={<LoadingState variant="skeleton" />}>
            <LazyComponent {...props} />
          </Suspense>
        ) : (
          <LoadingState variant="skeleton" />
        )}
      </div>
    );
  };
}