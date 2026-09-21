import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  Users,
  Store,
  FlaskConical,
  Award,
  Sparkles,
  X,
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';

interface PracticeExercise {
  id: string;
  role: string;
  tasksCount: number;
  tagline: string;
  summary: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  tasks: string[];
}

interface TeamAttempt {
  id: string;
  staffName: string;
  exercise: string;
  progress: string;
  retries: number;
  score: string;
  startedAt: string;
}

export const PracticeView: React.FC = () => {
  const { showToast } = useApp();
  const [activeExercise, setActiveExercise] = useState<PracticeExercise | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const EXERCISES: PracticeExercise[] = [
    {
      id: 'reception',
      role: 'Reception',
      tasksCount: 4,
      tagline: '4 TASKS · FICTIONAL RECORDS',
      summary: 'Identify a patient, build a test bill, apply corporate discount, and record a partial payment.',
      icon: Users,
      color: '#059669',
      bg: '#ecfdf5',
      tasks: [
        'Task 1: Search patient by phone "01712-000000" or create a walk-in record',
        'Task 2: Select "Complete Blood Count (CBC)" and "Serum Creatinine" investigations',
        'Task 3: Apply a 10% promotional campaign discount and verify net payable',
        'Task 4: Collect ৳500 cash payment and issue thermal 80mm money receipt'
      ]
    },
    {
      id: 'pharmacy',
      role: 'Pharmacy counter',
      tasksCount: 4,
      tagline: '4 TASKS · FICTIONAL RECORDS',
      summary: 'Choose an eligible batch, dispense the requested units, verify prescription and handle a return safely.',
      icon: Store,
      color: '#2563eb',
      bg: '#eff6ff',
      tasks: [
        'Task 1: Scan barcode or search for "Napa Extra 500mg+65mg" in fast OTC panel',
        'Task 2: Select oldest expiry batch adhering strictly to FEFO protocol',
        'Task 3: Calculate change return (ফেরত টাকা) for ৳500 tendered note',
        'Task 4: Process a customer medicine return slip with zero inventory discrepancy'
      ]
    },
    {
      id: 'lab',
      role: 'Lab team',
      tasksCount: 4,
      tagline: '4 TASKS · FICTIONAL RECORDS',
      summary: 'Match a sample barcode, enter biochemical analyzer parameters, and hand over to an authorised pathologist.',
      icon: FlaskConical,
      color: '#7c3aed',
      bg: '#f5f3ff',
      tasks: [
        'Task 1: Scan specimen barcode "SMP-2026-9999" and inspect tube integrity (EDTA)',
        'Task 2: Enter Hemoglobin (13.5 g/dL) and ESR (18 mm/1st hr) findings',
        'Task 3: Trigger reflex rule check for abnormal platelet threshold flags',
        'Task 4: Forward digital draft to Dr. Nusrat Jahan for final electronic signature'
      ]
    }
  ];

  const [attempts, setAttempts] = useState<TeamAttempt[]>([
    {
      id: 'att-1',
      staffName: 'Md. Al-Amin (Receptionist)',
      exercise: 'Reception — Invoicing & Collection',
      progress: '4 of 4 completed',
      retries: 0,
      score: '100%',
      startedAt: 'Today, 11:20 AM'
    },
    {
      id: 'att-2',
      staffName: 'Tanvir Hossain (Pharmacy Trainee)',
      exercise: 'Pharmacy counter — POS & FEFO Dispensing',
      progress: '4 of 4 completed',
      retries: 1,
      score: '95%',
      startedAt: 'Yesterday, 04:15 PM'
    },
    {
      id: 'att-3',
      staffName: 'Farzana Parvin (Lab Technologist)',
      exercise: 'Lab team — Result Entry & Verification',
      progress: '4 of 4 completed',
      retries: 0,
      score: '100%',
      startedAt: '14 Sept, 02:40 PM'
    }
  ]);

  const handleStartExercise = (ex: PracticeExercise) => {
    setActiveExercise(ex);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (!activeExercise) return;
    if (currentStepIndex < activeExercise.tasks.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      showToast('Step validated! Proceeding to next practice task.');
    } else {
      showToast(`Congratulations! You scored 100% on the ${activeExercise.role} exercise!`);
      const newAtt: TeamAttempt = {
        id: `att-${Date.now()}`,
        staffName: 'You (Current Admin)',
        exercise: `${activeExercise.role} Practice`,
        progress: '4 of 4 completed',
        retries: 0,
        score: '100%',
        startedAt: 'Just now'
      };
      setAttempts([newAtt, ...attempts]);
      setActiveExercise(null);
    }
  };

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', marginBottom: '6px' }}>
            LEARN BY DOING
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Staff practice room
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '800px' }}>
            Choose a role and work through realistic tasks. All records here are fictional; exercises never create real patients, payments, reports or stock movements.
          </p>
        </div>
      </div>

      {/* ====================================================================
          3 ROLE CARDS (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {EXERCISES.map(ex => {
          const Icon = ex.icon;
          return (
            <div
              key={ex.id}
              className="card"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: ex.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ex.color }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>
                    {ex.tagline}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  {ex.role}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {ex.summary}
                </p>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleStartExercise(ex)}
                  style={{ width: '100%', justifyContent: 'center', background: ex.color, borderColor: ex.color }}
                >
                  <Play size={15} /> Start {ex.role}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          TEAM PROGRESS TABLE (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="table-container">
        <div className="table-toolbar">
          <div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
              Team progress
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
              (Latest attempts across all clinic staff)
            </span>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Exercise Module</th>
              <th>Progress</th>
              <th>Retries / Hints</th>
              <th style={{ textAlign: 'center' }}>Score</th>
              <th>Started (Dhaka Time)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map(a => (
              <tr key={a.id}>
                <td>
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>{a.staffName}</strong>
                </td>
                <td style={{ color: '#334155', fontWeight: 500 }}>{a.exercise}</td>
                <td>
                  <span className="badge badge-paid" style={{ fontSize: '11px' }}>
                    {a.progress}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{a.retries} retries</td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                  {a.score}
                </td>
                <td style={{ color: '#64748b', fontSize: '12px' }}>{a.startedAt}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge" style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px' }}>
                    Passed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====================================================================
          PRACTICE SIMULATION MODAL
          ==================================================================== */}
      {activeExercise && (
        <div className="modal-backdrop" onClick={() => setActiveExercise(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  FICTIONAL TRAINING SANDBOX · {activeExercise.role.toUpperCase()}
                </div>
                <h3 className="modal-title" style={{ marginTop: '2px' }}>
                  Step {currentStepIndex + 1} of {activeExercise.tasks.length}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setActiveExercise(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Progress bar */}
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((currentStepIndex + 1) / activeExercise.tasks.length) * 100}%`,
                    background: '#059669',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  CURRENT EXERCISE OBJECTIVE:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                  {activeExercise.tasks[currentStepIndex]}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                💡 <em>Note: Simulated task executed in secure temporary sandbox. No changes will be written to real clinic ledgers or patient records.</em>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveExercise(null)}>
                Exit Practice
              </button>
              <button className="btn btn-primary" onClick={handleNextStep}>
                {currentStepIndex < activeExercise.tasks.length - 1 ? (
                  <>Complete Step & Next <ArrowRight size={15} /></>
                ) : (
                  <>Finish & Submit Exercise <Award size={15} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
