import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
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
      {/* Place your API key management UI here. Only authenticated users can see this. */}
      {/* ...existing dashboard content... */}
    </div>
  );
}
