import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";

export default async function ProfilePage() {
  const u = await getAuthUser();
  if (!u) redirect("/login");

  return (
    <main style={{ padding: 20 }}>
      <h1>Korisnički profil</h1>
      <p>Email: {u.email}</p>
      <p>Uloga: {u.role ?? "user"}</p>
    </main>
  );
}