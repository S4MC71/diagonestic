import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  FileText,
  Users,
  Calendar,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Printer,
  ChevronRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { invoices, patients, setCurrentView, openPrintModal } = useApp();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days'>('7days');

  // Compute live aggregates from invoices
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.netTotal, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalInvoices = invoices.length;
  const totalPatients = patients.length;

  return (
    <div>
      {/* Page Header with Time Filters */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Aug 28, 2026 – Sep 3, 2026 (Live Diagnostic Operations)</p>
        </div>

        <div className="page-actions">
          {/* Preset Buttons */}
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              border: '1px solid var(--slate-200)',
              borderRadius: '10px',
              padding: '3px'
            }}
          >
            {(['today', '7days', '30days', '90days'] as const).map(tab => {
              const labels = { today: 'Today', '7days': '7 days', '30days': '30 days', '90days': '90 days' };
              const isActive = dateRange === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setDateRange(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--slate-600)',
                    transition: 'all 0.15s'
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* New Invoice Shortcut */}
          <button
            className="btn btn-primary"
            onClick={() => setCurrentView('new-invoice')}
          >
            <PlusCircle size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* 3 High-Impact KPI Cards matching SihatSuite exact design */}
      <div className="kpi-grid">
        {/* Total Collected */}
        <div className="kpi-card kpi-cyan">
          <div>
            <div className="kpi-label">TOTAL COLLECTED</div>
            <div className="kpi-value">৳{totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="kpi-sub">৳{totalDue.toFixed(2)} outstanding</div>
          </div>
          <div className="kpi-icon-wrap">
            <DollarSign size={26} color="#ffffff" />
          </div>
        </div>

        {/* Invoices Raised */}
        <div className="kpi-card kpi-purple">
          <div>
            <div className="kpi-label">INVOICES RAISED</div>
            <div className="kpi-value">{totalInvoices}</div>
            <div className="kpi-sub">
              ৳{totalBilled.toFixed(2)} billed · ৳{totalDue.toFixed(2)} due
            </div>
          </div>
          <div className="kpi-icon-wrap">
            <FileText size={26} color="#ffffff" />
          </div>
        </div>

        {/* Patients Registered */}
        <div className="kpi-card kpi-green">
          <div>
            <div className="kpi-label">PATIENTS REGISTERED</div>
            <div className="kpi-value">{totalPatients}</div>
            <div className="kpi-sub">New registrations in period</div>
          </div>
          <div className="kpi-icon-wrap">
            <Users size={26} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* Income Overview Chart (Interactive SVG) */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--slate-900)' }}>Income Overview</h3>
            <p style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Daily billed vs collected — Aug 28, 2026 – Sep 3, 2026</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--slate-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#93c5fd' }} />
              <span>Billed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
              <span>Collected</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div style={{ height: '240px', width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 800 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y, idx) => (
              <g key={idx}>
                <line x1="40" y1={y} x2="780" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  ৳{(4 - idx) * 500}
                </text>
              </g>
            ))}

            {/* Dates along X axis */}
            {['28 Fri', '29 Sat', '30 Sun', '31 Mon', '01 Tue', '02 Wed', '03 Thu'].map((day, idx) => {
              const x = 60 + idx * 115;
              return (
                <text key={idx} x={x} y="215" textAnchor="middle" fontSize="11" fill="#64748b">
                  {day}
                </text>
              );
            })}

            {/* Billed line & fill */}
            <path
              d="M 60,190 L 175,185 L 290,160 L 405,170 L 520,130 L 635,90 L 750,110"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2.5"
            />
            {/* Collected line */}
            <path
              d="M 60,195 L 175,190 L 290,170 L 405,175 L 520,140 L 635,95 L 750,115"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
            />

            {/* Data Point Dots */}
            {[
              { x: 60, y: 195 },
              { x: 175, y: 190 },
              { x: 290, y: 170 },
              { x: 405, y: 175 },
              { x: 520, y: 140 },
              { x: 635, y: 95 },
              { x: 750, y: 115 }
            ].map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Two Column Bottom Widgets: Payment Breakdown & Recent Invoices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
        {/* Payment Methods */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--slate-900)', marginBottom: '14px' }}>
            Payment Methods
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Cash Counter</span>
                <span style={{ fontWeight: 700 }}>৳900.00 (54%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '54%', height: '100%', background: '#0284c7' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Mobile Banking (bKash / Nagad)</span>
                <span style={{ fontWeight: 700 }}>৳750.00 (46%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '46%', height: '100%', background: '#10b9b3' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Credit / Debit Card</span>
                <span style={{ fontWeight: 700 }}>৳0.00 (0%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: '#8b5cf6' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices Summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--slate-900)' }}>
              Recent Invoices
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('invoices')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <table className="custom-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Net</th>
                <th>Paid</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Print</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 4).map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoiceNo}</strong></td>
                  <td>{inv.patientName}</td>
                  <td>৳{inv.netTotal}</td>
                  <td>৳{inv.paidAmount}</td>
                  <td>
                    <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-partial'}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="icon-btn"
                      style={{ display: 'inline-flex' }}
                      title="Print Receipt"
                      onClick={() => openPrintModal(inv)}
                    >
                      <Printer size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
