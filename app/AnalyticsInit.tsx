'use client';

import { useEffect } from 'react';
import { initAnalytics, getFirebaseApp } from '@/lib/firebase';

export function AnalyticsInit() {
  useEffect(() => {
    try {
      const app = getFirebaseApp();
      // Basic startup status log
      // eslint-disable-next-line no-console
      console.log('[Firebase] initialized', {
        projectId: app.options.projectId,
        appId: app.options.appId,
      });
      initAnalytics()
        .then((a) => {
          // eslint-disable-next-line no-console
          console.log('[Firebase] analytics', a ? 'ready' : 'not available');
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log('[Firebase] analytics init failed', e);
        });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('[Firebase] init error', e);
    }
  }, []);
  return null;
}
