import React from 'react';
import { Invoice, TenantSettings } from '../../types';

interface Props {
  invoice: Invoice;
  settings: TenantSettings;
}

export const ThermalReceipt: React.FC<Props> = ({ invoice, settings }) => {
  return (
    <div className="thermal-receipt-preview printable-area">
      {/* Header */}
      <div className="receipt-header">
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
          {settings.name}
        </h2>
        <div style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-bangla)', marginBottom: '3px' }}>
          {settings.bengaliName}
        </div>
        <div style={{ fontSize: '10px' }}>{settings.address}, {settings.district}</div>
        <div style={{ fontSize: '10px' }}>Hotline: {settings.phone} / {settings.phone2}</div>
        <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>
          *** MONEY RECEIPT ***
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
          <span>Age/Sex: {invoice.patientAge}Y/{invoice.patientGender.charAt(0)}</span>
        </div>
        <div>Contact: {invoice.patientPhone}</div>
        {invoice.referralDoctorName && (
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            Ref By: {invoice.referralDoctorName}
          </div>
        )}
      </div>

      <div className="receipt-divider" />

      {/* Line Items */}
      <div style={{ marginBottom: '8px' }}>
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

      <div className="receipt-divider" />

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

      <div className="receipt-divider" />

      {/* Footer message */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold' }}>STATUS: [{invoice.paymentStatus}]</div>
        <div style={{ marginTop: '4px' }}>Reports delivery: 5:00 PM onwards</div>
        <div style={{ fontStyle: 'italic', marginTop: '2px' }}>Please bring this receipt for report collection.</div>
        <div style={{ marginTop: '8px', fontSize: '9px', opacity: 0.8 }}>
          Served by: {invoice.createdBy} | SihatSuite
        </div>
      </div>
    </div>
  );
};
