import {
  TenantSettings,
  DiagnosticTest,
  TestGroup,
  Doctor,
  Patient,
  Invoice,
  Chamber,
  Appointment,
  PharmacyProduct,
  Supplier,
  SendOutVendor,
  InventoryItem,
  User,
  AccountingTransaction
} from '../types';

export const INITIAL_TENANT_SETTINGS: TenantSettings = {
  name: 'Jhalakathi Diagnostic Center',
  bengaliName: 'ঝালকাঠি ডায়াগনস্টিক সেন্টার',
  slug: 'jhalakathid',
  established: '2019',
  phone: '01711-234567',
  phone2: '01812-987654',
  hotline: '09612-888999',
  email: 'info@jhalakathid.com',
  address: 'Hospital Road, Sadar',
  thana: 'Jhalakathi Sadar',
  district: 'Jhalakathi',
  currency: '৳',
  invoicePrefix: 'INV-2026-',
  samplePrefix: 'SMP-',
  patientPrefix: 'PAT-',
  defaultVatPercent: 0,
  thermalWidth: '80mm',
  defaultPrintFormat: 'thermal',
  enableWhatsAppNotifications: true,
  smsCreditBalance: 840,
  reportDisclaimer: 'All clinical reports are verified by authorized consultant pathologists. In case of any discrepancy, please contact within 7 days.',
  departmentSignatures: [
    {
      department: 'BIOCHEMISTRY',
      technicianName: 'Md. Al-Amin',
      technicianQualification: 'B.Sc (Medical Technology), Dhaka University',
      technicianShow: true,
      doctorName: 'Dr. Nusrat Jahan',
      doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU',
      doctorShow: true
    },
    {
      department: 'IMMUNOLOGY',
      technicianName: 'Farzana Parvin',
      technicianQualification: 'Diploma in Medical Technology (Laboratory)',
      technicianShow: true,
      doctorName: 'Dr. Nusrat Jahan',
      doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU',
      doctorShow: true
    },
    {
      department: 'HORMONE',
      technicianName: 'Md. Al-Amin',
      technicianQualification: 'B.Sc in Laboratory Medicine',
      technicianShow: true,
      doctorName: 'Dr. Kazi Mahfuzur Rahman',
      doctorQualification: 'MBBS, MD (Endocrinology & Metabolism)',
      doctorShow: true
    },
    {
      department: 'HAEMATOLOGY',
      technicianName: 'Farzana Parvin',
      technicianQualification: 'Diploma in Medical Technology (Laboratory)',
      technicianShow: true,
      doctorName: 'Prof. Dr. M. A. Rahman',
      doctorQualification: 'MBBS, FCPS (Haematology)',
      doctorShow: true
    },
    {
      department: 'MICROBIOLOGY',
      technicianName: 'Md. Masum Billah',
      technicianQualification: 'B.Sc (Honours), M.Sc (Microbiology)',
      technicianShow: true,
      doctorName: 'Dr. Shahreen Akhter',
      doctorQualification: 'MBBS, M.Phil (Microbiology)',
      doctorShow: true
    },
    {
      department: 'SEROLOGY',
      technicianName: 'Farzana Parvin',
      technicianQualification: 'Diploma in Medical Technology (Laboratory)',
      technicianShow: true,
      doctorName: 'Dr. Nusrat Jahan',
      doctorQualification: 'MBBS, M.Phil (Biochemistry), BSMMU',
      doctorShow: true
    },
    {
      department: 'PATHOLOGY',
      technicianName: 'Md. Al-Amin',
      technicianQualification: 'B.Sc (Medical Technology)',
      technicianShow: true,
      doctorName: 'Dr. K. M. Abdullah',
      doctorQualification: 'MBBS, DCP (Clinical Pathology), BSMMU',
      doctorShow: true
    },
    {
      department: 'RADIOLOGY',
      technicianName: 'Md. Kamal Hossain',
      technicianQualification: 'Diploma in Radiography & Imaging Technology',
      technicianShow: true,
      doctorName: 'Dr. Sayeedul Islam',
      doctorQualification: 'MBBS, FCPS (Radiology & Imaging)',
      doctorShow: true
    }
  ]
};

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Prof. Dr. M. A. Rahman',
    degrees: 'MBBS, FCPS (Medicine), MD (Cardiology)',
    specialty: 'Medicine & Cardiology Specialist',
    designation: 'Professor & Head of Cardiology',
    hospital: 'Sher-e-Bangla Medical College Hospital',
    phone: '01712-334455',
    email: 'dr.rahman@gmail.com',
    commissionType: 'percentage',
    commissionValue: 30,
    active: true,
    totalReferrals: 142,
    totalCommissionEarned: 42600,
    totalCommissionPaid: 35000
  },
  {
    id: 'doc-2',
    name: 'Dr. Nusrat Jahan',
    degrees: 'MBBS, DGO, MCPS (Obs & Gynae)',
    specialty: 'Gynecologist & Obstetrician',
    designation: 'Associate Professor',
    hospital: 'Jhalakathi District Hospital',
    phone: '01819-445566',
    email: 'dr.nusrat@yahoo.com',
    commissionType: 'percentage',
    commissionValue: 25,
    active: true,
    totalReferrals: 98,
    totalCommissionEarned: 29400,
    totalCommissionPaid: 25000
  },
  {
    id: 'doc-3',
    name: 'Dr. Tanvir Ahmed',
    degrees: 'MBBS, MD (Pediatrics)',
    specialty: 'Child & Pediatric Specialist',
    designation: 'Consultant',
    hospital: 'Mother & Child Care Center',
    phone: '01911-778899',
    commissionType: 'fixed',
    commissionValue: 150,
    active: true,
    totalReferrals: 64,
    totalCommissionEarned: 9600,
    totalCommissionPaid: 9600
  },
  {
    id: 'doc-4',
    name: 'Dr. Kazi Shahidul Islam',
    degrees: 'MBBS, MS (Orthopedics)',
    specialty: 'Orthopedic & Spine Surgeon',
    designation: 'Senior Consultant',
    hospital: 'General Hospital, Barishal',
    phone: '01715-998877',
    commissionType: 'percentage',
    commissionValue: 20,
    active: true,
    totalReferrals: 51,
    totalCommissionEarned: 15300,
    totalCommissionPaid: 10000
  }
];

