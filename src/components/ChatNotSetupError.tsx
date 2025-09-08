"use client";

interface ChatNotSetupErrorProps {
  title?: string;
  message?: string;
  showSetupButton?: boolean;
  onSetup?: () => void;
  onSkip?: () => void;
  variant?: "full" | "compact";
}

export default function ChatNotSetupError({
  title = "Chat Not Connected",
  message = "QuestChat needs to connect to your Whop Chat to work properly.",
  showSetupButton = true,
  onSetup,
  onSkip,
  variant = "full"
}: ChatNotSetupErrorProps) {
  
  if (variant === "compact") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-grow">
            <h3 className="text-sm font-medium text-yellow-800">
              {title}
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              {message}
            </p>
          </div>
          {showSetupButton && (
            <div className="ml-4">
              <button
                onClick={onSetup}
                className="text-sm bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700 transition"
              >
                Setup Now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-lg mx-auto text-center">
        <div className="text-8xl mb-6">⚠️</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {message}
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Why do I need Whop Chat?</h3>
          <div className="text-left space-y-3">
            <div className="flex items-start">
              <span className="text-purple-600 font-bold mr-3">📝</span>
              <span className="text-gray-700">Post daily engagement prompts</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-600 font-bold mr-3">🔥</span>
              <span className="text-gray-700">Track member response streaks</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-600 font-bold mr-3">🎁</span>
              <span className="text-gray-700">Automatically reward active members</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-600 font-bold mr-3">📊</span>
              <span className="text-gray-700">Show leaderboards and celebrate wins</span>
            </div>
          </div>
        </div>

        {showSetupButton && (
          <div className="space-y-3">
            <button
              onClick={onSetup}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition transform hover:scale-105"
            >
              🚀 Set Up QuestChat Now
            </button>
            
            <div className="flex items-center justify-center space-x-4 text-sm">
              <a
                href="https://whop.com/apps/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                Install Whop Chat First
              </a>
              {onSkip && (
                <>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={onSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip for now
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}