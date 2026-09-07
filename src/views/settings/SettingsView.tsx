import React, { useState } from 'react';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { ReportsSettingsTab } from './ReportsSettingsTab';
import { ReportFooterSettingsTab } from './ReportFooterSettingsTab';
import { PharmacySettingsTab } from './PharmacySettingsTab';
import { WhatsAppSettingsTab } from './WhatsAppSettingsTab';

export type SettingsTab = 'profile' | 'reports' | 'report-footer' | 'pharmacy' | 'whatsapp';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="settings-header">
        <h1 className="settings-header-title">Diagnostic Center Settings</h1>
        <p className="settings-header-sub">
          Configure your center profile, contact, legal registration, and report preferences.
        </p>
      </div>

      {/* Pill Navigation Bar */}
      <div className="settings-pill-nav">
        <button
          type="button"
          className={`settings-pill-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          type="button"
          className={`settings-pill-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Report & Invoice
        </button>
        <button
          type="button"
          className={`settings-pill-btn ${activeTab === 'report-footer' ? 'active' : ''}`}
          onClick={() => setActiveTab('report-footer')}
        >
          Report Footer
        </button>
        <button
          type="button"
          className={`settings-pill-btn ${activeTab === 'pharmacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacy')}
        >
          Pharmacy
        </button>
        <button
          type="button"
          className={`settings-pill-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          WhatsApp
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'profile' && <ProfileSettingsTab />}
      {activeTab === 'reports' && <ReportsSettingsTab />}
      {activeTab === 'report-footer' && <ReportFooterSettingsTab />}
      {activeTab === 'pharmacy' && <PharmacySettingsTab />}
      {activeTab === 'whatsapp' && <WhatsAppSettingsTab />}
    </div>
  );
};