export const INITIAL_TESTS: DiagnosticTest[] = [
  // Haematology
  {
    id: 't-cbc',
    code: 'HAEM-01',
    name: 'Complete Blood Count (CBC) with ESR',
    category: 'Haematology',
    price: 450,
    costPrice: 120,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 3,
    isDiscountable: true,
    normalRange: 'See breakdown',
    unit: 'Multi'
  },
  {
    id: 't-hb',
    code: 'HAEM-02',
    name: 'Hemoglobin (Hb%)',
    category: 'Haematology',
    price: 180,
    costPrice: 40,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Male: 13-17, Female: 12-15',
    unit: 'g/dL'
  },
  {
    id: 't-esr',
    code: 'HAEM-03',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'Haematology',
    price: 150,
    costPrice: 30,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '0 - 20',
    unit: 'mm in 1st hr'
  },
  {
    id: 't-platelet',
    code: 'HAEM-04',
    name: 'Platelet Count',
    category: 'Haematology',
    price: 250,
    costPrice: 50,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '150,000 - 450,000',
    unit: '/cu.mm'
  },
  {
    id: 't-btct',
    code: 'HAEM-05',
    name: 'Bleeding Time & Clotting Time (BT & CT)',
    category: 'Haematology',
    price: 200,
    costPrice: 30,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'BT: 1-5 min, CT: 4-10 min',
    unit: 'Minutes'
  },
  {
    id: 't-blood-group',
    code: 'HAEM-06',
    name: 'Blood Grouping & Rh Factor',
    category: 'Haematology',
    price: 150,
    costPrice: 35,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 1,
    isDiscountable: false,
    normalRange: 'ABO & Rh',
    unit: ''
  },
  {
    id: 't-pbf',
    code: 'HAEM-07',
    name: 'Peripheral Blood Film (PBF)',
    category: 'Haematology',
    price: 500,
    costPrice: 100,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 6,
    isDiscountable: true,
    normalRange: 'Normocytic Normochromic',
    unit: ''
  },

  // Biochemistry
  {
    id: 't-rbs',
    code: 'BIO-01',
    name: 'Random Blood Sugar (RBS)',
    category: 'Biochemistry',
    price: 150,
    costPrice: 25,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: '< 7.8',
    unit: 'mmol/L'
  },
  {
    id: 't-fbs',
    code: 'BIO-02',
    name: 'Fasting Blood Sugar (FBS)',
    category: 'Biochemistry',
    price: 150,
    costPrice: 25,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: '3.9 - 6.1',
    unit: 'mmol/L'
  },
  {
    id: 't-hba1c',
    code: 'BIO-03',
    name: 'Hemoglobin A1c (HbA1c)',
    category: 'Biochemistry',
    price: 850,
    costPrice: 250,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 4,
    isDiscountable: true,
    normalRange: '< 5.7% Non-diabetic',
    unit: '%'
  },
  {
    id: 't-creatinine',
    code: 'BIO-04',
    name: 'Serum Creatinine with eGFR',
    category: 'Biochemistry',
    price: 350,
    costPrice: 70,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Male: 0.7 - 1.3, Female: 0.5 - 1.1',
    unit: 'mg/dL'
  },
  {
    id: 't-urea',
    code: 'BIO-05',
    name: 'Blood Urea',
    category: 'Biochemistry',
    price: 300,
    costPrice: 60,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '15 - 45',
    unit: 'mg/dL'
  },
  {
    id: 't-uric-acid',
    code: 'BIO-06',
    name: 'Serum Uric Acid',
    category: 'Biochemistry',
    price: 350,
    costPrice: 70,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '3.5 - 7.2',
    unit: 'mg/dL'
  },
  {
    id: 't-lipid',
    code: 'BIO-07',
    name: 'Lipid Profile (Cholesterol, TG, HDL, LDL)',
    category: 'Biochemistry',
    price: 950,
    costPrice: 260,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 4,
    isDiscountable: true,
    normalRange: 'Chol: <200, TG: <150',
    unit: 'mg/dL'
  },
  {
    id: 't-sgpt',
    code: 'BIO-08',
    name: 'Serum ALT / SGPT',
    category: 'Biochemistry',
    price: 350,
    costPrice: 65,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '< 45',
    unit: 'U/L'
  },
  {
    id: 't-sgot',
    code: 'BIO-09',
    name: 'Serum AST / SGOT',
    category: 'Biochemistry',
    price: 350,
    costPrice: 65,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '< 35',
    unit: 'U/L'
  },
  {
    id: 't-bilirubin',
    code: 'BIO-10',
    name: 'Serum Bilirubin (Total & Direct)',
    category: 'Biochemistry',
    price: 300,
    costPrice: 60,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Total: 0.2 - 1.2',
    unit: 'mg/dL'
  },
  {
    id: 't-electrolytes',
    code: 'BIO-11',
    name: 'Serum Electrolytes (Na+, K+, Cl-)',
    category: 'Biochemistry',
    price: 800,
    costPrice: 220,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 3,
    isDiscountable: true,
    normalRange: 'Na: 135-145, K: 3.5-5.1',
    unit: 'mmol/L'
  },

  // Serology & Immunology
  {
    id: 't-hbsag',
    code: 'SERO-01',
    name: 'HBsAg (Screening Strip / ELISA)',
    category: 'Serology & Immunology',
    price: 350,
    costPrice: 60,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Negative',
    unit: ''
  },
  {
    id: 't-hcv',
    code: 'SERO-02',
    name: 'Anti-HCV (Hepatitis C Virus)',
    category: 'Serology & Immunology',
    price: 500,
    costPrice: 110,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Negative',
    unit: ''
  },
  {
    id: 't-widal',
    code: 'SERO-03',
    name: 'Widal Test (Enteric Fever / Typhoid)',
    category: 'Serology & Immunology',
    price: 350,
    costPrice: 70,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 3,
    isDiscountable: true,
    normalRange: 'TO & TH < 1:80',
    unit: 'Titre'
  },
  {
    id: 't-dengue-ns1',
    code: 'SERO-04',
    name: 'Dengue NS1 Antigen + IgG/IgM',
    category: 'Serology & Immunology',
    price: 750,
    costPrice: 280,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Negative',
    unit: ''
  },
  {
    id: 't-crp',
    code: 'SERO-05',
    name: 'C-Reactive Protein (CRP Quantitative)',
    category: 'Serology & Immunology',
    price: 450,
    costPrice: 110,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: '< 6.0',
    unit: 'mg/L'
  },
  {
    id: 't-tsh',
    code: 'SERO-06',
    name: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Serology & Immunology',
    price: 600,
    costPrice: 160,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 4,
    isDiscountable: true,
    normalRange: '0.4 - 4.5',
    unit: 'μIU/mL'
  },
  {
    id: 't-ft4',
    code: 'SERO-07',
    name: 'Free T4 (FT4)',
    category: 'Serology & Immunology',
    price: 650,
    costPrice: 180,
    vendorType: 'In-house',
    sampleType: 'Blood',
    turnaroundHours: 4,
    isDiscountable: true,
    normalRange: '0.8 - 1.8',
    unit: 'ng/dL'
  },

  // Clinical Pathology
  {
    id: 't-urine-rme',
    code: 'CP-01',
    name: 'Urine Routine & Microscopic Examination (R/M/E)',
    category: 'Clinical Pathology',
    price: 200,
    costPrice: 35,
    vendorType: 'In-house',
    sampleType: 'Urine',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Pus cells: 0-3, Sugar: Nil',
    unit: ''
  },
  {
    id: 't-stool-rme',
    code: 'CP-02',
    name: 'Stool Routine & Microscopic Examination (R/M/E)',
    category: 'Clinical Pathology',
    price: 200,
    costPrice: 35,
    vendorType: 'In-house',
    sampleType: 'Stool',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'No ova/parasites',
    unit: ''
  },
  {
    id: 't-semen',
    code: 'CP-03',
    name: 'Semen Analysis',
    category: 'Clinical Pathology',
    price: 600,
    costPrice: 90,
    vendorType: 'In-house',
    sampleType: 'Fluid',
    turnaroundHours: 4,
    isDiscountable: true,
    normalRange: 'Count: >15 mil/mL, Motility: >40%',
    unit: ''
  },

  // Ultrasonography
  {
    id: 't-usg-abd',
    code: 'USG-01',
    name: 'USG of Whole Abdomen',
    category: 'Ultrasonography (USG)',
    price: 1200,
    costPrice: 350,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Normal study',
    unit: ''
  },
  {
    id: 't-usg-preg',
    code: 'USG-02',
    name: 'USG of Pregnancy Profile with Anomaly / Growth',
    category: 'Ultrasonography (USG)',
    price: 1000,
    costPrice: 300,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Single active fetus',
    unit: ''
  },
  {
    id: 't-usg-kub',
    code: 'USG-03',
    name: 'USG of Kidneys, Ureters & Bladder (KUB) + Prostate',
    category: 'Ultrasonography (USG)',
    price: 900,
    costPrice: 250,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'No calculus or hydronephrosis',
    unit: ''
  },

  // Radiology / X-Ray
  {
    id: 't-xray-chest',
    code: 'RAD-01',
    name: 'Digital X-Ray Chest P/A View',
    category: 'X-Ray & Radiology',
    price: 500,
    costPrice: 150,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Clear lung fields, normal CTR',
    unit: ''
  },
  {
    id: 't-xray-lumbar',
    code: 'RAD-02',
    name: 'Digital X-Ray Lumbo-Sacral Spine (B/V)',
    category: 'X-Ray & Radiology',
    price: 800,
    costPrice: 250,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Normal alignment & disc spaces',
    unit: ''
  },

  // Cardiology
  {
    id: 't-ecg',
    code: 'CARD-01',
    name: 'Digital 12-Lead ECG with Interpretation',
    category: 'ECG & Cardiology',
    price: 350,
    costPrice: 60,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 1,
    isDiscountable: true,
    normalRange: 'Normal Sinus Rhythm',
    unit: ''
  },
  {
    id: 't-echo',
    code: 'CARD-02',
    name: '2D Echocardiography with Color Doppler',
    category: 'ECG & Cardiology',
    price: 2200,
    costPrice: 600,
    vendorType: 'In-house',
    sampleType: 'N/A',
    turnaroundHours: 2,
    isDiscountable: true,
    normalRange: 'Normal LV systolic function, EF > 60%',
    unit: ''
  },

  // Send-out / Reference Lab tests
  {
    id: 't-vit-d',
    code: 'SEND-01',
    name: 'Vitamin D (25-Hydroxy)',
    category: 'Biochemistry',
    price: 2400,
    costPrice: 1600,
    vendorType: 'Send-out',
    sampleType: 'Blood',
    turnaroundHours: 48,
    isDiscountable: false,
    normalRange: '30 - 100',
    unit: 'ng/mL'
  },
  {
    id: 't-b12',
    code: 'SEND-02',
    name: 'Vitamin B12 Level',
    category: 'Biochemistry',
    price: 1800,
    costPrice: 1200,
    vendorType: 'Send-out',
    sampleType: 'Blood',
    turnaroundHours: 48,
    isDiscountable: false,
    normalRange: '200 - 900',
    unit: 'pg/mL'
  }
];

