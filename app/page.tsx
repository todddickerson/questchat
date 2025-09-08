export default function Home() {
  const envStatus = {
    whopApiKey: !!process.env.WHOP_API_KEY,
    whopAgentUserId: !!process.env.WHOP_AGENT_USER_ID,
    whopAppId: !!process.env.WHOP_APP_ID,
    whopCompanyId: !!process.env.WHOP_COMPANY_ID,
    whopPublicBaseUrl: !!process.env.WHOP_PUBLIC_BASE_URL,
    databaseUrl: !!process.env.DATABASE_URL,
    signingSecret: !!process.env.QUESTCHAT_SIGNING_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    deploymentUrl: process.env.VERCEL_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000'
  }

  const allEnvVarsPresent = Object.entries(envStatus)
    .filter(([key]) => key !== 'nodeEnv' && key !== 'deploymentUrl')
    .every(([_, value]) => value === true)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            🎯 QuestChat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streaks, Quests & Unlocks for Whop Chat
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${allEnvVarsPresent ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              Deployment Status
            </h2>
            <div className="text-left space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.whopApiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Whop API Key</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.whopAgentUserId ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Whop Agent User ID</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.whopAppId ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Whop App ID</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.whopCompanyId ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Whop Company ID</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.databaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Database URL</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${envStatus.signingSecret ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Signing Secret</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  Environment: <span className="font-semibold">{envStatus.nodeEnv}</span>
                </p>
                <p className="text-xs text-gray-600">
                  URL: <span className="font-semibold">{envStatus.deploymentUrl}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">What it does:</h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-center">
                <span className="mr-3">📝</span>
                <strong>Daily Prompt:</strong> Bot posts a Q at a set time
              </li>
              <li className="flex items-center">
                <span className="mr-3">🔥</span>
                <strong>Streaks:</strong> First reply per day counts. Weekly leaderboard
              </li>
              <li className="flex items-center">
                <span className="mr-3">🎁</span>
                <strong>Auto-Rewards:</strong> Hit 3/7-day streak → instant promo code + congrats
              </li>
            </ul>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                This app is designed to be embedded in Whop experiences. 
                Navigate to <code className="bg-white px-2 py-1 rounded">/experiences/[experienceId]</code> to see the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
