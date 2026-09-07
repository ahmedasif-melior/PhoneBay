import { AdminConsole } from "@/components/dashboard/AdminConsole";
import { getAdminData } from "./_data";

export default async function AdminPage() {
  const data = await getAdminData();

  return (
    <AdminConsole
      initialListings={data.recentListings}
      initialUsers={data.usersWithListings}
      initialConversations={data.conversations}
      initialOrders={data.recentOrders}
      initialShops={data.recentShops}
      initialVerifications={data.verificationQueue}
      stats={data.stats}
      pipelines={data.pipeline}
    />
  );
}