export const INITIAL_TEST_GROUPS: TestGroup[] = [
  {
    id: 'grp-1',
    name: 'Diabetic Health Checkup Package',
    category: 'Profile',
    price: 1400,
    testIds: ['t-fbs', 't-hba1c', 't-creatinine', 't-urine-rme'],
    description: 'Complete baseline screening for diabetic patients'
  },
  {
    id: 'grp-2',
    name: 'Executive Cardiac Screening Package',
    category: 'Cardiology',
    price: 3600,
    testIds: ['t-lipid', 't-ecg', 't-echo', 't-rbs', 't-creatinine'],
    description: 'Comprehensive heart & vascular health evaluation'
  },
  {
    id: 'grp-3',
    name: 'Antenatal Screening Profile (ANC)',
    category: 'Gynae & Obs',
    price: 2100,
    testIds: ['t-cbc', 't-blood-group', 't-rbs', 't-hbsag', 't-urine-rme', 't-usg-preg'],
    description: 'Essential diagnostic panel for expectant mothers'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    code: 'PAT-2026-0001',
    name: 'Md. Rafiqul Islam',
    phone: '01718-123456',
    whatsApp: '01718123456',
    age: 48,
    ageUnit: 'yrs',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Kathalia Road, Jhalakathi Sadar',
    nid: '19784912839281',
    createdAt: '2026-08-28',
    visitCount: 3,
    totalBilled: 3450,
    outstandingDue: 0
  },
  {
    id: 'pat-2',
    code: 'PAT-2026-0002',
    name: 'Begum Rokeya Akter',
    phone: '01815-987654',
    whatsApp: '01815987654',
    age: 34,
    ageUnit: 'yrs',
    gender: 'Female',
    bloodGroup: 'O+',
    address: 'Rajapur Bazar, Jhalakathi',
    createdAt: '2026-08-30',
    visitCount: 2,
    totalBilled: 1850,
    outstandingDue: 450
  },
  {
    id: 'pat-3',
    code: 'PAT-2026-0003',
    name: 'Master Ayman Hossain',
    phone: '01912-345678',
    whatsApp: '01912345678',
    age: 8,
    ageUnit: 'yrs',
    gender: 'Male',
    bloodGroup: 'A+',
    address: 'Nalchity, Jhalakathi',
    createdAt: '2026-09-01',
    visitCount: 1,
    totalBilled: 1200,
    outstandingDue: 0
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-0001',
    date: '2026-09-02',
    time: '10:30 AM',
    patientId: 'pat-1',
    patientCode: 'PAT-2026-0001',
    patientName: 'Md. Rafiqul Islam',
    patientPhone: '01718-123456',
    patientAge: 48,
    patientGender: 'Male',
    type: 'Investigation',
    items: [
      {
        id: 'item-1',
        testId: 't-cbc',
        testName: 'Complete Blood Count (CBC) with ESR',
        category: 'Haematology',
        vendorType: 'In-house',
        price: 450,
        discountType: 'fixed',
        discountValue: 0,
        finalPrice: 450,
        sampleStatus: 'Report Ready'
      },
      {
        id: 'item-2',
        testId: 't-fbs',
        testName: 'Fasting Blood Sugar (FBS)',
        category: 'Biochemistry',
        vendorType: 'In-house',
        price: 150,
        discountType: 'fixed',
        discountValue: 0,
        finalPrice: 150,
        sampleStatus: 'Report Ready'
      },
      {
        id: 'item-3',
        testId: 't-creatinine',
        testName: 'Serum Creatinine with eGFR',
        category: 'Biochemistry',
        vendorType: 'In-house',
        price: 350,
        discountType: 'fixed',
        discountValue: 0,
        finalPrice: 350,
        sampleStatus: 'Report Ready'
      }
    ],
    referralDoctorId: 'doc-1',
    referralDoctorName: 'Prof. Dr. M. A. Rahman',
    referralCommissionAmount: 285,
    grossTotal: 950,
    discountType: 'fixed',
    discountValue: 50,
    discountAmount: 50,
    netTotal: 900,
    paidAmount: 900,
    dueAmount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'PAID',
    createdBy: 'jhalakathid_admin'
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2026-0002',
    date: '2026-09-02',
    time: '02:15 PM',
    patientId: 'pat-2',
    patientCode: 'PAT-2026-0002',
    patientName: 'Begum Rokeya Akter',
    patientPhone: '01815-987654',
    patientAge: 34,
    patientGender: 'Female',
    type: 'Investigation',
    items: [
      {
        id: 'item-4',
        testId: 't-usg-preg',
        testName: 'USG of Pregnancy Profile with Anomaly / Growth',
        category: 'Ultrasonography (USG)',
        vendorType: 'In-house',
        price: 1000,
        discountType: 'fixed',
        discountValue: 0,
        finalPrice: 1000,
        sampleStatus: 'Received'
      },
      {
        id: 'item-5',
        testId: 't-urine-rme',
        testName: 'Urine Routine & Microscopic Examination (R/M/E)',
        category: 'Clinical Pathology',
        vendorType: 'In-house',
        price: 200,
        discountType: 'fixed',
        discountValue: 0,
        finalPrice: 200,
        sampleStatus: 'Collected'
      }
    ],
    referralDoctorId: 'doc-2',
    referralDoctorName: 'Dr. Nusrat Jahan',
    referralCommissionAmount: 300,
    grossTotal: 1200,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    netTotal: 1200,
    paidAmount: 750,
    dueAmount: 450,
    paymentMethod: 'Mobile Banking',
    paymentStatus: 'PARTIAL',
    createdBy: 'jhalakathid_admin'
  }
];

