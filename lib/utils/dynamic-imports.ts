import React from 'react';
import dynamic from 'next/dynamic';
import LoadingState from '../../components/ui/loading-state';
import type { DynamicOptionsLoadingProps } from 'next/dynamic';

/**
 * Dynamic import with loading state for Next.js
 */
export const createDynamicComponent = <T extends Record<string, unknown> = Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    loading?: (props: DynamicOptionsLoadingProps) => React.ReactNode;
    ssr?: boolean;
  } = {}
) => {
  return dynamic(importFn, {
    loading: options.loading || (() => React.createElement(LoadingState, { variant: "spinner" })),
    ssr: options.ssr ?? true,
  });
};

/**
 * Dynamic import with skeleton loading
 */
export const createDynamicComponentWithSkeleton = <T extends Record<string, unknown> = Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  skeletonVariant: 'spinner' | 'skeleton' | 'message-skeleton' = 'skeleton'
) => {
  return dynamic(importFn, {
    loading: () => React.createElement(LoadingState, { variant: skeletonVariant }),
    ssr: true,
  });
};

/**
 * Dynamic import for client-side only components
 */
export const createClientOnlyComponent = <T extends Record<string, unknown> = Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return dynamic(importFn, {
    ssr: false,
    loading: () => React.createElement(LoadingState, { variant: "spinner" }),
  });
};

/**
 * Preload a dynamic component
 */
export const preloadDynamicComponent = <T>(
  component: { preload?: () => Promise<{ default: React.ComponentType<T> }> }
) => {
  if (component.preload) {
    return component.preload();
  }
  return Promise.resolve();
};