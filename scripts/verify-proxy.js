#!/usr/bin/env node

/**
 * Whop Proxy Verification Script
 * Checks if your local proxy and app are configured correctly
 */

const http = require('http');
const https = require('https');

const PROXY_PORT = process.env.PROXY_PORT || 3002;
const APP_PORT = process.env.APP_PORT || 3001;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkPort(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`✅ ${name} is running on port ${port}`, colors.green);
          try {
            const json = JSON.parse(data);
            if (json.whop) {
              log(`   Whop Config: ${json.whop.apiKeyConfigured ? '✅' : '❌'}`, colors.dim);
            }
          } catch {}
          resolve(true);
        } else {
          log(`⚠️  ${name} returned status ${res.statusCode}`, colors.yellow);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      log(`❌ ${name} is not running on port ${port}`, colors.red);
      resolve(false);
    });
    
    req.end();
  });
}

async function testProxyForwarding() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: PROXY_PORT,
      path: '/experiences/test',
      method: 'GET',
      headers: {
        'x-whop-user-token': 'test-token-123',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`✅ Proxy is forwarding requests correctly`, colors.green);
          
          // Check if response contains expected content
          if (data.includes('QuestChat') || data.includes('leaderboard')) {
            log(`   Response contains app content`, colors.dim);
          }
          resolve(true);
        } else {
          log(`⚠️  Proxy forwarding returned status ${res.statusCode}`, colors.yellow);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      log(`❌ Proxy forwarding failed: ${err.message}`, colors.red);
      resolve(false);
    });

    req.end();
  });
}

async function checkWhopDashboard() {
  log(`\n📋 Whop Dashboard Checklist:`, colors.blue);
  log(`   1. Go to: https://whop.com/hub`, colors.dim);
  log(`   2. Look for "Dev Toggle" in top right corner`, colors.dim);
  log(`   3. Enable dev mode`, colors.dim);
  log(`   4. Navigate to your QuestChat app`, colors.dim);
  log(`   5. Your app should load from localhost:${PROXY_PORT}`, colors.dim);
}

async function main() {
  log('\n' + '='.repeat(50), colors.bold);
  log('Whop Proxy Verification', colors.bold);
  log('='.repeat(50) + '\n', colors.bold);

  // Check if proxy is running
  const proxyRunning = await checkPort(PROXY_PORT, 'Proxy');
  
  // Check if app is running
  const appRunning = await checkPort(APP_PORT, 'App');
  
  // Test proxy forwarding
  if (proxyRunning) {
    log('\nTesting proxy forwarding...', colors.blue);
    await testProxyForwarding();
  }

  // Environment check
  log('\n🔧 Environment Variables:', colors.blue);
  const envVars = [
    'WHOP_API_KEY',
    'WHOP_APP_ID',
    'WHOP_COMPANY_ID',
    'WHOP_AGENT_USER_ID'
  ];
  
  let allEnvSet = true;
  envVars.forEach(varName => {
    const isSet = !!process.env[varName];
    log(`   ${varName}: ${isSet ? '✅ Set' : '❌ Missing'}`, isSet ? colors.green : colors.red);
    if (!isSet) allEnvSet = false;
  });

  // Whop Dashboard steps
  await checkWhopDashboard();

  // Summary
  log('\n' + '='.repeat(50), colors.bold);
  log('Summary', colors.bold);
  log('='.repeat(50), colors.bold);

  if (proxyRunning && appRunning && allEnvSet) {
    log('\n✅ Your local setup is ready!', colors.green);
    log('Next: Enable dev mode in Whop and test your app', colors.yellow);
  } else {
    log('\n⚠️  Some issues need attention:', colors.yellow);
    if (!proxyRunning) log('   - Start proxy: pnpm whop-dev', colors.dim);
    if (!appRunning) log('   - Check app is running on port ' + APP_PORT, colors.dim);
    if (!allEnvSet) log('   - Set missing environment variables', colors.dim);
  }

  // Testing URLs
  log('\n🔗 Test URLs:', colors.blue);
  log(`   Proxy Health: http://localhost:${PROXY_PORT}/api/health`, colors.dim);
  log(`   App Health: http://localhost:${APP_PORT}/api/health`, colors.dim);
  log(`   Experience Page: http://localhost:${PROXY_PORT}/experiences/test`, colors.dim);
  
  log('\n💡 Tip: Keep this terminal open to see proxy logs', colors.yellow);
}

main().catch(err => {
  log(`\n❌ Verification failed: ${err.message}`, colors.red);
  process.exit(1);
});