import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, ExternalLink, X } from 'lucide-react';

interface TutorialVideo {
  id: string;
  category: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  bgGradient: string;
}

const TUTORIALS: TutorialVideo[] = [
  {
    id: 'vid-1',
    category: 'DIAGNOSTIC MANAGEMENT',
    title: 'Diagnostic Management System — Onboarding',
    description: 'A walkthrough of the diagnostic management module, from setting up your centre to running it day to day.',
    youtubeId: '41gB7AUWfJw',
    youtubeUrl: 'https://www.youtube.com/watch?v=41gB7AUWfJw',
    bgGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)'
  },
  {
    id: 'vid-2',
    category: 'PRESCRIPTION',
    title: 'Prescription Module',
    description: 'How doctors write, print and reuse e-prescriptions in CarePulse.',
    youtubeId: '8nA7m6bU4xU',
    youtubeUrl: 'https://www.youtube.com/watch?v=8nA7m6bU4xU',
    bgGradient: 'linear-gradient(135deg, #0f2922 0%, #064e3b 50%, #059669 100%)'
  }
];

export const TutorialsView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);

  return (
    <div className="tutorials-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f2922', margin: '0 0 6px 0' }}>
          Tutorials
        </h1>
        <p style={{ fontSize: '13.5px', color: '#4d6b63', margin: 0 }}>
          Short video walkthroughs of CarePulse. Play them here — no need to leave the app.
        </p>
      </div>

      {/* Video Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '36px'
        }}
      >
        {TUTORIALS.map(tut => (
          <div
            key={tut.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid #e1ece7',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Video Banner with Play Overlay */}
            <div
              style={{
                position: 'relative',
                height: '240px',
                background: tut.bgGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setActiveVideo(tut)}
              title="Click to play video"
            >
              {/* Subtle background branding text */}
              <div style={{ position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}>C</span>
                  </div>
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>CarePulse</span>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>
                  HD Walkthrough • Bangla & English
                </div>
              </div>

              {/* Large Play Button Overlay */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '999px',
                  background: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  zIndex: 2
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.background = '#047857';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = '#059669';
                }}
              >
                <Play size={26} fill="#ffffff" style={{ marginLeft: '4px' }} />
              </div>
            </div>

            {/* Video Meta Body */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0d9488',
                  marginBottom: '8px'
                }}
              >
                {tut.category}
              </div>

              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '8px',
                  lineHeight: 1.3
                }}
              >
                {tut.title}
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  flex: 1
                }}
              >
                {tut.description}
              </p>

              <div style={{ marginTop: 'auto' }}>
                <a
                  href={tut.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#059669',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Watch on YouTube
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support Note matching live site */}
      <div
        style={{
          borderTop: '1px solid #e1ece7',
          paddingTop: '20px',
          fontSize: '13px',
          color: '#4d6b63'
        }}
      >
        More videos are added over time. Something unclear in the meantime?{' '}
        <button
          type="button"
          onClick={() => setCurrentView('support')}
          style={{
            color: '#059669',
            fontWeight: 600,
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: 'inherit'
          }}
        >
          Ask our support team
        </button>
        .
      </div>

      {/* In-App Video Playback Modal */}
      {activeVideo && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveVideo(null)}
          style={{ zIndex: 120, background: 'rgba(15, 23, 42, 0.75)' }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '840px', width: '95%', padding: 0, overflow: 'hidden', background: '#000' }}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#0f172a',
                color: '#fff'
              }}
            >
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{activeVideo.title}</span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                style={{ color: '#94a3b8', display: 'flex', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Responsive 16:9 Video Frame */}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
