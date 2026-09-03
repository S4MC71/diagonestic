import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PharmacyProduct, PharmacySale } from '../types';
import {
  Store,
  CreditCard,
  TrendingUp,
  Boxes,
  ShoppingCart,
  TruckIcon,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

export const PharmacyViews: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    pharmacyProducts,
    pharmacySales,
    createPharmacySale,
    suppliers,
    showToast
  } = useApp();

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState<{ product: PharmacyProduct; qty: number; total: number }[]>([
    { product: pharmacyProducts[0], qty: 10, total: 35.0 }
  ]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaid, setPosPaid] = useState<number>(35);

  // Cart calculations
  const cartSubtotal = cart.reduce((s, i) => s + i.total, 0);
  const cartNet = Math.max(0, cartSubtotal - posDiscount);
  const cartDue = Math.max(0, cartNet - posPaid);

  const handleAddToCart = (product: PharmacyProduct) => {
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      setCart(cart.map(c => (c.product.id === product.id ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.product.mrp } : c)));
    } else {
      setCart([...cart, { product, qty: 1, total: product.mrp }]);
    }
    setPosSearch('');
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(c => c.product.id !== productId));
  };

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const sale: PharmacySale = {
      id: `sale-${Date.now()}`,
      saleNo: `PS-2026-${String(pharmacySales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName,
      customerPhone,
      items: cart.map(c => ({
        productId: c.product.id,
        brandName: c.product.brandName,
        unit: c.product.form,
        quantity: c.qty,
        price: c.product.mrp,
        total: c.total
      })),
      subtotal: cartSubtotal,
      discount: posDiscount,
      total: cartNet,
      paid: posPaid,
      due: cartDue,
      paymentMethod: 'Cash'
    };
    createPharmacySale(sale);
    setCart([]);
    setPosDiscount(0);
    setPosPaid(0);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy Management & Counter POS</h1>
          <p className="page-subtitle">Retail Counter Sales, Medicine Stock, Expiry FEFO & Supplier Invoicing</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setCurrentView('pharmacy-pos')}
          >
            <CreditCard size={16} /> Open Counter POS
          </button>
        </div>
      </div>

      {/* Sub-tabs bar matching SihatSuite exact subnavigation */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${currentView === 'pharmacy-overview' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-overview')}
        >
          <Store size={15} /> Overview
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-pos' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-pos')}
        >
          <CreditCard size={15} /> Counter (POS)
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-sales' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-sales')}
        >
          <TrendingUp size={15} /> Sales History
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-products' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-products')}
        >
          <Boxes size={15} /> Products & Stock
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-purchases' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-purchases')}
        >
          <ShoppingCart size={15} /> Purchases
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-suppliers' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-suppliers')}
        >
          <TruckIcon size={15} /> Suppliers
        </button>
        <button
          className={`subtab-btn ${currentView === 'pharmacy-reports' ? 'active' : ''}`}
          onClick={() => setCurrentView('pharmacy-reports')}
        >
          <BarChart3 size={15} /> Pharmacy Reports
        </button>
      </div>

      {/* 1. OVERVIEW */}
      {currentView === 'pharmacy-overview' && (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card kpi-cyan">
              <div>
                <div className="kpi-label">SALES TODAY</div>
                <div className="kpi-value">৳1,480.00</div>
                <div className="kpi-sub">8 counter receipts</div>
              </div>
              <div className="kpi-icon-wrap"><TrendingUp size={24} /></div>
            </div>

            <div className="kpi-card kpi-green">
              <div>
                <div className="kpi-label">COLLECTED TODAY</div>
                <div className="kpi-value">৳1,450.00</div>
                <div className="kpi-sub">৳30.00 customer due</div>
              </div>
              <div className="kpi-icon-wrap"><CreditCard size={24} /></div>
            </div>

            <div className="kpi-card kpi-purple">
              <div>
                <div className="kpi-label">STOCK VALUE (AT COST)</div>
                <div className="kpi-value">৳184,200.00</div>
                <div className="kpi-sub">Across 420 pharmaceutical items</div>
              </div>
              <div className="kpi-icon-wrap"><Boxes size={24} /></div>
            </div>

            <div className="kpi-card kpi-amber">
              <div>
                <div className="kpi-label">NEEDS ATTENTION</div>
                <div className="kpi-value">4 Items</div>
                <div className="kpi-sub">2 expiring soon, 2 low stock</div>
              </div>
              <div className="kpi-icon-wrap"><AlertTriangle size={24} /></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COUNTER (POS) */}
      {currentView === 'pharmacy-pos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left: Product Search & Cart Table */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              Barcode / Product Quick Search
            </h3>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div className="table-search-input" style={{ width: '100%' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Scan barcode or type medicine name (e.g. Napa, Seclo, Monas)…"
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                />
              </div>

              {posSearch && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-xl)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 50
                  }}
                >
                  {pharmacyProducts
                    .filter(p => p.brandName.toLowerCase().includes(posSearch.toLowerCase()) || p.genericName.toLowerCase().includes(posSearch.toLowerCase()))
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleAddToCart(p)}
                        style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong>{p.brandName}</strong> ({p.genericName})
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Stock: {p.stockUnits} units | Exp: {p.expiryDate}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#073f8f' }}>৳{p.mrp}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Cart Items Table */}
            <table className="custom-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Medicine Item</th>
                  <th>Unit MRP</th>
                  <th style={{ width: '80px' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(c => (
                  <tr key={c.product.id}>
                    <td>
                      <strong>{c.product.brandName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{c.product.genericName}</div>
                    </td>
                    <td>৳{c.product.mrp}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={c.qty}
                        onChange={e => {
                          const q = Number(e.target.value) || 1;
                          setCart(cart.map(x => x.product.id === c.product.id ? { ...x, qty: q, total: q * x.product.mrp } : x));
                        }}
                        style={{ width: '60px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{c.total.toFixed(2)}</td>
                    <td>
                      <button className="icon-btn" onClick={() => handleRemoveFromCart(c.product.id)}>
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Customer & Checkout Panel */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Checkout Panel</h3>
            <form onSubmit={handleCompleteSale} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Phone (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>৳{cartSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Discount (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={posDiscount}
                    onChange={e => setPosDiscount(Number(e.target.value) || 0)}
                    style={{ width: '80px', padding: '3px 6px', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                  <span>Net Payable:</span>
                  <span>৳{cartNet.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Paid Cash (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={posPaid}
                    onChange={e => setPosPaid(Number(e.target.value) || 0)}
                    style={{ width: '90px', padding: '4px 6px', textAlign: 'right', fontWeight: 700, border: '1px solid #073f8f', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: cartDue > 0 ? '#dc2626' : '#16a34a' }}>
                  <span>Due Balance:</span>
                  <span>৳{cartDue.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '44px', fontSize: '14px', marginTop: '6px' }}
              >
                <Printer size={16} /> Complete Sale & Print POS Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS */}
      {currentView === 'pharmacy-products' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Generic & Company</th>
                <th>Batch No</th>
                <th>Expiry</th>
                <th>MRP (৳)</th>
                <th>Stock Units</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pharmacyProducts.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.brandName}</strong></td>
                  <td>
                    <div>{p.genericName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.company}</div>
                  </td>
                  <td>{p.batchNo}</td>
                  <td>{p.expiryDate}</td>
                  <td>৳{p.mrp}</td>
                  <td><strong>{p.stockUnits}</strong> ({p.stockPacks} packs)</td>
                  <td><span className="badge badge-paid">In Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. SALES */}
      {currentView === 'pharmacy-sales' && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: '13px', color: '#64748b' }}>Counter Sales History</span>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items Sold</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: '#073f8f' }}>PS-2026-0001</strong></td>
                <td>2026-09-02 11:30 AM</td>
                <td>Md. Mizanur Rahman</td>
                <td>Napa Extra x 10</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>৳35.00</td>
                <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>৳35.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 5. PURCHASES & SUPPLIERS */}
      {currentView === 'pharmacy-suppliers' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Supplier Depot</th>
                <th>Contact</th>
                <th>Terms</th>
                <th style={{ textAlign: 'right' }}>Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s.company}</div>
                  </td>
                  <td>{s.phone} | {s.address}</td>
                  <td>{s.paymentTermsDays} Days Credit</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                    ৳{s.outstandingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. REPORTS */}
      {currentView === 'pharmacy-reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Pharmacy Financial & Stock Reports</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Daily sales, gross margins, near-expiry alerts and stock valuations</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => showToast('Report exported as CSV')}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {['Daily Sales Register', 'Gross Profit Margin', 'Stock Valuation at Cost', 'Near Expiry (Within 90 Days)', 'Low Stock Reorder Alert', 'Customer Due Ledger'].map((title, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{title}</div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '10px', width: '100%', fontSize: '11px' }}
                  onClick={() => showToast(`Generated ${title}`)}
                >
                  Generate View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
