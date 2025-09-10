"use client";

import { useState, useEffect, ReactNode } from "react";
import ChatSetupWizard from "./ChatSetupWizard";
import ChatNotSetupError from "./ChatNotSetupError";

interface ExperienceWrapperProps {
  experienceId: string;
  companyId?: string;
  children: ReactNode;
  showSetupIfNeeded?: boolean;
  fallbackMessage?: string;
}

interface ChatStatus {
  isChecking: boolean;
  hasChat: boolean;
  needsSetup: boolean;
  error?: string;
}

export default function ExperienceWrapper({
  experienceId,
  companyId,
  children,
  showSetupIfNeeded = true,
  fallbackMessage = "Chat configuration needed to use QuestChat features."
}: ExperienceWrapperProps) {
  const [chatStatus, setChatStatus] = useState<ChatStatus>({
    isChecking: true,
    hasChat: false,
    needsSetup: false,
  });
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    checkChatStatus();
  }, [experienceId]);

  const checkChatStatus = async () => {
    console.log("[ExperienceWrapper] Starting chat status check", {
      experienceId,
      companyId,
      timestamp: new Date().toISOString()
    });
    
    setChatStatus({ isChecking: true, hasChat: false, needsSetup: false });

    try {
      // First check if the current experience ID is a valid chat
      const requestBody = { 
        experienceId,
        companyId: companyId || "biz_CHKyxzlPRslE1Q" // Use provided or default company ID
      };
      
      console.log("[ExperienceWrapper] Sending validation request", requestBody);
      
      const validateResponse = await fetch(`/api/admin/validate-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const validateData = await validateResponse.json();
      console.log("[ExperienceWrapper] Validation response received", {
        status: validateResponse.status,
        data: validateData,
        timestamp: new Date().toISOString()
      });

      if (validateData.valid) {
        console.log("[ExperienceWrapper] ✅ Chat validated successfully");
        setChatStatus({
          isChecking: false,
          hasChat: true,
          needsSetup: false,
        });
        return;
      }

      // If not valid, check if we need setup
      console.log("[ExperienceWrapper] ❌ Chat not valid, needs setup", {
        message: validateData.message,
        error: validateData.error
      });
      
      setChatStatus({
        isChecking: false,
        hasChat: false,
        needsSetup: true,
        error: validateData.message || "Chat not connected",
      });
    } catch (error) {
      console.error("[ExperienceWrapper] Failed to check chat status:", error);
      setChatStatus({
        isChecking: false,
        hasChat: false,
        needsSetup: true,
        error: "Unable to verify chat connection",
      });
    }
  };

  const handleSetupComplete = (newExperienceId: string) => {
    // Update the URL or redirect to the new experience
    window.location.href = `/experiences/${newExperienceId}`;
  };

  const handleSkipSetup = () => {
    setChatStatus(prev => ({ ...prev, needsSetup: false }));
    setShowSetupWizard(false);
  };

  // Loading state
  if (chatStatus.isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking chat setup...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard
  if (showSetupWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <ChatSetupWizard
          companyId={companyId}
          onComplete={handleSetupComplete}
          onSkip={handleSkipSetup}
        />
      </div>
    );
  }

  // Show chat not setup error
  if (chatStatus.needsSetup && showSetupIfNeeded) {
    return (
      <ChatNotSetupError
        title="Chat Not Connected"
        message={chatStatus.error || fallbackMessage}
        onSetup={() => setShowSetupWizard(true)}
        onSkip={handleSkipSetup}
      />
    );
  }

  // Show children (main content)
  return (
    <div>
      {/* Optional compact warning if chat not working but we're showing content anyway */}
      {!chatStatus.hasChat && !showSetupIfNeeded && (
        <div className="p-4">
          <ChatNotSetupError
            variant="compact"
            title="Limited Functionality"
            message="Some features may not work without proper chat connection."
            onSetup={() => setShowSetupWizard(true)}
            showSetupButton={true}
          />
        </div>
      )}
      {children}
    </div>
  );
}