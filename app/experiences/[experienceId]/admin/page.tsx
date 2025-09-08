"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ExperienceWrapper from "@/src/components/ExperienceWrapper";

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

  useEffect(() => {
    // Load existing config if available
    loadConfig();
  }, [experienceId]);

  const loadConfig = async () => {
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
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

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