export const INITIAL_CHAMBERS: Chamber[] = [
  {
    id: 'ch-1',
    name: 'Chamber 101 (Cardiology & Medicine)',
    roomNo: '101',
    doctorId: 'doc-1',
    doctorName: 'Prof. Dr. M. A. Rahman',
    visitingDays: ['Sat', 'Mon', 'Wed'],
    startTime: '04:00 PM',
    endTime: '08:00 PM',
    maxPatients: 30,
    consultationFee: 800,
    followUpFee: 400,
    phone: '01711-234567'
  },
  {
    id: 'ch-2',
    name: 'Chamber 102 (Gynaecology & Obs)',
    roomNo: '102',
    doctorId: 'doc-2',
    doctorName: 'Dr. Nusrat Jahan',
    visitingDays: ['Sat', 'Sun', 'Tue', 'Thu'],
    startTime: '03:00 PM',
    endTime: '07:00 PM',
    maxPatients: 25,
    consultationFee: 700,
    followUpFee: 400,
    phone: '01711-234567'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    serialNo: 1,
    date: '2026-09-03',
    timeSlot: '04:15 PM',
    patientId: 'pat-1',
    patientName: 'Md. Rafiqul Islam',
    patientPhone: '01718-123456',
    patientAge: 48,
    patientGender: 'Male',
    doctorId: 'doc-1',
    doctorName: 'Prof. Dr. M. A. Rahman',
    chamberId: 'ch-1',
    chamberName: 'Chamber 101',
    type: 'Follow-up',
    fee: 400,
    paymentStatus: 'Paid',
    status: 'Waiting',
    createdAt: '2026-09-02'
  },
  {
    id: 'app-2',
    serialNo: 2,
    date: '2026-09-03',
    timeSlot: '04:30 PM',
    patientId: 'pat-2',
    patientName: 'Begum Rokeya Akter',
    patientPhone: '01815-987654',
    patientAge: 34,
    patientGender: 'Female',
    doctorId: 'doc-1',
    doctorName: 'Prof. Dr. M. A. Rahman',
    chamberId: 'ch-1',
    chamberName: 'Chamber 101',
    type: 'New',
    fee: 800,
    paymentStatus: 'Paid',
    status: 'Waiting',
    createdAt: '2026-09-03'
  }
];

