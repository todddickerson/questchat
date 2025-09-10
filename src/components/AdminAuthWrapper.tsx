"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminAuthWrapperProps {
  experienceId: string;
  children: ReactNode;
}

export default function AdminAuthWrapper({ experienceId, children }: AdminAuthWrapperProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, [experienceId]);

  const checkAdminStatus = async () => {
    console.log("[AdminAuthWrapper] Checking admin status", {
      experienceId,
      timestamp: new Date().toISOString()
    });
    
    setIsChecking(true);
    setError(null);

    try {
      // Check if we're in Whop iframe
      const inIframe = window.self !== window.top;
      console.log("[AdminAuthWrapper] In iframe:", inIframe);

      // In production, we should verify admin status through Whop SDK
      // For now, we'll check if the user has access to the experience
      // and add additional admin verification
      
      if (!inIframe) {
        console.log("[AdminAuthWrapper] ⚠️ Not in Whop iframe - restricted access");
        setError("Admin panel must be accessed through Whop dashboard");
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      // TODO: Implement proper Whop SDK admin verification
      // This would involve checking user roles/permissions through Whop API
      // For now, we'll allow access if in iframe (temporary)
      
      console.log("[AdminAuthWrapper] ✅ Access granted (temporary - needs proper auth)");
      setIsAdmin(true);
      
    } catch (error) {
      console.error("[AdminAuthWrapper] Error checking admin status:", error);
      setError("Unable to verify admin permissions");
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin permissions...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            {error || "You need administrator permissions to access this page."}
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              To access the admin panel:
            </p>
            <ol className="text-left text-sm text-gray-600 space-y-2">
              <li>1. Go to your Whop dashboard</li>
              <li>2. Navigate to your QuestChat app</li>
              <li>3. Click on "Settings" or "Admin"</li>
              <li>4. You must be the app owner or have admin rights</li>
            </ol>
          </div>
          <button
            onClick={() => router.push(`/experiences/${experienceId}`)}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Return to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}