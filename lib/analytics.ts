// Firebase Analytics tracking utilities
import { initAnalytics } from './firebase';
import type { Analytics } from 'firebase/analytics';

let analyticsInstance: Analytics | undefined;

// Initialize analytics instance
async function getAnalytics(): Promise<Analytics | undefined> {
  if (typeof window === 'undefined') return undefined;
  
  if (!analyticsInstance) {
    try {
      analyticsInstance = await initAnalytics();
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
      return undefined;
    }
  }
  
  return analyticsInstance;
}

/**
 * Track a custom event in Firebase Analytics
 * @param eventName - Name of the event (snake_case)
 * @param params - Event parameters (key-value pairs)
 */
export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Event (not sent):', eventName, params);
      }
      return;
    }

    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, eventName, params);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', eventName, params);
    }
  } catch (error) {
    // Analytics failures should not break the app
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track a page view in Firebase Analytics
 * @param pagePath - Path of the page (e.g., '/shop', '/mines')
 * @param pageTitle - Title of the page (optional)
 */
export async function trackPageView(
  pagePath: string,
  pageTitle?: string
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Page view (not sent):', pagePath, pageTitle);
      }
      return;
    }

    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || pagePath,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view:', pagePath, pageTitle);
    }
  } catch (error) {
    // Analytics failures should not break the app
    console.error('[Analytics] Error tracking page view:', error);
  }
}

