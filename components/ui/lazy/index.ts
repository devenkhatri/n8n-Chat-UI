// Lazy-loaded components for better performance
import { createLazyComponent, createLazyComponentWithSkeleton } from '../../../lib/utils/lazy-loading';

// Heavy modal components
export const LazySettingsModal = createLazyComponent(
  () => import('../settings-modal'),
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-background rounded-lg p-6 w-full max-w-md">
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

export const LazyConversationExportModal = createLazyComponent(
  () => import('../conversation-export-modal')
);

export const LazyConversationImportModal = createLazyComponent(
  () => import('../conversation-import-modal')
);

export const LazyUpgradePromptModal = createLazyComponent(
  () => import('../upgrade-prompt-modal')
);

// Analytics and dashboard components
export const LazyAnalyticsDashboard = createLazyComponentWithSkeleton(
  () => import('../analytics-dashboard'),
  'skeleton'
);

export const LazyFeedbackAnalyticsPanel = createLazyComponentWithSkeleton(
  () => import('../feedback-analytics-panel'),
  'skeleton'
);

// Heavy panels
export const LazyConversationHistoryPanel = createLazyComponentWithSkeleton(
  () => import('../conversation-history-panel'),
  'skeleton'
);

export const LazySettingsPanel = createLazyComponentWithSkeleton(
  () => import('../settings-panel'),
  'skeleton'
);

// Branding components
export const LazyBrandingPreview = createLazyComponent(
  () => import('../branding-preview')
);

// Error recovery components
export const LazyErrorRecovery = createLazyComponent(
  () => import('../error-recovery')
);