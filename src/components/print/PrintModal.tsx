import React from 'react';
import { useApp } from '../../context/AppContext';
import { A4Invoice } from './A4Invoice';
import { ThermalReceipt } from './ThermalReceipt';
import { Printer, X, ArrowLeft, Plus } from 'lucide-react';

export const PrintModal: React.FC = () => {
  const {
    showPrintModal,
    closePrintModal,
    activePrintInvoice,
    activePrintFormat,
    setActivePrintFormat,
    activePrintColor,
    setActivePrintColor,
    setCurrentView,
    tenantSettings
  } = useApp();

  if (!showPrintModal || !activePrintInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleNewInvoice = () => {
    closePrintModal();
    setCurrentView('new-invoice');
  };

  return (
    <div className="modal-backdrop" onClick={closePrintModal} style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)' }}>
      <div
        className="modal-content print-modal-shell"
        onClick={e => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: activePrintFormat === 'thermal' ? '460px' : '900px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: '#f1f5f9',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 18px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={closePrintModal}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleNewInvoice}>
              <Plus size={14} /> New Invoice
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Paper Format Switcher */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
              <button
                className={`btn btn-sm ${activePrintFormat === 'thermal' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setActivePrintFormat('thermal')}
              >
                Thermal (80mm)
              </button>
              <button
                className={`btn btn-sm ${activePrintFormat === 'a5' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setActivePrintFormat('a5')}
              >
                A5
              </button>
              <button
                className={`btn btn-sm ${activePrintFormat === 'a4' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setActivePrintFormat('a4')}
              >
                A4
              </button>
            </div>

            {/* Color / B&W Mode Switcher */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', marginLeft: '6px' }}>
              <button
                className={`btn btn-sm ${activePrintColor === 'Color' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setActivePrintColor('Color')}
              >
                🎨 Color
              </button>
              <button
                className={`btn btn-sm ${activePrintColor === 'B&W' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setActivePrintColor('B&W')}
              >
                ⬛ B&W
              </button>
            </div>

            {/* Print Trigger */}
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ marginLeft: '10px', background: '#059669' }}
            >
              <Printer size={15} /> Print
            </button>

            <button className="icon-btn" onClick={closePrintModal} style={{ marginLeft: '8px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area Body */}
        <div
          className="print-area-wrapper"
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            background: '#e2e8f0'
          }}
        >
          {activePrintFormat === 'thermal' ? (
            <ThermalReceipt invoice={activePrintInvoice} settings={tenantSettings} />
          ) : (
            <A4Invoice invoice={activePrintInvoice} />
          )}
        </div>
      </div>
    </div>
  );
};
