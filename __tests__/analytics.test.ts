import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('Analytics Tracking', () => {
  let trackEvent: typeof import('../lib/analytics').trackEvent;
  let trackPageView: typeof import('../lib/analytics').trackPageView;
  let originalWindow: typeof global.window;
  let consoleErrorSpy: ReturnType<typeof mockConsoleError>;
  let consoleLogSpy: ReturnType<typeof mockConsoleLog>;

  function mockConsoleError() {
    const calls: any[][] = [];
    const original = console.error;
    console.error = (...args: any[]) => {
      calls.push(args);
      // Don't actually log in tests
    };
    return {
      calls,
      restore: () => {
        console.error = original;
      },
    };
  }

  function mockConsoleLog() {
    const calls: any[][] = [];
    const original = console.log;
    console.log = (...args: any[]) => {
      calls.push(args);
      // Don't actually log in tests
    };
    return {
      calls,
      restore: () => {
        console.log = original;
      },
    };
  }

  beforeEach(async () => {
    // Reset window
    originalWindow = global.window;
    global.window = {} as any;
    
    // Reset console spies
    if (consoleErrorSpy) consoleErrorSpy.restore();
    if (consoleLogSpy) consoleLogSpy.restore();
    consoleErrorSpy = mockConsoleError();
    consoleLogSpy = mockConsoleLog();
    
    // Import module
    const analytics = await import('../lib/analytics');
    trackEvent = analytics.trackEvent;
    trackPageView = analytics.trackPageView;
  });

  describe('trackEvent', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof trackEvent, 'function');
    });

    it('should not throw when called with event name', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event');
      });
    });

    it('should not throw when called with event name and parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          param1: 'value1',
          param2: 42,
          param3: true,
        });
      });
    });

    it('should handle string parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          string_param: 'test',
        });
      });
    });

    it('should handle number parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          number_param: 123,
        });
      });
    });

    it('should handle boolean parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          bool_param: true,
        });
      });
    });

    it('should handle mixed parameter types', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          string_param: 'test',
          number_param: 42,
          bool_param: false,
        });
      });
    });

    it('should not throw in server-side environment', async () => {
      delete (global as any).window;
      
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', { test: 'value' });
      });
      
      global.window = originalWindow;
    });

    it('should handle errors gracefully', async () => {
      // This test verifies that errors don't propagate
      // In a real scenario, Firebase might fail to initialize
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', { test: 'value' });
      });
    });
  });

  describe('trackPageView', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof trackPageView, 'function');
    });

    it('should not throw when called with path', async () => {
      await assert.doesNotReject(async () => {
        await trackPageView('/shop');
      });
    });

    it('should not throw when called with path and title', async () => {
      await assert.doesNotReject(async () => {
        await trackPageView('/shop', 'Shop Page');
      });
    });

    it('should not throw in server-side environment', async () => {
      delete (global as any).window;
      
      await assert.doesNotReject(async () => {
        await trackPageView('/test');
      });
      
      global.window = originalWindow;
    });

    it('should handle errors gracefully', async () => {
      await assert.doesNotReject(async () => {
        await trackPageView('/test');
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple consecutive events', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('event1');
        await trackEvent('event2');
        await trackEvent('event3');
      });
    });

    it('should handle concurrent events', async () => {
      await assert.doesNotReject(async () => {
        await Promise.all([
          trackEvent('event1'),
          trackEvent('event2'),
          trackEvent('event3'),
        ]);
      });
    });

    it('should handle page views and events together', async () => {
      await assert.doesNotReject(async () => {
        await trackPageView('/shop', 'Shop');
        await trackEvent('shop_item_click', { item_id: '123' });
        await trackPageView('/mines', 'Mines Game');
        await trackEvent('game_start', { mines_count: 5 });
      });
    });
  });

  describe('Event naming conventions', () => {
    it('should accept snake_case event names', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('game_start');
        await trackEvent('tile_reveal');
        await trackEvent('quiz_complete');
        await trackEvent('shop_item_view');
      });
    });

    it('should accept various event name formats', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('simple');
        await trackEvent('event_with_underscores');
        await trackEvent('eventWithCamelCase');
      });
    });
  });

  describe('Parameter validation', () => {
    it('should accept empty parameter object', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {});
      });
    });

    it('should accept undefined parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', undefined);
      });
    });

    it('should handle special characters in string parameters', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          special: 'test@example.com',
          unicode: '测试',
          symbols: '!@#$%^&*()',
        });
      });
    });

    it('should handle large numbers', async () => {
      await assert.doesNotReject(async () => {
        await trackEvent('test_event', {
          large_number: 999999999,
          negative: -42,
          zero: 0,
        });
      });
    });
  });
});
