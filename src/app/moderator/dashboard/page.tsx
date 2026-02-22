import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";

export default async function ModeratorDashboard() {
  const u = await getAuthUser();
  if (!u) redirect("/login");
  if ((u.role ?? "user") !== "moderator") redirect("/");

  return (
    <main style={{ padding: 20 }}>
      <h1>Moderator Dashboard</h1>
      <p>Ovde ide moderator panel.</p>
    </main>
  );
}