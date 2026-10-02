import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Tv,
  Users,
  CheckCircle2,
  Play,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  X
} from 'lucide-react';

export const ReceptionView: React.FC = () => {
  const {
    appointments,
    doctors,
    chambers,
    patients,
    addPatient,
    updateAppointmentStatus,
    addAppointment,
    showToast
  } = useApp();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [tvMode, setTvMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWalkinModal, setShowWalkinModal] = useState(false);

  // Helper to dynamically get doctor's assigned chamber room
  const getDoctorChamber = (doc?: any) => {
    if (!doc) return '101';
    const ch = chambers?.find((c: any) => c.doctorId === doc.id || c.assignedDoctorId === doc.id);
    return ch ? ch.roomNo : (doc.chamberRoom || doc.chamberNo || '101');
  };

  // Walk-in form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAge, setWalkinAge] = useState<number>(30);
  const [walkinGender, setWalkinGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [walkinDoctorId, setWalkinDoctorId] = useState(doctors[0]?.id || '');
  const [walkinType, setWalkinType] = useState<'Consultation' | 'Report Delivery' | 'Emergency'>('Consultation');

  // Today's date string YYYY-MM-DD
  const todayDate = new Date().toISOString().split('T')[0];

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Audio chime when calling a token
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // Filter appointments for today
  const todayAppointments = appointments.filter(a => {
    const isToday = a.date === todayDate || !a.date;
    const matchesDoc = selectedDoctorId === 'ALL' || a.doctorId === selectedDoctorId;
    const matchesSearch = !searchQuery ||
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientPhone.includes(searchQuery) ||
      String(a.serialNo).includes(searchQuery);
    return isToday && matchesDoc && matchesSearch;
  });

  const servingList = todayAppointments.filter(a => a.status === 'With Doctor');
  const waitingList = todayAppointments.filter(a => a.status === 'Waiting' || a.status === 'Booked');
  const completedList = todayAppointments.filter(a => a.status === 'Completed');

  const handleCallToken = (id: string, serial: number, patient: string) => {
    playChime();
    updateAppointmentStatus(id, 'With Doctor');
    showToast(`Token #${serial} (${patient}) called to Doctor.`);
  };

  const handleCompleteToken = (id: string, serial: number) => {
    updateAppointmentStatus(id, 'Completed');
    showToast(`Token #${serial} marked Completed.`);
  };

  const handleResetToWaiting = (id: string, serial: number) => {
    updateAppointmentStatus(id, 'Waiting');
    showToast(`Token #${serial} returned to Waiting.`);
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) {
      showToast('Please enter patient name and phone number');
      return;
    }

    const doc = doctors.find(d => d.id === walkinDoctorId) || doctors[0];
    const chamberRoom = getDoctorChamber(doc);

    // Look up or auto-sync with Central Patients Database
    const cleanPhone = walkinPhone.trim().replace(/[^0-9]/g, '');
    const existingPatient = patients.find(
      p => (selectedPatientId && p.id === selectedPatientId) ||
           (cleanPhone && p.phone.replace(/[^0-9]/g, '') === cleanPhone)
    );

    let finalPatientId = existingPatient ? existingPatient.id : '';

    if (!existingPatient) {
      // Auto-register new patient to central database
      const newP = addPatient({
        name: walkinName.trim(),
        phone: walkinPhone.trim(),
        whatsApp: walkinPhone.trim(),
        age: walkinAge,
        ageUnit: 'yrs',
        gender: walkinGender,
        bloodGroup: 'B+',
        address: 'Walk-in (Reception)',
        nid: ''
      });
      finalPatientId = newP.id;
    }

    addAppointment({
      doctorId: doc?.id || 'doc-1',
      doctorName: doc?.name || 'Consultant Doctor',
      patientId: finalPatientId || `pat-${Date.now()}`,
      patientName: walkinName.trim(),
      patientPhone: walkinPhone.trim(),
      patientAge: walkinAge,
      patientGender: walkinGender,
      date: todayDate,
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
      fee: doc?.consultationFee || 800,
      paymentStatus: 'Paid',
      chamberRoom: `Chamber ${chamberRoom}`,
      chamberNo: String(chamberRoom)
    });

    setWalkinName('');
    setWalkinPhone('');
    setSelectedPatientId('');
    setShowWalkinModal(false);
    showToast(`Token registered for ${walkinName.trim()} (Chamber: ${chamberRoom})`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Banner / Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Reception Live Queue Board
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
              Live · {autoRefresh ? `Refreshing in ${secondsLeft}s` : 'Paused'}
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Real-time patient flow, chamber token calling, and waiting hall monitor display
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
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
              color: soundEnabled ? '#059669' : '#64748b',
              cursor: 'pointer'
            }}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setTvMode(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.15)'
            }}
          >
            <Tv size={16} />
            <span>TV Display Mode</span>
          </button>

          <button
            onClick={() => setShowWalkinModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            <Plus size={16} />
            <span>New Walk-in Token</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search token #, patient name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: '#64748b' }} />
            <select
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                background: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Chambers / Doctors ({doctors.length})</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <span>Today: <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
          <span>·</span>
          <span>Total Queued: <strong>{todayAppointments.length}</strong></span>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Waiting in Queue</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>{waitingList.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Next in line ready</div>
        </div>

        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Now Serving</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{servingList.length}</div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>Inside Doctor's Chamber</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Completed Today</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#64748b', marginTop: '6px' }}>{completedList.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Consultations finished</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Chambers</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>{doctors.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Consultants on duty</div>
        </div>
      </div>

      {/* Main 3-Column Queue Board Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* 1. NOW SERVING COLUMN */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            padding: '16px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Now Serving (With Doctor)</h2>
            </div>
            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {servingList.length} Active
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '680px', overflowY: 'auto' }}>
            {servingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>No patient currently in consultation</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Call to Doctor" from the waiting list to serve next.</p>
              </div>
            ) : (
              servingList.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        background: '#059669',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '18px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px',
                        marginBottom: '8px'
                      }}>
                        TOKEN #{item.serialNo}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {item.patientName}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {item.patientGender}, {item.patientAge} yrs · {item.patientPhone}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#334155'
                  }}>
                    <div>Chamber: <strong>{item.chamberRoom || item.chamberNo || 'Chamber 101'}</strong></div>
                    <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                      {item.doctorName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      onClick={() => handleCompleteToken(item.id, item.serialNo)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark Done</span>
                    </button>
                    <button
                      onClick={() => handleResetToWaiting(item.id, item.serialNo)}
                      style={{
                        padding: '8px 12px',
                        background: '#fff',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Return back to waiting"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. WAITING IN QUEUE COLUMN */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#0284c7',
            padding: '16px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Waiting Queue</h2>
            </div>
            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {waitingList.length} Waiting
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '680px', overflowY: 'auto' }}>
            {waitingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>Queue is currently clear!</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>All scheduled patients have been attended to.</p>
              </div>
            ) : (
              waitingList.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: index === 0 ? '0 2px 8px rgba(2,132,199,0.1)' : 'none',
                    borderColor: index === 0 ? '#38bdf8' : '#e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      minWidth: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: index === 0 ? '#0284c7' : '#f1f5f9',
                      color: index === 0 ? '#fff' : '#0f172a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px'
                    }}>
                      <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>No</span>
                      #{item.serialNo}
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {item.patientName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.patientGender}, {item.patientAge}y · {item.doctorName}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCallToken(item.id, item.serialNo, item.patientName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      background: index === 0 ? '#0284c7' : '#f8fafc',
                      color: index === 0 ? '#fff' : '#0284c7',
                      border: '1px solid #0284c7',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Play size={12} fill={index === 0 ? '#fff' : '#0284c7'} />
                    <span>Call In</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. RECENTLY COMPLETED COLUMN */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#475569',
            padding: '16px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Completed Consultations</h2>
            </div>
            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {completedList.length}
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
            {completedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <Clock size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No completed tokens yet today</p>
              </div>
            ) : (
              completedList.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '13px',
                      color: '#475569',
                      background: '#e2e8f0',
                      padding: '3px 7px',
                      borderRadius: '4px'
                    }}>
                      #{item.serialNo}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{item.patientName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.doctorName}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                    Done ✓
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FULLSCREEN TV DISPLAY MODE MODAL */}
      {tvMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#090d16',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          {/* TV Header */}
          <div style={{
            padding: '24px 36px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15,23,42,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', animation: 'ping 1s infinite' }} />
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  PATIENT TOKEN DISPLAY · WAITING HALL
                </h1>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>
                  Please proceed to your assigned chamber when your token number is displayed.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={() => setTvMode(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Minimize2 size={16} />
                <span>Exit TV Mode</span>
              </button>
            </div>
          </div>

          {/* TV Grid */}
          <div style={{ flex: 1, padding: '36px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '36px', overflow: 'hidden' }}>
            {/* Left: NOW SERVING BIG HERO BOXES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ● NOW SERVING IN CHAMBERS
              </div>

              {servingList.length === 0 ? (
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '24px',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#64748b',
                  fontWeight: 600
                }}>
                  Please wait, next tokens will be called shortly...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  {servingList.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: 'linear-gradient(145deg, #064e3b 0%, #022c22 100%)',
                        border: '2px solid #10b981',
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: '0 0 35px rgba(16,185,129,0.25)'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' }}>
                        {item.chamberRoom || item.chamberNo || 'CHAMBER 101'}
                      </div>
                      <div style={{ fontSize: '64px', fontWeight: 900, color: '#fff', margin: '8px 0', letterSpacing: '-2px' }}>
                        TOKEN #{item.serialNo}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.patientName}
                      </div>
                      <div style={{ fontSize: '16px', color: '#6ee7b7', marginTop: '6px' }}>
                        Doctor: {item.doctorName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: UP NEXT LIST */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
                ⏳ UP NEXT / WAITING ({waitingList.length})
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {waitingList.slice(0, 8).map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      background: idx === 0 ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.04)',
                      border: idx === 0 ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: idx === 0 ? '#38bdf8' : '#94a3b8' }}>
                        #{item.serialNo}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{item.patientName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.doctorName}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                      {idx === 0 ? 'NEXT IN LINE' : `Wait ~${(idx + 1) * 10}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK WALK-IN MODAL */}
      {showWalkinModal && (
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
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Register Walk-in Patient</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Issue instant queue token for front desk</div>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Existing Patient Quick Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Existing Patient Quick Select <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional)</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={e => {
                    const pid = e.target.value;
                    setSelectedPatientId(pid);
                    const found = patients.find(p => p.id === pid);
                    if (found) {
                      setWalkinName(found.name);
                      setWalkinPhone(found.phone);
                      setWalkinAge(found.age);
                      setWalkinGender(found.gender as any);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#334155'
                  }}
                >
                  <option value="">-- New Walk-in Patient (or type details below) --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.phone} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Rahim"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={walkinPhone}
                    onChange={e => {
                      const val = e.target.value;
                      setWalkinPhone(val);
                      const clean = val.replace(/[^0-9]/g, '');
                      if (clean.length >= 7) {
                        const matched = patients.find(p => p.phone.replace(/[^0-9]/g, '') === clean);
                        if (matched && !selectedPatientId) {
                          setSelectedPatientId(matched.id);
                          setWalkinName(matched.name);
                          setWalkinAge(matched.age);
                          setWalkinGender(matched.gender as any);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={walkinAge}
                    onChange={e => setWalkinAge(parseInt(e.target.value) || 25)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Gender
                  </label>
                  <select
                    value={walkinGender}
                    onChange={e => setWalkinGender(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Service Type
                  </label>
                  <select
                    value={walkinType}
                    onChange={e => setWalkinType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="Consultation">Doctor Consultation</option>
                    <option value="Report Delivery">Report Consultation</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Assign to Doctor / Chamber *
                </label>
                <select
                  value={walkinDoctorId}
                  onChange={e => setWalkinDoctorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#fff'
                  }}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty} · Chamber: {getDoctorChamber(d)})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Issue Token & Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
