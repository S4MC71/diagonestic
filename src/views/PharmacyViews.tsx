import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView, PharmacyProduct, PharmacySale } from '../types';

type PharmacySubtab = 'overview' | 'pos' | 'sales' | 'products' | 'purchases' | 'suppliers' | 'reports';

const VIEW_TO_SUBTAB: Record<string, PharmacySubtab> = {
  'pharmacy-overview': 'overview',
  'pharmacy-pos': 'pos',
  'pharmacy-sales': 'sales',
  'pharmacy-products': 'products',
  'pharmacy-purchases': 'purchases',
  'pharmacy-suppliers': 'suppliers',
  'pharmacy-reports': 'reports'
};

const SUBTAB_TO_VIEW: Record<PharmacySubtab, ActiveView> = {
  overview: 'pharmacy-overview',
  pos: 'pharmacy-pos',
  sales: 'pharmacy-sales',
  products: 'pharmacy-products',
  purchases: 'pharmacy-purchases',
  suppliers: 'pharmacy-suppliers',
  reports: 'pharmacy-reports'
};
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
  X,
  Keyboard,
  Receipt,
  RotateCcw,
  Sparkles,
  Percent,
  Coins,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';

const QUICK_ADD_ITEMS = [
  { brandName: 'Napa 500mg', form: 'Tablet', mrp: 1.2, genericName: 'Paracetamol' },
  { brandName: 'Napa Extra', form: 'Tablet', mrp: 3.5, genericName: 'Paracetamol + Caffeine' },
  { brandName: 'Seclo 20mg', form: 'Capsule', mrp: 7.0, genericName: 'Omeprazole' },
  { brandName: 'Ciprocin 500mg', form: 'Tablet', mrp: 16.0, genericName: 'Ciprofloxacin' },
  { brandName: 'Monas 10mg', form: 'Tablet', mrp: 17.5, genericName: 'Montelukast' },
  { brandName: 'Torax 10mg', form: 'Tablet', mrp: 12.0, genericName: 'Ketorolac' },
  { brandName: 'Fexo 120mg', form: 'Tablet', mrp: 10.0, genericName: 'Fexofenadine' },
  { brandName: 'Almex 400mg', form: 'Suspension', mrp: 25.0, genericName: 'Albendazole' }
];

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

  // Active subtab derived directly from currentView, ensuring 100% sync with sidebar and URL routing
  const activeSubtab: PharmacySubtab = VIEW_TO_SUBTAB[currentView] || 'overview';

  const handleSubtabChange = (tab: PharmacySubtab) => {
    setCurrentView(SUBTAB_TO_VIEW[tab]);
  };

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState<{ product: PharmacyProduct; qty: number; total: number }[]>([
    { product: pharmacyProducts[0], qty: 10, total: 35.0 }
  ]);
  const [customerType, setCustomerType] = useState<'walkin' | 'wholesale'>('walkin');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Due'>('Cash');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaid, setPosPaid] = useState<number>(35);

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // New product form
  const [newBrand, setNewBrand] = useState('');
  const [newGeneric, setNewGeneric] = useState('');
  const [newCompany, setNewCompany] = useState('Square Pharmaceuticals PLC');
  const [newForm, setNewForm] = useState('Tablet');
  const [newBatch, setNewBatch] = useState(`BT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newExpiry, setNewExpiry] = useState('2028-06-30');
  const [newCost, setNewCost] = useState<number>(2.5);
  const [newMrp, setNewMrp] = useState<number>(3.5);
  const [newStock, setNewStock] = useState<number>(200);

  // Purchases list state
  const [purchases, setPurchases] = useState([
    {
      id: 'po-1',
      challanNo: 'CH-8941',
      supplier: 'Square Pharmaceuticals Depot',
      date: '2026-09-15',
      itemsCount: 8,
      totalCost: 18450,
      paidAmount: 18450,
      status: 'Received'
    },
    {
      id: 'po-2',
      challanNo: 'CH-8942',
      supplier: 'Beximco Pharma Distribution',
      date: '2026-09-12',
      itemsCount: 5,
      totalCost: 12200,
      paidAmount: 10000,
      status: 'Partial'
    }
  ]);

  // Cart calculations
  const cartSubtotal = cart.reduce((s, i) => s + i.total, 0);
  const cartNet = Math.max(0, cartSubtotal - posDiscount);
  const changeReturn = Math.max(0, posPaid - cartNet);
  const cartDue = Math.max(0, cartNet - posPaid);

  const handleAddToCart = (product: PharmacyProduct) => {
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      setCart(
        cart.map(c =>
          c.product.id === product.id
            ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.product.mrp }
            : c
        )
      );
    } else {
      setCart([...cart, { product, qty: 1, total: product.mrp }]);
    }
    setPosSearch('');
  };

  const handleQuickAdd = (quick: (typeof QUICK_ADD_ITEMS)[0]) => {
    const matched = pharmacyProducts.find(p => p.brandName.toLowerCase().includes(quick.brandName.toLowerCase().split(' ')[0]));
    const prod: PharmacyProduct = matched || {
      id: `prod-${Date.now()}`,
      brandName: quick.brandName,
      genericName: quick.genericName,
      company: 'Square Pharmaceuticals PLC',
      form: quick.form,
      strength: 'Standard',
      mrp: quick.mrp,
      costPrice: quick.mrp * 0.8,
      stockUnits: 150,
      stockPacks: 15,
      packSize: 10,
      batchNo: 'B2609',
      expiryDate: '2028-12-31',
      reorderLevel: 20
    };
    handleAddToCart(prod);
    showToast(`Added ${quick.brandName} to cart`);
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
      paymentMethod: paymentMethod as any
    };
    createPharmacySale(sale);
    setCart([]);
    setPosDiscount(0);
    setPosPaid(0);
    window.print();
    showToast(`Sale ${sale.saleNo} completed & receipt printed!`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand) return;
    const p: PharmacyProduct = {
      id: `prod-${Date.now()}`,
      brandName: newBrand,
      genericName: newGeneric || 'Generic Compound',
      company: newCompany,
      form: newForm,
      strength: 'Standard',
      mrp: newMrp,
      costPrice: newCost,
      stockUnits: newStock,
      stockPacks: Math.ceil(newStock / 10),
      packSize: 10,
      batchNo: newBatch,
      expiryDate: newExpiry,
      reorderLevel: 20
    };
    pharmacyProducts.push(p);
    setShowAddProductModal(false);
    setNewBrand('');
    showToast(`Added new product: ${newBrand}`);
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy</h1>
          <p className="page-subtitle">
            Retail Counter POS, Medicine Stock, Purchases, Sales History & Supplier Credit
          </p>
        </div>

        <div className="page-actions">
          {activeSubtab !== 'pos' && (
            <button
              className="btn btn-primary"
              onClick={() => handleSubtabChange('pos')}
            >
              <CreditCard size={16} /> Open Counter POS
            </button>
          )}
          {activeSubtab === 'products' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddProductModal(true)}
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs bar matching SihatSuite: 7 Subtabs */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${activeSubtab === 'overview' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('overview')}
        >
          <Store size={15} /> Overview
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'pos' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('pos')}
        >
          <CreditCard size={15} /> Counter (POS)
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'sales' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('sales')}
        >
          <TrendingUp size={15} /> Sales
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'reports' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('reports')}
        >
          <BarChart3 size={15} /> Reports
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'products' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('products')}
        >
          <Boxes size={15} /> Products
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'purchases' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('purchases')}
        >
          <ShoppingCart size={15} /> Purchases
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'suppliers' ? 'active' : ''}`}
          onClick={() => handleSubtabChange('suppliers')}
        >
          <TruckIcon size={15} /> Suppliers
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW SUBTAB                                        */}
      {/* ========================================================= */}
      {activeSubtab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-grid">
            <div className="kpi-card kpi-cyan">
              <div>
                <div className="kpi-label">SALES TODAY</div>
                <div className="kpi-value">৳1,480.00</div>
                <div className="kpi-sub">8 counter receipts issued</div>
              </div>
              <div className="kpi-icon-wrap">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="kpi-card kpi-green">
              <div>
                <div className="kpi-label">COLLECTED TODAY</div>
                <div className="kpi-value">৳1,450.00</div>
                <div className="kpi-sub">৳30.00 customer credit due</div>
              </div>
              <div className="kpi-icon-wrap">
                <CreditCard size={24} />
              </div>
            </div>

            <div className="kpi-card kpi-purple">
              <div>
                <div className="kpi-label">STOCK VALUE (AT COST)</div>
                <div className="kpi-value">৳184,200.00</div>
                <div className="kpi-sub">Across 420 pharmaceutical items</div>
              </div>
              <div className="kpi-icon-wrap">
                <Boxes size={24} />
              </div>
            </div>

            <div className="kpi-card kpi-amber">
              <div>
                <div className="kpi-label">NEEDS ATTENTION</div>
                <div className="kpi-value">4 Items</div>
                <div className="kpi-sub">2 expiring soon, 2 low stock</div>
              </div>
              <div className="kpi-icon-wrap">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            {/* Fast-Moving Medicines Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Top Fast-Moving Medicines (Last 7 Days)
                </h3>
              </div>
              <table className="custom-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>BRAND NAME</th>
                    <th>GENERIC</th>
                    <th style={{ textAlign: 'right' }}>UNITS SOLD</th>
                    <th style={{ textAlign: 'right' }}>REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyProducts.slice(0, 5).map((p, idx) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#059669' }}>{p.brandName}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.form}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{p.genericName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{80 - idx * 12} units</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ৳{((80 - idx * 12) * p.mrp).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expiry Alert Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Near-Expiry Batches (FEFO)
                  </h3>
                  <span className="badge badge-due">2 Near Expiry</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '13px', color: '#9f1239' }}>Almex 400mg Suspension</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>Exp: 2026-10-31</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Batch: BT-8491 · 15 bottles remaining in stock
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '13px', color: '#92400e' }}>Ciprocin 500mg Strip</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>Exp: 2026-11-15</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Batch: BT-7721 · 30 tablets remaining in stock
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                onClick={() => showToast('Opening expiry return claim manager')}
              >
                Return Stock to Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COUNTER (POS) SUBTAB                                   */}
      {/* ========================================================= */}
      {activeSubtab === 'pos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Keyboard Shortcuts Toolbar matching SihatSuite */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '8px',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Keyboard size={14} /> Keyboard Shortcuts:
              </span>
              <span style={{ fontSize: '12px', color: '#334155' }}>
                <kbd style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>F2</kbd> Search
              </span>
              <span style={{ fontSize: '12px', color: '#334155' }}>
                <kbd style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>F4</kbd> Discount
              </span>
              <span style={{ fontSize: '12px', color: '#334155' }}>
                <kbd style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>F8</kbd> Hold Bill
              </span>
              <span style={{ fontSize: '12px', color: '#334155' }}>
                <kbd style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>F9</kbd> Tender & Print
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCart([])}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                <RotateCcw size={12} /> Clear Cart
              </button>
            </div>
          </div>

          {/* Quick Add Chips matching SihatSuite */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', alignSelf: 'center', whiteSpace: 'nowrap' }}>
              Fast OTC:
            </span>
            {QUICK_ADD_ITEMS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAdd(q)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.color = '#059669';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <strong>{q.brandName}</strong>
                <span style={{ color: '#059669', fontWeight: 700 }}>৳{q.mrp.toFixed(2)}</span>
              </button>
            ))}
          </div>

          {/* POS Split Grid: Left Product Search & Cart / Right Checkout Register */}
          <div className="pharmacy-pos-grid">
            {/* Left: Product Search & Cart Table */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <label className="form-label" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Barcode Scan or Medicine Name Search</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>F2 Active</span>
                </label>
                <div className="table-search-input" style={{ width: '100%' }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Scan barcode or type medicine name (e.g. Napa, Seclo, Monas)..."
                    value={posSearch}
                    onChange={e => setPosSearch(e.target.value)}
                  />
                </div>

                {posSearch && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '68px',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      zIndex: 50
                    }}
                  >
                    {pharmacyProducts
                      .filter(
                        p =>
                          p.brandName.toLowerCase().includes(posSearch.toLowerCase()) ||
                          p.genericName.toLowerCase().includes(posSearch.toLowerCase())
                      )
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleAddToCart(p)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div>
                            <strong style={{ color: '#0f172a' }}>{p.brandName}</strong> ({p.genericName})
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Stock: {p.stockUnits} units · Batch: {p.batchNo} · Exp: {p.expiryDate}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#059669' }}>৳{p.mrp.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Cart Items Table */}
              <table className="custom-table" style={{ fontSize: '12px', margin: 0 }}>
                <thead>
                  <tr>
                    <th>MEDICINE ITEM</th>
                    <th style={{ textAlign: 'right' }}>UNIT MRP</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>QTY</th>
                    <th style={{ textAlign: 'right' }}>TOTAL</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Cart is empty. Scan barcode or click Fast OTC chips above.
                      </td>
                    </tr>
                  ) : (
                    cart.map(c => (
                      <tr key={c.product.id}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{c.product.brandName}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {c.product.genericName} · {c.product.form}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>৳{c.product.mrp.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={c.qty}
                            onChange={e => {
                              const q = Number(e.target.value) || 1;
                              setCart(
                                cart.map(x =>
                                  x.product.id === c.product.id
                                    ? { ...x, qty: q, total: q * x.product.mrp }
                                    : x
                                )
                              );
                            }}
                            style={{
                              width: '60px',
                              padding: '3px 6px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontWeight: 700
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          ৳{c.total.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="icon-btn"
                            onClick={() => handleRemoveFromCart(c.product.id)}
                            style={{ color: '#dc2626' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right: Customer & Checkout Panel */}
            <div className="card" style={{ height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Register Checkout
                </h3>

                {/* Walk-in vs Wholesale toggle */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomerType('walkin')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: customerType === 'walkin' ? '#ffffff' : 'transparent',
                      boxShadow: customerType === 'walkin' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      color: customerType === 'walkin' ? '#059669' : '#64748b'
                    }}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('wholesale')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: customerType === 'wholesale' ? '#ffffff' : 'transparent',
                      boxShadow: customerType === 'wholesale' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      color: customerType === 'wholesale' ? '#059669' : '#64748b'
                    }}
                  >
                    Wholesale
                  </button>
                </div>
              </div>

              <form onSubmit={handleCompleteSale} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ height: '32px', fontSize: '12px' }}
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Mobile Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ height: '32px', fontSize: '12px' }}
                      placeholder="017XXXXXXXX"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Payment Method Chips */}
                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['Cash', 'bKash', 'Nagad', 'Card', 'Due'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m as any)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: paymentMethod === m ? '1px solid #059669' : '1px solid #e2e8f0',
                          background: paymentMethod === m ? '#ecfdf5' : '#ffffff',
                          color: paymentMethod === m ? '#047857' : '#475569'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Register Calculations */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Items Subtotal:</span>
                    <span>৳{cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Discount (F4):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>৳</span>
                      <input
                        type="number"
                        min="0"
                        value={posDiscount}
                        onChange={e => setPosDiscount(Number(e.target.value) || 0)}
                        style={{
                          width: '75px',
                          height: '26px',
                          padding: '2px 4px',
                          textAlign: 'right',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '16px',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px',
                      color: '#0f172a'
                    }}
                  >
                    <span>Net Total:</span>
                    <span style={{ color: '#059669' }}>৳{cartNet.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>Tender Cash (৳):</span>
                    <input
                      type="number"
                      min="0"
                      value={posPaid}
                      onChange={e => setPosPaid(Number(e.target.value) || 0)}
                      style={{
                        width: '85px',
                        height: '28px',
                        padding: '2px 6px',
                        textAlign: 'right',
                        fontWeight: 700,
                        border: '1.5px solid #059669',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  {changeReturn > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        color: '#0284c7',
                        background: '#f0f9ff',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginTop: '2px'
                      }}
                    >
                      <span>Change Return (ফেরত):</span>
                      <span>৳{changeReturn.toFixed(2)}</span>
                    </div>
                  )}

                  {cartDue > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        color: '#dc2626',
                        background: '#fef2f2',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginTop: '2px'
                      }}
                    >
                      <span>Customer Due:</span>
                      <span>৳{cartDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    height: '42px',
                    fontSize: '14px',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  <Printer size={16} /> Complete Sale & Print Slip (F9)
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SALES SUBTAB                                           */}
      {/* ========================================================= */}
      {activeSubtab === 'sales' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={15} color="#64748b" />
              <input type="text" placeholder="Search receipt number, customer..." />
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Exported sales history to XLS')}
            >
              <Download size={14} /> Export XLS
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>RECEIPT #</th>
                <th>DATE & TIME</th>
                <th>CUSTOMER</th>
                <th>ITEMS SOLD</th>
                <th style={{ textAlign: 'right' }}>SUBTOTAL</th>
                <th style={{ textAlign: 'right' }}>DISCOUNT</th>
                <th style={{ textAlign: 'right' }}>NET TOTAL</th>
                <th style={{ textAlign: 'right' }}>PAID</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pharmacySales.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {s.saleNo}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {s.date} · {s.time}
                  </td>
                  <td>
                    <strong>{s.customerName}</strong>
                    {s.customerPhone && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{s.customerPhone}</div>
                    )}
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {s.items.map(i => `${i.brandName} x${i.quantity}`).join(', ')}
                  </td>
                  <td style={{ textAlign: 'right' }}>৳{s.subtotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: '#dc2626' }}>৳{s.discount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ৳{s.total.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                    ৳{s.paid.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="icon-btn"
                      title="Reprint POS Receipt"
                      onClick={() => {
                        window.print();
                        showToast(`Reprinting receipt ${s.saleNo}`);
                      }}
                    >
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. REPORTS SUBTAB                                         */}
      {/* ========================================================= */}
      {activeSubtab === 'reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Pharmacy Financial & Stock Reports
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Daily sales journals, gross margins, near-expiry alerts and inventory valuation
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => showToast('Report exported as CSV')}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {[
              { title: 'Daily Counter Sales Register', desc: 'Itemized sales, discounts and cashier drawer reconciliations' },
              { title: 'Gross Profit Margins', desc: 'Net sales minus purchase acquisition costs by product' },
              { title: 'Stock Valuation at Cost & MRP', desc: 'Current pharmaceutical stock valuation based on FEFO' },
              { title: 'Near Expiry (Within 90 Days)', desc: 'Batches needing supplier returns or fast clearance' },
              { title: 'Low Stock Reorder Alert', desc: 'Items currently at or below minimum buffer units' },
              { title: 'Customer Credit & Due Ledger', desc: 'Corporate and wholesale customer outstanding balances' }
            ].map((rep, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{rep.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{rep.desc}</div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '11px', justifyContent: 'center' }}
                  onClick={() => showToast(`Generated report: ${rep.title}`)}
                >
                  Generate View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PRODUCTS SUBTAB                                        */}
      {/* ========================================================= */}
      {activeSubtab === 'products' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={15} color="#64748b" />
              <input type="text" placeholder="Search brand, generic, batch..." />
            </div>

            <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)}>
              <Plus size={15} /> + Add Medicine Product
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>BRAND NAME</th>
                <th>GENERIC & COMPANY</th>
                <th>BATCH NO</th>
                <th>EXPIRY</th>
                <th style={{ textAlign: 'right' }}>COST (৳)</th>
                <th style={{ textAlign: 'right' }}>MRP (৳)</th>
                <th style={{ textAlign: 'right' }}>STOCK</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pharmacyProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '13px' }}>{p.brandName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.form}</div>
                  </td>
                  <td>
                    <div>{p.genericName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.company}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{p.batchNo}</span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{p.expiryDate}</td>
                  <td style={{ textAlign: 'right' }}>৳{p.costPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{p.mrp.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    {p.stockUnits} units
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-paid">In Stock</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => showToast(`Edit medicine ${p.brandName}`)}
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
      {/* 6. PURCHASES SUBTAB                                       */}
      {/* ========================================================= */}
      {activeSubtab === 'purchases' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={15} color="#64748b" />
              <input type="text" placeholder="Search purchase challan, supplier..." />
            </div>

            <button className="btn btn-primary" onClick={() => setShowAddPurchaseModal(true)}>
              <Plus size={15} /> + New Purchase Bill
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>CHALLAN / INVOICE #</th>
                <th>SUPPLIER DEPOT</th>
                <th>PURCHASE DATE</th>
                <th style={{ textAlign: 'center' }}>ITEMS</th>
                <th style={{ textAlign: 'right' }}>TOTAL COST</th>
                <th style={{ textAlign: 'right' }}>PAID</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(po => (
                <tr key={po.id}>
                  <td>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {po.challanNo}
                    </strong>
                  </td>
                  <td>
                    <strong>{po.supplier}</strong>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{po.date}</td>
                  <td style={{ textAlign: 'center' }}>{po.itemsCount} products</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{po.totalCost.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                    ৳{po.paidAmount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-paid">{po.status}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Viewing invoice ${po.challanNo}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. SUPPLIERS SUBTAB                                       */}
      {/* ========================================================= */}
      {activeSubtab === 'suppliers' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Pharmaceutical Suppliers & Depots
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Manufacturer depots, credit terms, and payable balances
              </span>
            </div>

            <button className="btn btn-primary" onClick={() => setShowAddSupplierModal(true)}>
              <Plus size={15} /> + Add Supplier Depot
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>SUPPLIER DEPOT</th>
                <th>CONTACT DETAILS</th>
                <th>PAYMENT TERMS</th>
                <th style={{ textAlign: 'right' }}>OUTSTANDING DUE</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{s.name}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s.company}</div>
                  </td>
                  <td>
                    <div>Phone: {s.phone}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s.address}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {s.paymentTermsDays} Days Credit
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: s.outstandingBalance > 0 ? '#dc2626' : '#16a34a' }}>
                    ৳{s.outstandingBalance.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Settle ledger for ${s.name}`)}
                    >
                      Settle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Product                                        */}
      {/* ========================================================= */}
      {showAddProductModal && (
        <div className="modal-backdrop" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register Medicine Product</h3>
              <button className="icon-btn" onClick={() => setShowAddProductModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Brand Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Napa Extra 500mg"
                    value={newBrand}
                    onChange={e => setNewBrand(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Generic Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Paracetamol"
                      value={newGeneric}
                      onChange={e => setNewGeneric(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dosage Form</label>
                    <select
                      className="form-control"
                      value={newForm}
                      onChange={e => setNewForm(e.target.value)}
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Syrup</option>
                      <option>Suspension</option>
                      <option>Injection</option>
                      <option>Eye Drop</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Batch No.</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newBatch}
                      onChange={e => setNewBatch(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newExpiry}
                      onChange={e => setNewExpiry(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Cost Price (৳)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={newCost}
                      onChange={e => setNewCost(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit MRP (৳) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={newMrp}
                      onChange={e => setNewMrp(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Units</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newStock}
                      onChange={e => setNewStock(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Purchase Bill                                  */}
      {/* ========================================================= */}
      {showAddPurchaseModal && (
        <div className="modal-backdrop" onClick={() => setShowAddPurchaseModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Supplier Purchase Inward</h3>
              <button className="icon-btn" onClick={() => setShowAddPurchaseModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast('Purchase bill recorded in ledger');
                setShowAddPurchaseModal(false);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Supplier Depot</label>
                  <select className="form-control">
                    {suppliers.map(s => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Challan / Invoice Number *</label>
                  <input type="text" className="form-control" placeholder="CH-XXXX" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Bill Amount (৳) *</label>
                  <input type="number" className="form-control" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPurchaseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Supplier                                       */}
      {/* ========================================================= */}
      {showAddSupplierModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSupplierModal(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Supplier Depot</h3>
              <button className="icon-btn" onClick={() => setShowAddSupplierModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast('Supplier registered');
                setShowAddSupplierModal(false);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Depot / Distributor Name *</label>
                  <input type="text" className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pharmaceutical Company</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input type="text" className="form-control" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSupplierModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
