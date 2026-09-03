import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, Search, Printer, DollarSign, ArrowDownLeft } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, showToast } = useApp();
  const [search, setSearch] = useState('');

  const samplePayments = [
    {
      id: 'p-1',
      receiptNo: 'MR-2026-0001',
      invoiceNo: 'INV-2026-0001',
      patientName: 'Md. Rafiqul Islam',
      date: '2026-09-02',
      time: '10:35 AM',
      amount: 900,
      method: 'Cash',
      receivedBy: 'jhalakathid_admin'
    },
    {
      id: 'p-2',
      receiptNo: 'MR-2026-0002',
      invoiceNo: 'INV-2026-0002',
      patientName: 'Begum Rokeya Akter',
      date: '2026-09-02',
      time: '02:20 PM',
      amount: 750,
      method: 'Mobile Banking (bKash)',
      receivedBy: 'jhalakathid_admin'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments Received</h1>
          <p className="page-subtitle">Patient Collection Records, Money Receipts & Cash Counter Clearance</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search receipt #, invoice # or patient…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Money Receipt #</th>
              <th>Date & Time</th>
              <th>Invoice #</th>
              <th>Patient Name</th>
              <th>Payment Method</th>
              <th style={{ textAlign: 'right' }}>Amount Paid (৳)</th>
              <th>Received By</th>
              <th style={{ textAlign: 'center' }}>Print</th>
            </tr>
          </thead>
          <tbody>
            {samplePayments.map(p => (
              <tr key={p.id}>
                <td><strong style={{ color: '#073f8f' }}>{p.receiptNo}</strong></td>
                <td>{p.date} {p.time}</td>
                <td><strong style={{ color: '#0284c7' }}>{p.invoiceNo}</strong></td>
                <td>{p.patientName}</td>
                <td><span className="badge badge-inhouse">{p.method}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                  ৳{p.amount.toFixed(2)}
                </td>
                <td>{p.receivedBy}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="icon-btn"
                    title="Print Money Receipt"
                    onClick={() => {
                      window.print();
                      showToast(`Printing receipt ${p.receiptNo}`);
                    }}
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
  );
};