export const INITIAL_PHARMACY_PRODUCTS: PharmacyProduct[] = [
  {
    id: 'p-1',
    code: 'MED-01',
    brandName: 'Napa Extra 500mg+65mg',
    genericName: 'Paracetamol + Caffeine',
    company: 'Beximco Pharmaceuticals Ltd.',
    form: 'Tablet',
    strength: '500mg+65mg',
    packSize: 'Box of 200',
    mrp: 3.5,
    costPrice: 2.8,
    stockPacks: 12,
    stockUnits: 2400,
    unitsPerPack: 200,
    batchNo: 'NX-8821',
    expiryDate: '2028-04-30',
    reorderLevel: 500,
    prescriptionRequired: false
  },
  {
    id: 'p-2',
    code: 'MED-02',
    brandName: 'Seclo 20mg Capsule',
    genericName: 'Omeprazole',
    company: 'Square Pharmaceuticals PLC',
    form: 'Capsule',
    strength: '20mg',
    packSize: 'Box of 100',
    mrp: 7.0,
    costPrice: 5.6,
    stockPacks: 8,
    stockUnits: 800,
    unitsPerPack: 100,
    batchNo: 'SEC-3912',
    expiryDate: '2027-11-30',
    reorderLevel: 200,
    prescriptionRequired: false
  },
  {
    id: 'p-3',
    code: 'MED-03',
    brandName: 'Monas 10mg Tablet',
    genericName: 'Montelukast Sodium',
    company: 'Acme Laboratories Ltd.',
    form: 'Tablet',
    strength: '10mg',
    packSize: 'Box of 30',
    mrp: 17.5,
    costPrice: 14.0,
    stockPacks: 15,
    stockUnits: 450,
    unitsPerPack: 30,
    batchNo: 'MON-1002',
    expiryDate: '2027-08-31',
    reorderLevel: 100,
    prescriptionRequired: true
  },
  {
    id: 'p-4',
    code: 'MED-04',
    brandName: 'Ciprocin 500mg Tablet',
    genericName: 'Ciprofloxacin',
    company: 'Square Pharmaceuticals PLC',
    form: 'Tablet',
    strength: '500mg',
    packSize: 30,
    mrp: 16.0,
    costPrice: 12.8,
    stockPacks: 5,
    stockUnits: 150,
    unitsPerPack: 30,
    batchNo: 'CIP-4890',
    expiryDate: '2027-06-30',
    reorderLevel: 60,
    prescriptionRequired: true
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Square Pharmaceuticals Depot',
    company: 'Square Distribution Barishal',
    phone: '01713-112233',
    email: 'order.barishal@square.com',
    address: 'C&B Road, Barishal',
    paymentTermsDays: 30,
    outstandingBalance: 14500
  },
  {
    id: 'sup-2',
    name: 'Beximco Pharma Distribution',
    company: 'Beximco Pharma Ltd.',
    phone: '01714-223344',
    email: 'bex.barishal@beximco.net',
    address: 'Band Road, Barishal',
    paymentTermsDays: 21,
    outstandingBalance: 9800
  }
];

