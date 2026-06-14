"use client";
import { useState } from "react";
import { LuCheck as Check, LuX as X, LuTrendingUp as TrendingUp, LuPackage as Package, LuCalculator as Calculator } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// Mock data based on EOQ concept
const initialRestockList = [
  { id: 1, name: "Basmati Rice", eoq_qty: 500, unit: "kg", unit_cost: 110, status: "pending" },
  { id: 2, name: "Toor Dal", eoq_qty: 250, unit: "kg", unit_cost: 145, status: "pending" },
  { id: 3, name: "Refined Sunflower Oil", eoq_qty: 150, unit: "L", unit_cost: 105, status: "pending" },
  { id: 4, name: "Wheat Flour (Atta)", eoq_qty: 800, unit: "kg", unit_cost: 35, status: "pending" },
  { id: 5, name: "Sugar", eoq_qty: 300, unit: "kg", unit_cost: 42, status: "pending" },
];

export default function SmartRestockPage() {
  const [restockList, setRestockList] = useState(initialRestockList);

  const handleAction = (id: number, action: "accepted" | "declined") => {
    setRestockList((prev) => 
      prev.map((item) => item.id === id ? { ...item, status: action } : item)
    );
  };

  const pendingItems = restockList.filter(item => item.status === "pending");
  const acceptedItems = restockList.filter(item => item.status === "accepted");

  const totalAcceptedCost = acceptedItems.reduce((acc, item) => acc + (item.eoq_qty * item.unit_cost), 0);

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title d-flex align-center gap-2">
            <TrendingUp className="text-brand" size={24} />
            Smart Restock
          </h1>
          <p className="dashboard-subtitle">
            Optimal order quantities based on the EOQ model to minimize holding and ordering costs.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-divider)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <Calculator size={20} style={{ color: 'var(--color-brand-600)' }} />
             <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', fontWeight: 500 }}>Accepted Restock Cost</h3>
           </div>
           <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>
             ₹{totalAcceptedCost.toLocaleString()}
           </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-divider)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <Package size={20} style={{ color: 'var(--color-warning)' }} />
             <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', fontWeight: 500 }}>Pending Approvals</h3>
           </div>
           <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>
             {pendingItems.length}
           </p>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Suggested EOQ Qty</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restockList.map((item) => (
                <tr key={item.id} style={{ opacity: item.status !== "pending" ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{item.name}</td>
                  <td>
                    <Badge variant="outline" size="sm">
                      {item.eoq_qty} {item.unit}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--color-muted)' }}>₹{item.unit_cost.toLocaleString()} / {item.unit}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-brand-700)' }}>
                    ₹{(item.eoq_qty * item.unit_cost).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.status === "pending" ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          icon={<X size={16} />} 
                          onClick={() => handleAction(item.id, "declined")}
                          style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          icon={<Check size={16} />} 
                          onClick={() => handleAction(item.id, "accepted")}
                          style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                        >
                          Accept
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={item.status === "accepted" ? "success" : "error"} size="sm">
                        {item.status === "accepted" ? "Accepted" : "Declined"}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {restockList.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                    No restock suggestions at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
