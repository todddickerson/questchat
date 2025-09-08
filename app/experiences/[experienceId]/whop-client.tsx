"use client";

import { useEffect, useState } from "react";
import { useIframeSdk } from "@whop/react";

export default function WhopClient({ children }: { children: React.ReactNode }) {
  const iframeSdk = useIframeSdk();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWhopSDK = async () => {
      try {
        console.log("🔧 Initializing Whop SDK...");
        
        // The iframe SDK is automatically initialized by the provider
        // We can directly use it here
        if (iframeSdk) {
          console.log("✅ Whop SDK ready");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ Failed to initialize Whop SDK:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
        setIsLoading(false);
      }
    };

    // Initialize when iframe SDK is available
    if (iframeSdk) {
      initWhopSDK();
    }
  }, [iframeSdk]);

  // Show debug info if not in iframe
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Not in Whop iframe
            </h2>
            <p className="text-yellow-700">
              This page is designed to be embedded in a Whop experience. 
              Direct access will show limited functionality.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              To view the full experience, access this page through your Whop dashboard.
            </p>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Whop integration...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Integration Error
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render with user context
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {user && (
        <div className="bg-purple-600 text-white px-4 py-2 text-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span>👤 {user.username || user.email || "User"}</span>
            <span className="opacity-75">Powered by QuestChat</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}