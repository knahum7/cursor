"use client";

const ProtectedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <h1 className="text-3xl font-bold mb-4">Protected Page</h1>
    <p className="text-lg text-gray-700 dark:text-gray-200">You have accessed the protected page.</p>
  </div>
);

export default ProtectedPage; 