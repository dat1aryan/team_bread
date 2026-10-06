
import { MedicalDocument, PatientProfile, VitalTrendSeries } from '@/types';

export const DEFAULT_PATIENT: PatientProfile = {
  id: 'pat-rajesh-001',
  fullName: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  dateOfBirth: '1974-05-14',
  gender: 'male',
  bloodGroup: 'B+',
  phone: '+91 98765 43210',
  emergencyContact: '+91 98765 43211 (Sunita Kumar - Spouse)',
  preferredLanguage: 'en',
  abhaId: '91-2048-5892-1144',
  abhaAddress: 'rajesh.kumar@abdm',
  isAbhaVerified: false,
};

export const SAMPLE_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-lab-diabetic-01',
    userId: 'pat-rajesh-001',
    title: 'Comprehensive Diabetic & Lipid Health Profile',
    fileName: 'diabetic_lipid_panel_oct2026.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    documentType: 'LAB_REPORT',
    date: '2026-10-04',
    doctorName: 'Dr. Sunita Rao, MD (Endocrinology)',
    facilityName: 'Dr. Lal PathLabs - Central Reference Lab',
    rawOcrText: `DR. LAL PATHLABS - PATIENT REPORT
Patient: Rajesh Kumar | Age: 52 Y / Male | Ref by: Dr. Sunita Rao
Date of Collection: 04-Oct-2026 | Report Status: Final
-------------------------------------------------------------------
TEST NAME                      RESULT   UNIT       REFERENCE INTERVAL
HbA1c (Glycated Hemoglobin)    7.4      %          4.0 - 5.6 (Normal)
                                                   5.7 - 6.4 (Prediabetes)
                                                   > 6.5 (Diabetes)
Estimated Average Glucose      166      mg/dL      90 - 120
Fasting Blood Sugar (FBS)      162      mg/dL      70 - 100
Post Prandial Blood Sugar      218      mg/dL      < 140
Total Cholesterol              228      mg/dL      < 200 (Desirable)
LDL Cholesterol (Calculated)   148      mg/dL      < 100 (Optimal)
HDL Cholesterol                42       mg/dL      > 40 (Normal)
Triglycerides                  190      mg/dL      < 150 (Normal)
Serum Creatinine               0.92     mg/dL      0.70 - 1.20
eGFR (CKD-EPI)                 94       mL/min     > 90 (Normal)
Urine Albumin/Creatinine Ratio 18       mg/g       < 30 (Normal)
-------------------------------------------------------------------
Clinical Remarks: Glycemic indices reflect sub-optimal diabetic control.
Dyslipidemia with elevated LDL and triglycerides noted. Kidney function preserved.`,
    aiSummary: {
      headline: 'Sub-optimally Controlled Diabetes with Borderline High Cholesterol',
      simpleExplanation: 'This blood test evaluates how well your body is managing sugar and fats. Your average 3-month blood sugar (HbA1c is 7.4%) and fasting morning sugar (162 mg/dL) are both above standard targets, indicating that your current lifestyle and medicine plan needs a review with your doctor. Your kidney function remains healthy and strong.',
      whyItMatters: 'Keeping HbA1c closer to 6.5% - 7.0% protects your heart, kidneys, and eyes from long-term strain. Addressing the elevated LDL ("bad") cholesterol will keep your arteries flexible and clear.',
      urgencyLevel: 'CONSULT_SOON',
      urgencyReason: 'Your blood sugar and LDL cholesterol are moderately elevated. While not an immediate emergency, you should consult your endocrinologist within the next 7-10 days to adjust medication dosages.',
      keyActionItems: [
        'Schedule a routine follow-up with Dr. Sunita Rao to review diabetes medications.',
        'Begin daily morning fasting blood sugar logs using a home glucometer.',
        'Incorporate 30 minutes of brisk walking 5 days a week.',
        'Reduce refined carbs (white rice, maida, sweets) and substitute with millets and whole grains.'
      ],
      dietAndLifestyleTips: [
        'Include fiber-rich vegetables (fenugreek/methi, spinach, bitter gourd/karela) before major meals.',
        'Avoid late-night carbohydrates; aim for dinner at least 2.5 hours before sleeping.',
        'Stay well hydrated with 2.5 to 3 liters of water daily.'
      ],
      questionsForDoctor: [
        'Should we adjust the dosage of my Metformin or add a secondary oral medication to bring HbA1c below 7.0%?',
        'Would a low-dose statin (like Atorvastatin) be recommended to reduce my LDL cholesterol from 148 to under 100 mg/dL?',
        'Do I need to check my microalbumin or kidney function again in 3 months or 6 months?'
      ],
      flaggedAbnormalities: [
        {
          testName: 'HbA1c (Glycated Hemoglobin)',
          value: '7.4 %',
          status: 'HIGH',
          plainExplanation: 'Shows your average blood sugar over the past 3 months. Normal is below 5.7%. At 7.4%, sugars have been running slightly higher than ideal.',
          advice: 'Consult your doctor for medication adjustment and stick to low glycemic-index foods.'
        },
        {
          testName: 'Fasting Blood Sugar (FBS)',
          value: '162 mg/dL',
          status: 'HIGH',
          plainExplanation: 'Your blood sugar after an overnight fast. Normal is under 100 mg/dL. 162 mg/dL shows high liver sugar release overnight.',
          advice: 'Avoid carbs late at night; discuss with doctor if evening medicine timing needs shifting.'
        },
        {
          testName: 'Post Prandial Sugar (PP)',
          value: '218 mg/dL',
          status: 'HIGH',
          plainExplanation: 'Blood sugar measured 2 hours after breakfast. Normal is below 140 mg/dL.',
          advice: 'Control meal portion sizes; take a light 15-minute walk after meals.'
        },
        {
          testName: 'LDL Cholesterol',
          value: '148 mg/dL',
          status: 'HIGH',
          plainExplanation: 'Often called "bad cholesterol". Optimal level is below 100 mg/dL. Extra LDL can build up in arterial walls.',
          advice: 'Reduce fried foods and palm/coconut oils; use cold-pressed mustard or olive oil in moderation.'
        },
        {
          testName: 'Triglycerides',
          value: '190 mg/dL',
          status: 'HIGH',
          plainExplanation: 'Blood fats linked to sugar and carb intake. Normal is under 150 mg/dL.',
          advice: 'Limit processed sugars, bakery snacks, and alcohol.'
        }
      ]
    },
    medications: [],
    labObservations: [
      {
        id: 'obs-hba1c-01',
        testName: 'HbA1c (Glycated Hemoglobin)',
        category: 'Glycemic Control',
        value: 7.4,
        unit: '%',
        referenceLow: 4.0,
        referenceHigh: 5.6,
        referenceRangeString: '4.0 - 5.6 %',
        status: 'HIGH',
        loincCode: '4548-4',
        clinicalMeaning: 'Elevated 3-month average blood glucose indicative of sub-optimally controlled Type 2 Diabetes.',
        date: '2026-10-04'
      },
      {
        id: 'obs-fbs-01',
        testName: 'Fasting Blood Sugar (FBS)',
        category: 'Glycemic Control',
        value: 162,
        unit: 'mg/dL',
        referenceLow: 70,
        referenceHigh: 100,
        referenceRangeString: '70 - 100 mg/dL',
        status: 'HIGH',
        loincCode: '1558-6',
        clinicalMeaning: 'Elevated fasting morning blood glucose.',
        date: '2026-10-04'
      },
      {
        id: 'obs-pp-01',
        testName: 'Post Prandial Blood Sugar',
        category: 'Glycemic Control',
        value: 218,
        unit: 'mg/dL',
        referenceLow: 80,
        referenceHigh: 140,
        referenceRangeString: '< 140 mg/dL',
        status: 'HIGH',
        loincCode: '1521-4',
        clinicalMeaning: 'Elevated post-meal blood sugar spike.',
        date: '2026-10-04'
      },
      {
        id: 'obs-ldl-01',
        testName: 'LDL Cholesterol',
        category: 'Lipid Profile',
        value: 148,
        unit: 'mg/dL',
        referenceLow: 50,
        referenceHigh: 100,
        referenceRangeString: '< 100 mg/dL',
        status: 'HIGH',
        loincCode: '13457-7',
        clinicalMeaning: 'Elevated low-density lipoprotein (atherogenic marker).',
        date: '2026-10-04'
      },
      {
        id: 'obs-tg-01',
        testName: 'Triglycerides',
        category: 'Lipid Profile',
        value: 190,
        unit: 'mg/dL',
        referenceLow: 50,
        referenceHigh: 150,
        referenceRangeString: '< 150 mg/dL',
        status: 'HIGH',
        loincCode: '2571-8',
        clinicalMeaning: 'Moderate hypertriglyceridemia.',
        date: '2026-10-04'
      },
      {
        id: 'obs-creat-01',
        testName: 'Serum Creatinine',
        category: 'Kidney Function',
        value: 0.92,
        unit: 'mg/dL',
        referenceLow: 0.70,
        referenceHigh: 1.20,
        referenceRangeString: '0.70 - 1.20 mg/dL',
        status: 'NORMAL',
        loincCode: '2160-0',
        clinicalMeaning: 'Normal renal clearance and filtration capacity.',
        date: '2026-10-04'
      }
    ],
    diagnoses: [
      {
        id: 'diag-01',
        condition: 'Type 2 Diabetes Mellitus with sub-optimal glycemic control',
        icd10Code: 'E11.65',
        clinicalStatus: 'Active',
        notes: 'Target HbA1c < 7.0%'
      },
      {
        id: 'diag-02',
        condition: 'Mixed Dyslipidemia (Elevated LDL & Triglycerides)',
        icd10Code: 'E78.2',
        clinicalStatus: 'Active',
        notes: 'Lifestyle modification + Statin evaluation indicated'
      }
    ],
    createdAt: '2026-10-04T10:15:00Z'
  },
  {
    id: 'doc-rx-cardio-02',
    userId: 'pat-rajesh-001',
    title: 'Cardiology & Diabetes Prescription',
    fileName: 'prescription_dr_mehra_oct2026.png',
    fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    documentType: 'PRESCRIPTION',
    date: '2026-10-05',
    doctorName: 'Dr. Arvind Mehra, MD, DM (Cardiology)',
    facilityName: 'Apollo Heart Clinic OPD',
    rawOcrText: `APOLLO CLINIC - OPD PRESCRIPTION
Dr. Arvind Mehra, MD, DM (Cardiology) | Reg No: MCI-44289
Patient: Rajesh Kumar, 52/M | Date: 05/10/2026
Diagnosis: Essential Hypertension, Type 2 DM, Dyslipidemia
BP: 142/88 mmHg | Pulse: 76 bpm

Rx:
1. Tab Metformin 500mg SR
   Dose: 1 tablet - BD (Twice daily) - After food (PC) - 30 days
   [१ गोली सुबह और १ गोली रात खाने के बाद]

2. Tab Telmisartan 40mg
   Dose: 1 tablet - OD (Once daily morning) - Before food (AC) - 30 days
   [१ गोली सुबह खाली पेट या नाश्ते से पहले]

3. Tab Atorvastatin 10mg
   Dose: 1 tablet - HS (At bedtime) - After dinner - 30 days
   [१ गोली रात को सोते समय]

4. Tab Methylcobalamin + Alpha Lipoic Acid (Neurobion Forte)
   Dose: 1 tablet - OD (Once daily) - After lunch - 30 days

Advice:
- Restrict daily sodium salt to under 5 grams.
- Check BP every Wednesday and Saturday.
- Follow up after 30 days with repeat Fasting Blood Sugar.`,
    aiSummary: {
      headline: 'Cardiology & Blood Sugar Management Prescription',
      simpleExplanation: 'Dr. Mehra has prescribed 4 daily medications to manage your blood pressure, keep your blood sugar steady, protect your heart arteries from cholesterol buildup, and nourish nerve health.',
      whyItMatters: 'Consistent daily medication timing ensures your blood pressure stays below 130/80 mmHg and your heart is shielded against stroke and cardiovascular strain.',
      urgencyLevel: 'ROUTINE',
      urgencyReason: 'Active routine therapy. Follow the prescribed morning, afternoon, and night schedule strictly.',
      keyActionItems: [
        'Organize your pills into morning, afternoon, and bedtime slots.',
        'Keep dietary salt strictly limited to less than 1 teaspoon per day.',
        'Maintain a log of home blood pressure readings twice weekly.',
        'Never stop blood pressure or sugar medications abruptly.'
      ],
      dietAndLifestyleTips: [
        'Take Telmisartan first thing in the morning with a full glass of water.',
        'Take Atorvastatin at bedtime, as cholesterol synthesis in the liver peaks overnight.',
        'Stay away from packaged namkeens, pickles, and processed snacks high in hidden sodium.'
      ],
      questionsForDoctor: [
        'Should I continue the nerve vitamin supplement after the 30-day course finishes?',
        'What should I do if my home blood pressure drops below 110/70 mmHg?',
        'Are there any mild muscle aches I should watch out for with Atorvastatin?'
      ],
      flaggedAbnormalities: [
        {
          testName: 'Systolic Blood Pressure',
          value: '142 mmHg',
          status: 'HIGH',
          plainExplanation: 'Recorded at 142/88 mmHg. Optimal systolic is under 120 mmHg.',
          advice: 'Take prescribed Telmisartan daily and keep dietary salt under 1 teaspoon.'
        }
      ]
    },
    medications: [
      {
        id: 'med-metformin-01',
        name: 'Metformin SR',
        genericName: 'Metformin Hydrochloride (Sustained Release)',
        dosage: '500mg',
        frequency: 'Twice Daily (1-0-1)',
        route: 'Oral',
        timing: 'After Food',
        duration: '30 days',
        instructions: 'Take 1 tablet after breakfast and 1 tablet after dinner to control blood sugar.',
        timeOfDay: ['Morning', 'Night'],
        isActive: true
      },
      {
        id: 'med-telmisartan-01',
        name: 'Telmisartan',
        genericName: 'Telmisartan (Angiotensin Receptor Blocker)',
        dosage: '40mg',
        frequency: 'Once Daily (1-0-0)',
        route: 'Oral',
        timing: 'Before Food',
        duration: '30 days',
        instructions: 'Take 1 tablet every morning to keep blood pressure controlled.',
        timeOfDay: ['Morning'],
        isActive: true
      },
      {
        id: 'med-atorva-01',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '10mg',
        frequency: 'Once Daily at Bedtime (0-0-1)',
        route: 'Oral',
        timing: 'After Food',
        duration: '30 days',
        instructions: 'Take 1 tablet at bedtime to lower LDL bad cholesterol.',
        timeOfDay: ['Night'],
        isActive: true
      },
      {
        id: 'med-neuro-01',
        name: 'Neurobion Forte / Methylcobalamin',
        genericName: 'B-Complex Vitamins with Alpha Lipoic Acid',
        dosage: '1 Tab',
        frequency: 'Once Daily (0-1-0)',
        route: 'Oral',
        timing: 'After Food',
        duration: '30 days',
        instructions: 'Take 1 tablet after lunch for nerve protection and energy.',
        timeOfDay: ['Afternoon'],
        isActive: true
      }
    ],
    labObservations: [
      {
        id: 'obs-rx-bp-sys',
        testName: 'Systolic Blood Pressure',
        category: 'Cardiovascular',
        value: 142,
        unit: 'mmHg',
        referenceLow: 90,
        referenceHigh: 120,
        referenceRangeString: '110 - 130 mmHg',
        status: 'HIGH',
        loincCode: '8480-6',
        clinicalMeaning: 'Stage 1 Hypertension recorded at clinic visit. Antihypertensive therapy (Telmisartan) prescribed.',
        date: '2026-10-05'
      },
      {
        id: 'obs-rx-pulse',
        testName: 'Heart Rate (Pulse)',
        category: 'Cardiovascular',
        value: 76,
        unit: 'bpm',
        referenceLow: 60,
        referenceHigh: 100,
        referenceRangeString: '60 - 100 bpm',
        status: 'NORMAL',
        loincCode: '8867-4',
        clinicalMeaning: 'Normal resting sinus heart rate.',
        date: '2026-10-05'
      }
    ],
    diagnoses: [
      {
        id: 'diag-rx-01',
        condition: 'Essential Hypertension (Stage 1)',
        icd10Code: 'I10',
        clinicalStatus: 'Active',
        notes: 'Target BP < 130/80 mmHg'
      },
      {
        id: 'diag-rx-02',
        condition: 'Type 2 Diabetes Mellitus',
        icd10Code: 'E11.9',
        clinicalStatus: 'Active'
      }
    ],
    createdAt: '2026-10-05T11:45:00Z'
  },
  {
    id: 'doc-discharge-03',
    userId: 'pat-rajesh-001',
    title: 'Hospital Discharge Summary - Acute Gastroenteritis',
    fileName: 'discharge_summary_max_aug2026.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    documentType: 'DISCHARGE_SUMMARY',
    date: '2026-08-18',
    doctorName: 'Dr. Vivek Singhania, MD (Internal Medicine)',
    facilityName: 'Max Super Speciality Hospital, Saket',
    rawOcrText: `MAX HEALTHCARE - DISCHARGE SUMMARY
IPD No: MAX-26-88129 | UHID: 1049281
Patient: Rajesh Kumar, 52/M | Ward: Deluxe 402
Date of Admission: 15-Aug-2026 | Date of Discharge: 18-Aug-2026
Primary Diagnosis: Acute Infective Gastroenteritis with Dehydration
Secondary Diagnosis: Known Type 2 Diabetes, Hypertension

Clinical Course:
Patient presented with loose stools (6-8 episodes/day), vomiting, and weakness.
Managed with IV fluids (Normal Saline + Ringer Lactate), IV Ondansetron, and oral probiotics.
Vitals at discharge: BP 124/82 mmHg, Pulse 72/min, Afebrile, tolerating oral diet well.
Electrolytes normalized: Serum Sodium 138 mEq/L, Serum Potassium 4.1 mEq/L.

Discharge Medications:
1. Cap Ofloxacin-Ornidazole 200/500mg - 1 tab BD x 3 days
2. Sachet Sporlac (Probiotic) - 1 sachet in water BD x 5 days
3. ORS packets - 1 liter daily x 3 days
4. Resume regular home medications (Metformin, Telmisartan) from tomorrow.`,
    aiSummary: {
      headline: 'Hospital Recovery Summary: Resolved Stomach Infection & Dehydration',
      simpleExplanation: 'You were admitted for 3 days in August for an acute stomach bug and dehydration. You received IV hydration and anti-nausea therapy. Your blood salts (sodium and potassium) returned to perfectly normal levels, and you were discharged in stable, healthy condition.',
      whyItMatters: 'Confirming that electrolytes and kidney function remained uninjured during dehydration is reassuring for diabetic patients.',
      urgencyLevel: 'ROUTINE',
      urgencyReason: 'Condition fully resolved. Continue gut probiotics and stay hydrated.',
      keyActionItems: [
        'Complete the 3-day probiotic course.',
        'Drink boiled and filtered water; avoid outside street food for 2 weeks.',
        'Resume regular blood pressure and diabetic medicines.'
      ],
      dietAndLifestyleTips: [
        'Eat light, easily digestible home foods: khichdi, curd rice, coconut water, bananas.',
        'Avoid spicy gravies, dairy cream, and fried savories until digestion feels 100% restored.'
      ],
      questionsForDoctor: [
        'Are my kidney markers fully back to baseline after the dehydration episode?'
      ],
      flaggedAbnormalities: []
    },
    medications: [
      {
        id: 'med-oflox-01',
        name: 'Ofloxacin-Ornidazole',
        genericName: 'Ofloxacin + Ornidazole 200/500mg',
        dosage: '1 Tab',
        frequency: 'Twice Daily (1-0-1)',
        route: 'Oral',
        timing: 'After Food',
        duration: '3 days',
        instructions: 'Take 1 tablet after meals for 3 days to clear residual bacterial infection.',
        timeOfDay: ['Morning', 'Night'],
        isActive: true
      },
      {
        id: 'med-sporlac-01',
        name: 'Sporlac Probiotic Sachet',
        genericName: 'Lactic Acid Bacillus (Probiotic)',
        dosage: '1 Sachet',
        frequency: 'Twice Daily (1-0-1)',
        route: 'Oral',
        timing: 'After Food',
        duration: '5 days',
        instructions: 'Mix 1 sachet in water after meals to restore healthy gut flora.',
        timeOfDay: ['Morning', 'Night'],
        isActive: true
      }
    ],
    labObservations: [
      {
        id: 'obs-dis-bp-sys',
        testName: 'Systolic Blood Pressure',
        category: 'Cardiovascular',
        value: 124,
        unit: 'mmHg',
        referenceLow: 90,
        referenceHigh: 120,
        referenceRangeString: '110 - 130 mmHg',
        status: 'NORMAL',
        loincCode: '8480-6',
        clinicalMeaning: 'Normalized discharge blood pressure following IV rehydration.',
        date: '2026-08-18'
      },
      {
        id: 'obs-dis-pulse',
        testName: 'Heart Rate (Pulse)',
        category: 'Cardiovascular',
        value: 72,
        unit: 'bpm',
        referenceLow: 60,
        referenceHigh: 100,
        referenceRangeString: '60 - 100 bpm',
        status: 'NORMAL',
        loincCode: '8867-4',
        clinicalMeaning: 'Stable resting pulse upon hospital discharge.',
        date: '2026-08-18'
      },
      {
        id: 'obs-dis-na',
        testName: 'Serum Sodium (Electrolytes)',
        category: 'Electrolytes',
        value: 138,
        unit: 'mEq/L',
        referenceLow: 135,
        referenceHigh: 145,
        referenceRangeString: '135 - 145 mEq/L',
        status: 'NORMAL',
        loincCode: '2951-2',
        clinicalMeaning: 'Electrolyte balance fully restored after gastroenteritis.',
        date: '2026-08-18'
      },
      {
        id: 'obs-dis-k',
        testName: 'Serum Potassium (Electrolytes)',
        category: 'Electrolytes',
        value: 4.1,
        unit: 'mEq/L',
        referenceLow: 3.5,
        referenceHigh: 5.0,
        referenceRangeString: '3.5 - 5.0 mEq/L',
        status: 'NORMAL',
        loincCode: '2823-3',
        clinicalMeaning: 'Normal potassium level supporting heart muscle conductivity.',
        date: '2026-08-18'
      }
    ],
    diagnoses: [
      {
        id: 'diag-dis-01',
        condition: 'Acute Infective Gastroenteritis with Dehydration',
        icd10Code: 'A09',
        clinicalStatus: 'Resolved'
      }
    ],
    createdAt: '2026-08-18T14:30:00Z'
  },
  {
    id: 'doc-cbc-04',
    userId: 'pat-rajesh-001',
    title: 'Complete Blood Count (CBC) Hematology Profile',
    fileName: 'cbc_hematology_jun2026.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    documentType: 'LAB_REPORT',
    date: '2026-06-12',
    doctorName: 'Dr. Ramesh Chawla, Pathologist',
    facilityName: 'SRL Diagnostics Labs',
    rawOcrText: `SRL DIAGNOSTICS - HEMATOLOGY REPORT
Patient: Rajesh Kumar | Age: 52 Y / Male | Date: 12-Jun-2026
-------------------------------------------------------------------
TEST NAME                   RESULT   UNIT       REFERENCE INTERVAL
Hemoglobin (Hb)             12.8     g/dL       13.5 - 17.5 (Low)
RBC Count                   4.2      mil/uL     4.5 - 5.9 (Low)
Packed Cell Volume (PCV)    38.5     %          40.0 - 50.0 (Low)
MCV (Mean Corpuscular Vol)  82       fL         80 - 96
Total Leukocyte Count (WBC) 6,800    /uL        4,000 - 11,000
Platelet Count              245,000  /uL        150,000 - 450,000
ESR (Westergren)            14       mm/1st hr  0 - 15
-------------------------------------------------------------------
Impression: Mild borderline normocytic anemia. Platelets and WBC counts within normal limits.`,
    aiSummary: {
      headline: 'Mild Borderline Low Hemoglobin (Slight Anemia)',
      simpleExplanation: 'Your hemoglobin was slightly below the optimal male range (12.8 g/dL vs target 13.5 g/dL). White blood cells and platelets were completely normal, meaning there is no active infection and your blood clots normally.',
      whyItMatters: 'Adequate hemoglobin carries oxygen from lungs to all your tissues. A mild dip can occasionally cause mild afternoon fatigue.',
      urgencyLevel: 'MONITOR',
      urgencyReason: 'Mild decrease in red blood cell volume. Worth checking dietary iron and repeating during annual checkup.',
      keyActionItems: [
        'Increase dietary iron sources: dark leafy greens, lentils, pomegranate, beetroot.',
        'Pair iron foods with vitamin C (amla, lemon, oranges) to enhance absorption.'
      ],
      dietAndLifestyleTips: [
        'Avoid drinking hot chai or coffee directly with meals, as tannins block iron absorption.'
      ],
      questionsForDoctor: [
        'Would a serum ferritin or iron profile test be helpful if afternoon fatigue persists?'
      ],
      flaggedAbnormalities: [
        {
          testName: 'Hemoglobin (Hb)',
          value: '12.8 g/dL',
          status: 'LOW',
          plainExplanation: 'Carries oxygen through the blood. Slightly below the standard 13.5 g/dL benchmark.',
          advice: 'Consume iron-rich natural foods and citrus fruits.'
        }
      ]
    },
    medications: [],
    labObservations: [
      {
        id: 'obs-hb-04',
        testName: 'Hemoglobin (Hb)',
        category: 'Complete Blood Count',
        value: 12.8,
        unit: 'g/dL',
        referenceLow: 13.5,
        referenceHigh: 17.5,
        referenceRangeString: '13.5 - 17.5 g/dL',
        status: 'LOW',
        loincCode: '718-7',
        clinicalMeaning: 'Borderline mild anemia.',
        date: '2026-06-12'
      }
    ],
    diagnoses: [],
    createdAt: '2026-06-12T09:00:00Z'
  }
];

