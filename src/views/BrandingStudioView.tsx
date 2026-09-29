import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Image,
  Palette,
  Megaphone,
  CheckCircle2,
  Calendar,
  Layers,
  QrCode
} from 'lucide-react';

export const BrandingStudioView: React.FC = () => {
  const { tenantSettings, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'essentials' | 'playbook' | 'templates' | 'studio'>('essentials');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Caption copied to clipboard!');
  };

  const templates = [
    {
      id: 'dengue-alert',
      category: 'Seasonal Health Alert',
      title: 'ডেঙ্গু প্রতিরোধ ও দ্রুততম এনএস১ (NS1 Ag) টেস্ট ক্যাম্পেইন',
      caption: `🚨 জ্বর হলে অবহেলা নয় — দ্রুত ডেঙ্গু পরীক্ষা করান!

${tenantSettings.name}-এ পাওয়া যাচ্ছে নির্ভুল ডেঙ্গু এনএস১ (Dengue NS1 Antigen) ও কমপ্লিট ব্লাড কাউন্ট (CBC) টেস্ট। 

✅ মাত্র ২ ঘণ্টার মধ্যে নির্ভুল ডিজিটাল রিপোর্ট
✅ ঘরে বসেই অনলাইনে রিপোর্ট ডাউনলোডের সুবিধা
✅ অভিজ্ঞ প্যাথলজিস্ট দ্বারা শতভাগ ভেরিফাইড রিপোর্ট

📍 ঠিকানা: ${tenantSettings.address}, ${tenantSettings.district}
📞 হটলাইন ও সিরিয়াল: ${tenantSettings.hotline || tenantSettings.phone}
🌐 অনলাইনে বুকিং করুন: https://${tenantSettings.slug || 'clinic'}.carepulse.app`,
    },
    {
      id: 'doctor-chamber',
      category: 'Doctor Chamber Schedule',
      title: 'প্রখ্যাত বিশেষজ্ঞ ডাক্তারের চেম্বার ও রোগী দেখার সময়সূচী',
      caption: `🩺 দক্ষ ও প্রখ্যাত বিশেষজ্ঞ ডাক্তারের পরামর্শ এখন আপনার খুব কাছেই!

${tenantSettings.name}-এ নিয়মিত রোগী দেখছেন ঢাকা থেকে আগত সিনিয়র কনসালট্যান্টগণ।

📅 ভিজিটিং ডে: প্রতি শুক্রবার ও শনিবার
⏰ সময়: সকাল ১০:০০ টা থেকে রাত ০৮:০০ টা
📌 চেম্বার রুম: চেম্বার-১০১

আপনার ও পরিবারের জন্য আগেই সিরিয়াল নিশ্চিত করুন:
📞 ফোন: ${tenantSettings.phone}
💬 হোয়াটসঅ্যাপ সিরিয়াল: ${tenantSettings.phone2 || tenantSettings.phone}

সুস্থ থাকুন, সঠিক পরামর্শে নিরাপদ থাকুন।`,
    },
    {
      id: 'health-package',
      category: 'Health Packages',
      title: 'এক্সিকিউটিভ হোল বডি হেলথ চেকআপ প্যাকেজ',
      caption: `🌿 আপনার ও আপনার বয়োবৃদ্ধ পিতা-মাতার সুস্বাস্থ্যের জন্য সম্পূর্ণ হেলথ চেকআপ!

আমাদের স্পেশাল হোল বডি চেকআপ প্যাকেজে অন্তর্ভুক্ত:
🔹 CBC with ESR (রক্তের সামগ্রিক পরীক্ষা)
🔹 Fasting Blood Sugar (ডায়াবেটিস পরীক্ষা)
🔹 Lipid Profile (কোলেস্টেরল ও হৃদরোগের ঝুঁকি)
🔹 Serum Creatinine (কিডনির কার্যকারিতা)
🔹 SGPT / ALT (লিভারের স্বাস্থ্য)
🔹 Urine R/M/E

💰 বিশেষ ছাড়সহ সম্পূর্ণ প্যাকেজ এখন মাত্র ৳২,২০০ টাকায়!
📍 ${tenantSettings.name}, ${tenantSettings.address}
📞 হটলাইন: ${tenantSettings.hotline || tenantSettings.phone}`,
    },
    {
      id: 'digital-report',
      category: 'Technology & Service',
      title: 'স্মার্ট ডায়াগনস্টিক — ঘরে বসেই মোবাইলে ডিজিটাল রিপোর্ট',
      caption: `📲 আর রিপোর্ট নিতে ক্লিনিকে দীর্ঘ লাইনে দাঁড়াতে হবে না!

${tenantSettings.name} নিয়ে এলো আধুনিক ডিজিটাল রিপোর্ট ট্র্যাকিং সিস্টেম:
✨ টেস্ট সম্পন্ন হওয়ার সাথে সাথে আপনার ফোনে চলে আসবে এসএমএস লিংক।
✨ যেকোনো সময় ঘরে বসেই রিপোর্ট ডাউনলোড ও প্রিন্ট করার সুবিধা।
✨ প্রেসক্রিপশনের কিউআর কোড (QR Code) স্ক্যান করে প্রেসক্রিপশন ও রিপোর্ট একসাথে দেখার সুবিধা।

সেরা প্রযুক্তি ও বিশ্বমানের প্যাথলজি সেবা পেতে আজই আসুন আমাদের সেন্টারে।
📞 হটলাইন: ${tenantSettings.phone}`,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Marketing & Branding Studio
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: '#fdf4ff',
              border: '1px solid #f0abfc',
              color: '#c026d3',
              fontSize: '11px',
              fontWeight: 800
            }}>
              <Sparkles size={12} />
              Growth & Local Reach
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Proven marketing playbooks, ready-to-use social media copy, and branding resources for your diagnostic center
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '8px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        {[
          { key: 'essentials', label: 'Brand Command Center', icon: Palette },
          { key: 'playbook', label: 'Local Growth Playbook', icon: BookOpen },
          { key: 'templates', label: 'Social Media Copy Templates', icon: Megaphone },
          { key: 'studio', label: 'Creative Studio & Canva', icon: Image },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: isActive ? '#059669' : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND COMMAND CENTER */}
      {activeTab === 'essentials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Center Identity Assets
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Center Name</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{tenantSettings.name}</div>
                {tenantSettings.bengaliName && (
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>{tenantSettings.bengaliName}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Established</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{tenantSettings.established || '2020'}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>District / Region</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{tenantSettings.district || 'Bangladesh'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Brand Voice & Tone</div>
                <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px', lineHeight: 1.5 }}>
                  <strong>Trustworthy · Accurate · Empathetic · Modern</strong><br />
                  Every post and SMS should convey clinical precision, hygiene, and patient care with polite Bengali tone.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Digital Presence Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Google Business Profile Verified', desc: 'Patients searching "diagnostic center near me" will find your location and reviews.', done: true },
                { title: 'Consistent Facebook Page Branding', desc: 'Profile picture and cover banner match the clinic entrance billboard.', done: true },
                { title: 'WhatsApp Business Catalog Activated', desc: 'Instant reply for test prices and doctor schedule requests.', done: true },
                { title: 'Prescription Pad QR Code Imprinted', desc: 'Patients scan QR code on invoice to download reports directly.', done: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCAL GROWTH PLAYBOOK */}
      {activeTab === 'playbook' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {[
            {
              title: 'Facebook Page Strategy (3-4 Posts / Week)',
              channel: 'Social Media',
              timing: 'Best Post Times: 11:30 AM & 08:30 PM',
              points: [
                'Post 1: Specialist doctor chamber visit reminder 2 days prior',
                'Post 2: Diagnostic test awareness (e.g. Dengue, Lipid, Diabetes)',
                'Post 3: Patient recovery testimony or lab technology highlight',
                'Always attach WhatsApp direct serial booking link in caption',
              ]
            },
            {
              title: 'Google Maps & Local SEO Domination',
              channel: 'Search Discovery',
              timing: 'Weekly Activity Required',
              points: [
                'Reply to 100% of reviews (both positive & critical) within 24 hours',
                'Upload 3 high-resolution photos of clean lab and reception every month',
                'Ensure accurate phone numbers and holiday opening times',
                'Collect Google 5-star reviews by sending SMS link after report delivery',
              ]
            },
            {
              title: 'Doctor Referral Outreach Program',
              channel: 'Medical Community',
              timing: 'Bi-weekly Medical Representative Visits',
              points: [
                'Distribute clean investigation referral requisition pads with center logo',
                'Provide automated instant commission disbursal via bKash / Cash',
                'Conduct continuing medical education (CME) tea meetings with local doctors',
                'Highlight automated 5-part hematology and automated biochemistry precision',
              ]
            },
            {
              title: 'Community Health Camps',
              channel: 'Local Visibility',
              timing: 'Quarterly Event in Sadar area',
              points: [
                'Offer Free Blood Group Determination camp on National Days',
                'Provide 50% discount coupons for diabetic screening (FBS + HbA1c)',
                'Partner with local schools and banks for employee annual checkups',
                'Live photo coverage on local Facebook groups and newspapers',
              ]
            },
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.channel}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                {card.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '14px' }}>
                ⏰ {card.timing}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {card.points.map((pt, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SOCIAL MEDIA TEMPLATES */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {templates.map(tpl => (
            <div
              key={tpl.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#ecfdf5',
                    color: '#059669',
                    marginBottom: '4px'
                  }}>
                    {tpl.category}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {tpl.title}
                  </h3>
                </div>

                <button
                  onClick={() => copyText(tpl.id, tpl.caption)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: copiedId === tpl.id ? '#ecfdf5' : '#0f172a',
                    color: copiedId === tpl.id ? '#059669' : '#fff',
                    border: copiedId === tpl.id ? '1px solid #10b981' : 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedId === tpl.id ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === tpl.id ? 'Copied!' : 'Copy Caption'}</span>
                </button>
              </div>

              <pre style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                fontFamily: 'Inter, system-ui, sans-serif',
                margin: 0
              }}>
                {tpl.caption}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CREATIVE STUDIO & CANVA */}
      {activeTab === 'studio' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              Pre-made Design Templates (Canva)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Use Canva to edit modern medical banners with your clinic name and phone number in seconds.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Facebook Post (1200 x 630 px)', desc: 'Standard banner for test discounts & doctor schedules', link: 'https://www.canva.com/search/templates?q=medical+clinic+banner' },
                { title: 'Facebook Story / WhatsApp Status (1080 x 1920 px)', desc: 'Vertical video or image for daily chamber reminders', link: 'https://www.canva.com/search/templates?q=medical+story' },
                { title: 'Prescription Pad Header (A4 210 x 35 mm)', desc: 'Official print-ready header for doctor prescriptions', link: 'https://www.canva.com/search/templates?q=prescription+pad' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 12px',
                      borderRadius: '6px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      color: '#059669',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              Standard Banner Dimensions
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
              Reference guidelines for your local digital printing press ( বিলবোর্ড ও ফেস্টুন সাইজ )
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Asset Type</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Dimension</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Format</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>Front Billboard</td>
                  <td style={{ padding: '10px' }}>20ft x 4ft (Panaview)</td>
                  <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>TIF / PDF (72 DPI)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>X-Banner Standee</td>
                  <td style={{ padding: '10px' }}>2ft x 5ft</td>
                  <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>PVC Vinyl Matte</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>Thermal Token Roll</td>
                  <td style={{ padding: '10px' }}>80mm Wide Thermal</td>
                  <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>POS Receipt Roll</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 700 }}>Report Cover File</td>
                  <td style={{ padding: '10px' }}>A4 Folder (300 GSM)</td>
                  <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>Artcard Gloss Lam</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
