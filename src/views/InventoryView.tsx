import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Requisition } from '../types';
import { Package, Search, Plus, ClipboardList, History, Trash2, X, CheckCircle } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventoryItems, requisitions, createRequisition, updateRequisitionStatus, showToast } = useApp();
  const [tab, setTab] = useState<'catalog' | 'requisitions' | 'history'>('catalog');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showReqModal, setShowReqModal] = useState(false);

  // New requisition form state
  const [reqNotes, setReqNotes] = useState('');
  const [reqItems, setReqItems] = useState([
    { itemId: inventoryItems[0]?.id || '', itemName: inventoryItems[0]?.name || '', qty: 1, note: '' }
  ]);

  const handleAddItemRow = () => {
    setReqItems([
      ...reqItems,
      { itemId: inventoryItems[0]?.id || '', itemName: inventoryItems[0]?.name || '', qty: 1, note: '' }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setReqItems(reqItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    const updated = [...reqItems];
    updated[idx].itemId = itemId;
    updated[idx].itemName = item?.name || '';
    setReqItems(updated);
  };

  const handleSubmitRequisition = (status: 'draft' | 'submitted') => {
    if (reqItems.length === 0) return;
    createRequisition({
      department: reqNotes || 'General Lab Store',
      requestedBy: 'jhalakathid_admin',
      items: reqItems,
      status,
      notes: reqNotes
    });
    setShowReqModal(false);
    setReqNotes('');
    setReqItems([{ itemId: inventoryItems[0]?.id || '', itemName: inventoryItems[0]?.name || '', qty: 1, note: '' }]);
  };

  const filteredRequisitions = requisitions.filter(
    r => statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinical & Lab Inventory</h1>
          <p className="page-subtitle">Reagent Stock Levels, Consumables Management & Internal Store Requisitions</p>
        </div>

        <div className="page-actions">
          {tab === 'requisitions' && (
            <button className="btn btn-primary" onClick={() => setShowReqModal(true)}>
              <Plus size={16} /> New Requisition
            </button>
          )}
          {tab === 'catalog' && (
            <button className="btn btn-primary" onClick={() => showToast('Stock reception modal opened')}>
              <Plus size={16} /> Receive Stock
            </button>
          )}
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="subtabs-bar">
        <button className={`subtab-btn ${tab === 'catalog' ? 'active' : ''}`} onClick={() => setTab('catalog')}>
          <Package size={15} /> Reagent Catalog ({inventoryItems.length})
        </button>
        <button className={`subtab-btn ${tab === 'requisitions' ? 'active' : ''}`} onClick={() => setTab('requisitions')}>
          <ClipboardList size={15} /> Store Requisitions ({requisitions.length})
        </button>
        <button className={`subtab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          <History size={15} /> Stock Movement Logs
        </button>
      </div>

      {/* 1. CATALOG TAB */}
      {tab === 'catalog' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search reagents or supplies…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Reagent / Supply Item</th>
                <th>Category</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Stock On-Hand</th>
                <th style={{ textAlign: 'right' }}>Unit Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems
                .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()))
                .map(item => {
                  const isLow = item.stockQty <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>{item.code}</span></td>
                      <td>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Supplier: {item.supplier}</div>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {item.stockQty} {item.unit}s
                      </td>
                      <td style={{ textAlign: 'right' }}>৳{item.costPrice}</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-due' : 'badge-paid'}`}>
                          {isLow ? 'Reorder Required' : 'Sufficient'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. REQUISITIONS TAB matching SihatSuite live audit */}
      {tab === 'requisitions' && (
        <div>
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['All', 'draft', 'submitted', 'approved', 'partially issued', 'issued', 'rejected'].map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize', fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Requisition #</th>
                  <th>Department / Purpose</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Requested Items</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map(r => (
                  <tr key={r.id}>
                    <td><strong style={{ color: '#073f8f' }}>{r.reqNo}</strong></td>
                    <td>{r.department}</td>
                    <td>{r.requestedBy}</td>
                    <td>{r.date}</td>
                    <td>
                      {r.items.map(i => `${i.itemName} (x${i.qty})`).join(', ')}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'approved' || r.status === 'issued'
                            ? 'badge-paid'
                            : r.status === 'submitted'
                            ? 'badge-partial'
                            : 'badge-due'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.status === 'submitted' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px' }}
                          onClick={() => updateRequisitionStatus(r.id, 'approved')}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {tab === 'history' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Item</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Authorized User</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-09-02 09:30 AM</td>
                <td>CBC 3-Part Diluent Reagent (20L)</td>
                <td><span className="badge badge-paid">+ Stock In</span></td>
                <td>+2 Canisters</td>
                <td>jhalakathid_admin</td>
              </tr>
              <tr>
                <td>2026-09-01 04:15 PM</td>
                <td>EDTA K3 Purple Top Vacutainer Tubes</td>
                <td><span className="badge badge-due">- Consumed</span></td>
                <td>-50 Tubes</td>
                <td>farzana_lab</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* New Requisition Modal matching SihatSuite live audit */}
      {showReqModal && (
        <div className="modal-backdrop" onClick={() => setShowReqModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Store Requisition</h3>
              <button className="icon-btn" onClick={() => setShowReqModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Purpose or department (e.g. Haematology Emergency)"
                  value={reqNotes}
                  onChange={e => setReqNotes(e.target.value)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Requisition Items *</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow} style={{ fontSize: '11px' }}>
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reqItems.map((row, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.4fr 32px', gap: '8px', alignItems: 'center' }}>
                      <select
                        className="form-control"
                        value={row.itemId}
                        onChange={e => handleItemChange(idx, e.target.value)}
                      >
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="Qty"
                        value={row.qty}
                        onChange={e => {
                          const updated = [...reqItems];
                          updated[idx].qty = Number(e.target.value) || 1;
                          setReqItems(updated);
                        }}
                      />

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Note (optional)"
                        value={row.note || ''}
                        onChange={e => {
                          const updated = [...reqItems];
                          updated[idx].note = e.target.value;
                          setReqItems(updated);
                        }}
                      />

                      {reqItems.length > 1 && (
                        <button className="icon-btn" onClick={() => handleRemoveItemRow(idx)}>
                          <Trash2 size={15} color="#dc2626" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setShowReqModal(false)}>
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => handleSubmitRequisition('draft')}>
                  Save as Draft
                </button>
                <button className="btn btn-primary" onClick={() => handleSubmitRequisition('submitted')}>
                  Submit Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
