export default function Home() {
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
