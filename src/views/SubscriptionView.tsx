import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPayment } from '../types';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  Download,
  FileText,
  AlertCircle,
  Zap,
  Building,
  Check,
  ChevronRight,
  X,
  PhoneCall
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter Diagnostic (DMS)',
    subtitle: 'For standalone pathology & ultrasound centers',
    monthlyPrice: 3500,
    annualPrice: 33600,
    features: [
      'Diagnostic Invoicing & Thermal Receipts',
      'Barcode Specimen Tube Tracking',
      'Pathology Multi-Parameter Reporting',
      'Daily Cash & Collection Ledger',
      'Up to 3 Staff Accounts'
    ]
  },
  {
    id: 'pro',
    name: 'Professional (DMS + Rx)',
    subtitle: 'For diagnostic clinics with doctor chambers',
    monthlyPrice: 6500,
    annualPrice: 62400,
    features: [
      'Everything in Starter DMS',
      'Doctor Consultation Chambers',
      'Patient Appointment & Serial Queues',
      'E-Prescription & Clinical History Module',
      'Bangla Drug Directory & Reusable Templates',
      'Up to 8 Staff Accounts'
    ]
  },
  {
    id: 'suite',
    name: 'Complete Suite (DMS + Rx + Pharmacy)',
    subtitle: 'Full service all-in-one healthcare operations ecosystem',
    monthlyPrice: 10000,
    annualPrice: 96000,
    popular: true,
    features: [
      'Everything in Professional DMS + Rx',
      'Pharmacy Retail Counter POS Terminal',
      'Batch & Expiry Date Medicine Inventory',
      'Doctor Referral Commission Engine',
      'Supplier Purchase Orders & Requisitions',
      'WhatsApp Bangla Patient Delivery',
      'Unlimited Staff Accounts'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Multi-Branch',
    subtitle: 'For healthcare groups & multi-location branches',
    monthlyPrice: 15000,
    annualPrice: 144000,
    features: [
      'Centralized Multi-Branch Synchronization',
      'Dedicated WhatsApp API Gateway Number',
      'Custom Letterhead Watermark Pathology Printing',
      'Accounting Profit & Loss Cash Flow Statements',
      'Dedicated Account Manager & 24/7 Priority SLA',
      'Cloud Backup with 99.9% Uptime Guarantee'
    ]
  }
];

