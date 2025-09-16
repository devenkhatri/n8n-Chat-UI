import React, { useState } from 'react'
import { type UserPreferences } from '../../lib/types/theme'
import { useTheme } from '../../hooks/use-theme'
import { useBranding } from '../../hooks/use-branding'
import { cn } from '../../lib/utils'
import Button from './button'
// import Input from './input' // Used in BrandingPreview
import Card from './card'
import BrandingPreview from './branding-preview'

interface SettingsPanelProps {
  onClose?: () => void
  className?: string
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, className }) => {
  const { 
    preferences, 
    updatePreferences, 
    theme, 
    setTheme
  } = useTheme()
  
  const { 
    branding, 
    updateBranding, 
    resetBranding
  } = useBranding()

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'branding' | 'accessibility'>('general')

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    updatePreferences({ [key]: value })
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'appearance' as const, label: 'Appearance', icon: '🎨' },
    { id: 'branding' as const, label: 'Branding', icon: '🏷️' },
    { id: 'accessibility' as const, label: 'Accessibility', icon: '♿' },
  ]

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <span className="sr-only">Close settings</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Chat Preferences</h3>
              <div className="space-y-4">
                {/* Message Grouping */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Message Grouping</label>
                    <p className="text-sm text-muted-foreground">
                      Group consecutive messages from the same sender
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('messageGrouping', !preferences.messageGrouping)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.messageGrouping ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.messageGrouping ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Sound Enabled */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Sound Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when receiving messages
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.soundEnabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.soundEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Compact Mode</label>
                    <p className="text-sm text-muted-foreground">
                      Use smaller spacing and condensed layout
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('compactMode', !preferences.compactMode)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.compactMode ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.compactMode ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Color Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                          theme === themeOption
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/60"
                        )}
                      >
                        <div className="text-2xl">
                          {themeOption === 'light' && '☀️'}
                          {themeOption === 'dark' && '🌙'}
                          {themeOption === 'system' && '💻'}
                        </div>
                        <span className="text-sm font-medium capitalize">
                          {themeOption}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Font Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => handlePreferenceChange('fontSize', size)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                          preferences.fontSize === size
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/60"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          size === 'sm' && "text-sm",
                          size === 'md' && "text-base",
                          size === 'lg' && "text-lg"
                        )}>
                          Aa
                        </span>
                        <span className="text-sm capitalize">
                          {size === 'sm' && 'Small'}
                          {size === 'md' && 'Medium'}
                          {size === 'lg' && 'Large'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Branding Settings */}
        {activeTab === 'branding' && (
          <BrandingPreview
            branding={branding}
            onBrandingChange={updateBranding}
            onReset={resetBranding}
          />
        )}

        {/* Accessibility Settings */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
              <div className="space-y-4">
                {/* Animations */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable Animations</label>
                    <p className="text-sm text-muted-foreground">
                      Show smooth transitions and micro-interactions
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('animationsEnabled', !preferences.animationsEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.animationsEnabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.animationsEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Keyboard Navigation Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Keyboard Navigation</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Tab</kbd> - Navigate between elements</p>
                    <p><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Enter</kbd> - Send message</p>
                    <p><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Esc</kbd> - Clear input</p>
                    <p><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl/Cmd + K</kbd> - Focus search</p>
                  </div>
                </div>

                {/* Screen Reader Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Screen Reader Support</h4>
                  <p className="text-sm text-muted-foreground">
                    This application includes ARIA labels, live regions for dynamic content updates, 
                    and semantic HTML structure for optimal screen reader compatibility.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Settings are automatically saved
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              // Reset all preferences to defaults
              updatePreferences({
                theme: 'system',
                fontSize: 'md',
                messageGrouping: true,
                soundEnabled: false,
                animationsEnabled: true,
                compactMode: false,
              })
              resetBranding?.()
            }}
          >
            Reset All
          </Button>
          {onClose && (
            <Button onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel