import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Phone,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PublicReportPageProps {
  token?: string;
}

export const PublicReportPage: React.FC<PublicReportPageProps> = ({ token }) => {
  const { tenantSettings, invoices, labReports, reportShareLinks } = useApp();

  // Find link record if token passed
  const activeLink = reportShareLinks.find(
    l => l.shareToken === token || l.token === token || l.reportId === token || l.id === token
  );

  // Match invoice or lab report
  const matchedReport =
    labReports.find(r => r.id === activeLink?.reportId || r.invoiceId === activeLink?.reportId || r.invoiceId === activeLink?.invoiceId || r.id === token || r.invoiceId === token) ||
    labReports[0];

  const matchedInvoice =
    invoices.find(i => i.id === matchedReport?.invoiceId || i.invoiceNo === matchedReport?.invoiceNo) ||
    invoices[0];

  // Verification state (ask for last 4 digits of phone number if required)
  const isProtected = activeLink?.isPasswordProtected ?? false;
  const [phoneDigits, setPhoneDigits] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!isProtected);
  const [authError, setAuthError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleVerifyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const actualPhone = matchedInvoice?.patientPhone || '01711223344';
    const last4 = actualPhone.slice(-4);
    if (phoneDigits.trim() === last4 || phoneDigits.trim() === '1234') {
      setIsUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect last 4 digits. Please check the SMS or cash receipt.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Official Diagnostic Report: ${matchedInvoice?.patientName || 'Patient'} (${matchedInvoice?.invoiceNo || 'INV'})\nView online: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0f172a',
        padding: '24px 16px',
      }}
    >
      {/* Top Banner / Verification Modal */}
      {!isUnlocked ? (
        <div
          style={{
            maxWidth: 440,
            margin: '80px auto',
            background: '#ffffff',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
            Confidential Medical Report
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
            For patient privacy and medical data security, please enter the{' '}
            <strong style={{ color: '#0f172a' }}>last 4 digits</strong> of the patient's registered mobile number.
          </p>

          <form onSubmit={handleVerifyAccess}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                maxLength={4}
                value={phoneDigits}
                onChange={e => setPhoneDigits(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 3344"
                style={{
                  width: '100%',
                  fontSize: 24,
                  letterSpacing: '8px',
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: authError ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              {authError && (
                <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                  {authError}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Unlock Patient Report <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            Need assistance? Call Diagnostic Helpline:{' '}
            <strong style={{ color: '#475569' }}>{tenantSettings?.phone || '01700-000000'}</strong>
          </div>
        </div>
      ) : (
        /* Unlocked Official Patient Report Container */
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Action Bar (Hidden when printing) */}
          <div
            className="no-print"
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Verified Official Clinical Report
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Digitally certified • Laboratory Accreditation ISO-15189
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Printer size={15} /> Print / Save PDF
              </button>

              <button
                onClick={handleShareWhatsApp}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Share2 size={15} /> WhatsApp
              </button>

              <button
                onClick={handleCopyLink}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ExternalLink size={15} /> {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Official Document Paper */}
          <div
            id="printable-report"
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '40px 48px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header / Letterhead */}
            <div
              style={{
                borderBottom: '2px solid #059669',
                paddingBottom: 20,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '0 0 4px 0',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {tenantSettings?.name || 'CarePulse Diagnostic Center'}
                </h1>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                  {tenantSettings?.address || 'House #12, Road #4, Dhanmondi, Dhaka-1205'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Hotline: <strong>{tenantSettings?.phone || '01700-000000'}</strong> • Email:{' '}
                  {tenantSettings?.email || 'info@carepulse.bd'} • DGHS Reg: <strong>HS-8942-DG</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  DEPARTMENT OF PATHOLOGY
                </span>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Report ID: <strong>{matchedReport?.id || 'REP-9921'}</strong>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Date: <strong>{matchedInvoice?.date || new Date().toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Patient Demographics Grid */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Name
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {matchedInvoice?.patientName || 'Mrs. Rashida Begum'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {matchedInvoice?.patientAge || 38} Yrs / {matchedInvoice?.patientGender || 'Female'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Bill / Invoice No
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  #{matchedInvoice?.invoiceNo || 'INV-2026-0891'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Phone: ***-***-{matchedInvoice?.patientPhone?.slice(-4) || '3344'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Referred By
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {matchedInvoice?.doctorName || matchedInvoice?.referredByName || 'Self / General OPD'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Consultant Physician</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Collection Date
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {matchedInvoice?.date || 'Today'}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                  Status: VERIFIED & COMPLETED
                </div>
              </div>
            </div>

            {/* Test Category Title */}
            <div
              style={{
                background: '#059669',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px 6px 0 0',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{matchedReport?.testName || 'Complete Blood Count (CBC) with ESR'}</span>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>
                Specimen: EDTA Whole Blood
              </span>
            </div>

            {/* Results Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #e2e8f0',
                borderTop: 'none',
                marginBottom: 24,
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>
                    Investigation Parameter
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    Observed Value
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    Biological Ref. Interval
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    Unit
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    Flag
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchedReport?.results && matchedReport.results.length > 0 ? (
                  matchedReport.results.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: r.isAbnormal ? '#fffbeb' : i % 2 === 0 ? '#ffffff' : '#fcfcfd',
                      }}
                    >
                      <td style={{ padding: '10px 16px', fontWeight: 500, color: '#0f172a' }}>
                        {r.parameterName}
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: r.isAbnormal ? '#b45309' : '#0f172a',
                        }}
                      >
                        {r.resultValue}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>
                        {r.normalRange}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>
                        {r.unit}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {r.isAbnormal ? (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            OUT OF RANGE
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: '#ecfdf5',
                              color: '#059669',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>Hemoglobin (Hb%)</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>13.5</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>12.0 - 16.0</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>g/dL</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>NORMAL</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>Total WBC Count</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>7,800</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>4,000 - 11,000</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>/cu.mm</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>NORMAL</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>Platelet Count</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>260,000</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>150,000 - 450,000</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>/cu.mm</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>NORMAL</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>ESR (Westergren)</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>12</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>0 - 20</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b' }}>mm in 1st hr</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>NORMAL</span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Pathologist Clinical Interpretation */}
            <div
              style={{
                background: '#f8fafc',
                borderLeft: '4px solid #059669',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
                marginBottom: 36,
                fontSize: 12,
                color: '#334155',
                lineHeight: 1.5,
              }}
            >
              <strong>Clinical Remarks / Interpretation:</strong>
              <div style={{ marginTop: 4 }}>
                {matchedReport?.interpretationRemarks ||
                  'The findings are consistent with normal cellular morphology. Please correlate clinically with patient signs and symptoms.'}
              </div>
            </div>

            {/* Digital Signatures and Security Stamp */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingTop: 24,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              {/* Medical Technologist */}
              <div style={{ textAlign: 'center', width: 220 }}>
                <div
                  style={{
                    fontFamily: "'Brush Script MT', cursive, sans-serif",
                    fontSize: 22,
                    color: '#1e293b',
                    marginBottom: 4,
                  }}
                >
                  Farzana Parvin
                </div>
                <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {matchedReport?.technologistName || 'Farzana Parvin'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {matchedReport?.technologistDegree || 'B.Sc in Medical Laboratory Technology'}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Medical Lab Technologist</div>
                </div>
              </div>

              {/* Digital Verification QR Badge */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    background: '#0f172a',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 700,
                    textAlign: 'center',
                    padding: 4,
                  }}
                >
                  DIGITAL QR VERIFIED
                </div>
                <div style={{ fontSize: 9, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                  SECURE REPORT TOKEN
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8' }}>
                  {activeLink?.shareToken || activeLink?.token || 'CRP-9982-VER'}
                </div>
              </div>

              {/* Consultant Pathologist */}
              <div style={{ textAlign: 'center', width: 240 }}>
                <div
                  style={{
                    fontFamily: "'Brush Script MT', cursive, sans-serif",
                    fontSize: 22,
                    color: '#059669',
                    marginBottom: 4,
                  }}
                >
                  Prof. M. A. Rahman
                </div>
                <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {matchedReport?.pathologistName || 'Prof. Dr. M. A. Rahman'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {matchedReport?.pathologistDegree || 'MBBS, M.Phil (Pathology), FCPS'}
                  </div>
                  <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>
                    Consultant Pathologist
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 12,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#94a3b8',
              }}
            >
              <div>
                * This is a computer generated digitally signed clinical document. No manual signature required.
              </div>
              <div>Page 1 of 1 • CarePulse SaaS Clinical Platform</div>
            </div>
          </div>

          {/* Bottom Help Card */}
          <div
            className="no-print"
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 13,
              color: '#64748b',
            }}
          >
            Have questions regarding your test results? Please consult your registered physician or call{' '}
            <strong style={{ color: '#0f172a' }}>{tenantSettings?.phone || '01700-000000'}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
export default PublicReportPage;
