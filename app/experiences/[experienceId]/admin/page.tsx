"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ExperienceWrapper from "@/components/ExperienceWrapper";
// import AdminAuthWrapper from "@/components/AdminAuthWrapper";

export default function AdminPage() {
  const params = useParams();
  const experienceId = params.experienceId as string;
  const [config, setConfig] = useState({
    promptTime: "09:00",
    gracePeriod: 24,
    percentage: 20,
    stock: 1,
    expiryDays: 30,
  });
  const [quests, setQuests] = useState<string[]>([]);
  const [newQuest, setNewQuest] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chatStatus, setChatStatus] = useState<any>(null);
  const [testingChat, setTestingChat] = useState(false);
  const [chatExperienceId, setChatExperienceId] = useState("");
  const [testChatId, setTestChatId] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    // Load existing config if available
    loadConfig();
    checkChatStatus();
  }, [experienceId]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/experiences/${experienceId}/config`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
        if (data.quests) {
          setQuests(data.quests.map((q: any) => q.prompt));
        }
        if (data.chatExperienceId) {
          setChatExperienceId(data.chatExperienceId);
          setTestChatId(data.chatExperienceId);
        }
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const loadConfig = fetchConfig;

  const handleSaveConfig = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/experiences/${experienceId}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, quests }),
      });
      if (response.ok) {
        setMessage("Configuration saved successfully!");
      } else {
        setMessage("Failed to save configuration");
      }
    } catch (error) {
      setMessage("Error saving configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrompt = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/test-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId }),
      });
      if (response.ok) {
        setMessage("Test prompt posted successfully!");
      } else {
        setMessage("Failed to post test prompt");
      }
    } catch (error) {
      setMessage("Error posting test prompt");
    } finally {
      setLoading(false);
    }
  };

  const addQuest = () => {
    if (newQuest.trim()) {
      setQuests([...quests, newQuest.trim()]);
      setNewQuest("");
    }
  };

  const removeQuest = (index: number) => {
    setQuests(quests.filter((_, i) => i !== index));
  };

  const checkChatStatus = async () => {
    setTestingChat(true);
    try {
      const response = await fetch("/api/admin/find-chat");
      if (response.ok) {
        const data = await response.json();
        setChatStatus(data);
      }
    } catch (error) {
      console.error("Error checking chat status:", error);
    } finally {
      setTestingChat(false);
    }
  };

  const handleChatSetup = async (action: string) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/setup-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action,
          experienceId,
          accessPassId: process.env.NEXT_PUBLIC_WHOP_ACCESS_PASS_ID 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.recommendations?.[0]?.message || "Operation completed");
        if (action === "test") {
          await checkChatStatus();
        }
      } else {
        setMessage(data.error || "Operation failed");
      }
    } catch (error) {
      setMessage("Error during chat setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExperienceWrapper experienceId={experienceId}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
            🎮 QuestChat Admin Panel
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">⚙️ Configuration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Prompt Time (UTC)
                </label>
                <input
                  type="time"
                  value={config.promptTime}
                  onChange={(e) => setConfig({ ...config, promptTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period (hours)
                </label>
                <input
                  type="number"
                  value={config.gracePeriod}
                  onChange={(e) => setConfig({ ...config, gracePeriod: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Percentage Off
                </label>
                <input
                  type="number"
                  value={config.percentage}
                  onChange={(e) => setConfig({ ...config, percentage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code Stock
                </label>
                <input
                  type="number"
                  value={config.stock}
                  onChange={(e) => setConfig({ ...config, stock: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Expiry (days)
                </label>
                <input
                  type="number"
                  value={config.expiryDays}
                  onChange={(e) => setConfig({ ...config, expiryDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </div>

          {/* Automatic Chat Channel Discovery */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">🔧 Chat Channel Status</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="font-semibold text-blue-900">🔍 Auto-Discovering Chat Channel...</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    QuestChat is automatically detecting your chat setup via API calls
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Status Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">💬 Chat Integration Status</h2>
            
            {testingChat ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Checking chat status...</p>
              </div>
            ) : chatStatus ? (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className={`p-4 rounded-lg ${
                  chatStatus.summary?.workingChats > 0 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-yellow-50 border border-yellow-200"
                }`}>
                  <h3 className="font-semibold mb-2">
                    {chatStatus.summary?.workingChats > 0 
                      ? "✅ Chat is configured" 
                      : "⚠️ Chat needs setup"}
                  </h3>
                  <p className="text-sm">
                    Tested experiences: {chatStatus.summary?.testedExperiences || 0}
                  </p>
                  <p className="text-sm">
                    Working chats: {chatStatus.summary?.workingChats || 0}
                  </p>
                  <p className="text-sm">
                    Can send messages: {chatStatus.summary?.canSendMessages ? "Yes" : "No"}
                  </p>
                </div>

                {/* Experience Details */}
                {chatStatus.testedExperiences?.map((exp: any) => (
                  <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm">{exp.id}</p>
                        <p className="text-xs text-gray-600">{exp.name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        exp.chatEnabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {exp.chatEnabled ? "Chat Enabled" : exp.error || "Not a Chat"}
                      </div>
                    </div>
                    {exp.recommendation && (
                      <p className="text-xs text-gray-600 mt-2">{exp.recommendation}</p>
                    )}
                  </div>
                ))}

                {/* Recommendations */}
                {chatStatus.recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg border ${
                    rec.type === 'success' ? 'bg-green-50 border-green-200' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    rec.type === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-sm font-semibold">{rec.message}</p>
                    <p className="text-xs mt-1">{rec.action}</p>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => checkChatStatus()}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    🔄 Refresh Status
                  </button>
                  <button
                    onClick={() => handleChatSetup("test")}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    🧪 Test Chat
                  </button>
                  <button
                    onClick={() => handleChatSetup("instructions")}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    📖 Setup Guide
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <button
                  onClick={checkChatStatus}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Check Chat Status
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">📝 Custom Prompts</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newQuest}
                onChange={(e) => setNewQuest(e.target.value)}
                placeholder="Add a custom prompt question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && addQuest()}
              />
              <button
                onClick={addQuest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>

            {quests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No custom prompts yet. Add some above!
              </p>
            ) : (
              <div className="space-y-2">
                {quests.map((quest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{quest}</span>
                    <button
                      onClick={() => removeQuest(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🚀 Quick Actions</h2>
            
            <button
              onClick={handleTestPrompt}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Posting..." : "📮 Post Test Prompt Now"}
            </button>

            <p className="text-sm text-gray-600 mt-3 text-center">
              This will immediately post a prompt to the chat for testing
            </p>
          </div>

          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Experience ID: {experienceId}</p>
            <p className="mt-2">Changes are saved automatically</p>
          </div>
        </div>
      </div>
    </ExperienceWrapper>
  );
}