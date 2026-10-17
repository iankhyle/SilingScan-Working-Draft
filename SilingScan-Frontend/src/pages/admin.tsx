import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { getRoleLabel, type UserRole } from "../lib/auth";

type Account = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

type UploadedScan = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  imageUrl: string;
  status: "Healthy" | "Diseased" | "Pending";
  confidence: number;
  summary: string;
  urgency: string;
  recommendations: string[];
  createdAt: string;
};

const manageableRoles: UserRole[] = ["farmer", "researcher", "agriculturist"];

const AdminPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [scans, setScans] = useState<UploadedScan[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      apiRequest<Account[]>("/admin/users"),
      apiRequest<UploadedScan[]>("/admin/scans"),
    ])
      .then(([users, uploadedScans]) => {
        if (active) {
          setAccounts(users);
          setScans(uploadedScans);
        }
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Unable to load accounts."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const changeRole = async (account: Account, role: UserRole) => {
    setUpdatingId(account.id);
    setError("");
    try {
      const updated = await apiRequest<Account>(`/admin/users/${encodeURIComponent(account.id)}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setAccounts((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update account role.");
    } finally {
      setUpdatingId("");
    }
  };

  const roleCounts = manageableRoles.map((role) => ({
    role,
    count: accounts.filter((account) => account.role === role).length,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-12">
      <header className="workspace-hero workspace-hero--admin">
        <div>
          <p className="workspace-eyebrow">Private administrator workspace</p>
          <h1>People & access</h1>
          <p>Manage account roles for your SilingScan team. Admin access is never available through public signup.</p>
        </div>
        <span className="workspace-hero__stamp" aria-hidden="true">🔐</span>
      </header>

      {error ? <p className="workspace-error" role="alert">{error}</p> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="workspace-stat"><span>Total accounts</span><strong>{accounts.length}</strong><small>All registered users</small></article>
        {roleCounts.map(({ role, count }) => <article className="workspace-stat" key={role}><span>{getRoleLabel(role)} accounts</span><strong>{count}</strong><small>Current assigned role</small></article>)}
      </section>

      <section className="workspace-card">
        <div className="workspace-section-heading">
          <div><p className="workspace-eyebrow">Account directory</p><h2>Registered accounts</h2></div>
          <span className="workspace-count">{accounts.length} total</span>
        </div>
        {loading ? <div className="workspace-empty">Loading accounts…</div> : accounts.length === 0 ? (
          <div className="workspace-empty"><h3>No accounts found</h3><p>New user signups will appear here.</p></div>
        ) : (
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead><tr><th>Name</th><th>Email</th><th>Created</th><th>Access role</th></tr></thead>
              <tbody>{accounts.map((account) => (
                <tr key={account.id}>
                  <td className="font-semibold text-slate-800">{account.name}</td>
                  <td>{account.email}</td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td>{account.role === "admin" ? <span className="workspace-status workspace-status--admin">Administrator</span> : (
                    <select aria-label={`Role for ${account.email}`} className="workspace-input workspace-role-select" disabled={updatingId === account.id} value={account.role} onChange={(event) => void changeRole(account, event.target.value as UserRole)}>
                      {manageableRoles.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}
                    </select>
                  )}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="workspace-card">
        <div className="workspace-section-heading">
          <div><p className="workspace-eyebrow">Platform uploads</p><h2>Uploaded plant scans</h2></div>
          <span className="workspace-count">{scans.length} total</span>
        </div>
        {loading ? <div className="workspace-empty">Loading uploaded scans…</div> : scans.length === 0 ? (
          <div className="workspace-empty"><h3>No uploads yet</h3><p>Images uploaded by users will appear here with their account and scan details.</p></div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scans.map((scan) => (
              <article className="workspace-record overflow-hidden p-0" key={scan.id}>
                <img src={scan.imageUrl} alt={`Plant uploaded by ${scan.userName}`} className="h-48 w-full object-cover" />
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate">{scan.userName}</h3>
                      <p className="break-all text-sm text-slate-600">{scan.userEmail}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scan.status === "Healthy" ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-600/20" : scan.status === "Diseased" ? "bg-red-500/15 text-red-700 ring-1 ring-red-600/20" : "bg-amber-500/15 text-amber-800 ring-1 ring-amber-600/20"}`}>{scan.status === "Pending" ? "Awaiting diagnosis" : scan.status}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{scan.summary}</p>
                  <div className="workspace-record__details">
                    <span>{scan.status === "Pending" ? "No AI result yet" : `${scan.confidence}% confidence`}</span>
                    <span>{new Date(scan.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Urgency</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{scan.urgency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Recommendations</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {scan.recommendations.map((recommendation) => <li key={recommendation} className="flex gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" /><span>{recommendation}</span></li>)}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
