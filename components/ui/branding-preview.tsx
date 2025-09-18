import React, { useState, useEffect } from 'react'
import { type BrandingConfig } from '../../lib/types/theme'
import { cn } from '../../lib/utils'
import Button from './button'
import Input from './input'
import Card from './card'

// Simple validation function
const validateBrandingConfig = (branding: Partial<BrandingConfig>) => {
  const errors: string[] = []
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  if (branding.primaryColor && !hexColorRegex.test(branding.primaryColor)) {
    errors.push('Primary color must be a valid hex color')
  }
  if (branding.secondaryColor && !hexColorRegex.test(branding.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color')
  }
  if (branding.appName && (branding.appName.length < 1 || branding.appName.length > 50)) {
    errors.push('App name must be between 1 and 50 characters')
  }

  return { isValid: errors.length === 0, errors }
}

// Simple preview function
const previewBranding = (branding: Partial<BrandingConfig>) => {
  const cssVariables: Record<string, string> = {}
  
  if (branding.primaryColor) {
    cssVariables['--color-primary'] = branding.primaryColor
    cssVariables['--color-primary-500'] = branding.primaryColor
  }
  if (branding.secondaryColor) {
    cssVariables['--color-secondary'] = branding.secondaryColor
  }
  if (branding.fontFamily) {
    cssVariables['--font-family'] = branding.fontFamily
  }

  return { cssVariables, validation: validateBrandingConfig(branding) }
}

interface BrandingPreviewProps {
  branding: Partial<BrandingConfig>
  onBrandingChange: (branding: Partial<BrandingConfig>) => void
  onApply?: () => void
  onReset?: () => void
  className?: string
}

const BrandingPreview: React.FC<BrandingPreviewProps> = ({
  branding,
  onBrandingChange,
  onApply,
  onReset,
  className,
}) => {
  const [localBranding, setLocalBranding] = useState<Partial<BrandingConfig>>(branding)
  const [validation, setValidation] = useState(validateBrandingConfig(branding))
  const [previewStyles, setPreviewStyles] = useState<Record<string, string>>({})

  // Update local state when props change
  useEffect(() => {
    setLocalBranding(branding)
  }, [branding])

  // Update validation and preview when local branding changes
  useEffect(() => {
    const newValidation = validateBrandingConfig(localBranding)
    setValidation(newValidation)

    if (newValidation.isValid) {
      const preview = previewBranding(localBranding)
      setPreviewStyles(preview.cssVariables)
    } else {
      setPreviewStyles({})
    }
  }, [localBranding])

  const handleInputChange = (field: keyof BrandingConfig, value: string) => {
    const updated = { ...localBranding, [field]: value }
    setLocalBranding(updated)
    onBrandingChange(updated)
  }

  const handleApply = () => {
    if (validation.isValid && onApply) {
      onApply()
    }
  }

  const handleReset = () => {
    setLocalBranding({})
    onBrandingChange({})
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Configuration Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Branding Configuration</h3>
          </div>

          {/* App Name */}
          <div>
            <label htmlFor="appName" className="block text-sm font-medium mb-2">
              Application Name
            </label>
            <Input
              id="appName"
              value={localBranding.appName || ''}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              placeholder="Enter application name"
              maxLength={50}
            />
          </div>

          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={localBranding.primaryColor || '#3b82f6'}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={localBranding.primaryColor || ''}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={localBranding.secondaryColor || '#64748b'}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={localBranding.secondaryColor || ''}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                placeholder="#64748b"
                className="flex-1"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium mb-2">
              Font Family
            </label>
            <Input
              id="fontFamily"
              value={localBranding.fontFamily || ''}
              onChange={(e) => handleInputChange('fontFamily', e.target.value)}
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium mb-2">
              Logo URL
            </label>
            <Input
              id="logo"
              value={localBranding.logo || ''}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              placeholder="https://example.com/logo.png or /logo.png"
            />
          </div>

          {/* Validation Errors */}
          {validation.errors.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <h4 className="text-sm font-medium text-destructive mb-2">
                Configuration Errors:
              </h4>
              <ul className="text-sm text-destructive space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleApply}
              disabled={!validation.isValid}
              className="flex-1"
            >
              Apply Changes
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </Card>

      {/* Live Preview */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Live Preview</h3>

          <div
            className="space-y-4 p-4 border rounded-lg"
            style={previewStyles}
          >
            {/* App Header Preview */}
            <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-lg">
              <div className="flex items-center gap-3">
                {localBranding.logo && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localBranding.logo}
                      alt="Logo"
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </>
                )}
                <h1 className="text-xl font-bold">
                  {localBranding.appName || 'Chat UI'}
                </h1>
              </div>
              <Button variant="secondary" size="sm">
                Settings
              </Button>
            </div>

            {/* Sample UI Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Buttons</h4>
                <div className="flex gap-2">
                  <Button size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Input</h4>
                <Input placeholder="Sample input field" />
              </div>
            </div>

            {/* Sample Chat Message */}
            <div className="space-y-3">
              <h4 className="font-medium">Chat Preview</h4>
              <div className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                    Hello! This is a sample user message.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
                    This is a sample assistant response with the current branding applied.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default BrandingPreview