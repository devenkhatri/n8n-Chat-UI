"use client";

import React, { useEffect, useRef } from 'react';
import { keyboardNavigation, focusManagement } from '../../lib/utils/accessibility';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  onEscape?: () => void;
  trapFocus?: boolean;
  className?: string;
}

/**
 * Component that provides keyboard navigation for its children
 */
export function KeyboardNavigation({
  children,
  orientation = 'vertical',
  wrap = true,
  onEscape,
  trapFocus = false,
  className,
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      // Handle escape key
      if (event.key === 'Escape' && onEscape) {
        keyboardNavigation.handleEscape(event, onEscape);
        return;
      }

      // Handle arrow keys based on orientation
      const isHorizontalKey = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const isVerticalKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';

      if (
        (orientation === 'horizontal' && isHorizontalKey) ||
        (orientation === 'vertical' && isVerticalKey) ||
        (orientation === 'both' && (isHorizontalKey || isVerticalKey)) ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = focusableElements.indexOf(activeElement);

        if (currentIndex !== -1) {
          keyboardNavigation.handleArrowKeys(
            event,
            focusableElements,
            currentIndex,
            (newIndex) => {
              setCurrentIndex(newIndex);
            }
          );
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Set up focus trap if enabled
    let cleanupFocusTrap: (() => void) | undefined;
    if (trapFocus) {
      cleanupFocusTrap = focusManagement.trapFocus(container);
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      cleanupFocusTrap?.();
    };
  }, [orientation, wrap, onEscape, trapFocus]);

  return (
    <div
      ref={containerRef}
      className={className}
      role={orientation === 'horizontal' ? 'menubar' : 'menu'}
      aria-orientation={orientation === 'both' ? undefined : orientation}
    >
      {children}
    </div>
  );
}

/**
 * Hook for managing keyboard navigation in custom components
 */
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    onEscape?: () => void;
  } = {}
) {
  const { orientation = 'vertical', onEscape } = options;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (items.length === 0) return;

      // Handle escape key
      if (event.key === 'Escape' && onEscape) {
        keyboardNavigation.handleEscape(event, onEscape);
        return;
      }

      // Handle arrow keys
      const isHorizontalKey = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const isVerticalKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';

      if (
        (orientation === 'horizontal' && isHorizontalKey) ||
        (orientation === 'vertical' && isVerticalKey) ||
        (orientation === 'both' && (isHorizontalKey || isVerticalKey)) ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        keyboardNavigation.handleArrowKeys(event, items, currentIndex, setCurrentIndex);
      }
    },
    [items, currentIndex, orientation, onEscape]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}