'use client'

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ExperienceWrapper from "@/components/ExperienceWrapper";

interface ClientWrapperProps {
  experienceId: string;
  children: React.ReactNode;
}

export default function ClientWrapper({ experienceId, children }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [inIframe, setInIframe] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Check if we're in iframe context
    try {
      setInIframe(window !== window.parent);
    } catch (e) {
      // If we can't access parent, we're in an iframe
      setInIframe(true);
    }
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not in iframe, show debug message
  if (!inIframe) {
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
          <ExperienceWrapper experienceId={experienceId}>
            {children}
          </ExperienceWrapper>
        </div>
      </div>
    );
  }

  // In iframe context - render normally
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <ExperienceWrapper experienceId={experienceId}>
        {children}
      </ExperienceWrapper>
    </div>
  );
}