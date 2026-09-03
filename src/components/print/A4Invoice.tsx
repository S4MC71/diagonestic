import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';

interface A4InvoiceProps {
  invoice: Invoice;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({ invoice }) => {
  const { tenantSettings, activePrintColor } = useApp();
  const isBW = activePrintColor === 'B&W';
  const isDue = invoice.dueAmount > 0;

  return (
    <div
      className={`a4-invoice-sheet ${isBW ? 'print-bw' : ''}`}
      style={{
        background: '#ffffff',
        color: '#0f172a',
        padding: '32px 40px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        lineHeight: '1.4',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Hospital Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', position: 'relative' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: isBW ? '#000000' : '#051c40' }}>
          {tenantSettings.name}
        </h1>
        {tenantSettings.bengaliName && (
          <div style={{ fontFamily: 'var(--font-bangla)', fontSize: '15px', color: isBW ? '#333333' : '#073f8f', fontWeight: 600, marginTop: '2px' }}>
            {tenantSettings.bengaliName}
          </div>
        )}
        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <span>📍 {tenantSettings.address}, {tenantSettings.thana}</span>
          <span>📞 {tenantSettings.phone} {tenantSettings.phone2 ? `, ${tenantSettings.phone2}` : ''}</span>
          <span>✉️ {tenantSettings.email}</span>
        </div>

        {/* INVESTIGATION Pill Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              border: '1.5px solid #0f172a',
              borderRadius: '4px',
              padding: '2px 14px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            INVESTIGATION
          </span>
        </div>
      </div>

      {/* 2. Demographics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1.2fr',
          gap: '12px',
          borderTop: '1px solid #cbd5e1',
          borderBottom: '1px solid #cbd5e1',
          padding: '10px 0',
          fontSize: '12px',
          marginBottom: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>PATIENT</div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{invoice.patientName}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569' }}>{invoice.patientId}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Phone: {invoice.patientPhone}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>AGE / SEX</div>
          <div style={{ fontWeight: 700 }}>{invoice.patientAge} yrs · {invoice.patientGender}</div>
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>REFERRED BY</div>
            <div style={{ fontWeight: 600 }}>{invoice.referredByName || 'Self / Walk-in'}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>INVOICE DETAILS</div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: isBW ? '#000000' : '#073f8f' }}>{invoice.invoiceNo}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{invoice.date} {invoice.time}</div>

          {/* Barcode representation */}
          <div style={{ display: 'inline-block', marginTop: '6px', textAlign: 'center' }}>
            <svg width="120" height="26" viewBox="0 0 120 26">
              <rect x="2" width="2" height="22" fill="#000" />
              <rect x="6" width="3" height="22" fill="#000" />
              <rect x="12" width="1" height="22" fill="#000" />
              <rect x="15" width="4" height="22" fill="#000" />
              <rect x="22" width="2" height="22" fill="#000" />
              <rect x="26" width="1" height="22" fill="#000" />
              <rect x="30" width="3" height="22" fill="#000" />
              <rect x="36" width="2" height="22" fill="#000" />
              <rect x="42" width="4" height="22" fill="#000" />
              <rect x="49" width="1" height="22" fill="#000" />
              <rect x="53" width="3" height="22" fill="#000" />
              <rect x="59" width="2" height="22" fill="#000" />
              <rect x="64" width="4" height="22" fill="#000" />
              <rect x="71" width="1" height="22" fill="#000" />
              <rect x="75" width="2" height="22" fill="#000" />
              <rect x="80" width="3" height="22" fill="#000" />
              <rect x="86" width="1" height="22" fill="#000" />
              <rect x="90" width="4" height="22" fill="#000" />
              <rect x="97" width="2" height="22" fill="#000" />
              <rect x="102" width="3" height="22" fill="#000" />
              <rect x="108" width="1" height="22" fill="#000" />
              <rect x="112" width="4" height="22" fill="#000" />
            </svg>
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#475569', letterSpacing: '1px' }}>
              {invoice.invoiceNo}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Test Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #0f172a', textAlign: 'left', fontWeight: 800 }}>
            <th style={{ padding: '6px 4px', width: '32px' }}>SL</th>
            <th style={{ padding: '6px 4px' }}>TEST / SERVICE</th>
            <th style={{ padding: '6px 4px', textAlign: 'right', width: '90px' }}>DISCOUNT (৳)</th>
            <th style={{ padding: '6px 4px', textAlign: 'center', width: '110px' }}>DELIVERY</th>
            <th style={{ padding: '6px 4px', textAlign: 'right', width: '100px' }}>AMOUNT (৳)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 4px' }}>{idx + 1}</td>
              <td style={{ padding: '8px 4px' }}>
                <strong style={{ color: isBW ? '#000' : '#073f8f' }}>{item.testName}</strong>
                {item.isSendOut && (
                  <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '6px' }}>(Send-Out)</span>
                )}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', color: '#64748b' }}>
                {item.discount ? item.discount.toFixed(2) : '0.00'}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'center', color: '#475569' }}>
                {item.deliveryDate || invoice.date}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>
                {item.price.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Lower Section: Watermark Stamp, QR Code, and Financial Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', minHeight: '130px' }}>
        {/* Left: Tilted Angled Rectangular DUE / PAID Stamp */}
        <div style={{ position: 'relative', width: '220px', paddingLeft: '20px' }}>
          <div
            style={{
              display: 'inline-block',
              transform: 'rotate(-12deg)',
              border: `4px solid ${isDue ? (isBW ? '#000' : '#dc2626') : (isBW ? '#000' : '#16a34a')}`,
              color: isDue ? (isBW ? '#000' : '#dc2626') : (isBW ? '#000' : '#16a34a'),
              fontWeight: '900',
              fontSize: '36px',
              padding: '4px 28px',
              borderRadius: '8px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              opacity: 0.85,
              userSelect: 'none'
            }}
          >
            {isDue ? 'DUE' : 'PAID'}
          </div>
        </div>

        {/* Center: Scannable QR Code */}
        <div style={{ textAlign: 'center', width: '120px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
              <rect x="2" y="2" width="8" height="8" rx="1" fill="#000" />
              <rect x="4" y="4" width="4" height="4" fill="#fff" />
              <rect x="14" y="2" width="8" height="8" rx="1" fill="#000" />
              <rect x="16" y="4" width="4" height="4" fill="#fff" />
              <rect x="2" y="14" width="8" height="8" rx="1" fill="#000" />
              <rect x="4" y="16" width="4" height="4" fill="#fff" />
              <rect x="14" y="14" width="3" height="3" fill="#000" />
              <rect x="19" y="14" width="3" height="3" fill="#000" />
              <rect x="14" y="19" width="3" height="3" fill="#000" />
              <rect x="19" y="19" width="3" height="3" fill="#000" />
            </svg>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>View Report</div>
        </div>

        {/* Right: Financial Totals Breakdown */}
        <div style={{ width: '220px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ color: '#475569' }}>Subtotal</span>
            <span>{invoice.subtotal.toFixed(2)} ৳</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ color: '#475569' }}>Discount</span>
              <span>{invoice.discountAmount.toFixed(2)} ৳</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontWeight: 800,
              fontSize: '14px',
              borderTop: '1px solid #cbd5e1',
              borderBottom: '1px solid #cbd5e1',
              margin: '4px 0'
            }}
          >
            <span>Total</span>
            <span style={{ color: isBW ? '#000' : '#073f8f' }}>{invoice.netTotal.toFixed(2)} ৳</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ color: '#475569' }}>Advance / Paid</span>
            <span style={{ fontWeight: 600 }}>{invoice.paidAmount.toFixed(2)} ৳</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 0',
              fontWeight: 700,
              color: isDue ? (isBW ? '#000' : '#dc2626') : '#475569'
            }}
          >
            <span>Due</span>
            <span>{invoice.dueAmount.toFixed(2)} ৳</span>
          </div>
        </div>
      </div>

      {/* 5. Footer Signatures (Three Lines) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '24px',
          fontSize: '11px',
          color: '#334155'
        }}
      >
        <div>
          <div style={{ borderTop: '1px solid #94a3b8', width: '130px', margin: '0 auto', paddingTop: '4px' }}>
            Received By
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1px solid #94a3b8', width: '130px', margin: '0 auto', paddingTop: '4px' }}>
            Authorized By
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1px solid #94a3b8', width: '140px', margin: '0 auto', paddingTop: '4px' }}>
            <div style={{ fontWeight: 600, color: '#073f8f' }}>{invoice.createdBy || 'jhalakathid_admin'}</div>
            Prepared By
          </div>
        </div>
      </div>

      {/* 6. Bengali Footer Note */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-bangla)',
          fontSize: '12px',
          color: '#64748b',
          marginTop: '16px',
          borderTop: '1px dashed #e2e8f0',
          paddingTop: '10px'
        }}
      >
        রিপোর্ট সংগ্রহের সময় অনুগ্রহ করে সংশ্লিষ্ট ইনভয়েস/বিল কপি সঙ্গে আনতে অনুরোধ করা হলো ।
      </div>
    </div>
  );
};
