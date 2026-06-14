"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LuPlus as Plus, LuPhone as Phone, LuStar as Star, LuRefreshCw as RefreshCw } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";

import { fetchSuppliers, createSupplier } from "@/lib/api";

export default function SuppliersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isAuthorized = role === "owner" || role === "admin";

  // All hooks before any early returns
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    product: "",
    priority: "1",
    telegram_chat_id: "",
  });

  useEffect(() => {
    if (status === "authenticated" && !isAuthorized) {
      router.push("/dashboard/inventory");
    }
  }, [status, isAuthorized, router]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await fetchSuppliers();
      setSuppliers(data as any[]);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSupplier({
        name: formData.name,
        phone: formData.phone,
        product: formData.product,
        priority: parseInt(formData.priority, 10),
        telegram_chat_id: formData.telegram_chat_id || null,
        status: "active",
      });
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", product: "", priority: "1", telegram_chat_id: "" });
      loadSuppliers();
    } catch (error) {
      console.error("Failed to add supplier:", error);
      alert("Failed to add supplier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || (!isAuthorized && status !== "unauthenticated")) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">
          {!isAuthorized && status === "authenticated" ? "Redirecting to your workspace..." : "Loading suppliers..."}
        </p>
      </div>
    );
  }

  const filtered = suppliers.filter((sup) =>
    (sup.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (sup.product || sup.product_id || "").toLowerCase().includes(search.toLowerCase())
  );
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const primarySuppliers = suppliers.filter((s) => String(s.priority) === "1").length;
  const avgRating = suppliers.length ? (suppliers.reduce((sum, sup) => sum + (Number(sup.rating) || 0), 0) / suppliers.length).toFixed(1) : "0.0";

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Suppliers</h1>
          <p className="dashboard-subtitle">
            {suppliers.length} suppliers · {suppliers.filter((s) => s.status === "active").length} active
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" onClick={loadSuppliers} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
            Refresh
          </Button>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="dashboard-card">
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Total Suppliers</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: 26, fontWeight: 800, color: 'var(--color-brand-800)' }}>{suppliers.length}</p>
        </div>
        <div className="dashboard-card">
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Active Suppliers</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: 26, fontWeight: 800, color: 'var(--color-brand-800)' }}>{activeSuppliers}</p>
        </div>
        <div className="dashboard-card">
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Avg Rating</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: 26, fontWeight: 800, color: 'var(--color-brand-800)' }}>{avgRating}</p>
        </div>
      </div>

      <div style={{ maxWidth: '24rem' }}>
        <SearchInput
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="dashboard-table-wrapper" style={{ marginTop: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>PHONE</th>
                <th>LAST CONTACTED</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                      <RefreshCw size={24} className="spin" style={{ color: 'var(--color-brand-600)', margin: '0 auto' }} />
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                    {suppliers.length === 0 ? "No suppliers yet. Add your first supplier!" : "No suppliers found matching your search."}
                  </td>
                </tr>
              ) : filtered.map((sup) => (
                <tr key={sup.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--color-brand-800)" }}>
                      {sup.name}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text)" }}>{sup.phone || "No phone"}</td>
                  <td style={{ color: "var(--color-text)" }}>{sup.last_contacted || "—"}</td>
                  <td>
                    <Badge variant={sup.status === "active" ? "success" : "warning"} dot size="sm">
                      {sup.status || "unknown"}
                    </Badge>
                  </td>
                  <td>
                    <button style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                      <Phone size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Supplier" size="lg">
        <form onSubmit={handleAddSupplier} className="dashboard-modal-form">
          <p className="dashboard-modal-intro">Save supplier details for quick reorders and communication.</p>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="supplier-name" className="dashboard-field-label">Supplier Name</label>
              <input
                id="supplier-name"
                className="dashboard-field-input"
                placeholder="E.g. Anand Trading Co."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="supplier-phone" className="dashboard-field-label">Phone Number</label>
              <input
                id="supplier-phone"
                className="dashboard-field-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="dashboard-field">
            <label htmlFor="supplier-product" className="dashboard-field-label">Product Supplied</label>
            <input
              id="supplier-product"
              className="dashboard-field-input"
              placeholder="E.g. Basmati Rice"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            />
          </div>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="supplier-priority" className="dashboard-field-label">Priority</label>
              <select
                id="supplier-priority"
                className="dashboard-field-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="1">1 - Primary</option>
                <option value="2">2 - Secondary</option>
                <option value="3">3 - Backup</option>
              </select>
            </div>
            <div className="dashboard-field">
              <label htmlFor="supplier-telegram" className="dashboard-field-label">Telegram Chat ID (optional)</label>
              <input
                id="supplier-telegram"
                className="dashboard-field-input"
                placeholder="e.g. -100123456"
                value={formData.telegram_chat_id}
                onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
              />
            </div>
          </div>

          <div className="dashboard-modal-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Supplier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
