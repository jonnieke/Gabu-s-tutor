// Usage tracking service for paywall functionality

const USAGE_KEY = 'gabu-usage-count';
const USER_AUTH_KEY = 'gabu-user-authenticated';
const MAX_FREE_USES = 5;

export const usageTracker = {
  // Get current usage count
  getUsageCount: (): number => {
    try {
      const count = localStorage.getItem(USAGE_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.warn('Failed to get usage count:', error);
      return 0;
    }
  },

  // Increment usage count
  incrementUsage: (): number => {
    try {
      const current = usageTracker.getUsageCount();
      const newCount = current + 1;
      localStorage.setItem(USAGE_KEY, newCount.toString());
      return newCount;
    } catch (error) {
      console.warn('Failed to increment usage:', error);
      return 0;
    }
  },

  // Check if user has exceeded free uses
  hasExceededFreeUses: (): boolean => {
    if (usageTracker.isAuthenticated()) {
      return false;
    }
    return usageTracker.getUsageCount() >= MAX_FREE_USES;
  },

  // Check if user should see paywall
  shouldShowPaywall: (): boolean => {
    return usageTracker.hasExceededFreeUses() && !usageTracker.isAuthenticated();
  },

  // Get remaining free uses
  getRemainingUses: (): number => {
    const used = usageTracker.getUsageCount();
    const remaining = MAX_FREE_USES - used;
    return Math.max(0, remaining);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    try {
      return localStorage.getItem(USER_AUTH_KEY) === 'true';
    } catch (error) {
      console.warn('Failed to check authentication:', error);
      return false;
    }
  },

  // Set user as authenticated
  setAuthenticated: (authenticated: boolean): void => {
    try {
      localStorage.setItem(USER_AUTH_KEY, authenticated.toString());
    } catch (error) {
      console.warn('Failed to set authentication:', error);
    }
  },

  // Reset usage count (for testing or after authentication)
  resetUsage: (): void => {
    try {
      localStorage.setItem(USAGE_KEY, '0');
    } catch (error) {
      console.warn('Failed to reset usage:', error);
    }
  },

  // Get max free uses constant
  getMaxFreeUses: (): number => {
    return MAX_FREE_USES;
  }
};

