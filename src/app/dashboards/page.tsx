import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import ApiKeyDashboardClient from "./ApiKeyDashboardClient";
import MainLayout from "../../components/MainLayout";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  // Fetch all API keys server-side
  const { data: apiKeys } = await supabase.from("api_keys").select("id, name, value");
  return (
    <MainLayout>
      <ApiKeyDashboardClient apiKeys={apiKeys || []} />
    </MainLayout>
  );
}
