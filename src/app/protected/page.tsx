"use client";
import MainLayout from "../MainLayout";

const ProtectedPage = () => (
  <MainLayout>
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-bold mb-4">Protected Page</h1>
      <p className="text-lg text-gray-700 dark:text-gray-200">You have accessed the protected page.</p>
    </div>
  </MainLayout>
);

export default ProtectedPage; 