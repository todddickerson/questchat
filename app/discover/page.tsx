import Link from "next/link";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            🎯 QuestChat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Turn daily participation into momentum. Gamify your community with streaks, 
            rewards, and automated engagement that keeps members coming back.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold mb-2">Daily Streaks</h3>
            <p className="text-gray-600">
              Track member engagement with streak counters. Daily prompts keep 
              your community active and motivated.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">Auto Rewards</h3>
            <p className="text-gray-600">
              Automatically generate promo codes and rewards when members 
              hit streak milestones. Set it and forget it.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Leaderboards</h3>
            <p className="text-gray-600">
              Beautiful leaderboards show top performers and create healthy 
              competition in your community.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h4 className="font-bold mb-2">Install QuestChat</h4>
              <p className="text-sm text-gray-600">Add QuestChat to your Whop community</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-bold mb-2">Configure Prompts</h4>
              <p className="text-sm text-gray-600">Set daily questions and reward thresholds</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-bold mb-2">Members Engage</h4>
              <p className="text-sm text-gray-600">Daily prompts keep members active</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-bold mb-2">Auto Rewards</h4>
              <p className="text-sm text-gray-600">Streak milestones trigger instant rewards</p>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">📈 Boost Engagement</h3>
            <p className="mb-4">
              "QuestChat increased our daily active users by 3x. The streak system 
              creates addictive engagement patterns that keep members coming back."
            </p>
            <div className="text-sm opacity-90">- Community Manager, 2k+ members</div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">💰 Increase Retention</h3>
            <p className="mb-4">
              "The automated reward system helped us retain 40% more members month-over-month. 
              It's like having a growth hacker on autopilot."
            </p>
            <div className="text-sm opacity-90">- Business Owner, $10k+ MRR</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-900 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Gamify Your Community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Install QuestChat now and watch your engagement soar
          </p>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm">Install from the Whop App Store</p>
            </div>
            <p className="text-sm opacity-75">
              Free to install • Works with any Whop community • Setup in minutes
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Built for Whop communities • 
            <Link href="/" className="hover:text-purple-600 ml-1">
              Learn more about QuestChat
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
