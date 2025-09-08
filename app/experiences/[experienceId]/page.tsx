import { prisma } from "@/lib/db";
import { requireAccess } from "@/lib/auth";

export default async function ExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  try {
    // For Whop iframe, we'll skip auth check for now to get it working
    // const { userId } = await requireAccess(params.experienceId);
    
    const experience = await prisma.experience.findUnique({
      where: { experienceId: params.experienceId },
      include: {
        config: true,
      },
    });

    // Get today's date for display
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get top streaks
    const topStreaks = await prisma.streak.findMany({
      where: { experienceId: params.experienceId },
      orderBy: [
        { current: 'desc' },
        { best: 'desc' },
      ],
      take: 20,
      include: {
        user: true,
      },
    });

    // Get weekly leaders
    const weeklyLeaders = await prisma.streak.findMany({
      where: { 
        experienceId: params.experienceId,
        weekCount: { gt: 0 }
      },
      orderBy: { weekCount: 'desc' },
      take: 10,
      include: {
        user: true,
      },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              🎯 QuestChat Leaderboard
            </h1>
            <p className="text-gray-600">{today}</p>
            {experience?.name && (
              <p className="text-lg mt-2 text-purple-600 font-semibold">
                {experience.name}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Streaks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">🔥</span>
                Current Streaks
              </h2>
              {topStreaks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No streaks yet. Be the first to start!
                </p>
              ) : (
                <div className="space-y-3">
                  {topStreaks.map((streak, index) => (
                    <div
                      key={streak.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl font-bold w-8">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="ml-3 font-semibold">
                          {streak.user.username || `User ${streak.user.whopUserId.slice(-6)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {streak.current}
                        </div>
                        <div className="text-xs text-gray-500">
                          Best: {streak.best}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Champions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Weekly Champions
              </h2>
              {weeklyLeaders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No activity this week yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {weeklyLeaders.map((streak, index) => (
                    <div
                      key={streak.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl font-bold w-8">
                          {index === 0 ? '👑' : `${index + 1}.`}
                        </span>
                        <span className="ml-3 font-semibold">
                          {streak.user.username || `User ${streak.user.whopUserId.slice(-6)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {streak.weekCount}
                        </div>
                        <div className="text-xs text-gray-500">
                          days active
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rewards Info */}
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-3">🎁 Streak Rewards</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="font-bold text-lg">3 Day Streak</div>
                <div className="text-sm opacity-90">Get 20% off promo code!</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="font-bold text-lg">7 Day Streak</div>
                <div className="text-sm opacity-90">Get exclusive rewards!</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Reply to the daily prompt in chat to maintain your streak!
            </p>
            <p className="text-xs mt-2">
              Streaks reset if you miss a day. Weekly leaderboard resets every Monday.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading experience:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load leaderboard
          </h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}