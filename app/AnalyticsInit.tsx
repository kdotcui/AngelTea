'use client';

import { useEffect } from 'react';
import { initAnalytics, getFirebaseApp } from '@/lib/firebase';

export function AnalyticsInit() {
  useEffect(() => {
    try {
      const app = getFirebaseApp();
      // Basic startup status log
      console.log('[Firebase] initialized', {
        projectId: app.options.projectId,
        appId: app.options.appId,
      });
      initAnalytics()
        .then((a) => {
          console.log('[Firebase] analytics', a ? 'ready' : 'not available');
        })
        .catch((e) => {
          console.log('[Firebase] analytics init failed', e);
        });
    } catch (e) {
      console.log('[Firebase] init error', e);
    }
  }, []);
  return null;
}
