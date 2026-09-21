import React from 'react';
import { Invoice, TenantSettings } from '../../types';

interface Props {
  invoice: Invoice;
  settings: TenantSettings;
}

export const ThermalReceipt: React.FC<Props> = ({ invoice, settings }) => {
  return (
    <div className="thermal-receipt-preview printable-area" style={{ width: '80mm', maxWidth: '320px', background: '#ffffff', color: '#000000', padding: '10px 14px', fontFamily: 'monospace, sans-serif' }}>
      {/* ====================================================================
          PART 1: CUSTOMER COPY (গ্রাহক কপি)
          ==================================================================== */}
      <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0' }}>
          {settings.name}
        </h2>
        {settings.bengaliName && (
          <div style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-bangla)', marginBottom: '3px' }}>
            {settings.bengaliName}
          </div>
        )}
        <div style={{ fontSize: '10px' }}>{settings.address}, {settings.district}</div>
        <div style={{ fontSize: '10px' }}>Hotline: {settings.phone} / {settings.phone2}</div>
        <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 'bold', border: '1px solid #000', padding: '2px 4px', display: 'inline-block' }}>
          *** MONEY RECEIPT (CUSTOMER COPY) ***
        </div>
      </div>

      {/* Meta Info */}
      <div style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice: <strong>{invoice.invoiceNo}</strong></span>
          <span>{invoice.date} {invoice.time}</span>
        </div>
        <div>Patient: <strong>{invoice.patientName}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>ID: {invoice.patientCode}</span>
          <span>Age/Sex: {invoice.patientAge}Y/{invoice.patientGender?.charAt(0) || 'M'}</span>
        </div>
        <div>Contact: {invoice.patientPhone}</div>
        {invoice.referralDoctorName && (
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            Ref By: {invoice.referralDoctorName}
          </div>
        )}
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

      {/* Line Items */}
      <div style={{ marginBottom: '8px', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
          <span>SL & TEST DESCRIPTION</span>
          <span>BDT (৳)</span>
        </div>
        {invoice.items.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>{idx + 1}. {item.testName}</span>
            <span>{item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

      {/* Financial Summary */}
      <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sub Total:</span>
          <span>৳{invoice.grossTotal.toFixed(2)}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Special Discount:</span>
            <span>-৳{invoice.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '3px', marginTop: '3px' }}>
          <span>Net Payable:</span>
          <span>৳{invoice.netTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Paid ({invoice.paymentMethod}):</span>
          <span>৳{invoice.paidAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: invoice.dueAmount > 0 ? '#991b1b' : '#065f46' }}>
          <span>Due Balance:</span>
          <span>৳{invoice.dueAmount.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

      {/* Footer message */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '6px' }}>
        <div style={{ fontWeight: 'bold' }}>PAYMENT STATUS: [{invoice.paymentStatus}]</div>
        <div style={{ marginTop: '3px' }}>Report Delivery: 5:00 PM onwards</div>
        <div style={{ fontStyle: 'italic', marginTop: '2px' }}>Please preserve this receipt for clinical report collection.</div>
        <div style={{ marginTop: '6px', fontSize: '9px', opacity: 0.8 }}>
          Issued by: {invoice.createdBy || 'Reception Desk'}
        </div>
      </div>

      {/* ====================================================================
          PERFORATED TEAR-OFF CUTTER
          ==================================================================== */}
      <div style={{ textAlign: 'center', margin: '14px 0 10px 0', borderTop: '2px dashed #000', paddingTop: '4px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px' }}>
        - - - - - - - - ✂ TEAR HERE (কাটুন) ✂ - - - - - - - -
      </div>

      {/* ====================================================================
          PART 2: LAB SPECIMEN & PHLEBOTOMY TOKEN (ল্যাব টোকেন)
          ==================================================================== */}
      <div style={{ paddingTop: '4px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
          [LAB SPECIMEN TOKEN]
        </div>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>
          {settings.name} — Phlebotomy Counter
        </div>
      </div>

      <div style={{ fontSize: '11px', lineHeight: '1.4', marginTop: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Token #: <strong>{invoice.invoiceNo.replace('INV-', 'SMP-')}</strong></span>
          <span>Inv: <strong>{invoice.invoiceNo}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <span>Patient: <strong>{invoice.patientName}</strong></span>
          <span>{invoice.patientAge}Y/{invoice.patientGender?.charAt(0) || 'M'}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #000', margin: '4px 0' }} />

      {/* Tests to draw */}
      <div style={{ fontSize: '10px', textAlign: 'left', margin: '4px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Specimen Draw Required:</span>
        <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px' }}>
          {invoice.items.map((item, idx) => (
            <li key={idx}><strong>{item.testName}</strong></li>
          ))}
        </ul>
      </div>

      {/* Specimen Tube Checklist */}
      <div style={{ border: '1px dashed #000', padding: '4px 6px', margin: '6px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
        <span>🟣 EDTA (CBC) [  ]</span>
        <span>🔴 Clot/SST [  ]</span>
        <span>🟡 Fluoride [  ]</span>
      </div>

      {/* Simulated Barcode */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div style={{ letterSpacing: '3px', fontWeight: 'bold', fontSize: '16px', fontFamily: 'monospace' }}>
          ||| | |||| | || ||| | |||
        </div>
        <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
          *{invoice.invoiceNo}*
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginTop: '8px', borderTop: '1px solid #000', paddingTop: '4px' }}>
        <span>Sample Drawn By: ____________</span>
        <span>Time: ________</span>
      </div>
    </div>
  );
};
