"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { reducedMotion, highContrast, textScaling } from '../lib/utils/accessibility';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReaderOptimizations: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReaderOptimizations: false,
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Detect system preferences
    const detectSystemPreferences = () => {
      const systemReducedMotion = reducedMotion.prefersReducedMotion();
      const systemHighContrast = highContrast.isHighContrastMode();

      setSettings(prev => ({
        ...prev,
        reducedMotion: systemReducedMotion,
        highContrast: systemHighContrast,
      }));
    };

    detectSystemPreferences();

    // Listen for system preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
    ];

    const handleChange = () => detectSystemPreferences();

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleChange);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleChange);
      });
    };
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);

    // Focus visible
    root.classList.toggle('focus-visible-enabled', settings.focusVisible);

    // Screen reader optimizations
    root.classList.toggle('screen-reader-optimized', settings.screenReaderOptimizations);

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        announceToScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}