import React, { useState } from 'react'
import { type UserPreferences } from '../../lib/types/theme'
import { useTheme } from '../../hooks/use-theme'
import { useBranding } from '../../hooks/use-branding'
import { cn } from '../../lib/utils'
import Button from './button'
import Card from './card'


interface SettingsPanelProps {
  onClose?: () => void
  className?: string
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, className }) => {
  const { 
    preferences, 
    updatePreferences, 
    theme, 
    setTheme,
    mounted
  } = useTheme()
  
  // Safe branding hook usage
  let branding, updateBranding, resetBranding
  try {
    const brandingHook = useBranding()
    branding = brandingHook.branding
    updateBranding = brandingHook.updateBranding
    resetBranding = brandingHook.resetBranding
  } catch {
    branding = { appName: 'Chat UI', primaryColor: '#3b82f6', secondaryColor: '#64748b', fontFamily: 'Inter' }
    updateBranding = () => {}
    resetBranding = () => {}
  }

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'branding' | 'accessibility'>('general')

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
          {onClose && (
            <button onClick={onClose} className="h-8 w-8 p-0 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="sr-only">Close settings</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

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
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 id="settings-title" className="text-2xl font-bold">Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            aria-label="Close settings"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
      <div className="mt-6 space-y-4">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <Card className="p-4">
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
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Color Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as const).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors",
                          theme === themeOption
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/60"
                        )}
                      >
                        <div className="text-xl">
                          {themeOption === 'light' && '☀️'}
                          {themeOption === 'dark' && '🌙'}
                          {themeOption === 'system' && '💻'}
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {themeOption}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => handlePreferenceChange('fontSize', size)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors",
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
                        <span className="text-xs capitalize">
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
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Branding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Application Name</label>
                <input
                  type="text"
                  value={branding?.appName || 'Chat UI'}
                  onChange={(e) => updateBranding?.({ appName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter application name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={branding?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateBranding?.({ primaryColor: e.target.value })}
                    className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateBranding?.({ primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="secondary"
                  onClick={() => resetBranding?.()}
                  className="w-full"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Accessibility Settings */}
        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <Card className="p-4">
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
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                    <p><kbd className="px-1 py-0.5 bg-background border rounded text-xs">Tab</kbd> Navigate</p>
                    <p><kbd className="px-1 py-0.5 bg-background border rounded text-xs">Enter</kbd> Send</p>
                    <p><kbd className="px-1 py-0.5 bg-background border rounded text-xs">Esc</kbd> Clear</p>
                    <p><kbd className="px-1 py-0.5 bg-background border rounded text-xs">⌘K</kbd> Search</p>
                  </div>
                </div>

                {/* Screen Reader Info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Screen Reader Support</h4>
                  <p className="text-xs text-muted-foreground">
                    Full ARIA support with semantic HTML and live regions for dynamic updates.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 mt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Settings are automatically saved
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
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
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel