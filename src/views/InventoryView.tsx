import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem, Requisition } from '../types';
import {
  Package,
  Search,
  Plus,
  ClipboardList,
  History,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  Boxes,
  ArrowDownToLine,
  SlidersHorizontal,
  Edit2,
  TrendingDown,
  TrendingUp,
  FolderTree
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    currentUser,
    inventoryItems,
    requisitions,
    createRequisition,
    updateRequisitionStatus,
    suppliers,
    showToast
  } = useApp();

  const [tab, setTab] = useState<'catalog' | 'categories' | 'history'>('catalog');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showRequisitionsModal, setShowRequisitionsModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [reqStatusFilter, setReqStatusFilter] = useState('All');

  // Categories list
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Haematology Reagents', count: 12, description: 'Diluent, Lyse, Cleaner and Controls for 3-part & 5-part CBC Analyzers' },
    { id: 'cat-2', name: 'Biochemistry Reagents', count: 28, description: 'Liquid stable clinical chemistry diagnostic reagents' },
    { id: 'cat-3', name: 'Vacutainer Blood Tubes', count: 8, description: 'Evacuated blood collection tubes (EDTA, Clot, Gel, Fluoride, Citrate)' },
    { id: 'cat-4', name: 'Rapid Diagnostic Kits (RDT)', count: 14, description: 'Immunochromatographic strip cassettes (Dengue, HBsAg, HCV, Malaria)' },
    { id: 'cat-5', name: 'Consumables & PPE', count: 16, description: 'Nitrile gloves, micropipette tips, syringes, alcohol pads and rolls' },
    { id: 'cat-6', name: 'Thermal & Printer Stationery', count: 6, description: 'Thermal barcode labels, 80mm POS receipt rolls, letterhead A4 paper' }
  ]);

  // Form states for New Item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Haematology Reagents');
  const [newItemUnit, setNewItemUnit] = useState('Bottle');
  const [newItemQty, setNewItemQty] = useState<number>(10);
  const [newItemReorder, setNewItemReorder] = useState<number>(5);
  const [newItemCost, setNewItemCost] = useState<number>(1200);
  const [newItemLocation, setNewItemLocation] = useState('Shelf B-2');

  // Receive Stock Form
  const [recvItemId, setRecvItemId] = useState(inventoryItems[0]?.id || '');
  const [recvSupplier, setRecvSupplier] = useState(suppliers[0]?.name || 'National Reagents Ltd');
  const [recvChallanNo, setRecvChallanNo] = useState('');
  const [recvQty, setRecvQty] = useState<number>(20);
  const [recvCost, setRecvCost] = useState<number>(1200);
  const [recvExpiry, setRecvExpiry] = useState('2027-12-31');

  // Requisition Form inside modal
  const [reqNotes, setReqNotes] = useState('');
  const [reqItems, setReqItems] = useState([
    { itemId: inventoryItems[0]?.id || '', itemName: inventoryItems[0]?.name || '', qty: 2, note: '' }
  ]);

  // Stock Movement History
  const [stockHistory, setStockHistory] = useState([
    {
      id: 'h-1',
      date: '2026-09-15 11:20 AM',
      item: 'CBC 3-Part Diluent Reagent (20L)',
      type: 'Receive Stock',
      qty: '+4 Canisters',
      source: 'National Reagents Ltd (Challan #CH-882)',
      user: 'lifecare_admin'
    },
    {
      id: 'h-2',
      date: '2026-09-14 03:45 PM',
      item: 'Purple Top EDTA Tubes (Pack 100)',
      type: 'Internal Issue',
      qty: '-5 Packs (500 tubes)',
      source: 'Dispatched to Phlebotomy Draw Counter',
      user: 'farzana_lab'
    },
    {
      id: 'h-3',
      date: '2026-09-12 10:15 AM',
      item: 'Urine Test Strips 10-Parameter (100 Strips)',
      type: 'Stock Adjustment',
      qty: '+2 Bottles',
      source: 'Physical inventory reconciliation',
      user: 'lifecare_admin'
    }
  ]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName,
      code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newItemCategory,
      unit: newItemUnit,
      stockQty: newItemQty,
      reorderLevel: newItemReorder,
      costPrice: newItemCost,
      supplier: 'National Reagents Ltd',
      location: newItemLocation,
      expiryDate: '2027-12-31'
    };
    inventoryItems.push(newItem);
    setShowNewItemModal(false);
    setNewItemName('');
    showToast(`Created inventory item: ${newItemName}`);
  };

  const handleReceiveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventoryItems.find(i => i.id === recvItemId);
    if (!item) return;
    item.stockQty += recvQty;
    setStockHistory([
      {
        id: `h-${Date.now()}`,
        date: new Date().toLocaleString(),
        item: item.name,
        type: 'Receive Stock',
        qty: `+${recvQty} ${item.unit}s`,
        source: `${recvSupplier} (Challan #${recvChallanNo || 'REC-AUTO'})`,
        user: currentUser?.username || 'admin'
      },
      ...stockHistory
    ]);
    setShowReceiveStockModal(false);
    showToast(`Received +${recvQty} ${item.unit}s of ${item.name}`);
  };

  const handleCreateRequisition = (status: 'draft' | 'submitted') => {
    if (reqItems.length === 0) return;
    createRequisition({
      department: reqNotes || 'General Laboratory Store',
      requestedBy: currentUser?.username || 'lifecare_admin',
      items: reqItems,
      status,
      notes: reqNotes
    });
    setReqNotes('');
    setReqItems([{ itemId: inventoryItems[0]?.id || '', itemName: inventoryItems[0]?.name || '', qty: 1, note: '' }]);
    showToast(`Requisition submitted to storekeeper`);
  };

  const filteredItems = inventoryItems.filter(i => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const pendingRequisitions = requisitions.filter(r => r.status === 'submitted');

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">
            Reagent Catalog, Stock Levels, Consumables Management & Inward Store Receptions
          </p>
        </div>

        {/* Top Header Action Buttons matching SihatSuite */}
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowRequisitionsModal(true)}
            style={{ position: 'relative' }}
          >
            <ClipboardList size={15} /> Requisitions
            {pendingRequisitions.length > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px'
                }}
              >
                {pendingRequisitions.length}
              </span>
            )}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowReceiveStockModal(true)}
          >
            <ArrowDownToLine size={15} /> Receive stock
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowNewItemModal(true)}
          >
            <Plus size={16} /> + New item
          </button>
        </div>
      </div>

      {/* Subtabs Bar matching SihatSuite: Catalog, Categories, Stock History */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${tab === 'catalog' ? 'active' : ''}`}
          onClick={() => setTab('catalog')}
        >
          Catalog ({inventoryItems.length})
        </button>
        <button
          className={`subtab-btn ${tab === 'categories' ? 'active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categories ({categories.length})
        </button>
        <button
          className={`subtab-btn ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Stock History
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. CATALOG SUBTAB                                         */}
      {/* ========================================================= */}
      {tab === 'catalog' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="table-search-input" style={{ width: '280px' }}>
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search reagents or supplies ( / )..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-control"
                style={{ width: '210px', height: '34px', fontSize: '12px' }}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Exporting inventory stock XLS')}
            >
              <Download size={14} /> Export XLS
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>ITEM SKU</th>
                <th>REAGENT / ITEM NAME</th>
                <th>CATEGORY</th>
                <th>STORAGE LOCATION</th>
                <th style={{ textAlign: 'right' }}>STOCK ON-HAND</th>
                <th style={{ textAlign: 'right' }}>REORDER ALERT</th>
                <th style={{ textAlign: 'right' }}>UNIT COST</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center', width: '120px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isLow = item.stockQty <= item.reorderLevel;
                const isOut = item.stockQty <= 0;

                return (
                  <tr key={item.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.code}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Supplier: {item.supplier || 'National Reagents Ltd'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#334155' }}>{item.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{item.location || 'Central Store'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span style={{ color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669', fontSize: '13px' }}>
                        {item.stockQty} {item.unit}s
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b', fontSize: '12px' }}>
                      {item.reorderLevel} {item.unit}s
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{item.costPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${isOut ? 'badge-due' : isLow ? 'badge-partial' : 'badge-paid'}`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setRecvItemId(item.id);
                            setShowReceiveStockModal(true);
                          }}
                        >
                          + Receive
                        </button>
                        <button
                          className="icon-btn"
                          title="Edit Item"
                          onClick={() => showToast(`Edit ${item.name}`)}
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CATEGORIES SUBTAB                                      */}
      {/* ========================================================= */}
      {tab === 'categories' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Inventory Classification Groups
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Organize diagnostic consumables, reagents, vacutainers and test kits.
              </span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>
              <Plus size={15} /> + Add Category
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>CATEGORY NAME</th>
                <th>DESCRIPTION</th>
                <th style={{ textAlign: 'center' }}>ACTIVE ITEMS</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderTree size={16} color="#059669" />
                      <strong style={{ color: '#0f172a' }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569', maxWidth: '400px' }}>
                    {cat.description}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    <span className="badge badge-inhouse">{cat.count} items</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-paid">Active</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Edit category ${cat.name}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. STOCK HISTORY SUBTAB                                   */}
      {/* ========================================================= */}
      {tab === 'history' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Stock Ledger & Inward Handoff Audit Logs
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Complete immutable transaction log of reagent dispatches and goods received.
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Exporting stock movement ledger')}
            >
              <Download size={14} /> Export Ledger
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>DATE & TIME</th>
                <th>ITEM NAME</th>
                <th>MOVEMENT TYPE</th>
                <th style={{ textAlign: 'right' }}>QTY CHANGE</th>
                <th>SUPPLIER / DESTINATION</th>
                <th>AUTHORIZED BY</th>
              </tr>
            </thead>
            <tbody>
              {stockHistory.map(h => (
                <tr key={h.id}>
                  <td style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {h.date}
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{h.item}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        h.type.includes('Receive')
                          ? 'badge-paid'
                          : h.type.includes('Adjustment')
                          ? 'badge-inhouse'
                          : 'badge-due'
                      }`}
                    >
                      {h.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    <span style={{ color: h.qty.startsWith('+') ? '#059669' : '#dc2626' }}>
                      {h.qty}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>{h.source}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {h.user}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Receive Stock                                      */}
      {/* ========================================================= */}
      {showReceiveStockModal && (
        <div className="modal-backdrop" onClick={() => setShowReceiveStockModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Receive Inventory Stock Inward</h3>
              <button className="icon-btn" onClick={() => setShowReceiveStockModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReceiveStockSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Reagent / Item *</label>
                  <select
                    className="form-control"
                    value={recvItemId}
                    onChange={e => setRecvItemId(e.target.value)}
                  >
                    {inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.stockQty} on hand)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Vendor / Supplier</label>
                    <select
                      className="form-control"
                      value={recvSupplier}
                      onChange={e => setRecvSupplier(e.target.value)}
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Challan / Invoice No.</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. CH-9941"
                      value={recvChallanNo}
                      onChange={e => setRecvChallanNo(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Received Qty *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={recvQty}
                      onChange={e => setRecvQty(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={recvCost}
                      onChange={e => setRecvCost(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      value={recvExpiry}
                      onChange={e => setRecvExpiry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReceiveStockModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: New Item Registration                              */}
      {/* ========================================================= */}
      {showNewItemModal && (
        <div className="modal-backdrop" onClick={() => setShowNewItemModal(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Inventory Catalog Item</h3>
              <button className="icon-btn" onClick={() => setShowNewItemModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateItem}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Item / Reagent Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Automated Serum Creatinine Enzymatic Kit (500T)"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newItemCategory}
                      onChange={e => setNewItemCategory(e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Packaging Unit</label>
                    <select
                      className="form-control"
                      value={newItemUnit}
                      onChange={e => setNewItemUnit(e.target.value)}
                    >
                      <option>Bottle</option>
                      <option>Pack</option>
                      <option>Kit</option>
                      <option>Box</option>
                      <option>Canister (20L)</option>
                      <option>Roll</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItemQty}
                      onChange={e => setNewItemQty(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reorder Alert</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItemReorder}
                      onChange={e => setNewItemReorder(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItemCost}
                      onChange={e => setNewItemCost(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Storage Location / Rack</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Refrigerator #2, Shelf A"
                    value={newItemLocation}
                    onChange={e => setNewItemLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewItemModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / DRAWER: Requisitions                              */}
      {/* ========================================================= */}
      {showRequisitionsModal && (
        <div className="modal-backdrop" onClick={() => setShowRequisitionsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Internal Store Requisitions</h3>
              <button className="icon-btn" onClick={() => setShowRequisitionsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['All', 'submitted', 'approved', 'issued'].map(st => (
                    <button
                      key={st}
                      className={`btn btn-sm ${reqStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textTransform: 'capitalize', fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => setReqStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleCreateRequisition('submitted');
                  }}
                >
                  + New Requisition Request
                </button>
              </div>

              <table className="custom-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>REQ #</th>
                    <th>DEPARTMENT</th>
                    <th>REQUESTED BY</th>
                    <th>ITEMS</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions
                    .filter(
                      r =>
                        reqStatusFilter === 'All' ||
                        r.status.toLowerCase() === reqStatusFilter.toLowerCase()
                    )
                    .map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong style={{ color: '#059669' }}>{r.reqNo}</strong>
                        </td>
                        <td>{r.department}</td>
                        <td>{r.requestedBy}</td>
                        <td style={{ fontSize: '12px' }}>
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
                              style={{ fontSize: '11px', padding: '2px 8px' }}
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

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRequisitionsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Category                                       */}
      {/* ========================================================= */}
      {showCategoryModal && (
        <div className="modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Category Group</h3>
              <button className="icon-btn" onClick={() => setShowCategoryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast('Category created successfully');
                setShowCategoryModal(false);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input type="text" className="form-control" placeholder="e.g. Molecular Biology Kits" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} placeholder="Classification scope..." />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
