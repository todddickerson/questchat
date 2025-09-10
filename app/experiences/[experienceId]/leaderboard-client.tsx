'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Auto-discovery component will be inline

interface LeaderboardClientProps {
  experienceId: string;
  topStreaks: any[];
  weeklyLeaders: any[];
  currentUserStreak: any;
  experience: any;
  today: string;
}

export default function LeaderboardClient({
  experienceId,
  topStreaks,
  weeklyLeaders,
  currentUserStreak,
  experience,
  today
}: LeaderboardClientProps) {
  const router = useRouter();
  const [isDevMode, setIsDevMode] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [chatDiscoveryResult, setChatDiscoveryResult] = useState<any>(null);
  const [isDiscoveringChat, setIsDiscoveringChat] = useState(false);

  useEffect(() => {
    // Check if we're in dev mode
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    setIsDevMode(isDev);

    // Check if we're in Whop iframe
    const inIframe = window.self !== window.top;
    setShowAdminButton(inIframe);

    // Start chat auto-discovery
    discoverChat();

    if (isDev) {
      // Development mode debug logging
      console.group(`🎮 [QuestChat Debug] Experience: ${experienceId}`);
      console.log('📍 Environment:', {
        mode: process.env.NODE_ENV,
        inIframe,
        hostname: window.location.hostname,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ WORKING Features:', {
        leaderboardDisplay: true,
        databaseConnection: true,
        experienceValidation: true,
        adminPanelAccess: inIframe,
        testPromptPosting: true
      });
      
      console.log('⚠️ PLACEHOLDER Features:', {
        realChatIntegration: 'Simulated - needs actual chat channel ID',
        streakTracking: 'Database ready - needs real user messages',
        promoCodeGeneration: 'Schema ready - needs Whop product integration',
        weeklyReset: 'Cron configured - not tested in production'
      });
      
      console.log('🗂️ Database Status:', {
        experience: experience ? 'Created' : 'Not found',
        topStreaksCount: topStreaks.length,
        weeklyLeadersCount: weeklyLeaders.length,
        currentUserStreak: currentUserStreak ? 'Authenticated' : 'Not authenticated'
      });
      
      console.log('🔧 Configuration:', {
        experienceId,
        experienceName: experience?.name || 'QuestChat',
        hasConfig: !!experience?.config,
        promptTime: experience?.config?.promptTimeUTC || '09:00 UTC'
      });
      
      console.groupEnd();
    }
  }, [experienceId, experience, topStreaks, weeklyLeaders, currentUserStreak]);

  const discoverChat = async () => {
    setIsDiscoveringChat(true);
    try {
      const response = await fetch("/api/chat/auto-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId })
      });
      
      const result = await response.json();
      setChatDiscoveryResult(result);
      
      if (isDevMode) {
        console.log("[ChatDiscovery] Result:", result);
      }
    } catch (error) {
      console.error("[ChatDiscovery] Error:", error);
      setChatDiscoveryResult({
        success: false,
        error: "Failed to discover chat channel",
        setupRequired: true,
        instructions: [
          "Unable to connect to Whop API",
          "Please check your configuration"
        ]
      });
    } finally {
      setIsDiscoveringChat(false);
    }
  };

  const handleAdminClick = () => {
    console.log(`🔑 [Admin] Navigating to admin panel for ${experienceId}`);
    router.push(`/experiences/${experienceId}/admin`);
  };

  return (
    <div className="relative">
      {/* Dev Mode Banner */}
      {isDevMode && (
        <div className="absolute top-0 right-0 z-50 bg-orange-500 text-white text-xs px-2 py-1 rounded-bl-lg">
          DEV MODE
        </div>
      )}

      {/* Admin Button - Show only in iframe */}
      {showAdminButton && (
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={handleAdminClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            title="Admin Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </button>
        </div>
      )}

      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              🎯 QuestChat Leaderboard
            </h1>
            <p className="text-gray-600 text-sm md:text-base">{today}</p>
            {experience?.name && (
              <p className="text-lg mt-2 text-purple-600 font-semibold">
                {experience.name}
              </p>
            )}
          </div>

          {/* Chat Setup Status - Auto-discovers and validates chat channel */}
          <div className="mb-6">
            {isDiscoveringChat ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900">🔍 Discovering Chat Channel...</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      QuestChat is automatically finding your chat channel
                    </p>
                  </div>
                </div>
              </div>
            ) : chatDiscoveryResult?.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">Chat Channel Connected!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      QuestChat is ready to post daily prompts and track streaks
                    </p>
                    {chatDiscoveryResult.chatId && (
                      <div className="mt-3 p-2 bg-green-100 rounded">
                        <code className="text-xs text-green-800">
                          Channel ID: {chatDiscoveryResult.chatId}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : chatDiscoveryResult?.setupRequired ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Setup Required</h3>
                    <p className="text-sm text-red-700 mt-1 mb-4">
                      {chatDiscoveryResult.error || "QuestChat needs to be configured"}
                    </p>
                    
                    {chatDiscoveryResult.instructions && chatDiscoveryResult.instructions.length > 0 && (
                      <div className="bg-white border border-red-100 rounded-lg p-4 mt-3">
                        <h4 className="font-medium text-gray-900 mb-2">How to fix this:</h4>
                        <ol className="space-y-2">
                          {chatDiscoveryResult.instructions.map((instruction: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex">
                              <span className="text-red-500 mr-2">{idx + 1}.</span>
                              <span>{instruction.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    <button
                      onClick={discoverChat}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      🔄 Retry Discovery
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900">Chat Setup Incomplete</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      {chatDiscoveryResult?.error || "Unable to verify chat channel configuration"}
                    </p>
                    <button
                      onClick={discoverChat}
                      className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      🔄 Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current User Streak - Show if authenticated */}
          {currentUserStreak && (
            <div className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 md:p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Your Streak</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {currentUserStreak.current} day{currentUserStreak.current !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm opacity-90">
                    Best: {currentUserStreak.best} days
                  </div>
                </div>
                <div className="text-5xl md:text-6xl">
                  {currentUserStreak.current >= 7 ? '🏆' : currentUserStreak.current >= 3 ? '🔥' : '✨'}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Current Streaks */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">🔥</span>
                Current Streaks
              </h2>
              {topStreaks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No streaks yet. Be the first to start!
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {topStreaks.slice(0, 10).map((streak, index) => (
                    <div
                      key={streak.id}
                      className={`flex items-center justify-between p-2 md:p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg md:text-2xl font-bold w-8">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="ml-2 md:ml-3 font-semibold text-sm md:text-base">
                          {streak.user.username || `User ${streak.user.whopUserId.slice(-6)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl md:text-2xl font-bold text-orange-600">
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
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Weekly Champions
              </h2>
              {weeklyLeaders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No activity this week yet.
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {weeklyLeaders.slice(0, 10).map((streak, index) => (
                    <div
                      key={streak.id}
                      className={`flex items-center justify-between p-2 md:p-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg md:text-2xl font-bold w-8">
                          {index === 0 ? '👑' : `${index + 1}.`}
                        </span>
                        <span className="ml-2 md:ml-3 font-semibold text-sm md:text-base">
                          {streak.user.username || `User ${streak.user.whopUserId.slice(-6)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl md:text-2xl font-bold text-purple-600">
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
          <div className="mt-6 md:mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 md:p-6 text-white">
            <h3 className="text-lg md:text-xl font-bold mb-3">🎁 Streak Rewards</h3>
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white/20 rounded-lg p-3 md:p-4">
                <div className="font-bold text-base md:text-lg">3 Day Streak</div>
                <div className="text-sm opacity-90">Get 20% off promo code!</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 md:p-4">
                <div className="font-bold text-base md:text-lg">7 Day Streak</div>
                <div className="text-sm opacity-90">Get exclusive rewards!</div>
              </div>
            </div>
            {isDevMode && (
              <div className="mt-4 bg-white/10 rounded-lg p-3 text-xs">
                <strong>Dev Note:</strong> Rewards are placeholder. Real promo codes require Whop product integration.
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 md:mt-8 text-center text-gray-600">
            <p className="text-sm">
              Reply to the daily prompt in chat to maintain your streak!
            </p>
            <p className="text-xs mt-2">
              Streaks reset if you miss a day. Weekly leaderboard resets every Monday.
            </p>
          </div>

          {/* Dev Mode Info Panel */}
          {isDevMode && (
            <div className="mt-8 bg-gray-100 rounded-lg p-4 text-xs font-mono">
              <div className="font-bold mb-2">🔧 Dev Mode Info:</div>
              <div className="space-y-1">
                <div>• Experience ID: {experienceId}</div>
                <div>• Database: {topStreaks.length > 0 || weeklyLeaders.length > 0 ? 'Connected ✅' : 'Empty (needs data)'}</div>
                <div>• Auth Status: {currentUserStreak ? 'Authenticated ✅' : 'Not authenticated'}</div>
                <div>• Chat Integration: Simulated (needs real chat ID)</div>
                <div>• Admin Access: {showAdminButton ? 'Available (click Admin button)' : 'Requires iframe context'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}