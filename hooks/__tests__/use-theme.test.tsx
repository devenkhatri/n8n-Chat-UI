import { renderHook, act } from '@testing-library/react'
import { ThemeProvider } from '../../providers/theme-provider'
import { useTheme } from '../use-theme'
import React from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  it('should initialize with system theme by default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    expect(result.current.theme).toBe('system')
    expect(result.current.isSystem).toBe(true)
  })

  it('should toggle between light and dark themes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.setTheme('light')
    })
    
    expect(result.current.theme).toBe('light')
    expect(result.current.isLight).toBe(true)
    expect(result.current.isDark).toBe(false)
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)
  })

  it('should cycle through themes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.setTheme('light')
    })
    
    expect(result.current.theme).toBe('light')
    
    act(() => {
      result.current.cycleTheme()
    })
    
    expect(result.current.theme).toBe('dark')
    
    act(() => {
      result.current.cycleTheme()
    })
    
    expect(result.current.theme).toBe('system')
    
    act(() => {
      result.current.cycleTheme()
    })
    
    expect(result.current.theme).toBe('light')
  })

  it('should update preferences', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.updatePreferences({
        fontSize: 'lg',
        animationsEnabled: false,
      })
    })
    
    expect(result.current.preferences.fontSize).toBe('lg')
    expect(result.current.preferences.animationsEnabled).toBe(false)
    expect(result.current.animationsEnabled).toBe(false)
  })

  it('should update branding', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.updateBranding({
        appName: 'Custom App',
        primaryColor: '#ff0000',
      })
    })
    
    expect(result.current.branding.appName).toBe('Custom App')
    expect(result.current.branding.primaryColor).toBe('#ff0000')
  })

  it('should return correct theme icons and labels', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.setTheme('light')
    })
    
    expect(result.current.getThemeIcon()).toBe('sun')
    expect(result.current.getThemeLabel()).toBe('Light')
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(result.current.getThemeIcon()).toBe('moon')
    expect(result.current.getThemeLabel()).toBe('Dark')
    
    act(() => {
      result.current.setTheme('system')
    })
    
    expect(result.current.getThemeIcon()).toBe('monitor')
    expect(result.current.getThemeLabel()).toBe('System')
  })

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-theme', 'dark')
  })

  it('should persist preferences to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.updatePreferences({ fontSize: 'lg' })
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ui-preferences',
      expect.stringContaining('"fontSize":"lg"')
    )
  })
})