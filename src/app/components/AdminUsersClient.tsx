"use client";

import { useEffect, useMemo, useState } from "react"; 
import "@/app/admin/users/users.css"; 
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiX, FiSave } from "react-icons/fi";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin";
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersClient() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Edit/Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<Partial<User> | null>(null);
  const [password, setPassword] = useState(""); // Za promenu lozinke
  const [acting, setActing] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const qs = roleFilter === "all" ? "" : `?role=${roleFilter}`;
      const res = await fetch(`/api/admin/users${qs}`);
      const data = await res.json();
      if (res.ok) setItems(data.users || []);
    } catch (err) {
      setMsg({ type: "error", text: "Greška pri učitavanju korisnika." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(u => 
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [items, query]);

  const handleEdit = (user: User) => {
    setActiveUser(user);
    setPassword("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeUser) return;
    setActing(true);
    setMsg(null);

    const method = activeUser.id ? "PATCH" : "POST";
    const url = activeUser.id ? `/api/admin/users/${activeUser.id}` : `/api/admin/users`;
    
    const body = { ...activeUser };
    if (password) (body as any).password = password;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Greška pri snimanju");

      setMsg({ type: "success", text: activeUser.id ? "Korisnik izmenjen" : "Korisnik kreiran" });
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovog korisnika?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg({ type: "success", text: "Korisnik obrisan" });
        loadUsers();
      }
    } catch (err) {
      setMsg({ type: "error", text: "Greška pri brisanju" });
    }
  };

  return (
    <div className="admin-users-wrap">
      <section className="cred-toolbar" style={{ maxWidth: "100%" }}>
        <div className="search">
          <FiSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraga po imenu ili emailu..."
          />
        </div>

        <select
          className="select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Sve uloge</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>

        <button className="btn" onClick={() => { setActiveUser({ role: 'user', isActive: true }); setModalOpen(true); }}>
          <FiUserPlus /> Novi korisnik
        </button>
      </section>

      {msg && <div className={`msg ${msg.type}`} style={{ marginTop: 14 }}>{msg.text}</div>}

      <section className="cred-card" style={{ maxWidth: "100%", marginTop: 14 }}>
        {loading ? (
          <div className="state">Učitavam korisnike...</div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ime i prezime</th>
                  <th>Email</th>
                  <th>Uloga</th>
                  <th>Status</th>
                  <th className="col-actions">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="td-strong">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="pill">{u.role}</span></td>
                    <td>
                      <span className={`tag ${u.isActive ? "active" : "rejected"}`}>
                        {u.isActive ? "Aktivan" : "Neaktivan"}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => handleEdit(u)}>
                        <FiEdit2 size={16} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(u.id)}>
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit / Create Modal */}
      {modalOpen && activeUser && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{activeUser.id ? "Izmena korisnika" : "Novi korisnik"}</h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <label className="field">
                <span>Ime i prezime</span>
                <input 
                  className="select" style={{width: '100%', padding: '0 12px'}}
                  value={activeUser.name || ""} 
                  onChange={e => setActiveUser({...activeUser, name: e.target.value})}
                />
              </label>
              <label className="field">
                <span>Email adresa</span>
                <input 
                  className="select" style={{width: '100%', padding: '0 12px'}}
                  value={activeUser.email || ""} 
                  onChange={e => setActiveUser({...activeUser, email: e.target.value})}
                />
              </label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <label className="field">
                  <span>Uloga</span>
                  <select 
                    className="select" 
                    value={activeUser.role} 
                    onChange={e => setActiveUser({...activeUser, role: e.target.value as any})}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="field">
                  <span>Status</span>
                  <select 
                    className="select" 
                    value={activeUser.isActive ? "true" : "false"} 
                    onChange={e => setActiveUser({...activeUser, isActive: e.target.value === "true"})}
                  >
                    <option value="true">Aktivan</option>
                    <option value="false">Neaktivan</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Lozinka {activeUser.id && "(ostavi prazno ako ne menjaš)"}</span>
                <input 
                  type="password"
                  className="select" style={{width: '100%', padding: '0 12px'}}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setModalOpen(false)}>Otkaži</button>
              <button className="btn ok" onClick={handleSave} disabled={acting}>
                <FiSave /> {acting ? "Snimam..." : "Sačuvaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}