export const VITAL_TRENDS_SERIES: VitalTrendSeries[] = [
  {
    testName: 'HbA1c (Glycated Hemoglobin)',
    category: 'Glycemic Control',
    unit: '%',
    normalRange: '4.0 - 5.6 % (Target < 7.0% for diabetic management)',
    targetMin: 4.0,
    targetMax: 7.0,
    currentValue: 7.4,
    currentStatus: 'HIGH',
    trendDirection: 'improving',
    aiInsight: 'Your HbA1c has improved over the past 12 months, dropping from 8.3% in November 2025 to 7.4% today following regular Metformin usage. Continuing consistent diet control will help achieve the doctor target of < 7.0%.',
    points: [
      { date: 'Nov 2025', timestamp: 1731600000000, value: 8.3, unit: '%', status: 'CRITICAL', facility: 'Max Lab' },
      { date: 'Feb 2026', timestamp: 1739500000000, value: 7.9, unit: '%', status: 'HIGH', facility: 'Apollo Clinic' },
      { date: 'Jun 2026', timestamp: 1749800000000, value: 7.6, unit: '%', status: 'HIGH', facility: 'SRL Diagnostics' },
      { date: 'Oct 2026', timestamp: 1759500000000, value: 7.4, unit: '%', status: 'HIGH', facility: 'Dr. Lal PathLabs' }
    ]
  },
  {
    testName: 'Fasting Blood Sugar (FBS)',
    category: 'Glycemic Control',
    unit: 'mg/dL',
    normalRange: '70 - 100 mg/dL',
    targetMin: 70,
    targetMax: 100,
    currentValue: 162,
    currentStatus: 'HIGH',
    trendDirection: 'improving',
    aiInsight: 'Fasting blood sugar fluctuates based on late-night carbohydrate intake. Morning readings show an overall decline from 195 mg/dL to 162 mg/dL.',
    points: [
      { date: 'Nov 2025', timestamp: 1731600000000, value: 195, unit: 'mg/dL', status: 'HIGH', facility: 'Max Lab' },
      { date: 'Feb 2026', timestamp: 1739500000000, value: 180, unit: 'mg/dL', status: 'HIGH', facility: 'Apollo Clinic' },
      { date: 'Jun 2026', timestamp: 1749800000000, value: 171, unit: 'mg/dL', status: 'HIGH', facility: 'SRL Diagnostics' },
      { date: 'Oct 2026', timestamp: 1759500000000, value: 162, unit: 'mg/dL', status: 'HIGH', facility: 'Dr. Lal PathLabs' }
    ]
  },
  {
    testName: 'LDL "Bad" Cholesterol',
    category: 'Lipid Profile',
    unit: 'mg/dL',
    normalRange: '< 100 mg/dL (Optimal for cardiac health)',
    targetMin: 50,
    targetMax: 100,
    currentValue: 148,
    currentStatus: 'HIGH',
    trendDirection: 'worsening',
    aiInsight: 'LDL cholesterol rose slightly over the festive season from 134 to 148 mg/dL. Dr. Mehra has prescribed low-dose Atorvastatin to pull this back down.',
    points: [
      { date: 'Nov 2025', timestamp: 1731600000000, value: 140, unit: 'mg/dL', status: 'HIGH', facility: 'Max Lab' },
      { date: 'Feb 2026', timestamp: 1739500000000, value: 134, unit: 'mg/dL', status: 'HIGH', facility: 'Apollo Clinic' },
      { date: 'Jun 2026', timestamp: 1749800000000, value: 139, unit: 'mg/dL', status: 'HIGH', facility: 'SRL Diagnostics' },
      { date: 'Oct 2026', timestamp: 1759500000000, value: 148, unit: 'mg/dL', status: 'HIGH', facility: 'Dr. Lal PathLabs' }
    ]
  },
  {
    testName: 'Systolic Blood Pressure',
    category: 'Cardiovascular',
    unit: 'mmHg',
    normalRange: '110 - 130 mmHg',
    targetMin: 110,
    targetMax: 130,
    currentValue: 142,
    currentStatus: 'HIGH',
    trendDirection: 'stable',
    aiInsight: 'Systolic BP sits in the 136-142 mmHg range. Daily morning Telmisartan therapy is actively stabilizing this towards the 120 mmHg goal.',
    points: [
      { date: 'Nov 2025', timestamp: 1731600000000, value: 148, unit: 'mmHg', status: 'HIGH', facility: 'Max Lab' },
      { date: 'Feb 2026', timestamp: 1739500000000, value: 138, unit: 'mmHg', status: 'NORMAL', facility: 'Apollo Clinic' },
      { date: 'Aug 2026', timestamp: 1755400000000, value: 124, unit: 'mmHg', status: 'NORMAL', facility: 'Max Hospital' },
      { date: 'Oct 2026', timestamp: 1759600000000, value: 142, unit: 'mmHg', status: 'HIGH', facility: 'Apollo Heart' }
    ]
  },
  {
    testName: 'Serum Creatinine (Kidney Function)',
    category: 'Renal Function',
    unit: 'mg/dL',
    normalRange: '0.70 - 1.20 mg/dL',
    targetMin: 0.70,
    targetMax: 1.20,
    currentValue: 0.92,
    currentStatus: 'NORMAL',
    trendDirection: 'stable',
    aiInsight: 'Kidney filtration remains outstanding and steady across all four quarters with zero signs of diabetic nephropathy.',
    points: [
      { date: 'Nov 2025', timestamp: 1731600000000, value: 0.95, unit: 'mg/dL', status: 'NORMAL', facility: 'Max Lab' },
      { date: 'Feb 2026', timestamp: 1739500000000, value: 0.91, unit: 'mg/dL', status: 'NORMAL', facility: 'Apollo Clinic' },
      { date: 'Aug 2026', timestamp: 1755400000000, value: 0.98, unit: 'mg/dL', status: 'NORMAL', facility: 'Max Hospital' },
      { date: 'Oct 2026', timestamp: 1759500000000, value: 0.92, unit: 'mg/dL', status: 'NORMAL', facility: 'Dr. Lal PathLabs' }
    ]
  }
];
