"use client";

import { useEffect, useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";

// Utility to generate a random API key value
const generateApiKeyValue = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

type ApiKey = {
  id: string;
  name: string;
  value: string;
};

const DashboardPage = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  // Check authentication on mount
  useEffect(() => {
    (async () => {
      const session = await getServerSession(authOptions);
      if (!session) {
        redirect("/api/auth/signin");
      } else {
        setSessionChecked(true);
      }
    })();
  }, []);

  // Fetch API keys
  useEffect(() => {
    if (!sessionChecked) return;
    const fetchKeys = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("api_keys").select("id, name, value");
      if (error) setError("Failed to fetch API keys");
      setApiKeys(data || []);
      setLoading(false);
    };
    fetchKeys();
  }, [sessionChecked]);

  // Create new API key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const value = generateApiKeyValue();
    const { data, error } = await supabase
      .from("api_keys")
      .insert([{ name: newKeyName, value }])
      .select("id, name, value")
      .single();
    if (error) {
      setError("Failed to create API key");
      return;
    }
    setApiKeys((prev) => [...prev, data]);
    setNewKeyName("");
  };

  // Edit API key name
  const handleEditName = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase
      .from("api_keys")
      .update({ name: editingName })
      .eq("id", id);
    if (error) {
      setError("Failed to update name");
      return;
    }
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, name: editingName } : k)));
    setEditingId(null);
    setEditingName("");
  };

  // Delete API key
  const handleDeleteKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) {
      setError("Failed to delete API key");
      return;
    }
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  // Reveal/mask value
  const handleToggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy to clipboard
  const handleCopy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopyStatus((prev) => ({ ...prev, [id]: false })), 1500);
  };

  if (!sessionChecked) {
    return null;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">API Key Dashboard</h1>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring"
          >
            Sign out
          </button>
        </form>
      </div>
      <form onSubmit={handleCreateKey} className="flex gap-2 mb-6" aria-label="Create API Key">
        <input
          className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="New API key name"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          aria-label="API Key Name"
          tabIndex={0}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Create API Key"
          tabIndex={0}
        >
          Create
        </button>
      </form>
      {error && (
        <div className="mb-4 text-red-600" role="alert" aria-live="assertive">{error}</div>
      )}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-gray-500">No API keys found.</div>
      ) : (
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Value</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-t">
                <td className="p-2 align-middle">
                  {editingId === key.id ? (
                    <input
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleEditName(key.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditName(key.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      aria-label="Edit API Key Name"
                      autoFocus
                      tabIndex={0}
                    />
                  ) : (
                    <span
                      tabIndex={0}
                      aria-label="API Key Name"
                      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={() => {
                        setEditingId(key.id);
                        setEditingName(key.name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setEditingId(key.id);
                          setEditingName(key.name);
                        }
                      }}
                    >
                      {key.name}
                    </span>
                  )}
                </td>
                <td className="p-2 align-middle">
                  <div className="flex items-center gap-2">
                    <input
                      className="border rounded px-2 py-1 w-48 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 select-all"
                      type={revealed[key.id] ? "text" : "password"}
                      value={key.value}
                      readOnly
                      aria-label={revealed[key.id] ? "API Key Value" : "Masked API Key Value"}
                      tabIndex={0}
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleReveal(key.id)}
                      aria-label={revealed[key.id] ? "Hide API Key" : "Show API Key"}
                      tabIndex={0}
                      className="focus:outline-none"
                    >
                      {revealed[key.id] ? (
                        <span role="img" aria-label="Hide">🙈</span>
                      ) : (
                        <span role="img" aria-label="Show">👁️</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(key.id, key.value)}
                      aria-label="Copy API Key"
                      tabIndex={0}
                      className="focus:outline-none"
                    >
                      <span role="img" aria-label="Copy">📋</span>
                    </button>
                    {copyStatus[key.id] && (
                      <span className="text-green-600 ml-1" aria-live="polite">Copied!</span>
                    )}
                  </div>
                </td>
                <td className="p-2 align-middle text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(key.id)}
                    aria-label="Delete API Key"
                    tabIndex={0}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <span role="img" aria-label="Delete">🗑️</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DashboardPage;
