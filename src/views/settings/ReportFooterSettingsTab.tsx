import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, ChevronUp, Upload, Check } from 'lucide-react';

interface DeptFooterState {
  department: string;
  technicianShow: boolean;
  technicianName: string;
  technicianQualification: string;
  technicianSignatureUrl?: string;
  doctorShow: boolean;
  doctorName: string;
  doctorQualification: string;
  doctorSignatureUrl?: string;
}

const DEFAULT_11_DEPARTMENTS: DeptFooterState[] = [
  {
    department: 'BIOCHEMISTRY',
    technicianShow: true,
    technicianName: 'Md. Al-Amin',
    technicianQualification: 'B.Sc (Medical Technology), Dhaka University\nSpecialized in Automated Clinical Chemistry',
    doctorShow: true,
    doctorName: 'Dr. Nusrat Jahan',
    doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU\nAssistant Professor, Biochemistry'
  },
  {
    department: 'IMMUNOLOGY',
    technicianShow: true,
    technicianName: 'Farzana Parvin',
    technicianQualification: 'Diploma in Medical Technology (Laboratory)\nState Medical Faculty of Bangladesh',
    doctorShow: true,
    doctorName: 'Dr. Nusrat Jahan',
    doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU'
  },
  {
    department: 'HORMONE',
    technicianShow: true,
    technicianName: 'Md. Al-Amin',
    technicianQualification: 'B.Sc in Laboratory Medicine',
    doctorShow: true,
    doctorName: 'Dr. Kazi Mahfuzur Rahman',
    doctorQualification: 'MBBS, MD (Endocrinology & Metabolism), BIRDEM'
  },
  {
    department: 'HAEMATOLOGY',
    technicianShow: true,
    technicianName: 'Farzana Parvin',
    technicianQualification: 'Diploma in Medical Technology (Laboratory)',
    doctorShow: true,
    doctorName: 'Prof. Dr. M. A. Rahman',
    doctorQualification: 'MBBS, FCPS (Haematology)\nConsultant Haematologist'
  },
  {
    department: 'MICROBIOLOGY',
    technicianShow: true,
    technicianName: 'Md. Masum Billah',
    technicianQualification: 'B.Sc (Honours), M.Sc (Microbiology), DU',
    doctorShow: true,
    doctorName: 'Dr. Shahreen Akhter',
    doctorQualification: 'MBBS, M.Phil (Microbiology), BSMMU'
  },
  {
    department: 'SEROLOGY',
    technicianShow: true,
    technicianName: 'Farzana Parvin',
    technicianQualification: 'Diploma in Medical Technology (Laboratory)',
    doctorShow: true,
    doctorName: 'Dr. Nusrat Jahan',
    doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU'
  },
  {
    department: 'PATHOLOGY',
    technicianShow: true,
    technicianName: 'Md. Al-Amin',
    technicianQualification: 'B.Sc (Medical Technology)',
    doctorShow: true,
    doctorName: 'Dr. K. M. Abdullah',
    doctorQualification: 'MBBS, DCP (Clinical Pathology), BSMMU\nConsultant Pathologist'
  },
  {
    department: 'RADIOLOGY',
    technicianShow: true,
    technicianName: 'Md. Kamal Hossain',
    technicianQualification: 'Diploma in Radiography & Imaging Technology',
    doctorShow: true,
    doctorName: 'Dr. Sayeedul Islam',
    doctorQualification: 'MBBS, FCPS (Radiology & Imaging)\nSenior Consultant Radiologist'
  },
  {
    department: 'CLINICAL PATHOLOGY',
    technicianShow: true,
    technicianName: 'Md. Al-Amin',
    technicianQualification: 'B.Sc (Medical Technology)',
    doctorShow: true,
    doctorName: 'Dr. K. M. Abdullah',
    doctorQualification: 'MBBS, DCP (Clinical Pathology), BSMMU'
  },
  {
    department: 'USG',
    technicianShow: false,
    technicianName: '',
    technicianQualification: '',
    doctorShow: true,
    doctorName: 'Dr. Sayeedul Islam',
    doctorQualification: 'MBBS, FCPS (Radiology & Imaging), Sonologist'
  },
  {
    department: 'OTHER',
    technicianShow: true,
    technicianName: 'Farzana Parvin',
    technicianQualification: 'Diploma in Medical Technology',
    doctorShow: true,
    doctorName: 'Dr. K. M. Abdullah',
    doctorQualification: 'MBBS, DCP (Clinical Pathology)'
  }
];

