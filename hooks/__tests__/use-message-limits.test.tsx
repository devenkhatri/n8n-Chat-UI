import { renderHook, act } from '@testing-library/react'
import { useMessageLimits } from '../use-message-limits'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useMessageLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('initializes with default config', async () => {
    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.config.total).toBe(5)
    expect(result.current.config.remaining).toBe(5)
    expect(result.current.config.plan).toBe('free')
    expect(result.current.percentage).toBe(100)
    expect(result.current.canSend).toBe(true)
    expect(result.current.isEmpty).toBe(false)
    expect(result.current.isLow).toBe(false)
  })

  it('loads config from localStorage', async () => {
    const storedConfig = {
      total: 5,
      remaining: 2,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.config.remaining).toBe(2)
    expect(result.current.percentage).toBe(40)
    // 40% is greater than 20%, so isLow should be false
    expect(result.current.isLow).toBe(false)
  })

  it('consumes message correctly', async () => {
    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    let consumed: boolean = false
    await act(async () => {
      consumed = await result.current.consumeMessage()
    })

    expect(consumed).toBe(true)
    expect(result.current.config.remaining).toBe(4)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('prevents consuming when empty', async () => {
    const storedConfig = {
      total: 5,
      remaining: 0,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    let consumed: boolean = true
    await act(async () => {
      consumed = await result.current.consumeMessage()
    })

    expect(consumed).toBe(false)
    expect(result.current.config.remaining).toBe(0)
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.canSend).toBe(false)
  })

  it('allows unlimited consumption for premium plan', async () => {
    const storedConfig = {
      total: 999999, // Use a large number instead of Infinity for JSON serialization
      remaining: 999999,
      plan: 'premium',
      features: {
        unlimitedMessages: true,
        prioritySupport: true,
        advancedFeatures: true,
        exportConversations: true,
        customThemes: true,
        apiAccess: true,
        teamCollaboration: true
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    let consumed: boolean = false
    await act(async () => {
      consumed = await result.current.consumeMessage()
    })

    expect(consumed).toBe(true)
    expect(result.current.config.remaining).toBe(999999) // Should remain unchanged for unlimited
    expect(result.current.canSend).toBe(true)
    expect(result.current.percentage).toBeGreaterThan(99) // Close to 100%
  })

  it('resets limits correctly', async () => {
    const storedConfig = {
      total: 5,
      remaining: 1,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.resetLimits()
    })

    expect(result.current.config.remaining).toBe(5)
    expect(result.current.percentage).toBe(100)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('upgrades plan correctly', async () => {
    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.upgradePlan('pro')
    })

    expect(result.current.config.plan).toBe('pro')
    expect(result.current.config.total).toBe(500)
    expect(result.current.config.remaining).toBe(500)
    expect(result.current.config.features.prioritySupport).toBe(true)
    expect(result.current.config.features.exportConversations).toBe(true)
  })

  it('upgrades to premium correctly', async () => {
    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.upgradePlan('premium')
    })

    expect(result.current.config.plan).toBe('premium')
    expect(result.current.config.total).toBe(Infinity)
    expect(result.current.config.features.unlimitedMessages).toBe(true)
    expect(result.current.config.features.apiAccess).toBe(true)
    expect(result.current.config.features.teamCollaboration).toBe(true)
  })

  it('provides correct upgrade recommendation', async () => {
    // Test with heavy usage (should recommend premium)
    const heavyUsageConfig = {
      total: 5,
      remaining: 0, // 100% used
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(heavyUsageConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.getUpgradeRecommendation()).toBe('premium')
  })

  it('provides alternative actions when empty', async () => {
    const emptyConfig = {
      total: 5,
      remaining: 0,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(emptyConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    const actions = result.current.getAlternativeActions()
    expect(actions).toHaveLength(2)
    expect(actions[0].label).toBe('Reset Session')
    expect(actions[1].label).toBe('Upgrade Plan')
  })

  it('calculates correct status flags', async () => {
    // Test low status (20% remaining)
    const lowConfig = {
      total: 5,
      remaining: 1,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(lowConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.percentage).toBe(20)
    expect(result.current.isLow).toBe(true)
    expect(result.current.isVeryLow).toBe(false)
    expect(result.current.isEmpty).toBe(false)
  })

  it('calculates very low status correctly', async () => {
    // Test very low status (10% remaining)
    const veryLowConfig = {
      total: 10,
      remaining: 1,
      plan: 'free',
      features: {
        unlimitedMessages: false,
        prioritySupport: false,
        advancedFeatures: false,
        exportConversations: false,
        customThemes: false,
        apiAccess: false,
        teamCollaboration: false
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(veryLowConfig))

    const { result } = renderHook(() => useMessageLimits())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.percentage).toBe(10)
    expect(result.current.isLow).toBe(true)
    expect(result.current.isVeryLow).toBe(true)
    expect(result.current.isEmpty).toBe(false)
  })
})