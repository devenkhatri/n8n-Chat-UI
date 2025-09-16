import { NextRequest, NextResponse } from 'next/server';

interface MetricsData {
  timestamp: string;
  application: {
    name: string;
    version: string;
    environment: string;
    uptime: number;
  };
  system: {
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpu?: {
      usage: number;
    };
  };
  http: {
    requests_total: number;
    requests_per_minute: number;
    response_time_avg: number;
    error_rate: number;
  };
  business: {
    messages_sent: number;
    messages_received: number;
    active_sessions: number;
    user_interactions: number;
  };
}

// Simple in-memory metrics store (in production, use Redis or similar)
class MetricsStore {
  private static instance: MetricsStore;
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];
  private messagesSent: number = 0;
  private messagesReceived: number = 0;
  private activeSessions: Set<string> = new Set();
  private userInteractions: number = 0;

  private constructor() {
    this.startTime = Date.now();
  }

  static getInstance(): MetricsStore {
    if (!MetricsStore.instance) {
      MetricsStore.instance = new MetricsStore();
    }
    return MetricsStore.instance;
  }

  incrementRequests(): void {
    this.requestCount++;
  }

  incrementErrors(): void {
    this.errorCount++;
  }

  addResponseTime(time: number): void {
    this.responseTimes.push(time);
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  incrementMessagesSent(): void {
    this.messagesSent++;
  }

  incrementMessagesReceived(): void {
    this.messagesReceived++;
  }

  addActiveSession(sessionId: string): void {
    this.activeSessions.add(sessionId);
  }

  removeActiveSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  incrementUserInteractions(): void {
    this.userInteractions++;
  }

  getMetrics(): MetricsData {
    const uptime = Date.now() - this.startTime;
    const memUsage = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
    };

    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    const requestsPerMinute = this.requestCount / (uptime / 60000);
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      timestamp: new Date().toISOString(),
      application: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'n8n Chat UI',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime,
      },
      system: {
        memory: memUsage,
      },
      http: {
        requests_total: this.requestCount,
        requests_per_minute: requestsPerMinute,
        response_time_avg: avgResponseTime,
        error_rate: errorRate,
      },
      business: {
        messages_sent: this.messagesSent,
        messages_received: this.messagesReceived,
        active_sessions: this.activeSessions.size,
        user_interactions: this.userInteractions,
      },
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.activeSessions.clear();
    this.userInteractions = 0;
  }
}

const metricsStore = MetricsStore.getInstance();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Increment request counter
    metricsStore.incrementRequests();
    
    // Get metrics data
    const metrics = metricsStore.getMetrics();
    
    // Add response time
    const responseTime = Date.now() - startTime;
    metricsStore.addResponseTime(responseTime);
    
    // Check if Prometheus format is requested
    const acceptHeader = request.headers.get('accept');
    const format = request.nextUrl.searchParams.get('format');
    
    if (format === 'prometheus' || acceptHeader?.includes('text/plain')) {
      // Return Prometheus format
      const prometheusMetrics = formatPrometheusMetrics(metrics);
      
      return new NextResponse(prometheusMetrics, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': `${responseTime}ms`,
        },
      });
    }
    
    // Return JSON format
    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
  } catch (error) {
    metricsStore.incrementErrors();
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

// POST endpoint to receive metrics from client-side
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    switch (type) {
      case 'message_sent':
        metricsStore.incrementMessagesSent();
        break;
      case 'message_received':
        metricsStore.incrementMessagesReceived();
        break;
      case 'session_start':
        if (data?.sessionId) {
          metricsStore.addActiveSession(data.sessionId);
        }
        break;
      case 'session_end':
        if (data?.sessionId) {
          metricsStore.removeActiveSession(data.sessionId);
        }
        break;
      case 'user_interaction':
        metricsStore.incrementUserInteractions();
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown metric type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to record metric',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Reset metrics (for testing/debugging)
export async function DELETE(): Promise<NextResponse> {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }
  
  try {
    metricsStore.reset();
    return NextResponse.json({ success: true, message: 'Metrics reset' });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to reset metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function formatPrometheusMetrics(metrics: MetricsData): string {
  const lines: string[] = [];
  
  // Application metrics
  lines.push(`# HELP app_uptime_seconds Application uptime in seconds`);
  lines.push(`# TYPE app_uptime_seconds counter`);
  lines.push(`app_uptime_seconds{app="${metrics.application.name}",version="${metrics.application.version}",env="${metrics.application.environment}"} ${metrics.application.uptime / 1000}`);
  
  // Memory metrics
  lines.push(`# HELP nodejs_heap_used_bytes Node.js heap used in bytes`);
  lines.push(`# TYPE nodejs_heap_used_bytes gauge`);
  lines.push(`nodejs_heap_used_bytes ${metrics.system.memory.heapUsed}`);
  
  lines.push(`# HELP nodejs_heap_total_bytes Node.js heap total in bytes`);
  lines.push(`# TYPE nodejs_heap_total_bytes gauge`);
  lines.push(`nodejs_heap_total_bytes ${metrics.system.memory.heapTotal}`);
  
  // HTTP metrics
  lines.push(`# HELP http_requests_total Total number of HTTP requests`);
  lines.push(`# TYPE http_requests_total counter`);
  lines.push(`http_requests_total ${metrics.http.requests_total}`);
  
  lines.push(`# HELP http_request_duration_seconds Average HTTP request duration in seconds`);
  lines.push(`# TYPE http_request_duration_seconds gauge`);
  lines.push(`http_request_duration_seconds ${metrics.http.response_time_avg / 1000}`);
  
  lines.push(`# HELP http_error_rate_percent HTTP error rate percentage`);
  lines.push(`# TYPE http_error_rate_percent gauge`);
  lines.push(`http_error_rate_percent ${metrics.http.error_rate}`);
  
  // Business metrics
  lines.push(`# HELP chat_messages_sent_total Total number of messages sent`);
  lines.push(`# TYPE chat_messages_sent_total counter`);
  lines.push(`chat_messages_sent_total ${metrics.business.messages_sent}`);
  
  lines.push(`# HELP chat_messages_received_total Total number of messages received`);
  lines.push(`# TYPE chat_messages_received_total counter`);
  lines.push(`chat_messages_received_total ${metrics.business.messages_received}`);
  
  lines.push(`# HELP chat_active_sessions Current number of active sessions`);
  lines.push(`# TYPE chat_active_sessions gauge`);
  lines.push(`chat_active_sessions ${metrics.business.active_sessions}`);
  
  lines.push(`# HELP user_interactions_total Total number of user interactions`);
  lines.push(`# TYPE user_interactions_total counter`);
  lines.push(`user_interactions_total ${metrics.business.user_interactions}`);
  
  return lines.join('\n') + '\n';
}