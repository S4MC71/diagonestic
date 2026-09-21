import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Copy,
  Check,
  Plus,
  Search,
  FileText,
  X,
  Sparkles,
  ChevronRight,
  Printer,
  Edit2
} from 'lucide-react';

interface ReportTemplateItem {
  id: string;
  title: string;
  category: string;
  modality: 'USG' | 'X-Ray' | 'ECG' | 'ECHO' | 'Endoscopy';
  findings: Record<string, string>;
  impression: string;
  comment?: string;
  rawText: string;
}

export const ReportTemplatesView: React.FC = () => {
  const { showToast, setCurrentView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('USG of Whole Abdomen');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Comprehensive Clinical Templates Database
  const TEMPLATES_DATABASE: ReportTemplateItem[] = [
    {
      id: 'tmpl-1',
      title: 'Whole Abdomen Normal (Male)',
      category: 'USG of Whole Abdomen',
      modality: 'USG',
      findings: {
        'LIVER': 'Normal in size (13.8 cm), shape and homogeneous parenchymal echotexture. No focal solid or cystic space-occupying lesion (SOL) detected. Intrahepatic biliary radicals are not dilated. Portal vein is normal in caliber.',
        'GALLBLADDER': 'Well distended, walls are thin, smooth and uniform. Lumen is completely clear of any calculus, sludge or polyp. Common Bile Duct (CBD) is normal in caliber.',
        'PANCREAS': 'Visualized portions appear normal in size and homogeneous echotexture. Main pancreatic duct is not dilated.',
        'SPLEEN': 'Normal in size (9.8 cm) and homogeneous parenchymal echotexture. No splenic focal lesion seen.',
        'KIDNEYS': 'Both kidneys are normal in size, shape and anatomic position. Corticomedullary differentiation is well preserved. Right Kidney: 10.2 cm, Left Kidney: 10.5 cm. No calculus, mass or hydronephrosis.',
        'URINARY BLADDER': 'Well distended with clear echo-free lumen. Walls are thin and regular. No intraluminal mass or calculus seen.',
        'PROSTATE': 'Normal in size (~22 gm) and homogeneous echotexture. Capsule is intact.'
      },
      impression: 'Normal ultrasonographic study of whole abdomen (Male).',
      comment: 'Clinically correlated with routine checkup.',
      rawText: `ULTRASONOGRAPHY OF WHOLE ABDOMEN (MALE)

LIVER: Normal in size (13.8 cm), shape and homogeneous parenchymal echotexture. No focal solid or cystic SOL detected. Intrahepatic biliary radicals are not dilated. Portal vein is normal in caliber.
GALLBLADDER: Well distended, walls are smooth and uniform. Lumen is completely clear. CBD is normal.
PANCREAS: Visualized portions appear normal in size and homogeneous echotexture.
SPLEEN: Normal in size (9.8 cm) and homogeneous parenchymal echotexture.
KIDNEYS: Both kidneys are normal in size, shape and anatomic position. Right: 10.2 cm, Left: 10.5 cm. No calculus or hydronephrosis.
URINARY BLADDER: Well distended with clear echo-free lumen. Walls are regular.
PROSTATE: Normal in size (~22 gm) with homogeneous echotexture.

IMPRESSION:
Normal ultrasonographic study of whole abdomen (Male).`
    },
    {
      id: 'tmpl-2',
      title: 'Whole Abdomen Fatty Liver (Grade II)',
      category: 'USG of Whole Abdomen',
      modality: 'USG',
      findings: {
        'LIVER': 'Enlarged in size (16.2 cm) with diffusely increased parenchymal echogenicity. Posterior beam attenuation noted with impaired visualization of intrahepatic vessels and diaphragm, consistent with Grade II fatty infiltration (Hepatic Steatosis). No focal SOL.',
        'GALLBLADDER': 'Distended, physiological wall thickness. Lumen is clear.',
        'SPLEEN & PANCREAS': 'Within normal physiological limits.',
        'KIDNEYS': 'Normal size and corticomedullary differentiation.'
      },
      impression: 'Hepatomegaly with Grade-II diffuse fatty liver (Hepatic Steatosis). Other organs unremarkable.',
      rawText: `ULTRASONOGRAPHY OF WHOLE ABDOMEN

LIVER: Enlarged in size (16.2 cm) with diffusely increased parenchymal echogenicity. Posterior attenuation noted with impaired visualization of intrahepatic vessels and diaphragm, consistent with Grade II fatty infiltration. No focal SOL.
GALLBLADDER: Distended, physiological wall thickness. Lumen is clear.
SPLEEN & PANCREAS: Within normal physiological limits.
KIDNEYS: Normal size and corticomedullary differentiation.

IMPRESSION:
Hepatomegaly with Grade-II diffuse fatty liver (Hepatic Steatosis).`
    },
    {
      id: 'tmpl-3',
      title: 'KUB & Prostate (Renal Calculus)',
      category: 'KUB',
      modality: 'USG',
      findings: {
        'RIGHT KIDNEY': 'Normal in size and position. Cortical echotexture is preserved. No calculus or hydronephrosis.',
        'LEFT KIDNEY': 'Mildly enlarged. Moderate hydronephrosis seen with dilatation of upper and mid calyceal system. A bright hyperechoic calculus measuring ~7.5 mm with acoustic posterior shadowing is noted at the upper ureteric junction.',
        'URINARY BLADDER': 'Well distended. Wall thickness is normal. Lumen is clear.',
        'PROSTATE': 'Normal in size (~24 gm) and homogeneous echotexture.'
      },
      impression: 'Left upper ureteric calculus (~7.5 mm) with left moderate hydronephrosis. Right kidney and bladder are unremarkable.',
      rawText: `ULTRASONOGRAPHY OF KUB & PROSTATE

RIGHT KIDNEY: Normal in size and position. Cortical echotexture is preserved. No calculus or hydronephrosis.
LEFT KIDNEY: Mildly enlarged. Moderate hydronephrosis seen with dilatation of upper and mid calyceal system. A bright hyperechoic calculus measuring ~7.5 mm with acoustic posterior shadowing is noted at the upper ureteric junction.
URINARY BLADDER: Well distended. Wall thickness is normal. Lumen is clear.
PROSTATE: Normal in size (~24 gm) and homogeneous echotexture.

IMPRESSION:
Left upper ureteric calculus (~7.5 mm) with left moderate hydronephrosis.`
    },
    {
      id: 'tmpl-4',
      title: 'KUB Female (Normal Urinary Tract)',
      category: 'KUB',
      modality: 'USG',
      findings: {
        'RIGHT KIDNEY': 'Bipolar length 10.1 cm. Normal cortex. No calculus or pelvicalyceal dilatation.',
        'LEFT KIDNEY': 'Bipolar length 10.4 cm. Normal cortex. No calculus or pelvicalyceal dilatation.',
        'URINARY BLADDER': 'Adequately distended. Mucosal outline is regular. Post-void residual volume (PVR) is insignificant (<15 ml).'
      },
      impression: 'Normal ultrasonographic study of kidneys, ureters and urinary bladder (KUB Female).',
      rawText: `ULTRASONOGRAPHY OF KUB (FEMALE)

RIGHT KIDNEY: Bipolar length 10.1 cm. Normal cortex. No calculus or pelvicalyceal dilatation.
LEFT KIDNEY: Bipolar length 10.4 cm. Normal cortex. No calculus or pelvicalyceal dilatation.
URINARY BLADDER: Adequately distended. Mucosal outline is regular. Post-void residual volume (PVR) is insignificant (<15 ml).

IMPRESSION:
Normal ultrasonographic study of kidneys, ureters and urinary bladder (KUB Female).`
    },
    {
      id: 'tmpl-5',
      title: 'Pregnancy Profile 28-Weeks (Single Live Fetus)',
      category: 'USG - Pregnancy Profile',
      modality: 'USG',
      findings: {
        'GRAVID UTERUS': 'Single active intrauterine fetus in cephalic presentation.',
        'FETAL HEART RATE': '146 bpm, regular and strong.',
        'FETAL BIOMETRY': 'BPD: 7.2 cm (~28w 4d), FL: 5.4 cm (~28w 2d), AC: 24.1 cm (~28w 3d). Composite gestational age: ~28 weeks.',
        'PLACENTA': 'Anterior, Grade II maturity, well away from internal os.',
        'LIQUOR AMNII': 'AFI is adequate (~13.5 cm).',
        'ESTIMATED WEIGHT': '~1250 gm (+/- 10%).'
      },
      impression: 'Single live intrauterine pregnancy of approximately 28 weeks in cephalic presentation with adequate liquor and non-previa anterior placenta.',
      rawText: `OBSTETRIC ULTRASONOGRAPHY (PREGNANCY PROFILE)

GRAVID UTERUS: Single active intrauterine fetus in cephalic presentation.
FETAL HEART RATE: 146 bpm, regular and strong.
FETAL BIOMETRY:
- BPD: 7.2 cm (~28w 4d)
- FL: 5.4 cm (~28w 2d)
- AC: 24.1 cm (~28w 3d)
Composite gestational age: ~28 weeks.
PLACENTA: Anterior, Grade II maturity, well away from internal os.
LIQUOR AMNII: AFI is adequate (~13.5 cm).
ESTIMATED FETAL WEIGHT (EFW): ~1250 gm (+/- 10%).

IMPRESSION:
Single live intrauterine pregnancy of approximately 28 weeks in cephalic presentation.`
    },
    {
      id: 'tmpl-6',
      title: 'Chest X-Ray P/A View (Normal)',
      category: 'Other USG & Radiology',
      modality: 'X-Ray',
      findings: {
        'LUNG FIELDS': 'Bilateral lung fields appear clear without any active focal consolidation, infiltrates or cavity.',
        'HEART': 'Cardiothoracic ratio (CTR) is within normal limits (<50%).',
        'C-P ANGLES': 'Both costophrenic and cardiophrenic angles are acute and clear.',
        'BONES & SOFT TISSUES': 'Thoracic cage bones and soft tissues are unremarkable.'
      },
      impression: 'Normal digital radiographic study of chest (P/A View).',
      rawText: `DIGITAL CHEST X-RAY (P/A VIEW)

LUNG FIELDS: Bilateral lung fields appear clear without any active focal consolidation, infiltrates or cavity.
HEART: Cardiothoracic ratio (CTR) is within normal limits (<50%).
C-P ANGLES: Both costophrenic and cardiophrenic angles are acute and clear.
BONES & SOFT TISSUES: Thoracic cage bones and soft tissues are unremarkable.

IMPRESSION:
Normal digital radiographic study of chest (P/A View).`
    }
  ];

  // Unique categories list with item counts
  const categories = [
    { name: 'USG of Whole Abdomen', count: 2 },
    { name: 'KUB', count: 2 },
    { name: 'USG - Pregnancy Profile', count: 1 },
    { name: 'Other USG & Radiology', count: 1 },
    { name: 'Echocardiography', count: 0 },
    { name: 'Thyroid & Neck USG', count: 0 }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Report template text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredTemplates = TEMPLATES_DATABASE.filter(t => {
    const matchesCat = t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.rawText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Report Templates
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Browse published report templates. Click any template to preview and copy its content.
          </p>
        </div>
      </div>

      {/* ====================================================================
          MAIN TWO-COLUMN OR THREE-COLUMN WORKSPACE
          Left: Categories List | Center: Template Cards | Right: Rich Preview
          ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTemplate ? '260px 340px 1fr' : '280px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* ==================================================================
            LEFT PANEL: CATEGORIES DIRECTORY (MATCHING SIHATSUITE)
            ================================================================== */}
        <div
          className="card"
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            Template Categories
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map(cat => (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedTemplate(null);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: selectedCategory === cat.name ? '#ecfdf5' : 'transparent',
                  color: selectedCategory === cat.name ? '#059669' : '#334155',
                  fontWeight: selectedCategory === cat.name ? 700 : 500,
                  fontSize: '13px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (selectedCategory !== cat.name) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={e => {
                  if (selectedCategory !== cat.name) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: selectedCategory === cat.name ? '#10b981' : '#f1f5f9',
                    color: selectedCategory === cat.name ? '#ffffff' : '#64748b',
                    fontWeight: 700
                  }}
                >
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================
            CENTER / MAIN GRID: TEMPLATE CARDS
            ================================================================== */}
        <div>
          {/* Search inside category */}
          <div className="table-search-input" style={{ width: '100%', marginBottom: '16px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder={`Search in ${selectedCategory}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                <BookOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div>No templates found in this category yet.</div>
              </div>
            ) : (
              filteredTemplates.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: selectedTemplate?.id === t.id ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: selectedTemplate?.id === t.id ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-inhouse" style={{ fontSize: '10px' }}>
                          {t.modality}
                        </span>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {t.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                        {t.impression}
                      </p>
                    </div>

                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT PANEL: SIDE-BY-SIDE RICH REPORT PREVIEW & COPY BUTTON
            ================================================================== */}
        {selectedTemplate && (
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '80px'
            }}
          >
            {/* Header with Title, Copy & Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-inhouse" style={{ fontSize: '10px', marginBottom: '4px' }}>
                  {selectedTemplate.category}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {selectedTemplate.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleCopy(selectedTemplate.rawText)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setSelectedTemplate(null)}
                  title="Close preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Formatted Report View */}
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px', fontSize: '13px' }}>
              <div style={{ marginBottom: '16px', fontWeight: 700, color: '#059669', fontSize: '14px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                Clinical Ultrasound Study
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(selectedTemplate.findings).map(([key, val]) => (
                  <div key={key}>
                    <strong style={{ color: '#0f172a', fontSize: '12px' }}>{key}:</strong>{' '}
                    <span style={{ color: '#334155', lineHeight: 1.5 }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '16px' }}>
                <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  IMPRESSION:
                </strong>
                <div style={{ color: '#059669', fontWeight: 700, lineHeight: 1.5 }}>
                  {selectedTemplate.impression}
                </div>
              </div>

              {selectedTemplate.comment && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  Comment: {selectedTemplate.comment}
                </div>
              )}
            </div>

            {/* Bottom Action: Apply to Lab Reports */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Standardized diagnostic findings format
              </span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  handleCopy(selectedTemplate.rawText);
                  setCurrentView('lab-reports');
                }}
              >
                Insert into Lab Report →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
