import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const PharmacySettingsTab: React.FC = () => {
  const { tenantSettings, updateTenantSettings, showToast } = useApp();

  const [expiryWarningDays, setExpiryWarningDays] = useState<number>(
    tenantSettings.pharmacyExpiryWarningDays ?? 30
  );
  const [showStockWhilePrescribing, setShowStockWhilePrescribing] = useState<boolean>(
    tenantSettings.rxShowPharmacyStock ?? true
  );

  const handleSaveExpiry = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({ pharmacyExpiryWarningDays: expiryWarningDays });
    showToast('Expiry warning threshold saved');
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({ rxShowPharmacyStock: showStockWhilePrescribing });
    showToast('Prescription pad stock preference saved');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Expiry Warning Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Expiry warning</h2>
        <p className="settings-card-sub">
          How early the counter should start flagging a batch as near expiry.
        </p>

        <form onSubmit={handleSaveExpiry}>
          <div className="form-group" style={{ maxWidth: '380px', marginBottom: '14px' }}>
            <label className="form-label">Warn this many days before expiry</label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-control"
              value={expiryWarningDays}
              onChange={e => setExpiryWarningDays(parseInt(e.target.value) || 30)}
            />
            <div className="settings-helper-text">
              A fast-moving chemist may want 15 days; a shop carrying slow lines may want 90. This only moves the warning — stock that has passed its expiry date can never be sold, whatever this is set to.
            </div>
          </div>

          <button type="submit" className="settings-btn-primary">
            Save
          </button>
        </form>
      </div>

      {/* 2. Stock on the Prescription Pad Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Stock on the prescription pad</h2>
        <p className="settings-card-sub">
          Whether doctors can see what your pharmacy has in stock while writing a prescription.
        </p>

        <form onSubmit={handleSaveStock}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: '3px' }}
                checked={showStockWhilePrescribing}
                onChange={e => setShowStockWhilePrescribing(e.target.checked)}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Show pharmacy stock while prescribing
                </span>
                <div className="settings-helper-text" style={{ marginTop: '4px' }}>
                  Adds an availability badge to each medicine, how many days of the course you can fill, and one-tap alternatives from the same generic when something is out of stock. Nothing is reserved, and none of it is printed on the prescription.
                </div>
                <div className="settings-helper-text" style={{ marginTop: '6px' }}>
                  When unchecked, the pad behaves as if you had no pharmacy — the stock figures are not sent to the browser at all.
                </div>
              </div>
            </label>
          </div>

          <button type="submit" className="settings-btn-primary">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};
