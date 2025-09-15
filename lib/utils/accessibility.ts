/**
 * Accessibility utilities and helpers
 */

/**
 * Screen reader announcement utility
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      activeElement?.focus();
    };
  },

  /**
   * Focus first error in a form
   */
  focusFirstError: (container: HTMLElement) => {
    const firstError = container.querySelector('[aria-invalid="true"]') as HTMLElement;
    firstError?.focus();
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onEscape: () => void) => {
    if (event.key === 'Escape') {
      onEscape();
    }
  },
};

/**
 * ARIA utilities
 */
export const ariaUtils = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  },

  /**
   * Set ARIA describedby relationship
   */
  setDescribedBy: (element: HTMLElement, describedById: string) => {
    element.setAttribute('aria-describedby', describedById);
  },

  /**
   * Set ARIA labelledby relationship
   */
  setLabelledBy: (element: HTMLElement, labelledById: string) => {
    element.setAttribute('aria-labelledby', labelledById);
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]) => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAG: (ratio: number, level: 'AA' | 'AAA' = 'AA') => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
};

/**
 * Reduced motion utilities
 */
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number) => {
    return reducedMotion.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Conditionally apply animations
   */
  conditionalAnimation: (animation: string) => {
    return reducedMotion.prefersReducedMotion() ? 'none' : animation;
  },
};

/**
 * High contrast mode utilities
 */
export const highContrast = {
  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Apply high contrast styles conditionally
   */
  applyHighContrastStyles: (normalStyles: string, highContrastStyles: string) => {
    return highContrast.isHighContrastMode() ? highContrastStyles : normalStyles;
  },
};

/**
 * Text scaling utilities
 */
export const textScaling = {
  /**
   * Get user's preferred font size multiplier
   */
  getFontSizeMultiplier: () => {
    if (typeof window === 'undefined') return 1;
    
    // Check for browser zoom level
    const devicePixelRatio = window.devicePixelRatio || 1;
    const zoomLevel = Math.round(((window.outerWidth / window.innerWidth) * 100) / devicePixelRatio);
    
    return Math.max(1, zoomLevel / 100);
  },

  /**
   * Scale font size based on user preferences
   */
  scaleFontSize: (baseFontSize: number) => {
    const multiplier = textScaling.getFontSizeMultiplier();
    return baseFontSize * multiplier;
  },
};

/**
 * Accessibility testing utilities
 */
export const a11yTesting = {
  /**
   * Check for missing alt text on images
   */
  checkImageAltText: (container: HTMLElement = document.body) => {
    const images = container.querySelectorAll('img');
    const issues: string[] = [];

    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });

    return issues;
  },

  /**
   * Check for proper heading hierarchy
   */
  checkHeadingHierarchy: (container: HTMLElement = document.body) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });

    return issues;
  },

  /**
   * Check for proper form labels
   */
  checkFormLabels: (container: HTMLElement = document.body) => {
    const inputs = container.querySelectorAll('input, select, textarea');
    const issues: string[] = [];

    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      container.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push(`Form input ${index + 1} is missing a label`);
      }
    });

    return issues;
  },

  /**
   * Run all accessibility checks
   */
  runAllChecks: (container: HTMLElement = document.body) => {
    return {
      imageAltText: a11yTesting.checkImageAltText(container),
      headingHierarchy: a11yTesting.checkHeadingHierarchy(container),
      formLabels: a11yTesting.checkFormLabels(container),
    };
  },
};