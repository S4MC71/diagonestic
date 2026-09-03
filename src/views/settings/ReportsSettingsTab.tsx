import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const ReportsSettingsTab: React.FC = () => {
  const { tenantSettings, updateTenantSettings, showToast } = useApp();

  // Numbering, Currency & Commission state
  const [invoicePrefix, setInvoicePrefix] = useState(tenantSettings.invoicePrefix || 'INV');
  const [samplePrefix, setSamplePrefix] = useState(tenantSettings.samplePrefix || 'SMP');
  const [reportPrefix, setReportPrefix] = useState(tenantSettings.reportPrefix || 'RPT');
  const [patientPrefix, setPatientPrefix] = useState(tenantSettings.patientPrefix || 'P');
  const [currency, setCurrency] = useState(tenantSettings.currency || 'BDT (৳)');
  const [vatPercent, setVatPercent] = useState<number>(tenantSettings.vatRate || 0);
  const [invoicePrintSize, setInvoicePrintSize] = useState<'thermal' | 'a5' | 'a4'>(
    tenantSettings.defaultPrintFormat || 'thermal'
  );
  const [showCompanyOnInvoice, setShowCompanyOnInvoice] = useState(true);
  const [doctorCommission, setDoctorCommission] = useState('Enabled');
  const [commissionAgentMode, setCommissionAgentMode] = useState('Optional');

  // Report Printing state
  const [reportHeader, setReportHeader] = useState('');
  const [reportFooter, setReportFooter] = useState(
    tenantSettings.reportDisclaimer ||
      'All clinical reports are verified by authorized consultant pathologists. In case of any discrepancy, please contact within 7 days.'
  );
  const [reportTopA4, setReportTopA4] = useState<number>(0);
  const [reportTopA5, setReportTopA5] = useState<number>(0);
  const [reportBottomA4, setReportBottomA4] = useState<number>(0);
  const [reportBottomA5, setReportBottomA5] = useState<number>(0);
  const [showCompanyOnReport, setShowCompanyOnReport] = useState(true);

  // Prescription Printing state
  const [rxPrintMode, setRxPrintMode] = useState('Plain Paper (print doctor header)');
  const [rxTopA4, setRxTopA4] = useState<number>(0);
  const [rxBottomA4, setRxBottomA4] = useState<number>(0);
  const [rxTopA5, setRxTopA5] = useState<number>(0);
  const [rxBottomA5, setRxBottomA5] = useState<number>(0);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      invoicePrefix,
      samplePrefix,
      reportPrefix,
      patientPrefix,
      currency,
      vatRate: vatPercent,
      defaultPrintFormat: invoicePrintSize,
      reportDisclaimer: reportFooter
    });
    showToast('Configuration settings saved successfully');
  };

  return (
    <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Numbering, Currency & Commission Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Numbering, Currency & Commission</h2>
        <div className="settings-grid-4" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Invoice Prefix</label>
            <input
              type="text"
              className="form-control"
              value={invoicePrefix}
              onChange={e => setInvoicePrefix(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sample Prefix</label>
            <input
              type="text"
              className="form-control"
              value={samplePrefix}
              onChange={e => setSamplePrefix(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Report Prefix</label>
            <input
              type="text"
              className="form-control"
              value={reportPrefix}
              onChange={e => setReportPrefix(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Patient Code Prefix</label>
            <input
              type="text"
              className="form-control"
              value={patientPrefix}
              onChange={e => setPatientPrefix(e.target.value)}
            />
          </div>
        </div>

        <div className="settings-grid-3" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="BDT (৳)">BDT (৳)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">VAT %</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={vatPercent}
              onChange={e => setVatPercent(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Print Size</label>
            <select
              className="form-control"
              value={invoicePrintSize}
              onChange={e => setInvoicePrintSize(e.target.value as any)}
            >
              <option value="thermal">Thermal (80mm POS)</option>
              <option value="a5">A5</option>
              <option value="a4">A4</option>
            </select>
            <div className="settings-helper-text">
              Default paper size when printing an invoice. Staff can still switch per print.
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ marginTop: '3px' }}
              checked={showCompanyOnInvoice}
              onChange={e => setShowCompanyOnInvoice(e.target.checked)}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Show company name & address on invoice
              </span>
              <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                When checked, A4 and A5 invoices print your logo, name and contacts at the top. Uncheck if you bill on pre-printed letterhead. Thermal invoices always print the header — roll paper is never pre-printed.
              </div>
            </div>
          </label>
        </div>

        <div className="settings-grid-2" style={{ marginBottom: '18px' }}>
          <div className="form-group">
            <label className="form-label">Doctor Commission</label>
            <select className="form-control" value={doctorCommission} onChange={e => setDoctorCommission(e.target.value)}>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Commission Agent on Invoice</label>
            <select
              className="form-control"
              value={commissionAgentMode}
              onChange={e => setCommissionAgentMode(e.target.value)}
            >
              <option value="Optional">Optional</option>
              <option value="Required">Required</option>
            </select>
            <div className="settings-helper-text">
              When set to Required, a commission agent must be selected before an invoice can be saved.
            </div>
          </div>
        </div>

        <button type="button" className="settings-btn-primary" onClick={handleSaveAll}>
          Save Configuration
        </button>
      </div>

      {/* 2. Report Printing Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Report Printing</h2>
        <p className="settings-card-sub">
          Letterhead text, blank space reserved at the top and bottom of printed reports, and whether the center name and address are printed.
        </p>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Report Header (letterhead)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Appears at top of every printed report"
            value={reportHeader}
            onChange={e => setReportHeader(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Report Footer</label>
          <input
            type="text"
            className="form-control"
            placeholder="Appears at bottom of every printed report"
            value={reportFooter}
            onChange={e => setReportFooter(e.target.value)}
          />
        </div>

        <div className="settings-grid-4" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Report Top Padding — A4 (mm)</label>
            <input
              type="number"
              className="form-control"
              value={reportTopA4}
              onChange={e => setReportTopA4(parseInt(e.target.value) || 0)}
            />
            <div className="settings-helper-text">
              Blank space at the top of A4 printed reports, e.g. to skip pre-printed letterhead
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Report Top Padding — A5 / Other (mm)</label>
            <input
              type="number"
              className="form-control"
              value={reportTopA5}
              onChange={e => setReportTopA5(parseInt(e.target.value) || 0)}
            />
            <div className="settings-helper-text">Blank space at the top for A5 and other paper sizes</div>
          </div>

          <div className="form-group">
            <label className="form-label">Report Bottom Padding — A4 (mm)</label>
            <input
              type="number"
              className="form-control"
              value={reportBottomA4}
              onChange={e => setReportBottomA4(parseInt(e.target.value) || 0)}
            />
            <div className="settings-helper-text">
              Space reserved at the bottom of A4 reports. Signatures are placed above this gap.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Report Bottom Padding — A5 / Other (mm)</label>
            <input
              type="number"
              className="form-control"
              value={reportBottomA5}
              onChange={e => setReportBottomA5(parseInt(e.target.value) || 0)}
            />
            <div className="settings-helper-text">Space reserved at the bottom for A5 and other paper sizes.</div>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ marginTop: '3px' }}
              checked={showCompanyOnReport}
              onChange={e => setShowCompanyOnReport(e.target.checked)}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Show company name & address on report
              </span>
              <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                When checked, the lab name and address are printed at the top of every report. Uncheck if you use pre-printed letterhead that already has this information.
              </div>
            </div>
          </label>
        </div>

        <button type="button" className="settings-btn-primary" onClick={handleSaveAll}>
          Save Configuration
        </button>
      </div>

      {/* 3. Prescription Printing Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Prescription Printing</h2>
        <p className="settings-card-sub">
          Default print mode for prescriptions, and blank space reserved at the top and bottom when printing on pre-printed letterhead. Margins do not affect plain-paper prints.
        </p>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Print Mode</label>
          <select className="form-control" value={rxPrintMode} onChange={e => setRxPrintMode(e.target.value)}>
            <option value="Plain Paper (print doctor header)">Plain Paper (print doctor header)</option>
            <option value="Letterhead Pad (suppress doctor header)">Letterhead Pad (suppress doctor header)</option>
          </select>
          <div className="settings-helper-text">
            Plain Paper prints the doctor header at the top; Letterhead suppresses it for pre-printed pads. A doctor who sets their own Default Print Mode overrides this.
          </div>
        </div>

        <div className="settings-grid-4" style={{ marginBottom: '18px' }}>
          <div className="form-group">
            <label className="form-label">A4 — Top Padding (mm)</label>
            <input
              type="number"
              className="form-control"
              value={rxTopA4}
              onChange={e => setRxTopA4(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">A4 — Bottom Padding (mm)</label>
            <input
              type="number"
              className="form-control"
              value={rxBottomA4}
              onChange={e => setRxBottomA4(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">A5 / Other — Top Padding (mm)</label>
            <input
              type="number"
              className="form-control"
              value={rxTopA5}
              onChange={e => setRxTopA5(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">A5 / Other — Bottom Padding (mm)</label>
            <input
              type="number"
              className="form-control"
              value={rxBottomA5}
              onChange={e => setRxBottomA5(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <button type="button" className="settings-btn-primary" onClick={handleSaveAll}>
          Save Configuration
        </button>
      </div>
    </form>
  );
};
