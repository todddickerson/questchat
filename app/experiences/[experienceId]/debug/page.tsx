import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export default async function DebugPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const headersList = headers();
  
  // Get all headers
  const allHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    // Censor sensitive headers
    if (key.toLowerCase().includes('cookie') || 
        key.toLowerCase().includes('authorization') ||
        key.toLowerCase().includes('token')) {
      allHeaders[key] = '[REDACTED]';
    } else {
      allHeaders[key] = value;
    }
  });
  
  // Check database
  let experience = null;
  let dbError = null;
  try {
    experience = await prisma.experience.findUnique({
      where: { experienceId: params.experienceId },
      include: {
        config: true,
        _count: {
          select: {
            streaks: true,
            messages: true,
            rewards: true,
          },
        },
      },
    });
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown database error';
  }
  
  // Check environment variables (censored)
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    WHOP_API_KEY: process.env.WHOP_API_KEY ? `${process.env.WHOP_API_KEY.slice(0, 10)}...` : 'NOT SET',
    WHOP_APP_ID: process.env.WHOP_APP_ID || 'NOT SET',
    WHOP_COMPANY_ID: process.env.WHOP_COMPANY_ID || 'NOT SET',
    WHOP_AGENT_USER_ID: process.env.WHOP_AGENT_USER_ID || 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (PostgreSQL)' : 'NOT SET',
    DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
    QUESTCHAT_SIGNING_SECRET: process.env.QUESTCHAT_SIGNING_SECRET ? 'SET' : 'NOT SET',
  };
  
  // Check Whop-specific headers
  const whopHeaders = {
    'x-whop-user-id': headersList.get('x-whop-user-id') || 'not present',
    'x-whop-experience-id': headersList.get('x-whop-experience-id') || 'not present',
    'x-whop-company-id': headersList.get('x-whop-company-id') || 'not present',
    'x-whop-signature': headersList.get('x-whop-signature') ? '[PRESENT]' : 'not present',
    'referer': headersList.get('referer') || 'not present',
    'origin': headersList.get('origin') || 'not present',
  };
  
  // Check iframe context
  const isInIframe = headersList.get('sec-fetch-dest') === 'iframe' || 
                     headersList.get('sec-fetch-mode') === 'navigate';
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">🔍 QuestChat Debug Page</h1>
        
        {/* Environment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Environment Status</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className={value.includes('NOT SET') ? 'text-red-500' : 'text-green-600'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Experience Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Experience Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Experience ID: {params.experienceId}</div>
            {dbError ? (
              <div className="text-red-500">Database Error: {dbError}</div>
            ) : experience ? (
              <>
                <div className="text-green-600">✅ Experience exists in database</div>
                <div>Name: {experience.name || 'Not set'}</div>
                <div>Access Pass ID: {experience.accessPassId || 'Not set'}</div>
                <div>Config: {experience.config ? '✅ Configured' : '❌ Not configured'}</div>
                <div>Streaks: {experience._count.streaks}</div>
                <div>Messages: {experience._count.messages}</div>
                <div>Rewards: {experience._count.rewards}</div>
              </>
            ) : (
              <div className="text-yellow-500">⚠️ Experience not found in database</div>
            )}
          </div>
        </div>
        
        {/* Whop Integration Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Whop Integration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>In iframe: {isInIframe ? '✅ Yes' : '❌ No'}</div>
            {Object.entries(whopHeaders).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className={value === 'not present' ? 'text-yellow-500' : 'text-green-600'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Request Headers (for debugging) */}
        <details className="bg-white rounded-lg shadow p-6">
          <summary className="cursor-pointer font-semibold text-lg mb-4">
            📋 All Request Headers (click to expand)
          </summary>
          <div className="space-y-1 font-mono text-xs">
            {Object.entries(allHeaders).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-gray-600 w-48">{key}:</span>
                <span className="text-gray-800 break-all">{value}</span>
              </div>
            ))}
          </div>
        </details>
        
        {/* Timestamp */}
        <div className="text-center text-gray-500 text-sm">
          Generated at: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}