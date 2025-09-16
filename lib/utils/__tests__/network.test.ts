/**
 * @jest-environment jsdom
 */

import { networkManager, fetchWithRetry, isNetworkError, isRetryableError, getErrorType } from '../network'

// Mock fetch
global.fetch = jest.fn()

// Mock navigator
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('Network Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('fetchWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockResponse = new Response('success', { status: 200 })
      ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const response = await fetchWithRetry('/test')
      expect(response).toBe(mockResponse)
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on network error', async () => {
      const networkError = new TypeError('Failed to fetch')
      const successResponse = new Response('success', { status: 200 })
      
      ;(fetch as jest.Mock)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('/test', {}, { maxRetries: 1, baseDelay: 10 })
      expect(response).toBe(successResponse)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on 5xx errors', async () => {
      const serverError = new Response('Server Error', { status: 500 })
      const successResponse = new Response('success', { status: 200 })
      
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('/test', {}, { maxRetries: 1, baseDelay: 10 })
      expect(response).toBe(successResponse)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on 429 rate limit', async () => {
      const rateLimitError = new Response('Rate Limited', { status: 429 })
      const successResponse = new Response('success', { status: 200 })
      
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce(rateLimitError)
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('/test', {}, { maxRetries: 1, baseDelay: 10 })
      expect(response).toBe(successResponse)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on 4xx client errors (except 429)', async () => {
      const clientError = new Response('Bad Request', { status: 400 })
      
      ;(fetch as jest.Mock).mockResolvedValueOnce(clientError)

      await expect(fetchWithRetry('/test', {}, { maxRetries: 1, baseDelay: 10 }))
        .rejects.toThrow('HTTP 400: Bad Request')
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw after max retries', async () => {
      const networkError = new TypeError('Failed to fetch')
      
      ;(fetch as jest.Mock).mockRejectedValue(networkError)

      await expect(fetchWithRetry('/test', {}, { maxRetries: 2, baseDelay: 10 }))
        .rejects.toThrow('Failed to fetch')
      expect(fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('Error Classification', () => {
    it('should identify network errors', () => {
      const networkError = new TypeError('Failed to fetch')
      expect(isNetworkError(networkError)).toBe(true)

      const otherError = new Error('Some other error')
      expect(isNetworkError(otherError)).toBe(false)
    })

    it('should identify retryable errors', () => {
      // Network errors
      expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true)
      
      // Server errors
      expect(isRetryableError({ status: 500 })).toBe(true)
      expect(isRetryableError({ status: 502 })).toBe(true)
      expect(isRetryableError({ status: 503 })).toBe(true)
      
      // Rate limit
      expect(isRetryableError({ status: 429 })).toBe(true)
      
      // Timeout
      expect(isRetryableError({ status: 408 })).toBe(true)
      
      // Client errors (not retryable)
      expect(isRetryableError({ status: 400 })).toBe(false)
      expect(isRetryableError({ status: 404 })).toBe(false)
    })

    it('should classify error types correctly', () => {
      expect(getErrorType(new TypeError('Failed to fetch'))).toBe('network')
      expect(getErrorType({ status: 500 })).toBe('server')
      expect(getErrorType({ status: 400 })).toBe('client')
      expect(getErrorType(new Error('Unknown'))).toBe('unknown')
    })
  })

  describe('NetworkManager', () => {
    it('should track online/offline state', () => {
      const state = networkManager.getNetworkState()
      expect(state.isOnline).toBe(true)
    })

    it('should handle offline requests by queueing', async () => {
      // Simulate going offline
      Object.defineProperty(window.navigator, 'onLine', { value: false })
      
      // This would normally queue the request
      networkManager.fetchWithRetry('/test')
      
      expect(networkManager.getQueueSize()).toBeGreaterThan(0)
      
      // Clean up
      networkManager.clearQueue()
    })
  })
})