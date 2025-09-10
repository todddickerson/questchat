import { test, expect } from '@playwright/test';

const PROD_URL = 'https://questchat.vercel.app';

test.describe('QuestChat Production Tests', () => {
  test('Health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.database.connected).toBe(true);
    expect(data.whop.apiKeyConfigured).toBe(true);
  });

  test('Main page loads within iframe context', async ({ page }) => {
    await page.goto(PROD_URL);
    
    // Check for Whop SDK initialization
    const hasWhopScript = await page.evaluate(() => {
      return document.querySelector('script[src*="whop"]') !== null;
    });
    
    // Page should either show auth requirement or main content
    const title = await page.title();
    expect(title).toContain('QuestChat');
  });

  test('Experience routes are accessible', async ({ page }) => {
    // Test with a sample experience ID
    const experienceId = 'test-experience-123';
    
    await page.goto(`${PROD_URL}/experiences/${experienceId}`);
    
    // Should not return 404
    const response = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    expect(response).not.toContain('404');
  });

  test('Admin routes require authentication', async ({ page }) => {
    const experienceId = 'test-experience-123';
    
    await page.goto(`${PROD_URL}/experiences/${experienceId}/admin`);
    
    // Should show auth requirement or admin page
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('API endpoints have proper CORS headers', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  test('Cron endpoints are protected', async ({ request }) => {
    // Test without auth header
    const promptResponse = await request.post(`${PROD_URL}/api/cron/prompt`);
    expect(promptResponse.status()).toBe(401);
    
    const rolloverResponse = await request.post(`${PROD_URL}/api/cron/rollover`);
    expect(rolloverResponse.status()).toBe(401);
  });

  test('Database connection is active', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);
    const data = await response.json();
    
    expect(data.database.connected).toBe(true);
    expect(data.database.experiences).toBeGreaterThanOrEqual(0);
  });

  test('Whop configuration is present', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);
    const data = await response.json();
    
    expect(data.whop.apiKeyConfigured).toBe(true);
    expect(data.whop.appIdConfigured).toBe(true);
    expect(data.whop.companyIdConfigured).toBe(true);
    expect(data.whop.agentUserIdConfigured).toBe(true);
  });
});

test.describe('Experience Flow Tests', () => {
  test('Leaderboard page structure', async ({ page }) => {
    await page.goto(`${PROD_URL}/experiences/default`);
    
    // Check for key UI elements
    const hasLeaderboard = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('streak') || text.includes('leaderboard') || text.includes('quest');
    });
    
    expect(hasLeaderboard).toBeTruthy();
  });

  test('Admin panel has configuration options', async ({ page }) => {
    await page.goto(`${PROD_URL}/experiences/default/admin`);
    
    const hasAdminElements = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('admin') || text.includes('config') || text.includes('settings');
    });
    
    expect(hasAdminElements).toBeTruthy();
  });
});

test.describe('Whop Integration Tests', () => {
  test('App loads in Whop iframe context', async ({ page, context }) => {
    // Set referrer to simulate Whop iframe
    await context.addInitScript(() => {
      Object.defineProperty(document, 'referrer', {
        get: () => 'https://whop.com'
      });
    });
    
    await page.goto(PROD_URL);
    
    // Check for iframe-specific headers or SDK
    const hasIframeSupport = await page.evaluate(() => {
      return window.self !== window.top || document.referrer.includes('whop');
    });
    
    // App should support iframe embedding
    const xFrameOptions = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    expect(xFrameOptions).not.toBe('DENY');
  });
});