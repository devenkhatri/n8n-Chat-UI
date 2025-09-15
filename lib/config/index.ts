/**
 * Environment-based configuration management
 * Centralizes all configuration values and provides type safety
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
    customCssUrl?: string;
  };
  features: {
    enableSound: boolean;
    enableAnimations: boolean;
    enableMessageGrouping: boolean;
    enableAnalytics: boolean;
  };
  api: {
    n8nWebhookUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  analytics: {
    endpoint?: string;
    apiKey?: string;
    sampleRate: number;
    enabled: boolean;
  };
  monitoring: {
    enableHealthChecks: boolean;
    enableMetrics: boolean;
    metricsRetentionDays: number;
  };
  performance: {
    enableServiceWorker: boolean;
    enableImageOptimization: boolean;
    enableBundleAnalysis: boolean;
  };
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    allowedOrigins: string[];
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  app: {
    name: 'n8n Chat UI',
    version: '1.0.0',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
  },
  branding: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
  },
  features: {
    enableSound: false,
    enableAnimations: true,
    enableMessageGrouping: true,
    enableAnalytics: false,
  },
  api: {
    n8nWebhookUrl: '',
    timeout: 30000,
    retryAttempts: 3,
  },
  analytics: {
    sampleRate: 1.0,
    enabled: false,
  },
  monitoring: {
    enableHealthChecks: true,
    enableMetrics: true,
    metricsRetentionDays: 7,
  },
  performance: {
    enableServiceWorker: true,
    enableImageOptimization: true,
    enableBundleAnalysis: false,
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    allowedOrigins: ['http://localhost:3000'],
  },
};

// Environment-specific overrides
const environmentConfigs: Record<string, Partial<AppConfig>> = {
  development: {
    app: {
      environment: 'development',
      baseUrl: 'http://localhost:3000',
    },
    features: {
      enableAnalytics: false,
    },
    performance: {
      enableBundleAnalysis: true,
    },
    security: {
      enableCSP: false,
      allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    },
  },
  staging: {
    app: {
      environment: 'staging',
      baseUrl: 'https://staging-chat.example.com',
    },
    features: {
      enableAnalytics: true,
    },
    analytics: {
      enabled: true,
      sampleRate: 0.5,
    },
    security: {
      allowedOrigins: ['https://staging-chat.example.com'],
    },
  },
  production: {
    app: {
      environment: 'production',
      baseUrl: 'https://chat.example.com',
    },
    features: {
      enableAnalytics: true,
    },
    analytics: {
      enabled: true,
      sampleRate: 1.0,
    },
    performance: {
      enableServiceWorker: true,
      enableImageOptimization: true,
    },
    security: {
      enableCSP: true,
      enableHSTS: true,
      allowedOrigins: ['https://chat.example.com'],
    },
  },
};

// Helper function to get environment variable with fallback
function getEnvVar(key: string, fallback: string = ''): string {
  // Always use process.env to avoid hydration issues
  return process.env[key] || fallback;
}

// Helper function to get boolean environment variable
function getEnvBool(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

// Helper function to get number environment variable
function getEnvNumber(key: string, fallback: number = 0): number {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

// Build configuration from environment variables
function buildConfigFromEnv(): AppConfig {
  const environment = getEnvVar('NODE_ENV', 'development') as AppConfig['app']['environment'];
  
  // Start with default config
  let config = { ...defaultConfig };
  
  // Apply environment-specific overrides
  if (environmentConfigs[environment]) {
    config = mergeDeep(config, environmentConfigs[environment]);
  }
  
  // Apply environment variable overrides
  const envOverrides: Partial<AppConfig> = {
    app: {
      name: getEnvVar('NEXT_PUBLIC_APP_NAME', config.app.name),
      version: getEnvVar('npm_package_version', config.app.version),
      environment,
      baseUrl: getEnvVar('NEXT_PUBLIC_BASE_URL', config.app.baseUrl),
    },
    branding: {
      primaryColor: getEnvVar('NEXT_PUBLIC_PRIMARY_COLOR', config.branding.primaryColor),
      secondaryColor: getEnvVar('NEXT_PUBLIC_SECONDARY_COLOR', config.branding.secondaryColor),
      fontFamily: getEnvVar('NEXT_PUBLIC_FONT_FAMILY', config.branding.fontFamily),
      logoUrl: getEnvVar('NEXT_PUBLIC_LOGO_URL') || undefined,
      customCssUrl: getEnvVar('NEXT_PUBLIC_CUSTOM_CSS_URL') || undefined,
    },
    features: {
      enableSound: getEnvBool('NEXT_PUBLIC_ENABLE_SOUND', config.features.enableSound),
      enableAnimations: getEnvBool('NEXT_PUBLIC_ENABLE_ANIMATIONS', config.features.enableAnimations),
      enableMessageGrouping: getEnvBool('NEXT_PUBLIC_ENABLE_MESSAGE_GROUPING', config.features.enableMessageGrouping),
      enableAnalytics: getEnvBool('NEXT_PUBLIC_ENABLE_ANALYTICS', config.features.enableAnalytics),
    },
    api: {
      n8nWebhookUrl: getEnvVar('NEXT_PUBLIC_N8N_WEBHOOK_URL', config.api.n8nWebhookUrl),
      timeout: getEnvNumber('NEXT_PUBLIC_API_TIMEOUT', config.api.timeout),
      retryAttempts: getEnvNumber('NEXT_PUBLIC_API_RETRY_ATTEMPTS', config.api.retryAttempts),
    },
    analytics: {
      endpoint: getEnvVar('NEXT_PUBLIC_ANALYTICS_ENDPOINT') || undefined,
      apiKey: getEnvVar('NEXT_PUBLIC_ANALYTICS_API_KEY') || undefined,
      sampleRate: getEnvNumber('NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE', config.analytics.sampleRate),
      enabled: getEnvBool('NEXT_PUBLIC_ENABLE_ANALYTICS', config.analytics.enabled),
    },
    monitoring: {
      enableHealthChecks: getEnvBool('ENABLE_HEALTH_CHECKS', config.monitoring.enableHealthChecks),
      enableMetrics: getEnvBool('ENABLE_METRICS', config.monitoring.enableMetrics),
      metricsRetentionDays: getEnvNumber('METRICS_RETENTION_DAYS', config.monitoring.metricsRetentionDays),
    },
    performance: {
      enableServiceWorker: getEnvBool('NEXT_PUBLIC_ENABLE_SERVICE_WORKER', config.performance.enableServiceWorker),
      enableImageOptimization: getEnvBool('NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION', config.performance.enableImageOptimization),
      enableBundleAnalysis: getEnvBool('ENABLE_BUNDLE_ANALYSIS', config.performance.enableBundleAnalysis),
    },
    security: {
      enableCSP: getEnvBool('ENABLE_CSP', config.security.enableCSP),
      enableHSTS: getEnvBool('ENABLE_HSTS', config.security.enableHSTS),
      allowedOrigins: getEnvVar('ALLOWED_ORIGINS', config.security.allowedOrigins.join(',')).split(',').filter(Boolean),
    },
  };
  
  return mergeDeep(config, envOverrides);
}

// Deep merge utility function
function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Export the configuration
export const config: AppConfig = buildConfigFromEnv();

// Export individual config sections for convenience
export const appConfig = config.app;
export const brandingConfig = config.branding;
export const featuresConfig = config.features;
export const apiConfig = config.api;
export const analyticsConfig = config.analytics;
export const monitoringConfig = config.monitoring;
export const performanceConfig = config.performance;
export const securityConfig = config.security;

// Validation function
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!config.api.n8nWebhookUrl) {
    errors.push('NEXT_PUBLIC_N8N_WEBHOOK_URL is required');
  }
  
  // URL validation
  try {
    new URL(config.api.n8nWebhookUrl);
  } catch {
    errors.push('NEXT_PUBLIC_N8N_WEBHOOK_URL must be a valid URL');
  }
  
  // Analytics validation
  if (config.analytics.enabled && !config.analytics.endpoint) {
    errors.push('NEXT_PUBLIC_ANALYTICS_ENDPOINT is required when analytics is enabled');
  }
  
  // Color validation
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(config.branding.primaryColor)) {
    errors.push('NEXT_PUBLIC_PRIMARY_COLOR must be a valid hex color');
  }
  if (!colorRegex.test(config.branding.secondaryColor)) {
    errors.push('NEXT_PUBLIC_SECONDARY_COLOR must be a valid hex color');
  }
  
  // Sample rate validation
  if (config.analytics.sampleRate < 0 || config.analytics.sampleRate > 1) {
    errors.push('NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE must be between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Development helper to log configuration
export function logConfig(): void {
  if (config.app.environment === 'development') {
    console.group('🔧 Application Configuration');
    console.log('Environment:', config.app.environment);
    console.log('App Name:', config.app.name);
    console.log('Version:', config.app.version);
    console.log('Base URL:', config.app.baseUrl);
    console.log('Analytics Enabled:', config.analytics.enabled);
    console.log('Features:', config.features);
    console.groupEnd();
    
    const validation = validateConfig();
    if (!validation.valid) {
      console.group('❌ Configuration Errors');
      validation.errors.forEach(error => console.error(error));
      console.groupEnd();
    }
  }
}