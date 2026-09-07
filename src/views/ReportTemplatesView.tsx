import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Copy, Check, Plus, Search } from 'lucide-react';

export const ReportTemplatesView: React.FC = () => {
  const { showToast } = useApp();
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates = [
    {
      id: 'tmpl-1',
      title: 'USG of Whole Abdomen (Normal Adult)',
      category: 'Whole Abdomen',
      content: `ULTRASONOGRAPHY OF WHOLE ABDOMEN

LIVER: Normal in size (13.5 cm), shape and homogeneous parenchymal echotexture. No focal solid or cystic space-occupying lesion (SOL) detected. Intrahepatic biliary radicals are not dilated. Portal vein is normal in caliber.

GALLBLADDER: Well distended, walls are smooth and uniform. Lumen is clear of any calculus or polyp. Common Bile Duct (CBD) is normal in caliber.

PANCREAS: Visualized portions appear normal in size and homogeneous echotexture. Main pancreatic duct is not dilated.

SPLEEN: Normal in size (9.8 cm) and homogeneous echotexture. No splenic focal lesion seen.

KIDNEYS: Both kidneys are normal in size, shape and anatomic position. Cortical thickness and corticomedullary differentiation are well maintained. No evidence of calculus, hydronephrosis, or SOL in either kidney.
- Right Kidney: 10.2 cm
- Left Kidney: 10.5 cm

URINARY BLADDER: Well filled with clear echo-free lumen. Walls are thin and smooth. No calculus, mass or diverticulum seen.

IMPRESSION:
Normal ultrasonographic study of whole abdomen.`
    },
    {
      id: 'tmpl-2',
      title: 'USG of Kidneys, Ureters & Bladder (KUB - Calculus)',
      category: 'KUB',
      content: `ULTRASONOGRAPHY OF KUB & PROSTATE

RIGHT KIDNEY: Normal in size and position. Cortical echotexture is preserved. No calculus or hydronephrosis.

LEFT KIDNEY: Mildly enlarged. Moderate hydronephrosis seen with dilatation of upper and mid calyceal system. A bright hyperechoic calculus measuring ~7.5 mm with acoustic posterior shadowing is noted at the upper ureteric junction.

URINARY BLADDER: Well distended. Wall thickness is normal. Lumen is clear.

PROSTATE: Normal in size (~22 gm) and homogeneous echotexture.

IMPRESSION:
Left upper ureteric calculus with moderate hydronephrosis.`
    },
    {
      id: 'tmpl-3',
      title: 'USG of Pregnancy Profile (Single Live Fetus)',
      category: 'Pregnancy',
      content: `OBSTETRIC ULTRASONOGRAPHY (PREGNANCY PROFILE)

GRAVID UTERUS: Shows a single, active, intrauterine fetus in cephalic presentation. Fetal cardiac activity is regular and strong. Fetal cardiac rate: 146 bpm. Adequate fetal movements noted.

BIOMETRY:
- Biparietal Diameter (BPD): 7.2 cm (~28 weeks 4 days)
- Femur Length (FL): 5.4 cm (~28 weeks 2 days)
- Abdominal Circumference (AC): 24.1 cm (~28 weeks 3 days)

PLACENTA: Anterior, Grade II maturity, clear of the internal cervical os.
LIQUOR AMNII: Amniotic fluid index (AFI) is adequate (~13.5 cm).
ESTIMATED FETAL WEIGHT (EFW): ~1250 gm (+/- 10%)

IMPRESSION:
Single live intrauterine pregnancy of approximately 28 weeks gestation in cephalic presentation. Placenta is anterior, non-previa. Adequate amniotic fluid.`
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Report template copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Diagnostic Report Templates</h1>
          <p className="page-subtitle">Standardized Ultrasonography, Radiology & Pathology Clinical Format Library</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['ALL', 'Whole Abdomen', 'KUB', 'Pregnancy'].map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {templates
          .filter(t => selectedCat === 'ALL' || t.category === selectedCat)
          .map(tmpl => (
            <div key={tmpl.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} color="#059669" />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{tmpl.title}</h3>
                  <span className="badge badge-inhouse">{tmpl.category}</span>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(tmpl.id, tmpl.content)}
                >
                  {copiedId === tmpl.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copiedId === tmpl.id ? 'Copied!' : 'Copy Template'}
                </button>
              </div>

              <pre
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--slate-200)',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  color: '#334155'
                }}
              >
                {tmpl.content}
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
};
