import React from 'react';
import { Appointment, TenantSettings } from '../../types';
import { Printer, X, CheckCircle, Clock, MapPin, User, Stethoscope } from 'lucide-react';

interface Props {
  appointment: Appointment | null;
  settings: TenantSettings;
  onClose: () => void;
}

export const TokenSlipModal: React.FC<Props> = ({ appointment, settings, onClose }) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentTime = appointment.timeSlot || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#f8fafc',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh'
        }}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              OPD Token Slip
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Ready for 80mm / 58mm Thermal POS Printer
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5,150,105,0.3)'
              }}
            >
              <Printer size={15} />
              Print Slip
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          {/* ========================================================= */}
          {/* THERMAL SLIP PRINTABLE AREA                               */}
          {/* ========================================================= */}
          <div
            className="printable-area thermal-receipt-preview"
            style={{
              width: '100%',
              maxWidth: '320px',
              background: '#ffffff',
              color: '#000000',
              padding: '16px 14px',
              fontFamily: 'monospace, "Courier New", Courier, sans-serif',
              fontSize: '11px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                {settings.name || 'HOSPITAL & DIAGNOSTIC CENTER'}
              </h2>
              {settings.bengaliName && (
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                  {settings.bengaliName}
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#333' }}>
                {settings.address || 'Hospital Road'}, {settings.district || ''}
              </div>
              <div style={{ fontSize: '10px', color: '#333' }}>
                Hotline: {settings.phone || '01711-000000'}
              </div>
              <div
                style={{
                  margin: '8px auto 4px',
                  padding: '2px 8px',
                  border: '1px solid #000',
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              >
                *** OPD CONSULTATION TOKEN ***
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* BIG TOKEN BADGE */}
            <div
              style={{
                textAlign: 'center',
                margin: '10px 0',
                padding: '10px 0',
                border: '2px solid #000',
                borderRadius: '6px',
                background: '#fafafa'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TOKEN / SERIAL NO
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.2', color: '#000' }}>
                #{appointment.serialNo}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
                {appointment.chamberRoom || (appointment.chamberNo ? `Chamber ${appointment.chamberNo}` : 'Chamber 101')}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Doctor Details */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '8px' }}>
              <div>
                DOCTOR: <strong>{appointment.doctorName}</strong>
              </div>
              <div>
                ROOM &nbsp;: <strong>{appointment.chamberRoom || appointment.chamberNo || 'Room 101'}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Patient Details */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PATIENT: <strong>{appointment.patientName}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PHONE &nbsp;: {appointment.patientPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>AGE/SEX: {appointment.patientAge} Yrs / {appointment.patientGender}</span>
                <span>ID: {appointment.patientId ? appointment.patientId.replace('pat-', 'P-') : 'OPD'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>DATE &nbsp;&nbsp;: {appointment.date || currentDate}</span>
                <span>TIME: {currentTime}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Billing / Fee info */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SERVICE: Consultation</span>
                <span>FEE: ৳{appointment.fee || 800}.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px' }}>
                <span>STATUS : {appointment.paymentStatus?.toUpperCase() || 'PAID'}</span>
                <span>PAID: ৳{appointment.fee || 800}.00</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Footer Instructions */}
            <div style={{ textAlign: 'center', fontSize: '9.5px', lineHeight: '1.4', marginTop: '8px', color: '#222' }}>
              <div>অনুগ্রহ করে সংশ্লিষ্ট চেম্বারের সামনে অপেক্ষা করুন।</div>
              <div>লাইভ টিভি স্ক্রিনে আপনার টোকেন নম্বর কল করা হবে।</div>
              <div style={{ marginTop: '4px', fontStyle: 'italic', fontSize: '9px' }}>
                Printed: {new Date().toLocaleTimeString()} · Counter Slip
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              background: '#059669',
              border: 'none'
            }}
          >
            <Printer size={15} /> Print Slip Now
          </button>
        </div>
      </div>
    </div>
  );
};
