import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Trash2, CheckSquare, Square, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { RecallPatient } from '../types';

export const RecallView: React.FC = () => {
  const {
    diagnosticTests,
    recallRules,
    addRecallRule,
    deleteRecallRule,
    addCommonRecallRules,
    showToast
  } = useApp();

  const [testSearch, setTestSearch] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [intervalDays, setIntervalDays] = useState(90);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  // Filter available tests for custom rule dropdown
  const filteredTests = useMemo(() => {
    const term = testSearch.trim().toLowerCase();
    if (!term) return diagnosticTests;
    return diagnosticTests.filter(t => t.name.toLowerCase().includes(term));
  }, [diagnosticTests, testSearch]);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) {
      showToast('Please select a diagnostic test to add recall rule');
      return;
    }
    const test = diagnosticTests.find(t => t.id === selectedTestId);
    if (!test) return;

    if (recallRules.some(r => r.testName.toLowerCase() === test.name.toLowerCase())) {
      showToast(`A recall rule for "${test.name}" already exists!`);
      return;
    }

    addRecallRule({
      testId: test.id,
      testName: test.name,
      intervalDays: Number(intervalDays) || 90
    });
    setSelectedTestId('');
    setTestSearch('');
  };

  // Mock due patients based on active rules
  const duePatients: RecallPatient[] = useMemo(() => {
    if (recallRules.length === 0) return [];
    
    // Sample patients with tests that match active recall rules
    const samplePool: RecallPatient[] = [
      {
        id: 'rec-1',
        patientName: 'Md. Rafiqul Islam',
        phone: '01718-123456',
        testName: 'HbA1c (Glycated Hemoglobin)',
        lastDoneDate: '2026-05-10',
        overdueDays: 29,
        lastRemindedDate: undefined
      },
      {
        id: 'rec-2',
        patientName: 'Begum Rokeya Akter',
        phone: '01911-987654',
        testName: 'Lipid Profile',
        lastDoneDate: '2026-02-15',
        overdueDays: 24,
        lastRemindedDate: undefined
      },
      {
        id: 'rec-3',
        patientName: 'Kazi Nazrul Islam',
        phone: '01819-234567',
        testName: 'Complete Blood Count (CBC) with ESR',
        lastDoneDate: '2026-06-20',
        overdueDays: 18,
        lastRemindedDate: undefined
      },
      {
        id: 'rec-4',
        patientName: 'Fatema Khatun',
        phone: '01612-345678',
        testName: 'Thyroid Stimulating Hormone (TSH)',
        lastDoneDate: '2026-05-28',
        overdueDays: 11,
        lastRemindedDate: undefined
      }
    ];

    const activeTestNames = new Set(recallRules.map(r => r.testName.toLowerCase()));
    return samplePool.filter(p => activeTestNames.has(p.testName.toLowerCase()));
  }, [recallRules]);

  const toggleSelectAll = () => {
    if (selectedPatientIds.length === duePatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(duePatients.map(p => p.id));
    }
  };

  const toggleSelectPatient = (id: string) => {
    setSelectedPatientIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportExcel = () => {
    if (duePatients.length === 0) {
      showToast('No overdue patients to export');
      return;
    }
    const headers = ['Patient', 'Phone', 'Test', 'Last Done', 'Overdue Days', 'Last Reminded'];
    const rows = duePatients.map(p => [
      `"${p.patientName}"`,
      `"${p.phone}"`,
      `"${p.testName}"`,
      p.lastDoneDate,
      p.overdueDays,
      p.lastRemindedDate || 'Never'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carepulse_patient_recall_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Patient recall list downloaded as Excel/CSV');
  };

  const handleSendWhatsApp = () => {
    if (selectedPatientIds.length === 0) {
      showToast('Please select at least one patient to message');
      return;
    }
    showToast('WhatsApp messaging is not enabled for this account. Contact system administrator.');
  };

  return (
    <div className="recall-page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f2922', margin: '0 0 6px 0' }}>
          Patient Recall
        </h1>
        <p style={{ fontSize: '13.5px', color: '#4d6b63', margin: 0, maxWidth: '980px', lineHeight: 1.5 }}>
          Patients whose test is due again, from the tests you choose and the interval you set. A patient is listed once their last result is older than the interval, and not again for 30 days after a reminder.
        </p>
      </div>

      {/* 1. Recall Rules Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Recall rules
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              &ldquo;This test is due again after N days.&rdquo; One rule per test.
            </p>
          </div>
          <button
            type="button"
            className="settings-btn-secondary"
            onClick={addCommonRecallRules}
            title="Add standard 60, 90 & 180 day clinical intervals"
          >
            Add the common ones
          </button>
        </div>

        {/* Existing Rules List */}
        {recallRules.length === 0 ? (
          <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            No rules yet — add the common ones, or pick a test below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {recallRules.map(rule => (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#1e293b'
                }}
              >
                <span style={{ fontWeight: 600 }}>{rule.testName}</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>• {rule.intervalDays}d</span>
                <button
                  type="button"
                  onClick={() => deleteRecallRule(rule.id)}
                  title="Remove rule"
                  style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rule Builder Form */}
        <form onSubmit={handleAddRule}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              TEST
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type to filter..."
              value={testSearch}
              onChange={e => setTestSearch(e.target.value)}
              style={{ height: '38px', fontSize: '13px' }}
            />
            <select
              className="form-control"
              value={selectedTestId}
              onChange={e => setSelectedTestId(e.target.value)}
              style={{ height: '40px', fontSize: '13px' }}
            >
              <option value="">Choose a test...</option>
              {filteredTests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (৳{t.price})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                DUE AGAIN AFTER
              </span>
              <input
                type="number"
                min="1"
                max="730"
                className="form-control"
                style={{ width: '80px', height: '38px', textAlign: 'center' }}
                value={intervalDays}
                onChange={e => setIntervalDays(Number(e.target.value) || 90)}
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>days</span>
            </div>

            <button
              type="submit"
              className="settings-btn-primary"
              style={{ height: '38px', padding: '0 20px' }}
            >
              Add rule
            </button>
          </div>
        </form>
      </div>

      {/* 2. Due Now Patients Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Due now — {duePatients.length}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Most overdue first. Tick who to message, or download the list to phone them.
            </p>
          </div>

          <button
            type="button"
            className="settings-btn-secondary"
            onClick={handleExportExcel}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={15} color="#059669" />
            Excel
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            {selectedPatientIds.length} selected
          </span>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={selectedPatientIds.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: selectedPatientIds.length > 0 ? '#0f172a' : '#94a3b8',
              color: '#ffffff',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: selectedPatientIds.length > 0 ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'all 0.15s'
            }}
          >
            Send WhatsApp reminders
          </button>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            WhatsApp messaging is not enabled for this account
          </span>
        </div>

        {/* Due Patients Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={duePatients.length > 0 && selectedPatientIds.length === duePatients.length}
                    onChange={toggleSelectAll}
                    disabled={duePatients.length === 0}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>PATIENT</th>
                <th>PHONE</th>
                <th>TEST</th>
                <th>LAST DONE</th>
                <th>OVERDUE</th>
                <th>LAST REMINDED</th>
              </tr>
            </thead>
            <tbody>
              {duePatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', fontSize: '13.5px' }}>
                    Nobody is due right now — add a rule above, or wait for one to mature.
                  </td>
                </tr>
              ) : (
                duePatients.map(patient => {
                  const isSelected = selectedPatientIds.includes(patient.id);
                  return (
                    <tr key={patient.id} style={{ background: isSelected ? '#f0fdfa' : undefined }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPatient(patient.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{patient.patientName}</strong>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                        {patient.phone}
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{patient.testName}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{patient.lastDoneDate}</td>
                      <td>
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>
                          {patient.overdueDays} days
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>
                        {patient.lastRemindedDate || 'Never'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
