import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  Printer,
  ChevronRight,
  TrendingUp,
  PackageX
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { invoices, patients, setCurrentView, openPrintModal } = useApp();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days'>('7days');
  const [startDate, setStartDate] = useState('2026-09-11');
  const [endDate, setEndDate] = useState('2026-09-17');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Compute live aggregates from invoices
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.netTotal, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalInvoices = invoices.length;
  const totalPatients = patients.length;

  const chartData = [
    { day: '11 Fri', billed: 0, collected: 0, trend: 0, x: 75, y: 195 },
    { day: '12 Sat', billed: 0, collected: 0, trend: 0, x: 190, y: 195 },
    { day: '13 Sun', billed: 0, collected: 0, trend: 0, x: 305, y: 195 },
    { day: '14 Mon', billed: 380, collected: 380, trend: 380, x: 420, y: 35 },
    { day: '15 Tue', billed: 0, collected: 0, trend: 0, x: 535, y: 195 },
    { day: '16 Wed', billed: 0, collected: 0, trend: 0, x: 650, y: 195 },
    { day: '17 Thu', billed: 0, collected: 0, trend: 0, x: 765, y: 195 }
  ];

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER WITH DATE PRESET BUTTONS & DATE RANGE PICKER
          ==================================================================== */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Dashboard
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Sep 11, 2026 – Sep 17, 2026
          </p>
        </div>

        {/* Right Filter Controls Matching SihatSuite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Preset Buttons */}
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '3px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {(['today', '7days', '30days', '90days'] as const).map(tab => {
              const labels = { today: 'Today', '7days': '7 days', '30days': '30 days', '90days': '90 days' };
              const isActive = dateRange === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDateRange(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#059669' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Date Range Picker Input Group */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#334155'
            }}
          >
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#334155', cursor: 'pointer', outline: 'none' }}
            />
            <span style={{ color: '#94a3b8' }}>→</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#334155', cursor: 'pointer', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          LOW / OUT OF STOCK ALERT CARD MATCHING SIHATSUITE
          ==================================================================== */}
      <div
        style={{
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '10px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.05em' }}>
          INVENTORY LOW / OUT OF STOCK
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#ffffff',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            TEST EDTA Tube: 0 tube
          </span>
        </div>
      </div>

      {/* ====================================================================
          3 HIGH-IMPACT STAT KPI CARDS (LOCAL COLORS)
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Total Collected */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: '12px',
            padding: '22px 24px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(5,150,105,0.18)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', opacity: 0.9 }}>
              TOTAL COLLECTED
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginTop: '4px' }}>
              ৳{totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
              ৳{totalDue.toFixed(2)} outstanding
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DollarSign size={24} color="#ffffff" />
          </div>
        </div>

        {/* Invoices Raised */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            borderRadius: '12px',
            padding: '22px 24px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.18)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', opacity: 0.9 }}>
              INVOICES RAISED
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginTop: '4px' }}>
              {totalInvoices}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
              ৳{totalBilled.toFixed(2)} billed · ৳{totalDue.toFixed(2)} due
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={24} color="#ffffff" />
          </div>
        </div>

        {/* Patients Registered */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            borderRadius: '12px',
            padding: '22px 24px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(13,148,136,0.18)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', opacity: 0.9 }}>
              PATIENTS REGISTERED
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginTop: '4px' }}>
              {totalPatients}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
              New registrations in period
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={24} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* ====================================================================
          INCOME OVERVIEW CHART CARD (MIXED BARS + SPLINE CURVE + TOOLTIP)
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Income Overview
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', margin: 0 }}>
              Daily billed vs collected — Sep 11, 2026 – Sep 17, 2026
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#a7f3d0' }} />
              <span>Billed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }} />
              <span>Collected</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart with Bar & Spline Overlay */}
        <div style={{ height: '260px', width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 840 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid horizontal lines */}
            {[0, 50, 100, 150, 200].map((y, idx) => (
              <g key={idx}>
                <line x1="40" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="32" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  ৳{Math.round((4 - idx) * 95)}
                </text>
              </g>
            ))}

            {/* Bars for 14 Mon (Billed & Collected) */}
            <rect x="402" y="35" width="18" height="165" fill="#a7f3d0" rx="3" opacity="0.85" />
            <rect x="424" y="35" width="18" height="165" fill="#059669" rx="3" />

            {/* Spline curve connecting collected points */}
            <path
              d="M 75,200 C 190,200 305,200 380,200 C 400,200 410,35 420,35 C 430,35 440,200 460,200 C 535,200 650,200 765,200"
              fill="none"
              stroke="#047857"
              strokeWidth="2.5"
            />

            {/* Data Point Circles */}
            {chartData.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === idx ? '6' : '4'}
                fill="#047857"
                stroke="#ffffff"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* X Axis Day Labels */}
            {chartData.map((pt, idx) => (
              <text key={idx} x={pt.x} y="216" textAnchor="middle" fontSize="11" fill="#64748b">
                {pt.day}
              </text>
            ))}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${(chartData[hoveredPoint].x / 840) * 100}%`,
                top: `${chartData[hoveredPoint].y - 40}px`,
                transform: 'translate(-50%, -100%)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '11px',
                pointerEvents: 'none',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}
            >
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '3px' }}>
                {chartData[hoveredPoint].day}
              </strong>
              <div style={{ color: '#059669', fontWeight: 600 }}>
                ● Collected: ৳{chartData[hoveredPoint].collected.toFixed(2)}
              </div>
              <div style={{ color: '#10b981' }}>
                ● Billed: ৳{chartData[hoveredPoint].billed.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          TWO-COLUMN BOTTOM ROW: PAYMENT METHODS & INVOICE SUMMARY
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Payment Methods Breakdown Card */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
            Payment Methods
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Cash × 1</span>
                <strong style={{ color: '#0f172a' }}>৳200.00</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: '#059669', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Mobile Banking (bKash/Nagad)</span>
                <strong style={{ color: '#0f172a' }}>৳180.00</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: '#10b981', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Invoice Summary
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('invoices')}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Confirmed</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                {totalInvoices} invoice{totalInvoices > 1 ? 's' : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Fully Paid</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
                {invoices.filter(i => i.paymentStatus === 'PAID').length}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Partial / Outstanding Due</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px' }}>
                {invoices.filter(i => i.paymentStatus === 'PARTIAL').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
