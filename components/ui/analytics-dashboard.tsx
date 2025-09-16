'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from './card';
import Button from './button';
import { useAnalytics } from '@/hooks/use-analytics';
import { UsageMetrics, PerformanceMetrics } from '@/lib/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

interface DashboardData {
  sessionMetrics: UsageMetrics | null;
  performanceMetrics: PerformanceMetrics[];
  realtimeStats: {
    activeUsers: number;
    messagesPerMinute: number;
    errorRate: number;
    averageResponseTime: number;
  };
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { getSessionMetrics, isEnabled } = useAnalytics();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sessionMetrics: null,
    performanceMetrics: [],
    realtimeStats: {
      activeUsers: 0,
      messagesPerMinute: 0,
      errorRate: 0,
      averageResponseTime: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get session metrics
      const sessionMetrics = getSessionMetrics();

      // Simulate loading performance metrics (in real app, this would come from API)
      const performanceMetrics = await loadPerformanceMetrics();

      // Simulate loading realtime stats (in real app, this would come from API)
      const realtimeStats = await loadRealtimeStats();

      setDashboardData({
        sessionMetrics,
        performanceMetrics,
        realtimeStats,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getSessionMetrics]);

  useEffect(() => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }

    loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEnabled, getSessionMetrics, loadDashboardData]);

  const loadPerformanceMetrics = async (): Promise<PerformanceMetrics[]> => {
    // In a real application, this would fetch from your analytics API
    // For demo purposes, we'll return mock data
    return [
      {
        lcp: 1200,
        fid: 50,
        cls: 0.1,
        fcp: 800,
        ttfb: 200,
        messageResponseTime: 1500,
        componentRenderTime: 16,
        bundleSize: 245000,
      },
    ];
  };

  const loadRealtimeStats = async () => {
    // In a real application, this would fetch from your analytics API
    // For demo purposes, we'll return mock data
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      messagesPerMinute: Math.floor(Math.random() * 20) + 5,
      errorRate: Math.random() * 0.05, // 0-5% error rate
      averageResponseTime: Math.floor(Math.random() * 1000) + 500,
    };
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }
    
    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    return Math.max(0, score);
  };

  if (!isEnabled) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <p>Analytics tracking is disabled in this environment.</p>
          <p className="text-sm mt-2">Enable analytics in production to view usage metrics.</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const { sessionMetrics, performanceMetrics, realtimeStats } = dashboardData;
  const currentPerformance = performanceMetrics[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={loadDashboardData} variant="secondary" size="sm">
          Refresh
        </Button>
      </div>

      {/* Realtime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{realtimeStats.activeUsers}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{realtimeStats.messagesPerMinute}</div>
          <div className="text-sm text-gray-600">Messages/Min</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {(realtimeStats.errorRate * 100).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">Error Rate</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {realtimeStats.averageResponseTime}ms
          </div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </Card>
      </div>

      {/* Session Metrics */}
      {sessionMetrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xl font-bold">{sessionMetrics.messagesPerSession}</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            
            <div>
              <div className="text-xl font-bold">{formatDuration(sessionMetrics.sessionDuration)}</div>
              <div className="text-sm text-gray-600">Session Duration</div>
            </div>
            
            <div>
              <div className="text-xl font-bold">
                {(sessionMetrics.errorRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            
            <div>
              <div className="text-xl font-bold">
                {sessionMetrics.userRetention ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">User Retained</div>
            </div>
          </div>

          {/* Feature Usage */}
          {Object.keys(sessionMetrics.featureUsage).length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Feature Usage</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(sessionMetrics.featureUsage).map(([feature, count]) => (
                  <div key={feature} className="text-sm">
                    <span className="font-medium">{feature}:</span> {count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Performance Metrics */}
      {currentPerformance && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Performance Score</span>
              <span className="text-lg font-bold">
                {getPerformanceScore(currentPerformance)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPerformanceScore(currentPerformance)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPerformance.lcp && (
              <div>
                <div className="text-lg font-bold">{currentPerformance.lcp.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Largest Contentful Paint</div>
              </div>
            )}
            
            {currentPerformance.fid && (
              <div>
                <div className="text-lg font-bold">{currentPerformance.fid.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">First Input Delay</div>
              </div>
            )}
            
            {currentPerformance.cls && (
              <div>
                <div className="text-lg font-bold">{currentPerformance.cls.toFixed(3)}</div>
                <div className="text-sm text-gray-600">Cumulative Layout Shift</div>
              </div>
            )}
            
            {currentPerformance.fcp && (
              <div>
                <div className="text-lg font-bold">{currentPerformance.fcp.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">First Contentful Paint</div>
              </div>
            )}
            
            {currentPerformance.ttfb && (
              <div>
                <div className="text-lg font-bold">{currentPerformance.ttfb.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Time to First Byte</div>
              </div>
            )}
            
            {currentPerformance.bundleSize && (
              <div>
                <div className="text-lg font-bold">{formatBytes(currentPerformance.bundleSize)}</div>
                <div className="text-sm text-gray-600">Bundle Size</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}