import dynamic from 'next/dynamic';
import { LoadingState } from '../../components/ui/loading-state';

/**
 * Dynamic import with loading state for Next.js
 */
export const createDynamicComponent = <T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    loading?: React.ComponentType;
    ssr?: boolean;
  } = {}
) => {
  return dynamic(importFn, {
    loading: options.loading || (() => <LoadingState variant="spinner" />),
    ssr: options.ssr ?? true,
  });
};

/**
 * Dynamic import with skeleton loading
 */
export const createDynamicComponentWithSkeleton = <T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  skeletonVariant: 'spinner' | 'skeleton' | 'message-skeleton' = 'skeleton'
) => {
  return dynamic(importFn, {
    loading: () => <LoadingState variant={skeletonVariant} />,
    ssr: true,
  });
};

/**
 * Dynamic import for client-side only components
 */
export const createClientOnlyComponent = <T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return dynamic(importFn, {
    ssr: false,
    loading: () => <LoadingState variant="spinner" />,
  });
};

/**
 * Preload a dynamic component
 */
export const preloadDynamicComponent = (
  component: ReturnType<typeof dynamic>
) => {
  if (typeof window !== 'undefined') {
    component.preload();
  }
};