export const INITIAL_SENDOUT_VENDORS: SendOutVendor[] = [
  {
    id: 'vnd-1',
    name: 'Popular Diagnostic Reference Lab',
    contactPerson: 'Mr. M. Haque',
    phone: '01711-998811',
    email: 'referral@populardiagnostic.com',
    address: 'Dhanmondi, Dhaka',
    activeTestsCount: 85,
    balanceDue: 4200
  },
  {
    id: 'vnd-2',
    name: 'Square Hospital Reference Lab',
    contactPerson: 'Dr. Shahreen',
    phone: '01713-556677',
    email: 'lab.sendout@squarehospital.com',
    address: 'Panthapath, Dhaka',
    activeTestsCount: 40,
    balanceDue: 0
  }
];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv-item-1',
    code: 'RGT-CBC-01',
    name: 'CBC 3-Part Diluent Reagent (20L)',
    category: 'Haematology Reagent',
    unit: 'Canister',
    stockQty: 4,
    reorderLevel: 2,
    costPrice: 4200,
    location: 'Lab Store Room A',
    supplier: 'Sysmex Bangladesh',
    lastRestocked: '2026-08-15'
  },
  {
    id: 'inv-item-2',
    code: 'RGT-BIO-02',
    name: 'Creatinine Jaffe Reagent Kit',
    category: 'Biochemistry Reagent',
    unit: 'Kit (4x50ml)',
    stockQty: 6,
    reorderLevel: 3,
    costPrice: 1850,
    location: 'Reagent Fridge 1',
    supplier: 'Randox BD',
    lastRestocked: '2026-08-20'
  },
  {
    id: 'inv-item-3',
    code: 'CON-VAC-01',
    name: 'EDTA K3 Purple Top Vacutainer Tubes (100 pcs)',
    category: 'Blood Collection Consumable',
    unit: 'Box',
    stockQty: 18,
    reorderLevel: 5,
    costPrice: 650,
    location: 'Phlebotomy Counter',
    supplier: 'BD Medical Supplies',
    lastRestocked: '2026-08-25'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'System Administrator',
    username: 'jhalakathid_admin',
    email: 'admin@jhalakathid.com',
    phone: '01711-234567',
    role: 'Global Tenant Admin',
    isActive: true,
    active: true
  },
  {
    id: 'usr-2',
    name: 'Kamrul Hasan',
    username: 'kamrul_reception',
    email: 'kamrul@jhalakathid.com',
    phone: '01811-345678',
    role: 'Receptionist / Billing Clerk',
    isActive: true,
    active: true
  },
  {
    id: 'usr-3',
    name: 'Farzana Parvin',
    username: 'farzana_lab',
    email: 'farzana@jhalakathid.com',
    phone: '01912-456789',
    role: 'Medical Technologist / Pathologist',
    isActive: true,
    active: true
  }
];

