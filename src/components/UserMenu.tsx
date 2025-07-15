"use client";
import { useSession, signIn, signOut } from "next-auth/react";

const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="text-gray-500 dark:text-gray-300 animate-pulse px-4 py-2">Loading...</div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200" tabIndex={0} aria-label="Signed in user name">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") signOut(); }}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          aria-label="Sign out"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") signIn(); }}
      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      tabIndex={0}
      aria-label="Sign in"
    >
      Sign in
    </button>
  );
};

export default UserMenu; 