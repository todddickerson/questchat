const { chromium } = require('playwright');

async function testWhopLoggedIn() {
  console.log('🚀 Launching browser to test Whop integration...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Log console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      console.log('❌ Console error:', msg.text());
    } else if (type === 'warning') {
      console.log('⚠️  Console warning:', msg.text());
    }
  });
  
  // Log network failures
  page.on('requestfailed', request => {
    console.log('❌ Request failed:', request.url(), request.failure()?.errorText);
  });
  
  try {
    // Navigate to the Whop experience page
    console.log('📍 Navigating to Whop experience page...');
    await page.goto('https://whop.com/joined/fitbro2-0/exp_ms5KOPv48rZVnh/app/', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(5000);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'whop-logged-in.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: whop-logged-in.png');
    
    // Look for QuestChat iframe
    console.log('🔍 Looking for QuestChat iframe...');
    const iframes = await page.$$('iframe');
    console.log(`Found ${iframes.length} iframe(s) on page`);
    
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      const src = await iframe.getAttribute('src');
      const title = await iframe.getAttribute('title');
      console.log(`Iframe ${i + 1}: src="${src}", title="${title}"`);
      
      if (src && src.includes('questchat')) {
        console.log('✅ Found QuestChat iframe!');
        
        // Navigate to iframe content directly
        const iframePage = await context.newPage();
        const fullSrc = src.startsWith('http') ? src : `https://whop.com${src}`;
        console.log(`📍 Opening iframe content: ${fullSrc}`);
        
        await iframePage.goto(fullSrc, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        await iframePage.screenshot({
          path: 'questchat-content.png',
          fullPage: true
        });
        console.log('📸 QuestChat content screenshot: questchat-content.png');
        
        await iframePage.close();
      }
    }
    
    // Check for app installation or configuration issues
    const errorElements = await page.$$('text=/error|failed|not found/i');
    if (errorElements.length > 0) {
      console.log('⚠️  Found potential error messages on page');
    }
    
    // Look for the QuestChat app in the experience
    const questChatApp = await page.$('text=/QuestChat/i');
    if (questChatApp) {
      console.log('✅ Found QuestChat app reference');
    } else {
      console.log('❌ QuestChat app not found on page');
      
      // Check if we need to install the app
      const installButton = await page.$('button:has-text("Install"), button:has-text("Add App")');
      if (installButton) {
        console.log('📦 App needs to be installed - found install button');
      }
    }
    
    // Try to navigate directly to our experience page
    console.log('\n📍 Testing direct experience page access...');
    const directPage = await context.newPage();
    const experienceUrl = 'https://questchat.vercel.app/experiences/exp_ms5KOPv48rZVnh';
    
    try {
      await directPage.goto(experienceUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      await directPage.screenshot({
        path: 'questchat-direct.png',
        fullPage: true
      });
      console.log('📸 Direct access screenshot: questchat-direct.png');
      
      // Check if leaderboard loads
      const leaderboard = await directPage.$('text=/Current Streaks|Leaderboard/i');
      if (leaderboard) {
        console.log('✅ Leaderboard component loaded!');
      } else {
        console.log('❌ Leaderboard not found');
      }
    } catch (error) {
      console.log('❌ Direct access failed:', error.message);
    }
    
    await directPage.close();
    
    console.log('\n📊 Test Summary:');
    console.log('================================');
    console.log('✓ Whop page loaded');
    console.log('✓ Screenshots captured');
    console.log('? Check screenshots for visual verification');
    console.log('\nKeeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ 
      path: 'whop-error.png',
      fullPage: true 
    });
    console.log('📸 Error screenshot saved: whop-error.png');
  }
}

// Run the test
testWhopLoggedIn().catch(console.error);