export const INITIAL_TRANSACTIONS: AccountingTransaction[] = [
  {
    id: 'tx-1',
    date: '2026-09-02',
    type: 'INCOME',
    category: 'Diagnostic Collections',
    description: 'Daily cash collections from invoice billing',
    amount: 14650,
    paymentMethod: 'Cash',
    account: 'Main Cash Counter'
  },
  {
    id: 'tx-2',
    date: '2026-09-02',
    type: 'EXPENSE',
    category: 'Doctor Referral Commission',
    description: 'Commission payout to Prof. Dr. M. A. Rahman',
    amount: 5000,
    paymentMethod: 'Cash',
    account: 'Main Cash Counter',
    voucherNo: 'VCH-2026-089'
  },
  {
    id: 'tx-3',
    date: '2026-09-01',
    type: 'EXPENSE',
    category: 'Electricity Bill',
    description: 'WZPDCL monthly electric bill for August 2026',
    amount: 8750,
    paymentMethod: 'Mobile Banking',
    account: 'bKash Merchant',
    voucherNo: 'WZP-9921'
  }
];

export const initialUsers = INITIAL_USERS;
export const initialPatients = INITIAL_PATIENTS;
export const initialTests = INITIAL_TESTS;
export const initialInvoices = INITIAL_INVOICES;
export const initialDoctors = INITIAL_DOCTORS;
export const initialChambers = INITIAL_CHAMBERS;
export const initialAppointments = INITIAL_APPOINTMENTS;
export const initialPharmacyProducts = INITIAL_PHARMACY_PRODUCTS;
export const initialSuppliers = INITIAL_SUPPLIERS;
export const initialSendOutVendors = INITIAL_SENDOUT_VENDORS;
export const initialInventory = INITIAL_INVENTORY_ITEMS;
export const initialTransactions = INITIAL_TRANSACTIONS;
export const initialSettings = INITIAL_TENANT_SETTINGS;

