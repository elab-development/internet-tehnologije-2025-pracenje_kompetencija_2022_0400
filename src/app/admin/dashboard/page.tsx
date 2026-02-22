import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";

export default async function AdminDashboard() {
  const u = await getAuthUser();
  if (!u) redirect("/login");
  if ((u.role ?? "user") !== "admin") redirect("/");

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Ovde ide admin panel.</p>
    </main>
  );
}