"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";

const Playground = () => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowPopup(false);
    if (!apiKey) {
      setError("API key is required");
      setShowPopup(true);
      setLoading(false);
      return;
    }
    const { data, error: supabaseError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("value", apiKey)
      .single();
    if (supabaseError || !data) {
      setError("Invalid API key");
      setShowPopup(true);
      setLoading(false);
      return;
    }
    // Valid key, redirect
    router.push("/protected");
  };

  // Auto-dismiss popup after 2 seconds
  if (showPopup && error) {
    setTimeout(() => setShowPopup(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <form
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-4 w-full max-w-md"
        onSubmit={handleSubmit}
        aria-label="API Key Validation Form"
      >
        <h1 className="text-2xl font-bold mb-2">Validate API Key</h1>
        <input
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          aria-label="API Key Input"
          tabIndex={0}
          required
        />
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          type="submit"
          aria-label="Validate API Key"
          tabIndex={0}
          disabled={loading}
        >
          {loading ? "Validating..." : "Validate"}
        </button>
      </form>
      {showPopup && error && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in"
          role="alert"
          aria-live="assertive"
          tabIndex={0}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Playground; 