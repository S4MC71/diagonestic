import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TenantWebsite } from '../types';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  Save,
  Palette,
  FileText,
  Settings,
  Search,
  Share2,
  QrCode,
  AlertCircle,
  Eye,
  Smartphone,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

export const WebsiteCMSView: React.FC = () => {
  const { tenantWebsite, updateTenantWebsite, tenantSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'services' | 'seo' | 'domain'>('overview');

  // Form states
  const [isPublished, setIsPublished] = useState(tenantWebsite.isPublished);
  const [acceptBookings, setAcceptBookings] = useState(tenantWebsite.acceptBookings);
  const [theme, setTheme] = useState(tenantWebsite.theme || 'serene-emerald');
  const [primaryColor, setPrimaryColor] = useState(tenantWebsite.primaryColor || '#059669');
  const [accentColor, setAccentColor] = useState(tenantWebsite.accentColor || '#0284c7');
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'bn'>(tenantWebsite.primaryLanguage || 'bn');
  const [tagline, setTagline] = useState(tenantWebsite.tagline || '');
  const [aboutText, setAboutText] = useState(tenantWebsite.aboutText || '');
  const [announcement, setAnnouncement] = useState(tenantWebsite.announcement || '');
  const [announcementType, setAnnouncementType] = useState(tenantWebsite.announcementType || 'info');
  const [facebookUrl, setFacebookUrl] = useState(tenantWebsite.facebookUrl || '');
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState(tenantWebsite.googleBusinessUrl || '');
  const [customDomain, setCustomDomain] = useState(tenantWebsite.customDomain || '');
  const [metaTitle, setMetaTitle] = useState(tenantWebsite.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(tenantWebsite.metaDescription || '');
  const [showTestPrices, setShowTestPrices] = useState(tenantWebsite.showTestPrices ?? true);
  const [showConsultationFees, setShowConsultationFees] = useState(tenantWebsite.showConsultationFees ?? true);

  const [copiedLink, setCopiedLink] = useState(false);

  const websiteUrl = `https://${tenantSettings.slug || 'clinic'}.carepulse.app`;

  const handleSave = () => {
    updateTenantWebsite({
      isPublished,
      acceptBookings,
      theme,
      primaryColor,
      accentColor,
      primaryLanguage,
      tagline,
      aboutText,
      announcement,
      announcementType,
      facebookUrl,
      googleBusinessUrl,
      customDomain,
      metaTitle,
      metaDescription,
      showTestPrices,
      showConsultationFees
    });
    showToast('Public website settings saved and published!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast('Public website link copied to clipboard!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Public Website CMS & Online Portal
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Build, brand, and publish your diagnostic center's patient portal with online booking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => window.open(websiteUrl, '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={15} />
            <span>Open Website</span>
          </button>

          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
            }}
          >
            <Save size={16} />
            <span>Save & Publish</span>
          </button>
        </div>
      </div>

      {/* Website Status & Domain Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 10px 25px rgba(15,23,42,0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: isPublished ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              border: `1px solid ${isPublished ? '#10b981' : '#ef4444'}`,
              color: isPublished ? '#34d399' : '#f87171',
              fontSize: '11px',
              fontWeight: 800
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPublished ? '#10b981' : '#ef4444' }} />
              {isPublished ? 'PUBLIC WEBSITE LIVE' : 'DRAFT MODE (HIDDEN)'}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              SSL Secured · Fast Global CDN
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '10px 0 4px 0', color: '#fff' }}>
            {websiteUrl}
          </h2>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            {customDomain ? `Custom Domain linked: ${customDomain}` : 'Default CarePulse Subdomain active'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '8px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        {[
          { key: 'overview', label: 'Overview & Theme', icon: Palette },
          { key: 'content', label: 'Story & Content', icon: FileText },
          { key: 'services', label: 'Services & Bookings', icon: Smartphone },
          { key: 'seo', label: 'SEO & Google Snippet', icon: Search },
          { key: 'domain', label: 'Custom Domain', icon: Globe },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: isActive ? '#059669' : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & THEME */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Publishing & Visibility
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>Public Website Status</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Make website accessible to patients over internet</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>Accept Online Patient Bookings</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Allow patients to book tests & doctor serials online</div>
                </div>
                <input
                  type="checkbox"
                  checked={acceptBookings}
                  onChange={e => setAcceptBookings(e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Primary Website Language
                </label>
                <select
                  value={primaryLanguage}
                  onChange={e => setPrimaryLanguage(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  <option value="bn">বাংলা (Bengali - Default for BD)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Color Theme & Brand Palette
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Preset Clinical Theme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { id: 'serene-emerald', label: 'Serene Emerald', color: '#059669', sec: '#10b981' },
                    { id: 'ocean-blue', label: 'Clinical Ocean', color: '#0284c7', sec: '#38bdf8' },
                    { id: 'royal-purple', label: 'Premium Indigo', color: '#6366f1', sec: '#8b5cf6' },
                    { id: 'medical-teal', label: 'Medical Teal', color: '#0d9488', sec: '#14b8a6' },
                  ].map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setPrimaryColor(t.color);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: theme === t.id ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        background: theme === t.id ? '#f8fafc' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Primary Color (Hex)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Accent Color (Hex)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORY & CONTENT */}
      {activeTab === 'content' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Hero Tagline / Banner Headline
            </label>
            <input
              type="text"
              placeholder="e.g. আপনার সুস্থতাই আমাদের অঙ্গীকার — সর্বাধুনিক প্রযুক্তির নির্ভুল ডায়াগনস্টিক"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              About Us / Diagnostic Center Story
            </label>
            <textarea
              rows={4}
              placeholder="Write about your clinic's mission, experienced doctors, laboratory technology, and accreditations..."
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', lineHeight: 1.5 }}
            />
          </div>

          {/* Announcement Banner */}
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Emergency Announcement Banner (Top of Website)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
              <input
                type="text"
                placeholder="e.g. ডেঙ্গু প্রতিরোধে সকল এনএস১ (NS1) টেস্টে ২০% ছাড় দেওয়া হচ্ছে।"
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />

              <select
                value={announcementType}
                onChange={e => setAnnouncementType(e.target.value as any)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="success">Offer / Success (Green)</option>
              </select>
            </div>
          </div>

          {/* Social Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Facebook Page URL
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/yourdiagnostic"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Google Business / Maps URL
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={googleBusinessUrl}
                onChange={e => setGoogleBusinessUrl(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & BOOKINGS */}
      {activeTab === 'services' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Public Catalog & Booking Permissions
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
            Control what clinical pricing and scheduling information patients can see online
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>Display Diagnostic Test Prices Publicly</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Show test prices in BDT on public service catalog</div>
            </div>
            <input
              type="checkbox"
              checked={showTestPrices}
              onChange={e => setShowTestPrices(e.target.checked)}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>Display Doctor Consultation Fees Publicly</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Show specialist consultation fee (BDT) on chamber schedule</div>
            </div>
            <input
              type="checkbox"
              checked={showConsultationFees}
              onChange={e => setShowConsultationFees(e.target.checked)}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: SEO & GOOGLE PREVIEW */}
      {activeTab === 'seo' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Search Engine Optimization (SEO)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Optimize your center to rank on top when patients search for diagnostic tests or doctors in your district.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Meta Page Title
            </label>
            <input
              type="text"
              placeholder="e.g. ঝালকাঠি ডায়াগনস্টিক সেন্টার — নির্ভুল টেস্ট ও বিশেষজ্ঞ ডাক্তার সিরিয়াল"
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Meta Description
              </label>
              <span style={{ fontSize: '11px', color: metaDescription.length > 160 ? '#ef4444' : '#64748b' }}>
                {metaDescription.length}/160 characters
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Provide a concise description of your diagnostic services, phone number, and location..."
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          {/* Google Snippet Live Card Preview */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
              Google Search Result Live Preview:
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
              <div style={{ fontSize: '12px', color: '#202124' }}>
                {websiteUrl}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a0dab', marginTop: '4px', cursor: 'pointer' }}>
                {metaTitle || `${tenantSettings.name} — Diagnostic Services`}
              </div>
              <div style={{ fontSize: '13px', color: '#4d5156', marginTop: '4px', lineHeight: 1.4 }}>
                {metaDescription || `${tenantSettings.name} in ${tenantSettings.district}. Best pathology, blood tests, and doctor appointments.`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOM DOMAIN */}
      {activeTab === 'domain' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Connect Custom Domain
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Use your own domain name (e.g. www.yourclinic.com) instead of the default subdomain.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Your Custom Domain
            </label>
            <input
              type="text"
              placeholder="e.g. jhalakathidiagnostic.com"
              value={customDomain}
              onChange={e => setCustomDomain(e.target.value)}
              style={{ width: '100%', maxWidth: '450px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '650px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              DNS Configuration Instructions:
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              Log in to your domain registrar (e.g. Namecheap, GoDaddy, DianaHost) and add the following CNAME record:
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Host / Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Points To / Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 700 }}>CNAME</td>
                  <td style={{ padding: '8px 12px' }}>www (or @)</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>cname.carepulse.app</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
