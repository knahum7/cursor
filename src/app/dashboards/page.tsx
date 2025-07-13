"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

// Type for API Key matching Supabase schema
export type ApiKey = {
  id: string;
  name: string;
  value: string;
  created_at: string;
};

// Helper to generate random API key value
const generateApiKeyValue = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let randomPart = '';
  for (let i = 0; i < 10; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `gitingest${randomPart}`;
};

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Fetch API keys from Supabase
  useEffect(() => {
    const fetchApiKeys = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, value, created_at")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      setApiKeys(data || []);
      setLoading(false);
    };
    fetchApiKeys();
  }, []);

  // Add new API key (auto-generate value)
  const handleAddKey = async () => {
    if (!newKeyName) return;
    setLoading(true);
    setError(null);
    const generatedValue = generateApiKeyValue();
    const { data, error } = await supabase
      .from("api_keys")
      .insert([{ name: newKeyName, value: generatedValue }])
      .select();
    if (error) setError(error.message);
    if (data) setApiKeys((prev) => [data[0], ...prev]);
    setNewKeyName("");
    setLoading(false);
  };

  // Delete API key
  const handleDeleteKey = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) setError(error.message);
    setApiKeys((prev) => prev.filter((key) => key.id !== id));
    setLoading(false);
  };

  // Start editing
  const handleEditKey = (key: ApiKey) => {
    setEditId(key.id);
    setEditName(key.name);
  };

  // Update API key (name only)
  const handleUpdateKey = async () => {
    if (!editId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("api_keys")
      .update({ name: editName })
      .eq("id", editId)
      .select();
    if (error) setError(error.message);
    if (data) setApiKeys((prev) => prev.map((key) => key.id === editId ? data[0] : key));
    setEditId(null);
    setEditName("");
    setLoading(false);
  };

  // Toggle API key value visibility
  const handleToggleVisibility = (id: string) => {
    setVisibleKeyId((prev) => (prev === id ? null : id));
  };

  // Clipboard copy handler
  const handleCopyKey = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  // Get the part after 'gitingest'
  const getSuffix = (value: string) => value.startsWith('gitingest') ? value.slice(9) : value;

  return (
    <div className="min-h-screen flex flex-col items-center p-8 gap-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">API Key Dashboard</h1>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h2 className="text-lg font-semibold mb-2">Add New API Key</h2>
        <div className="flex flex-col gap-2 mb-4">
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Key Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            aria-label="API Key Name"
          />
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleAddKey}
            aria-label="Add API Key"
            tabIndex={0}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Key"}
          </button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <h2 className="text-lg font-semibold mb-2">Your API Keys</h2>
        {loading && <div className="text-gray-500 mb-2">Loading...</div>}
        <ul className="space-y-3">
          {apiKeys.map((key) => (
            <li
              key={key.id}
              className="flex flex-col gap-2 border-b pb-2 last:border-b-0"
            >
              {editId === key.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    className="border rounded px-2 py-1"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="Edit API Key Name"
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={handleUpdateKey}
                      aria-label="Save API Key"
                      tabIndex={0}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="bg-gray-400 text-white rounded px-3 py-1 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      onClick={() => setEditId(null)}
                      aria-label="Cancel Edit"
                      tabIndex={0}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-4 min-w-0">
                  <span className="font-semibold break-all min-w-[120px] max-w-[200px]">{key.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center min-w-0 max-w-[400px] break-all" style={{ width: 260 }}>
                    <span>
                      gitingest
                      {visibleKeyId === key.id
                        ? <span>{getSuffix(key.value)}</span>
                        : <span>{'*'.repeat(getSuffix(key.value).length || 10)}</span>}
                    </span>
                  </span>
                  <div className="flex flex-row items-center gap-2">
                    <button
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
                      onClick={() => handleToggleVisibility(key.id)}
                      aria-label={visibleKeyId === key.id ? "Hide API Key Value" : "Show API Key Value"}
                      tabIndex={0}
                      style={{ minWidth: 32, minHeight: 32 }}
                    >
                      {visibleKeyId === key.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.675-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.675 2.325A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.675-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.675 2.325A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                      )}
                    </button>
                    <button
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
                      onClick={() => handleCopyKey(key.id, key.value)}
                      aria-label="Copy API Key Value"
                      tabIndex={0}
                      style={{ minWidth: 32, minHeight: 32 }}
                    >
                      {copiedKeyId === key.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 text-white rounded px-3 py-1 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      onClick={() => handleEditKey(key)}
                      aria-label={`Edit ${key.name}`}
                      tabIndex={0}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleDeleteKey(key.id)}
                      aria-label={`Delete ${key.name}`}
                      tabIndex={0}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
