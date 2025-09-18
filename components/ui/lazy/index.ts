// Lazy-loaded components for better performance
import { createLazyComponent, createLazyComponentWithSkeleton } from '../../../lib/utils/lazy-loading';

// Heavy modal components
export const LazySettingsModal = createLazyComponent<
  typeof import('../settings-modal')['default']
>(
  () => import('../settings-modal')
);

export const LazyConversationExportModal = createLazyComponent<
  typeof import('../conversation-export-modal')['default']
>(
  () => import('../conversation-export-modal')
);

export const LazyConversationImportModal = createLazyComponent<
  typeof import('../conversation-import-modal')['default']
>(
  () => import('../conversation-import-modal')
);

export const LazyUpgradePromptModal = createLazyComponent<
  typeof import('../upgrade-prompt-modal')['default']
>(
  () => import('../upgrade-prompt-modal')
);

// Analytics and dashboard components
export const LazyAnalyticsDashboard = createLazyComponentWithSkeleton<
  typeof import('../analytics-dashboard')['default']
>(
  () => import('../analytics-dashboard'),
  'skeleton'
);

export const LazyFeedbackAnalyticsPanel = createLazyComponentWithSkeleton<
  typeof import('../feedback-analytics-panel')['default']
>(
  () => import('../feedback-analytics-panel'),
  'skeleton'
);

// Heavy panels
export const LazyConversationHistoryPanel = createLazyComponentWithSkeleton<
  typeof import('../conversation-history-panel')['default']
>(
  () => import('../conversation-history-panel'),
  'skeleton'
);

export const LazySettingsPanel = createLazyComponentWithSkeleton<
  typeof import('../settings-panel')['default']
>(
  () => import('../settings-panel'),
  'skeleton'
);

// Branding components
export const LazyBrandingPreview = createLazyComponent<
  typeof import('../branding-preview')['default']
>(
  () => import('../branding-preview')
);

// Error recovery components
export const LazyErrorRecovery = createLazyComponent<
  typeof import('../error-recovery')['default']
>(
  () => import('../error-recovery')
);