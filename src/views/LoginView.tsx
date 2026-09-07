import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { setCurrentView, setCurrentUser, users, showToast } = useApp();
  const [username, setUsername] = useState('lifecare_admin');
  const [password, setPassword] = useState('B8hAz3zRkyBr');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentUser(users[0]);
      setCurrentView('dashboard');
      showToast('Welcome back, LifeCare Diagnostic Admin!');
    }, 400);
  };

  const handleQuickDemo = () => {
    setCurrentUser(users[0]);
    setCurrentView('dashboard');
    showToast('Signed in with Demo Admin account');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Left Column - Hero Banner */}
      <div
        style={{
          position: 'relative',
          width: '46%',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#064e3b'
        }}
        className="login-left-banner"
      >
        {/* Background Gradients & Orbs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.3)',
            filter: 'blur(80px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-90px',
            left: '-90px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.25)',
            filter: 'blur(80px)'
          }}
        />

        {/* Content Box */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            padding: '48px'
          }}
        >
          {/* Brand header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/logo.svg"
                alt="CarePulse"
                style={{ height: '38px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                backdropFilter: 'blur(4px)'
              }}
            >
              Enterprise v2.6
            </span>
          </div>

          {/* Main Hero Content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              margin: '40px 0',
              gap: '24px'
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  border: '1px solid rgba(16, 185, 179, 0.3)',
                  background: 'rgba(16, 185, 179, 0.1)',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#5de8e2',
                  marginBottom: '16px'
                }}
              >
                <span>🇧🇩</span> Built for Bangladesh
              </span>

              <h2
                style={{
                  fontSize: '2.4rem',
                  fontWeight: '800',
                  lineHeight: '1.2',
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginBottom: '14px'
                }}
              >
                The software your
                <br />
                <span
                  style={{
                    background: 'linear-gradient(to right, #10b9b3, #5de8e2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  diagnostic center
                </span>{' '}
                runs on
              </h2>

              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.65)',
                  maxWidth: '480px'
                }}
              >
                Deliver reports on WhatsApp in Bangla, bill in Taka, track referral commissions, and
                print on your thermal machine — all in one place.
              </p>
            </div>

            {/* Feature Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(16, 185, 179, 0.25)',
                  background: 'rgba(16, 185, 179, 0.12)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#5de8e2'
                }}
              >
                WhatsApp Report Delivery
              </span>
              <span
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.75)'
                }}
              >
                Referral Tracking
              </span>
              <span
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.75)'
                }}
              >
                Automatic Updates
              </span>
              <span
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(251, 176, 64, 0.25)',
                  background: 'rgba(251, 176, 64, 0.12)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#fbd47a'
                }}
              >
                Thermal & A4 Printing
              </span>
              <span
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  background: 'rgba(167, 139, 250, 0.12)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#c4b5fd',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={13} /> AI Insights
                <span
                  style={{
                    background: 'rgba(167, 139, 250, 0.25)',
                    borderRadius: '999px',
                    padding: '1px 6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Live
                </span>
              </span>
            </div>

            {/* Metrics stats row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '20px'
              }}
            >
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>Low</p>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Monthly cost</p>
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>বাংলা</p>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>& English</p>
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>99.9%</p>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Uptime Cloud</p>
              </div>
            </div>
          </div>

          {/* Footer copyright */}
          <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
            © 2026 CarePulse Health Cloud. Empowering Modern Diagnostic Operations.
          </p>
        </div>
      </div>

      {/* Right Column - Sign In Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a' }}>Sign in</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
              >
                Username
              </label>
              <input
                type="text"
                className="form-control"
                style={{ height: '44px', borderRadius: '12px' }}
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
              >
                Password
              </label>
              <input
                type="password"
                className="form-control"
                style={{ height: '44px', borderRadius: '12px' }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#059669' }}
                />
                Remember me
              </label>
              <a
                href="#forgot"
                onClick={e => {
                  e.preventDefault();
                  alert('For password reset, please contact system admin: support@carepulse.health');
                }}
                style={{ color: '#059669', fontWeight: '600' }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                height: '46px',
                borderRadius: '12px',
                fontSize: '14px',
                marginTop: '6px',
                background: 'linear-gradient(135deg, #059669, #10b981)'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>

            {/* Instant Demo Access Button */}
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px dashed #10b981',
                  color: '#047857',
                  background: '#ecfdf5',
                  fontWeight: 600
                }}
                onClick={handleQuickDemo}
              >
                <ShieldCheck size={16} /> ⚡ 1-Click Demo Login (LifeCare Admin)
              </button>
            </div>
          </form>

          <p style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
            © 2026 CarePulse. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
