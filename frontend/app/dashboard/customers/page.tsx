"use client";

import { useState, useEffect } from "react";
import { LuUsers, LuPlus, LuRefreshCw as RefreshCw, LuEye as Eye, LuX as X } from "react-icons/lu";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { fetchOrders, RecentOrder } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  location: string;
  phone: string;
  totalOrders: number;
  totalValue: number;
  lastOrderDate: Date;
  lastOrderDisplay: string;
  status: "Active" | "Inactive";
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setAllOrders(data as any[]);
        const map = new Map<string, Customer>();
        
        for (const order of data as RecentOrder[]) {
          const name = (order as any).buyer_name || "Guest Buyer";
          const phone = (order as any).phone || "No contact";
          const location = (order as any).buyer_address || "TBD";
          const key = `${name}-${phone}`;
          
          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name,
              phone,
              location,
              totalOrders: 0,
              totalValue: 0,
              lastOrderDate: new Date(0),
              lastOrderDisplay: "TBD",
              status: "Active",
            });
          }
          
          const c = map.get(key)!;
          c.totalOrders += 1;
          c.totalValue += (order.total_amount || 0);
          const orderDate = new Date(order.created_at);
          if (orderDate > c.lastOrderDate) {
            c.lastOrderDate = orderDate;
            const diffDays = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 0) c.lastOrderDisplay = "Today";
            else if (diffDays === 1) c.lastOrderDisplay = "Yesterday";
            else c.lastOrderDisplay = orderDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
            
            if (diffDays > 30) c.status = "Inactive";
            else c.status = "Active";
          }
        }
        
        setCustomers(Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue));
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((custom) =>
    custom.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    custom.phone.includes(searchQuery)
  );

  const totalValue = filteredCustomers.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title d-flex align-center gap-2">
            Customers
          </h1>
          <p className="dashboard-subtitle">
            {filteredCustomers.length} tracked customers · ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })} total value
          </p>
        </div>
        
        <div className="dashboard-header-right">
          <Button size="sm" icon={<LuPlus size={16} />}>Add Customer</Button>
        </div>
      </div>
      
      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <SearchInput 
            placeholder="Search customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
      </div>

      <div className="dashboard-table-wrapper" style={{ marginTop: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>LOCATION</th>
                <th>PHONE</th>
                <th>TOTAL ORDERS</th>
                <th>TOTAL VALUE</th>
                <th>LAST ORDER</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                      <RefreshCw size={24} className="spin" style={{ color: 'var(--color-brand-600)', margin: '0 auto' }} />
                   </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--color-brand-800)" }}>
                      {customer.name}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text)" }}>{customer.location}</td>
                  <td style={{ color: "var(--color-text)" }}>{customer.phone}</td>
                  <td style={{ color: "var(--color-text)" }}>{customer.totalOrders}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--color-brand-800)" }}>
                      ₹{customer.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text)" }}>{customer.lastOrderDisplay}</td>
                  <td>
                    <Badge
                      variant={customer.status === "Active" ? "success" : "warning"}
                      size="sm"
                      dot
                    >
                      {customer.status}
                    </Badge>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel for Customer History */}
      {selectedCustomer && (
        <>
          <div 
            onClick={() => setSelectedCustomer(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 999,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#fff',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', margin: 0 }}>Customer History</h2>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#666' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>{selectedCustomer.name}</h3>
                <p style={{ color: '#666', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Phone: {selectedCustomer.phone}</p>
                <p style={{ color: '#666', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Location: {selectedCustomer.location}</p>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Order History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allOrders
                  .filter((o: any) => o.buyer_name === selectedCustomer.name && o.phone === selectedCustomer.phone)
                  .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                  .map((order: any) => (
                    <div key={order.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '0.5rem', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#333' }}>{order.product_name || 'Unknown Product'}</span>
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>{new Date(order.created_at || 0).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#555', fontSize: '0.875rem' }}>Qty: {order.quantity} {order.unit || 'units'}</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-brand-700)' }}>₹{order.total_amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}</span>
                      </div>
                      {order.status && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'default'} size="sm">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                {allOrders.filter((o: any) => o.buyer_name === selectedCustomer.name && o.phone === selectedCustomer.phone).length === 0 && (
                  <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>No previous orders found.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
