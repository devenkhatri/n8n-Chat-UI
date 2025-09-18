import { NextResponse } from 'next/server';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database?: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    external_apis?: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory?: {
      status: 'healthy' | 'unhealthy';
      usage: number;
      limit: number;
    };
    disk?: {
      status: 'healthy' | 'unhealthy';
      usage: number;
      available: number;
    };
  };
}

// Track application start time
const startTime = Date.now();

export async function GET(): Promise<NextResponse> {
  const startCheck = Date.now();
  
  try {
    // Basic health information
    const healthData: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now() - startTime,
      checks: {},
    };

    // Memory check
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const memLimit = parseInt(process.env.MEMORY_LIMIT || '512') * 1024 * 1024; // Default 512MB
      const memUsagePercent = (memUsage.heapUsed / memLimit) * 100;
      
      healthData.checks.memory = {
        status: memUsagePercent > 90 ? 'unhealthy' : 'healthy',
        usage: memUsage.heapUsed,
        limit: memLimit,
      };
      
      if (memUsagePercent > 90) {
        healthData.status = 'unhealthy';
      }
    }

    // External API check (n8n webhook)
    if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
      try {
        const apiCheckStart = Date.now();
        const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        
        const responseTime = Date.now() - apiCheckStart;
        
        healthData.checks.external_apis = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
        };
        
        if (!response.ok) {
          healthData.status = 'unhealthy';
          healthData.checks.external_apis.error = `HTTP ${response.status}`;
        }
      } catch (error) {
        healthData.checks.external_apis = {
          status: 'unhealthy',
          responseTime: Date.now() - startCheck,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        healthData.status = 'unhealthy';
      }
    }

    // Disk space check (if available)
    if (typeof process !== 'undefined' && typeof process.platform !== 'undefined') {
      try {
        const fs = await import('fs');
        fs.statSync('.');
        
        // This is a simplified check - in production you'd want more sophisticated disk monitoring
        healthData.checks.disk = {
          status: 'healthy',
          usage: 0, // Would need platform-specific implementation
          available: 0, // Would need platform-specific implementation
        };
      } catch {
        // Disk check failed, but don't mark as unhealthy unless critical
      }
    }

    const responseTime = Date.now() - startCheck;
    
    // Add response time to headers
    const response = NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Check-Version': '1.0',
      },
    });

    return response;
  } catch (error) {
    const errorResponse: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now() - startTime,
      checks: {
        external_apis: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Health check failed',
        },
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startCheck}ms`,
        'X-Health-Check-Version': '1.0',
      },
    });
  }
}

// Readiness check - simpler check for container orchestration
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick readiness check
    const isReady = Date.now() - startTime > 1000; // App has been running for at least 1 second
    
    return new NextResponse(null, {
      status: isReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Ready': isReady ? 'true' : 'false',
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Ready': 'false',
      },
    });
  }
}