export const SubscriptionView: React.FC = () => {
  const { tenantSettings, activeSubscription, updateActiveSubscription, subscriptionPayments, recordSubscriptionPayment, showToast } = useApp();

  // Billing Cycle Toggle for Pricing Table
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'bKash' | 'Nagad' | 'Card' | 'Bank'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt Modal State
  const [viewingPayment, setViewingPayment] = useState<SubscriptionPayment | null>(null);

  const handleOpenUpgrade = (tier: PricingTier) => {
    setSelectedTier(tier);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    const amount = billingCycle === 'annual' ? selectedTier.annualPrice : selectedTier.monthlyPrice;

    setIsProcessing(true);
    setTimeout(() => {
      // Record payment
      recordSubscriptionPayment({
        planName: selectedTier.name,
        billingCycle: billingCycle === 'annual' ? 'Annual' : 'Monthly',
        amount,
        currency: 'BDT',
        method: `${paymentGateway} Merchant`,
        accountInfo: trxId ? `TrxID: ${trxId}` : 'Authorized Digital Payment',
        status: 'Paid'
      });

      // Update active subscription
      const now = new Date();
      const expiry = new Date();
      if (billingCycle === 'annual') {
        expiry.setFullYear(expiry.getFullYear() + 1);
      } else {
        expiry.setMonth(expiry.getMonth() + 1);
      }

      updateActiveSubscription({
        planName: selectedTier.name,
        planSubtitle: selectedTier.subtitle,
        status: 'Active',
        price: amount,
        billingPeriodText: billingCycle === 'annual' ? 'per 12 months' : 'per 1 months',
        discountNote: billingCycle === 'annual' ? '20% Annual Loyalty Discount Applied' : undefined,
        startDate: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        expiryDate: expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        daysRemaining: billingCycle === 'annual' ? 365 : 30
      });

      setIsProcessing(false);
      setShowUpgradeModal(false);
      setTrxId('');
      showToast(`Congratulations! Upgraded to ${selectedTier.name}`);
    }, 600);
  };

  return (
    <div className="view-container" style={{ maxWidth: '1160px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Subscription
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Your current plan, subscription period, and payment history.
          </p>
        </div>
      </div>

      {/* ====================================================================
          CARD 1: CURRENT ACTIVE PLAN (MATCHING LIVE SCREENSHOT)
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeSubscription.planName}
              </h2>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}
              >
                {activeSubscription.status}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 12px 0' }}>
              {activeSubscription.planSubtitle}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeSubscription.modules.map((mod, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: i === 0 ? '#dbeafe' : i === 1 ? '#f3e8ff' : '#ccfbf1',
                    color: i === 0 ? '#1d4ed8' : i === 1 ? '#7e22ce' : '#0f766e'
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {activeSubscription.price.toLocaleString()} BDT
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {activeSubscription.billingPeriodText}
            </div>
            {activeSubscription.discountNote && (
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                {activeSubscription.discountNote}
              </div>
            )}
          </div>
        </div>

        {/* 4-Stat Metric Grid Matching Live Site */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            background: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '10px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              START DATE
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {activeSubscription.startDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              EXPIRY DATE
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {activeSubscription.expiryDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              DAYS REMAINING
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
              {activeSubscription.daysRemaining} days
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              BILLING PERIOD
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {activeSubscription.billingPeriodText.replace('per ', '')}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CARD 2: AVAILABLE PACKAGES & UPGRADE OPTIONS
          ==================================================================== */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Available Packages & Upgrade Options
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Choose the package that fits your diagnostic center's growth. Upgrade or renew seamlessly.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div
            style={{
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              display: 'inline-flex',
              gap: '4px'
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
                fontWeight: 600,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                border: 'none',
                background: billingCycle === 'annual' ? '#ffffff' : 'transparent',
                color: billingCycle === 'annual' ? '#0f172a' : '#64748b',
                fontWeight: 600,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: billingCycle === 'annual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Annual Billing <span style={{ color: '#16a34a', fontWeight: 700 }}>(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {PRICING_TIERS.map(tier => {
            const isCurrent = activeSubscription.planName.toLowerCase().includes(tier.id);
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={tier.id}
                className="card"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: isCurrent ? '2px solid #059669' : tier.popular ? '2px solid #10b981' : '1px solid #e1ece7',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: tier.popular ? '0 4px 14px rgba(5,150,105,0.12)' : '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-11px',
                      left: '20px',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    CURRENT ACTIVE PLAN
                  </div>
                )}

                {!isCurrent && tier.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-11px',
                      left: '20px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f2922', margin: '4px 0 4px 0' }}>
                    {tier.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#4d6b63', margin: '0 0 14px 0', minHeight: '32px' }}>
                    {tier.subtitle}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f2922' }}>
                      {price.toLocaleString()} BDT
                    </span>
                    <span style={{ fontSize: '12px', color: '#4d6b63', marginLeft: '4px' }}>
                      {periodLabel}
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {tier.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#1e3a34' }}>
                        <Check size={14} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="btn"
                  onClick={() => handleOpenUpgrade(tier)}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isCurrent ? '#059669' : tier.popular ? '#059669' : '#0f2922',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                >
                  {isCurrent ? 'Renew / Extend Tier' : 'Upgrade to this Plan'} <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          CARD 3: PAYMENT HISTORY (MATCHING LIVE HEADER + TABLE)
          ==================================================================== */}
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
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Payment History ({subscriptionPayments.length})
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Log of all subscription renewals, trial activations, and add-on transactions.
            </p>
          </div>
        </div>

        {subscriptionPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
            No payments recorded yet.
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>DATE</th>
                  <th style={{ textAlign: 'left' }}>RECEIPT / INVOICE #</th>
                  <th style={{ textAlign: 'left' }}>PLAN / DESCRIPTION</th>
                  <th style={{ textAlign: 'left' }}>PAYMENT METHOD</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ textAlign: 'center' }}>STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#334155', fontWeight: 500 }}>{p.date}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#059669' }}>
                      {p.receiptNo}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{p.planName}</strong>
                      {p.accountInfo && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.accountInfo}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-inhouse" style={{ fontSize: '11px' }}>
                        {p.method}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {p.amount.toLocaleString()} {p.currency}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        ✓ {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewingPayment(p)}
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          UPGRADE / PAYMENT MODAL
          ==================================================================== */}
      {showUpgradeModal && selectedTier && (
        <div className="modal-backdrop" onClick={() => setShowUpgradeModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
                  Upgrade Plan
                </span>
                <h3 className="modal-title" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedTier.name}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setShowUpgradeModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmUpgrade}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Plan Summary Box */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Billing Frequency:</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      {billingCycle === 'annual' ? 'Annual (12 Months)' : 'Monthly'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Total Payable Amount:</span>
                    <strong style={{ fontSize: '18px', color: '#0f766e', fontWeight: 800 }}>
                      {(billingCycle === 'annual' ? selectedTier.annualPrice : selectedTier.monthlyPrice).toLocaleString()} BDT
                    </strong>
                  </div>
                </div>

                {/* Gateway Selection */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                    Select Payment Method *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'bKash', name: 'bKash Merchant' },
                      { id: 'Nagad', name: 'Nagad' },
                      { id: 'Card', name: 'Visa / MasterCard' },
                      { id: 'Bank', name: 'Bank Transfer' }
                    ].map(gw => (
                      <div
                        key={gw.id}
                        onClick={() => setPaymentGateway(gw.id as any)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: paymentGateway === gw.id ? '2px solid #0f766e' : '1px solid #cbd5e1',
                          background: paymentGateway === gw.id ? '#f0fdfa' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: paymentGateway === gw.id ? '#0f766e' : '#334155'
                        }}
                      >
                        <CreditCard size={15} /> {gw.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions per Gateway */}
                <div style={{ background: '#eff6ff', borderLeft: '3px solid #3b82f6', padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '12px', color: '#1e3a8a' }}>
                  {paymentGateway === 'bKash' && 'Send payment to bKash Merchant No. 01894422170 (Counter 1) and enter the Transaction ID below.'}
                  {paymentGateway === 'Nagad' && 'Send payment to Nagad Merchant No. 01894422170 and enter the Transaction ID below.'}
                  {paymentGateway === 'Card' && 'Instant checkout with any Bangladesh Visa/MasterCard. Enter card reference or simulated TrxID.'}
                  {paymentGateway === 'Bank' && 'Deposit to DBBL A/C 123-110-8921 (CarePulse Technologies Ltd) and enter deposit slip voucher.'}
                </div>

                {/* Transaction ID input */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9HJ87K2M19"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !trxId.trim()}
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isProcessing || !trxId.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Processing Payment...' : 'Confirm & Activate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          RECEIPT PREVIEW MODAL
          ==================================================================== */}
      {viewingPayment && (
        <div className="modal-backdrop" onClick={() => setViewingPayment(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Subscription Receipt
              </h3>
              <button className="icon-btn" onClick={() => setViewingPayment(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                  CarePulse Health Cloud
                </div>
                <div style={{ fontSize: '12px', color: '#4d6b63' }}>
                  Diagnostic Management Platform — Official Tax Invoice
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '14px 0', marginBottom: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Receipt No:</span>
                  <strong>{viewingPayment.receiptNo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Date:</span>
                  <span>{viewingPayment.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Tenant:</span>
                  <span>{tenantSettings?.name || 'LifeCare Diagnostic Center'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Package:</span>
                  <strong>{viewingPayment.planName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Billing Cycle:</span>
                  <span>{viewingPayment.billingCycle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Method:</span>
                  <span>{viewingPayment.method}</span>
                </div>
                {viewingPayment.accountInfo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Reference:</span>
                    <span>{viewingPayment.accountInfo}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <span>Total Paid:</span>
                  <span style={{ color: '#0f766e' }}>{viewingPayment.amount.toLocaleString()} {viewingPayment.currency}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                ✓ PAYMENT VERIFIED & ACTIVE
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  window.print();
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Print / Save PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setViewingPayment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
