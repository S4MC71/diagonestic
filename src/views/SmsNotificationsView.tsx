import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SmsConfig, SmsLog } from '../types';
import {
  MessageSquare,
  Send,
  CreditCard,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Search,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';

export const SmsNotificationsView: React.FC = () => {
  const {
    smsConfig,
    updateSmsConfig,
    smsLogs,
    sendSmsNotification,
    tenantSettings,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'logs' | 'config' | 'templates'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Quick SMS modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [customPhone, setCustomPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Config states
  const [enabled, setEnabled] = useState(smsConfig.enabled ?? true);
  const [provider, setProvider] = useState(smsConfig.provider);
  const [apiKey, setApiKey] = useState(smsConfig.apiKey);
  const [senderId, setSenderId] = useState(smsConfig.senderId);
  const [showApiKey, setShowApiKey] = useState(false);

  // Triggers
  const [notifyReport, setNotifyReport] = useState(smsConfig.notifyOnReportReady);
  const [notifyAppt, setNotifyAppt] = useState(smsConfig.notifyOnAppointment);
  const [notifyDue, setNotifyDue] = useState(smsConfig.notifyOnDuePayment);
  const [notifyBooking, setNotifyBooking] = useState(smsConfig.notifyOnBookingConfirm);

  // Templates
  const [tplReport, setTplReport] = useState(smsConfig.templateReportReady);
  const [tplAppt, setTplAppt] = useState(smsConfig.templateAppointment);
  const [tplDue, setTplDue] = useState(smsConfig.templateDuePayment);

  const handleSaveConfig = () => {
    updateSmsConfig({
      enabled,
      provider,
      apiKey,
      senderId,
      notifyOnReportReady: notifyReport,
      notifyOnAppointment: notifyAppt,
      notifyOnDuePayment: notifyDue,
      notifyOnBookingConfirm: notifyBooking,
      templateReportReady: tplReport,
      templateAppointment: tplAppt,
      templateDuePayment: tplDue
    });
    showToast('SMS Gateway settings updated successfully!');
  };

  const handleSendCustomSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhone.trim() || !customMessage.trim()) {
      showToast('Please enter recipient phone and message');
      return;
    }
    const success = sendSmsNotification(customPhone.trim(), customMessage.trim(), 'GENERAL');
    if (success) {
      setShowSendModal(false);
      setCustomPhone('');
      setCustomMessage('');
    }
  };

  const filteredLogs = smsLogs.filter(log => {
    const matchesSearch = !searchQuery ||
      log.phone.includes(searchQuery) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            SMS Notifications & Gateway
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Automated SMS alerts for test report readiness, doctor appointments, and patient billing
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => showToast('Redirecting to SSL Wireless Recharge Portal...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <CreditCard size={15} />
            <span>Recharge Credits</span>
          </button>

          <button
            onClick={() => setShowSendModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
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
            <Send size={15} />
            <span>Send Quick SMS</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>SMS Credit Balance</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {smsConfig.balance} Credits
          </div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
            ~{Math.floor(smsConfig.balance / 0.5)} SMS remaining (@ ৳0.50/SMS)
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Delivered Successfully</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {smsLogs.filter(l => l.status === 'DELIVERED').length}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>99.4% Delivery rate</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Gateway Provider</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '10px' }}>
            {smsConfig.provider.toUpperCase().replace('_', ' ')}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Sender: {smsConfig.senderId}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Triggers</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>4</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Report, Serial, Due, Booking</div>
        </div>
      </div>

      {/* Tabs */}
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
          { key: 'logs', label: 'SMS Delivery Logs', icon: Clock },
          { key: 'templates', label: 'Message Templates', icon: MessageSquare },
          { key: 'config', label: 'Gateway Configuration', icon: Settings },
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

      {/* TAB 1: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter phone or message..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#fff', outline: 'none' }}
              >
                <option value="ALL">All Types</option>
                <option value="REPORT_READY">Report Ready</option>
                <option value="APPOINTMENT_REMINDER">Appointment</option>
                <option value="PAYMENT_DUE">Payment Due</option>
                <option value="BOOKING_CONFIRM">Booking Confirm</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {filteredLogs.length} logged SMS events
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                  <th style={{ padding: '12px 20px' }}>Recipient Phone</th>
                  <th style={{ padding: '12px 16px' }}>Notification Type</th>
                  <th style={{ padding: '12px 16px' }}>Message Body</th>
                  <th style={{ padding: '12px 16px' }}>Provider</th>
                  <th style={{ padding: '12px 16px' }}>Cost</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} style={{ color: '#059669' }} />
                        <span>{log.phone}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        color: '#475569'
                      }}>
                        {log.type || 'GENERAL'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '380px', lineHeight: 1.4 }}>
                      {log.message}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                      {log.provider || 'SSL Wireless'}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      ৳{log.cost || 0.50}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: log.status === 'DELIVERED' ? '#ecfdf5' : '#fee2e2',
                        color: log.status === 'DELIVERED' ? '#059669' : '#dc2626'
                      }}>
                        {log.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right', color: '#94a3b8', fontSize: '11px' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Automated Notification Templates
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Use available dynamic placeholders: <code>{'{patient_name}'}</code>, <code>{'{center_name}'}</code>, <code>{'{report_link}'}</code>, <code>{'{doctor_name}'}</code>, <code>{'{serial_no}'}</code>, <code>{'{invoice_no}'}</code>
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                1. Lab Report Ready Notification Template
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{tplReport.length} characters</span>
            </div>
            <textarea
              rows={3}
              value={tplReport}
              onChange={e => setTplReport(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                2. Doctor Appointment Confirmation Template
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{tplAppt.length} characters</span>
            </div>
            <textarea
              rows={3}
              value={tplAppt}
              onChange={e => setTplAppt(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                3. Invoice Due Payment Reminder Template
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{tplDue.length} characters</span>
            </div>
            <textarea
              rows={3}
              value={tplDue}
              onChange={e => setTplDue(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <button
              onClick={handleSaveConfig}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              <span>Save Templates</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION */}
      {activeTab === 'config' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Master Center SMS Service Activation Banner */}
          <div style={{
            background: enabled ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${enabled ? '#a7f3d0' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: enabled ? '#059669' : '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: enabled ? '#065f46' : '#991b1b' }}>
                  Center SMS Service: {enabled ? 'ACTIVE (চালু)' : 'DISABLED (বন্ধ)'}
                </div>
                <div style={{ fontSize: '12px', color: enabled ? '#047857' : '#b91c1c', marginTop: '2px' }}>
                  {enabled
                    ? 'All patient notifications (Token slip SMS, report alerts, reminders) are actively operational.'
                    : 'SMS sending is disabled for this center. Reception walk-in won\'t trigger SMS charges.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: enabled ? '#dc2626' : '#059669',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {enabled ? 'Disable SMS Service' : 'Enable SMS Service'}
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              SMS Gateway Integration
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Connect your BTRC-approved SMS aggregator account to send non-masking and masking SMS
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                SMS Gateway Provider
              </label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value as any)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
              >
                <option value="ssl_wireless">SSL Wireless (SSL Commerz SMS)</option>
                <option value="greenweb">Greenweb Bangladesh</option>
                <option value="twilio">Twilio Global</option>
                <option value="mock">Sandbox Testing Gateway</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Sender ID / Masking Name
              </label>
              <input
                type="text"
                placeholder="e.g. JHALAKATHI"
                value={senderId}
                onChange={e => setSenderId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              API Key / Auth Token
            </label>
            <div style={{ position: 'relative', maxWidth: '500px' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Trigger Toggles */}
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Automated Notification Triggers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Report Ready Alert — Send download link immediately when all test parameters are verified', checked: notifyReport, set: setNotifyReport },
                { label: 'Doctor Appointment Confirmation — Send token & chamber serial on booking', checked: notifyAppt, set: setNotifyAppt },
                { label: 'Payment Due Alert — Notify patient if invoice has remaining balance', checked: notifyDue, set: setNotifyDue },
                { label: 'Online Booking Received — Confirm patient public website booking request', checked: notifyBooking, set: setNotifyBooking },
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    checked={t.checked}
                    onChange={e => t.set(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleSaveConfig}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              <span>Save Gateway Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK SEND CUSTOM SMS MODAL */}
      {showSendModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Send Instant SMS</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Send direct notification to any patient phone number</div>
              </div>
              <button onClick={() => setShowSendModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSendCustomSms} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Recipient Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={customPhone}
                  onChange={e => setCustomPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Message Text *</label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{customMessage.length} chars (1 SMS unit)</span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message to patient..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                Est. cost: ৳0.50 per SMS · Sender ID: <strong>{smsConfig.senderId}</strong>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowSendModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Send size={15} />
                  <span>Send SMS Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
