import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2 } from 'lucide-react';

interface PurchaseClaim {
  id: string;
  date: string;
  messages: number;
  amount: number;
  method: string;
  transactionId: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  description?: string;
}

export const WhatsAppSettingsTab: React.FC = () => {
  const { showToast } = useApp();

  // Preferences State
  const [autoNewPatient, setAutoNewPatient] = useState(true);
  const [autoReportReady, setAutoReportReady] = useState(true);
  const [language, setLanguage] = useState('Bangla');
  const [adminPhone, setAdminPhone] = useState('01834259899');
  const [senderAccount, setSenderAccount] = useState<'system' | 'own'>('system');

  // Purchase Claim Form State
  const [claimMessages, setClaimMessages] = useState<string>('500');
  const [claimAmount, setClaimAmount] = useState<string>('250.00');
  const [claimMethod, setClaimMethod] = useState('bKash');
  const [claimTrxId, setClaimTrxId] = useState('');
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimDesc, setClaimDesc] = useState('');

  // Claims History State
  const [claims, setClaims] = useState<PurchaseClaim[]>([]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('WhatsApp preferences saved successfully');
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTrxId || !claimMessages || !claimAmount) {
      showToast('Please fill in all required claim fields');
      return;
    }

    const newClaim: PurchaseClaim = {
      id: `clm-${Date.now()}`,
      date: claimDate,
      messages: parseInt(claimMessages) || 500,
      amount: parseFloat(claimAmount) || 250,
      method: claimMethod,
      transactionId: claimTrxId,
      status: 'Pending Verification',
      description: claimDesc
    };

    setClaims(prev => [newClaim, ...prev]);
    setClaimTrxId('');
    setClaimDesc('');
    showToast(`Claim for ${claimMessages} messages submitted! Verification pending.`);
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(prev => prev.filter(c => c.id !== id));
    showToast('Pending claim deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Alert Banner */}
      <div className="settings-alert-banner">
        <span>
          WhatsApp messaging is currently switched off for your account by the system administrator. Contact support to enable it.
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <span
            style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              letterSpacing: '0.05em'
            }}
          >
            DISABLED
          </span>
          <span
            style={{
              background: '#059669',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px'
            }}
          >
            100 credits left
          </span>
        </div>
      </div>

      {/* 1. Message Preferences & Sender Account Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Message Preferences & Sender Account</h2>
        <p className="settings-card-sub">Automatic WhatsApp messages sent to patients.</p>

        <form onSubmit={handleSavePreferences}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: '3px' }}
                checked={autoNewPatient}
                onChange={e => setAutoNewPatient(e.target.checked)}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  New patient registered
                </span>
                <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                  Send a welcome message when a patient is registered with a WhatsApp number.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: '3px' }}
                checked={autoReportReady}
                onChange={e => setAutoReportReady(e.target.checked)}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  All reports ready
                </span>
                <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                  Notify the patient when every report on an invoice has been approved.
                </div>
              </div>
            </label>
          </div>

          <div className="settings-grid-2" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label">Message Language</label>
              <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="Bangla">Bangla</option>
                <option value="English">English</option>
              </select>
              <div className="settings-helper-text">Language used for automatic messages.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin WhatsApp Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="01XXXXXXXXX"
                value={adminPhone}
                onChange={e => setAdminPhone(e.target.value)}
              />
              <div className="settings-helper-text">
                Receives confirmations, e.g. when a credit purchase is approved.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>Sender account</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="senderAccount"
                  checked={senderAccount === 'system'}
                  onChange={() => setSenderAccount('system')}
                />
                <span>System account (uses message credits)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="senderAccount"
                  checked={senderAccount === 'own'}
                  onChange={() => setSenderAccount('own')}
                />
                <span>Own WhatsApp Business account (no credits needed)</span>
              </label>
            </div>
          </div>

          <button type="submit" className="settings-btn-primary">
            Save WhatsApp Settings
          </button>
        </form>
      </div>

      {/* 2. Message Credits Card */}
      <div className="settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h2 className="settings-card-title" style={{ margin: 0 }}>Message Credits</h2>
          <span
            style={{
              background: '#059669',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px'
            }}
          >
            100 remaining
          </span>
        </div>

        <p className="settings-card-sub">
          Every account starts with 100 free messages. To buy more, make the payment and submit the transaction details below — credits are added after the CarePulse team verifies the payment.
        </p>

        <form onSubmit={handleSubmitClaim} style={{ marginBottom: '24px' }}>
          <div className="settings-grid-3" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Number of Messages *</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 500"
                value={claimMessages}
                onChange={e => setClaimMessages(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount Paid (৳) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="e.g. 250.00"
                value={claimAmount}
                onChange={e => setClaimAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select className="form-control" value={claimMethod} onChange={e => setClaimMethod(e.target.value)}>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="settings-grid-3" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Transaction ID *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 9HX72KLM4P"
                value={claimTrxId}
                onChange={e => setClaimTrxId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Date *</label>
              <input
                type="date"
                className="form-control"
                value={claimDate}
                onChange={e => setClaimDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional note"
                value={claimDesc}
                onChange={e => setClaimDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-helper-text" style={{ marginBottom: '14px' }}>
            A claim cannot be edited after submission — you can delete a pending claim and submit a new one.
          </div>

          <button type="submit" className="settings-btn-primary">
            Submit Claim
          </button>
        </form>

        {/* Claims History Table */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            Purchase Claims History
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>MESSAGES</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                  <th>TRANSACTION</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                      No credit purchases yet.
                    </td>
                  </tr>
                ) : (
                  claims.map(claim => (
                    <tr key={claim.id}>
                      <td>{claim.date}</td>
                      <td><strong>{claim.messages}</strong></td>
                      <td>৳{claim.amount.toFixed(2)}</td>
                      <td><span className="badge badge-inhouse">{claim.method}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)' }}>{claim.transactionId}</span></td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Delete pending claim"
                          onClick={() => handleDeleteClaim(claim.id)}
                        >
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
