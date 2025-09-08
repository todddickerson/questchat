"use client";

import { useState } from "react";

interface ChatSetupWizardProps {
  companyId?: string;
  onSkip?: () => void;
  onComplete?: (experienceId: string) => void;
}

export default function ChatSetupWizard({ companyId, onSkip, onComplete }: ChatSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [experienceId, setExperienceId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  // Inline instructions to avoid importing server-side code
  const instructions = [
    "Install Whop Chat from the Whop App Store",
    "Create a chat channel for your community",
    "Come back to QuestChat and connect it to your chat",
    "Configure your daily prompts and rewards",
    "Watch engagement soar! 🚀",
  ];

  const validateAndComplete = async () => {
    if (!experienceId.trim()) {
      setError("Please enter a chat experience ID");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/validate-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId: experienceId.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        onComplete?.(experienceId.trim());
      } else {
        setError("Invalid chat experience ID. Please check and try again.");
      }
    } catch (error) {
      setError("Failed to validate chat. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to QuestChat!
        </h2>
        <p className="text-gray-600">
          Let's get your community engagement engine running in just a few steps
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Setup Progress</span>
          <span className="text-sm text-gray-500">
            Step {Math.min(currentStep + 1, instructions.length)} of {instructions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / instructions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="space-y-4 mb-8">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className={`flex items-start p-4 rounded-lg transition-all duration-300 ${
              index <= currentStep
                ? index === currentStep
                  ? "bg-purple-50 border-l-4 border-purple-500"
                  : "bg-green-50 border-l-4 border-green-500"
                : "bg-gray-50"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                  ? "bg-purple-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div className="flex-grow">
              <p
                className={`${
                  index <= currentStep ? "text-gray-900 font-medium" : "text-gray-500"
                }`}
              >
                {instruction}
              </p>
              {index === 0 && currentStep === 0 && (
                <div className="mt-3">
                  <a
                    href="https://whop.com/apps/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Install Whop Chat
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Experience ID Input */}
      {currentStep === instructions.length - 2 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat Experience ID
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Find this in your Whop dashboard under the chat experience settings
          </p>
          <input
            type="text"
            value={experienceId}
            onChange={(e) => setExperienceId(e.target.value)}
            placeholder="exp_xxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          Skip setup for now
        </button>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}

          {currentStep < instructions.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={validateAndComplete}
              disabled={isValidating || !experienceId.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "Validating..." : "Complete Setup 🎉"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}