export const ReportFooterSettingsTab: React.FC = () => {
  const { tenantSettings, updateTenantSettings, showToast } = useApp();

  const [printQrCode, setPrintQrCode] = useState(tenantSettings.showQrOnReport ?? true);
  const [departments, setDepartments] = useState<DeptFooterState[]>(() => {
    if (tenantSettings.departmentSignatures && tenantSettings.departmentSignatures.length > 0) {
      // Merge with defaults to ensure all 11 disciplines exist
      const existingMap = new Map(tenantSettings.departmentSignatures.map(d => [d.department, d]));
      return DEFAULT_11_DEPARTMENTS.map(def => (existingMap.get(def.department) as any) || def);
    }
    return DEFAULT_11_DEPARTMENTS;
  });

  const [expandedDept, setExpandedDept] = useState<string | null>('BIOCHEMISTRY');

  const handleSaveQr = () => {
    updateTenantSettings({ showQrOnReport: printQrCode });
    showToast('QR code setting saved successfully');
  };

  const handleUpdateDeptField = (deptName: string, field: keyof DeptFooterState, value: any) => {
    setDepartments(prev =>
      prev.map(d => (d.department === deptName ? { ...d, [field]: value } : d))
    );
  };

  const handleSaveRow = (deptName: string) => {
    updateTenantSettings({ departmentSignatures: departments });
    showToast(`Saved signatures for ${deptName}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Footer QR Code Card */}
      <div className="settings-card">
        <h2 className="settings-card-title">Footer QR Code</h2>
        <p className="settings-card-sub">
          The QR code printed at the bottom of a report links to the patient's online copy.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ marginTop: '3px' }}
              checked={printQrCode}
              onChange={e => setPrintQrCode(e.target.checked)}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Print QR code on report
              </span>
              <div className="settings-helper-text" style={{ marginTop: '2px' }}>
                When unchecked, no QR code is printed. Patients can still open their report from the link on the invoice.
              </div>
            </div>
          </label>
        </div>

        <button type="button" className="settings-btn-primary" onClick={handleSaveQr}>
          Save QR Setting
        </button>
      </div>

      {/* 2. Report Footer Configuration Card */}
      <div className="settings-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px 24px 16px 24px' }}>
          <h2 className="settings-card-title">Report Footer Configuration</h2>
          <p className="settings-card-sub" style={{ margin: 0 }}>
            Configure lab technician and report verify doctor details per report type. Click a row to expand and edit signatures, names, and qualifications.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Report Type</th>
                <th style={{ width: '36%' }}>Lab Technician</th>
                <th style={{ width: '36%' }}>Verify Doctor</th>
                <th style={{ textAlign: 'center', width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => {
                const isExpanded = expandedDept === dept.department;
                return (
                  <React.Fragment key={dept.department}>
                    <tr
                      style={{
                        cursor: 'pointer',
                        background: isExpanded ? '#f8fafc' : 'transparent',
                        borderBottom: isExpanded ? 'none' : '1px solid #e2e8f0'
                      }}
                      onClick={() => setExpandedDept(isExpanded ? null : dept.department)}
                    >
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>{dept.department}</strong>
                      </td>
                      <td style={{ fontSize: '12.5px', color: dept.technicianName ? '#334155' : '#94a3b8' }}>
                        {dept.technicianShow && dept.technicianName ? (
                          dept.technicianName
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Not set</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12.5px', color: dept.doctorName ? '#334155' : '#94a3b8' }}>
                        {dept.doctorShow && dept.doctorName ? (
                          dept.doctorName
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Not set</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ color: '#64748b' }}
                          onClick={e => {
                            e.stopPropagation();
                            setExpandedDept(isExpanded ? null : dept.department);
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Row Editor */}
                    {isExpanded && (
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <td colSpan={4} style={{ padding: '0 24px 24px 24px' }}>
                          <div className="settings-footer-accordion">
                            {/* Technician Side */}
                            <div>
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={dept.technicianShow}
                                    onChange={e =>
                                      handleUpdateDeptField(dept.department, 'technicianShow', e.target.checked)
                                    }
                                  />
                                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                    Show in report footer
                                  </span>
                                </label>
                              </div>

                              <div style={{ marginBottom: '14px' }}>
                                <button
                                  type="button"
                                  className="settings-btn-secondary"
                                  style={{ fontSize: '11.5px', padding: '5px 12px' }}
                                  onClick={() => showToast(`Signature uploaded for technician (${dept.department})`)}
                                >
                                  <Upload size={13} /> Upload signature
                                </button>
                              </div>

                              <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label className="form-label" style={{ fontSize: '12px' }}>Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Md. Rahim Uddin"
                                  value={dept.technicianName}
                                  onChange={e =>
                                    handleUpdateDeptField(dept.department, 'technicianName', e.target.value)
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '12px' }}>Qualifications</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  placeholder="e.g. B.Sc. (MLT), BMLT&#10;DHMS, PGDMLT"
                                  value={dept.technicianQualification}
                                  onChange={e =>
                                    handleUpdateDeptField(dept.department, 'technicianQualification', e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            {/* Verify Doctor Side */}
                            <div>
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={dept.doctorShow}
                                    onChange={e =>
                                      handleUpdateDeptField(dept.department, 'doctorShow', e.target.checked)
                                    }
                                  />
                                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                    Show in report footer
                                  </span>
                                </label>
                              </div>

                              <div style={{ marginBottom: '14px' }}>
                                <button
                                  type="button"
                                  className="settings-btn-secondary"
                                  style={{ fontSize: '11.5px', padding: '5px 12px' }}
                                  onClick={() => showToast(`Signature uploaded for doctor (${dept.department})`)}
                                >
                                  <Upload size={13} /> Upload signature
                                </button>
                              </div>

                              <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label className="form-label" style={{ fontSize: '12px' }}>Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Dr. Fatema Khatun"
                                  value={dept.doctorName}
                                  onChange={e =>
                                    handleUpdateDeptField(dept.department, 'doctorName', e.target.value)
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '12px' }}>Qualifications</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  placeholder="e.g. MBBS, MD (Pathology)&#10;FCPS (Microbiology)"
                                  value={dept.doctorQualification}
                                  onChange={e =>
                                    handleUpdateDeptField(dept.department, 'doctorQualification', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <button
                              type="button"
                              className="settings-btn-primary"
                              style={{ height: '34px', padding: '0 16px', fontSize: '12px' }}
                              onClick={() => handleSaveRow(dept.department)}
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
