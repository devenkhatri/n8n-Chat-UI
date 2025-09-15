"use client";

import React from 'react';
import { useAccessibility } from '../../providers/accessibility-provider';
import { Button } from './button';
import { Card } from './card';

interface AccessibilitySettingsProps {
  className?: string;
}

export function AccessibilitySettings({ className }: AccessibilitySettingsProps) {
  const { settings, updateSettings } = useAccessibility();

  return (
    <Card className={className} variant="outlined" padding="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Customize the interface to meet your accessibility needs.
          </p>
        </div>

        {/* Motion Settings */}
        <div className="space-y-3">
          <h4 className="font-medium">Motion & Animation</h4>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="rounded border-border focus:ring-2 focus:ring-primary focus:border-primary"
              aria-describedby="reduced-motion-desc"
            />
            <div>
              <span className="text-sm font-medium">Reduce motion</span>
              <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
          </label>
        </div>

        {/* Visual Settings */}
        <div className="space-y-3">
          <h4 className="font-medium">Visual</h4>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              className="rounded border-border focus:ring-2 focus:ring-primary focus:border-primary"
              aria-describedby="high-contrast-desc"
            />
            <div>
              <span className="text-sm font-medium">High contrast mode</span>
              <p id="high-contrast-desc" className="text-xs text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.focusVisible}
              onChange={(e) => updateSettings({ focusVisible: e.target.checked })}
              className="rounded border-border focus:ring-2 focus:ring-primary focus:border-primary"
              aria-describedby="focus-visible-desc"
            />
            <div>
              <span className="text-sm font-medium">Enhanced focus indicators</span>
              <p id="focus-visible-desc" className="text-xs text-muted-foreground">
                Show clear focus outlines for keyboard navigation
              </p>
            </div>
          </label>
        </div>

        {/* Font Size Settings */}
        <div className="space-y-3">
          <h4 className="font-medium">Text Size</h4>
          <div className="space-y-2">
            {[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium (Default)' },
              { value: 'large', label: 'Large' },
              { value: 'extra-large', label: 'Extra Large' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="fontSize"
                  value={option.value}
                  checked={settings.fontSize === option.value}
                  onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                  className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Screen Reader Settings */}
        <div className="space-y-3">
          <h4 className="font-medium">Screen Reader</h4>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.screenReaderOptimizations}
              onChange={(e) => updateSettings({ screenReaderOptimizations: e.target.checked })}
              className="rounded border-border focus:ring-2 focus:ring-primary focus:border-primary"
              aria-describedby="screen-reader-desc"
            />
            <div>
              <span className="text-sm font-medium">Screen reader optimizations</span>
              <p id="screen-reader-desc" className="text-xs text-muted-foreground">
                Enhanced announcements and navigation for screen readers
              </p>
            </div>
          </label>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              updateSettings({
                reducedMotion: false,
                highContrast: false,
                fontSize: 'medium',
                focusVisible: true,
                screenReaderOptimizations: false,
              });
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </Card>
  );
}