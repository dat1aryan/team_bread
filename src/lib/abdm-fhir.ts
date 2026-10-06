
import { MedicalDocument, PatientProfile, ExtractedLabObservation, ExtractedMedication, AbhaProfileData } from '@/types';

export const MOCK_ABHA_PROFILE: AbhaProfileData = {
  abhaNumber: '91-2048-5892-1144',
  abhaAddress: 'rajesh.kumar@abdm',
  fullName: 'Rajesh Kumar',
  gender: 'MALE',
  dateOfBirth: '1974-05-14',
  kycVerified: true,
  linkedFacilities: [
    {
      name: 'Dr. Lal PathLabs - Central Reference Lab',
      hipId: 'IN0710045',
      type: 'DIAGNOSTIC_LAB',
      recordsCount: 4
    },
    {
      name: 'Apollo Heart Clinic OPD',
      hipId: 'IN0710099',
      type: 'CLINIC',
      recordsCount: 3
    },
    {
      name: 'Max Super Speciality Hospital, Saket',
      hipId: 'IN0710001',
      type: 'HOSPITAL',
      recordsCount: 1
    }
  ]
};

/**
 * Transforms an ingested medical document and patient into a valid HL7 FHIR R4 Bundle
 */
export function generateFhirR4Bundle(document: MedicalDocument, patient: PatientProfile): Record<string, any> {
  const patientRefId = `urn:uuid:patient-${patient.id}`;
  const timestamp = new Date().toISOString();

  const entries: any[] = [];

  // 1. Patient Resource
  const patientResource = {
    fullUrl: patientRefId,
    resource: {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient']
      },
      identifier: [
        {
          system: 'https://healthid.ndhm.gov.in',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical Record Number'
              }
            ]
          },
          value: patient.abhaId || '91-2048-5892-1144'
        }
      ],
      name: [
        {
          use: 'official',
          text: patient.fullName
        }
      ],
      gender: patient.gender,
      birthDate: patient.dateOfBirth,
      telecom: [
        {
          system: 'phone',
          value: patient.phone,
          use: 'mobile'
        }
      ]
    }
  };
  entries.push(patientResource);

  // 2. Observations for Lab Results
  const observationRefs: { reference: string }[] = [];

  document.labObservations.forEach((obs: ExtractedLabObservation, idx: number) => {
    const obsRefId = `urn:uuid:obs-${obs.id || idx}`;
    observationRefs.push({ reference: obsRefId });

    const interpretationCode = obs.status === 'HIGH' ? 'H' : obs.status === 'LOW' ? 'L' : obs.status === 'CRITICAL' ? 'AA' : 'N';
    const interpretationDisplay = obs.status === 'HIGH' ? 'High' : obs.status === 'LOW' ? 'Low' : obs.status === 'CRITICAL' ? 'Critical' : 'Normal';

    entries.push({
      fullUrl: obsRefId,
      resource: {
        resourceType: 'Observation',
        id: obs.id || `obs-${idx}`,
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation']
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: obs.loincCode || '99999-9',
              display: obs.testName
            }
          ],
          text: obs.testName
        },
        subject: {
          reference: patientRefId
        },
        effectiveDateTime: `${obs.date}T09:00:00Z`,
        valueQuantity: {
          value: obs.value,
          unit: obs.unit,
          system: 'http://unitsofmeasure.org',
          code: obs.unit
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: interpretationCode,
                display: interpretationDisplay
              }
            ]
          }
        ],
        referenceRange: [
          {
            low: {
              value: obs.referenceLow,
              unit: obs.unit
            },
            high: {
              value: obs.referenceHigh,
              unit: obs.unit
            },
            text: obs.referenceRangeString
          }
        ]
      }
    });
  });

  // 3. DiagnosticReport Resource (if lab or diagnostic)
  if (document.documentType === 'LAB_REPORT' || document.documentType === 'DIAGNOSTIC_IMAGING') {
    entries.push({
      fullUrl: `urn:uuid:report-${document.id}`,
      resource: {
        resourceType: 'DiagnosticReport',
        id: document.id,
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportLab']
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                code: 'LAB',
                display: 'Laboratory'
              }
            ]
          }
        ],
        code: {
          text: document.title
        },
        subject: {
          reference: patientRefId
        },
        effectiveDateTime: `${document.date}T09:00:00Z`,
        issued: timestamp,
        performer: [
          {
            display: document.facilityName || 'Accredited Pathology Laboratory'
          }
        ],
        result: observationRefs,
        conclusion: document.aiSummary.simpleExplanation
      }
    });
  }

  // 4. MedicationRequest Resources (if prescription)
  document.medications.forEach((med: ExtractedMedication, idx: number) => {
    entries.push({
      fullUrl: `urn:uuid:med-${med.id || idx}`,
      resource: {
        resourceType: 'MedicationRequest',
        id: med.id || `med-${idx}`,
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest']
        },
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '387584000',
              display: med.name
            }
          ],
          text: `${med.name} ${med.dosage}`
        },
        subject: {
          reference: patientRefId
        },
        authoredOn: `${document.date}T10:00:00Z`,
        dosageInstruction: [
          {
            text: `${med.instructions || ''} (${med.frequency}, ${med.timing})`,
            timing: {
              code: {
                text: med.frequency
              }
            },
            route: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '260548002',
                  display: med.route || 'Oral'
                }
              ]
            }
          }
        ]
      }
    });
  });

  // 5. Condition Resources
  document.diagnoses.forEach((diag, idx) => {
    entries.push({
      fullUrl: `urn:uuid:condition-${diag.id || idx}`,
      resource: {
        resourceType: 'Condition',
        id: diag.id || `cond-${idx}`,
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: diag.clinicalStatus === 'Resolved' ? 'resolved' : 'active'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/icd-10',
              code: diag.icd10Code || 'R69',
              display: diag.condition
            }
          ],
          text: diag.condition
        },
        subject: {
          reference: patientRefId
        }
      }
    });
  });

  return {
    resourceType: 'Bundle',
    id: `setu-bundle-${document.id}`,
    meta: {
      versionId: '1',
      lastUpdated: timestamp,
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
    },
    identifier: {
      system: 'https://setu.ai/fhir/bundles',
      value: `BUNDLE-${document.id}`
    },
    type: 'document',
    timestamp: timestamp,
    entry: entries
  };
}

/**
 * Simulates ABDM OTP Verification
 */
export async function verifyAbhaOtp(abhaId: string, otp: string): Promise<{ success: boolean; message: string; profile?: AbhaProfileData }> {
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!otp || otp.length < 4) {
    return { success: false, message: 'Invalid OTP. Please enter 4 or 6-digit verification code.' };
  }

  return {
    success: true,
    message: 'ABHA ID verified successfully through ABDM National Health Gateway.',
    profile: {
      ...MOCK_ABHA_PROFILE,
      abhaNumber: abhaId.includes('@') ? '91-2048-5892-1144' : abhaId,
      abhaAddress: abhaId.includes('@') ? abhaId : 'rajesh.kumar@abdm'
    }
  };
}
