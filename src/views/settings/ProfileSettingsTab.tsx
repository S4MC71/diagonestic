import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Upload, Image as ImageIcon, Check } from 'lucide-react';

export const ProfileSettingsTab: React.FC = () => {
  const { tenantSettings, updateTenantSettings, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State initialized from TenantSettings
  const [displayName, setDisplayName] = useState(tenantSettings.name || 'LifeCare Diagnostic Center');
  const [slug] = useState(tenantSettings.slug || 'lifecare-diagnostic-center');
  const [establishedYear, setEstablishedYear] = useState(tenantSettings.established || tenantSettings.establishedYear || '2020');
  const [website, setWebsite] = useState(tenantSettings.website || 'https://lifecarediagnostic.com.bd');

  const [address, setAddress] = useState(tenantSettings.address || 'Medical College Road, Central Square');
  const [thana, setThana] = useState(tenantSettings.thana || 'Central Sadar');
  const [district, setDistrict] = useState(tenantSettings.district || 'Dhaka');
  const [division, setDivision] = useState(tenantSettings.division || 'Dhaka');
  const [postCode, setPostCode] = useState(tenantSettings.postCode || '1205');

  const [phone, setPhone] = useState(tenantSettings.phone || '01834259899');
  const [phone2, setPhone2] = useState(tenantSettings.phone2 || '01894422170');
  const [hotline, setHotline] = useState(tenantSettings.hotline || '01894422170');
  const [email, setEmail] = useState(tenantSettings.email || 'samubincoc1@gmail.com');

  const [enableHomeCollection, setEnableHomeCollection] = useState(tenantSettings.enableHomeCollection ?? true);
  const [emailYesterdaySummary, setEmailYesterdaySummary] = useState(true);
  const [alsoSendTo, setAlsoSendTo] = useState('accounts@lifecarediagnostic.com, manager@lifecarediagnostic.com');

  const [tradeLicense, setTradeLicense] = useState(tenantSettings.tradeLicenseNo || 'TRAD/DHK/2024/0982');
  const [bin, setBin] = useState(tenantSettings.binNo || '002938471-0402');
  const [tin, setTin] = useState(tenantSettings.tinNo || '592817402819');
  const [drugLicense, setDrugLicense] = useState(tenantSettings.drugLicenseNo || 'DL-DHK-8921');

  const [logoPreview, setLogoPreview] = useState<string | null>(tenantSettings.logoUrl || null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      name: displayName,
      establishedYear,
      website,
      address,
      thana,
      district,
      division,
      postCode,
      phone,
      phone2,
      hotline,
      email,
      enableHomeCollection,
      tradeLicenseNo: tradeLicense,
      binNo: bin,
      tinNo: tin,
      drugLicenseNo: drugLicense,
      logoUrl: logoPreview || tenantSettings.logoUrl
    });
    showToast('Profile settings saved successfully');
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        showToast('Logo image loaded. Click "Save Profile" to apply.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-profile-layout">
      {/* Left Column: Form Cards */}
      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Identity Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Identity</h2>
          <div className="settings-grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dhaka Diagnostic & Imaging Center"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock size={12} color="#64748b" /> URL Slug (read-only)
              </label>
              <input
                type="text"
                className="form-control"
                style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                value={slug}
                readOnly
              />
            </div>
          </div>

          <div className="settings-grid-2">
            <div className="form-group">
              <label className="form-label">Established Year</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2010"
                value={establishedYear}
                onChange={e => setEstablishedYear(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://yourcenter.com.bd"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. Address Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Address</h2>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Full Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="House, Road, Area"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="settings-grid-4">
            <div className="form-group">
              <label className="form-label">Upazila / Thana</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Gulshan"
                value={thana}
                onChange={e => setThana(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dhaka"
                value={district}
                onChange={e => setDistrict(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Division</label>
              <select className="form-control" value={division} onChange={e => setDivision(e.target.value)}>
                <option value="">Select Division</option>
                <option value="Barishal">Barishal</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Khulna">Khulna</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Post Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 1212"
                value={postCode}
                onChange={e => setPostCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Contact Information Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Contact Information</h2>
          <p className="settings-card-sub">
            How patients reach you. These details are printed on your invoices and reports and shown on your public pages — the system does not send anything to them.
          </p>

          <div className="settings-grid-3" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Primary Phone *</label>
              <input
                type="text"
                className="form-control"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional"
                value={phone2}
                onChange={e => setPhone2(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hotline / Third Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional"
                value={hotline}
                onChange={e => setHotline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Public Contact Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="contact@yourcenter.com.bd"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="settings-helper-text">
              Printed on reports so patients can reach you. It does not receive system emails — for that, use “Also send to” under Email Notifications below.
            </div>
          </div>
        </div>

        {/* 4. Home Collection Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Home Collection</h2>
          <p className="settings-card-sub">
            Allow patients to open your public booking page and request sample collection from home.
          </p>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ marginTop: '3px' }}
              checked={enableHomeCollection}
              onChange={e => setEnableHomeCollection(e.target.checked)}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Enable Home Collection</span>
              <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                When disabled, your public booking link will show that home collection is currently unavailable.
              </div>
            </div>
          </label>
        </div>

        {/* 5. Email Notifications Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Email Notifications</h2>
          <p className="settings-card-sub">
            Automatic emails to your admins: the morning summary of yesterday’s money, and a warning before your subscription expires.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: '3px' }}
                checked={emailYesterdaySummary}
                onChange={e => setEmailYesterdaySummary(e.target.checked)}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Email me yesterday’s income and expenses
                </span>
                <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                  Sent only on days with activity, so a quiet day means no email. The figures match your cash book exactly, cancelled invoices excluded.
                </div>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Also send to</label>
            <div className="settings-helper-text" style={{ marginBottom: '6px', marginTop: 0 }}>
              Your admin users always receive these, whether entered here or not. Add any other addresses you want them sent to, separated by commas.
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="office@example.com, accounts@example.com"
              value={alsoSendTo}
              onChange={e => setAlsoSendTo(e.target.value)}
            />
            <div className="settings-helper-text" style={{ marginTop: '6px' }}>
              The summary carries the day’s takings — share it only with people who need to see the figures.
            </div>
          </div>
        </div>

        {/* 6. Legal & Regulatory Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">Legal & Regulatory (Bangladesh)</h2>
          <p className="settings-card-sub">
            Printed on invoices and public receipts where applicable.
          </p>

          <div className="settings-grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Trade License No.</label>
              <input
                type="text"
                className="form-control"
                placeholder="Trade License Number"
                value={tradeLicense}
                onChange={e => setTradeLicense(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">BIN (Business Identification No.)</label>
              <input
                type="text"
                className="form-control"
                placeholder="BIN Number"
                value={bin}
                onChange={e => setBin(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-grid-2">
            <div className="form-group">
              <label className="form-label">TIN (Tax Identification No.)</label>
              <input
                type="text"
                className="form-control"
                placeholder="TIN Number"
                value={tin}
                onChange={e => setTin(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drug License No. (if applicable)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Drug License Number"
                value={drugLicense}
                onChange={e => setDrugLicense(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div>
          <button type="submit" className="settings-btn-primary">
            Save Profile
          </button>
        </div>
      </form>

      {/* Right Column: Logo Upload Card */}
      <div>
        <div className="settings-card" style={{ position: 'sticky', top: '20px' }}>
          <h2 className="settings-card-title">Logo</h2>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
            CENTER LOGO
          </div>

          <div
            style={{
              width: '100%',
              height: '140px',
              borderRadius: '8px',
              border: '2px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              marginBottom: '14px',
              overflow: 'hidden'
            }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Center Logo" style={{ maxHeight: '100px', maxWidth: '90%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <ImageIcon size={28} style={{ margin: '0 auto 6px auto', display: 'block' }} />
                <span style={{ fontSize: '12px' }}>No logo uploaded</span>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoFile}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="settings-btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> Upload Logo
          </button>

          <div className="settings-helper-text" style={{ textAlign: 'center', marginTop: '10px' }}>
            PNG, JPG or SVG · max 5 MB. Shown on public report pages.
          </div>
        </div>
      </div>
    </div>
  );
};
