// ========================================================================
// SetuHealth Backend API - Render Web Service Entrypoint
// Express server with Gemini Vision OCR, ABDM FHIR, and Clinical AI endpoints
// ========================================================================

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { analyzeMedicalDocument } from './gemini';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow Vercel frontend & local development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer memory storage for direct file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Render Healthcheck Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'SetuHealth AI Copilot Backend',
    platform: 'Render Web Service',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key'),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'SetuHealth AI Copilot Backend API is running on Render.',
    endpoints: {
      health: 'GET /health',
      analyze: 'POST /api/ocr-analyze',
      fhir: 'POST /api/fhir-generate',
      abdmVerify: 'POST /api/abdm/verify-otp'
    }
  });
});

// OCR & Clinical Analysis Endpoint
app.post('/api/ocr-analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let imageBase64 = req.body.imageBase64;
    let mimeType = req.body.mimeType || 'image/jpeg';
    const rawText = req.body.rawText;

    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    }

    const result = await analyzeMedicalDocument(imageBase64, mimeType, rawText);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/ocr-analyze:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze medical document'
    });
  }
});

// Mock ABDM OTP Verification
app.post('/api/abdm/verify-otp', (req: Request, res: Response) => {
  const { abhaId, otp } = req.body;

  if (!otp || otp.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Must be 4 or 6 digits.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'ABHA ID verified successfully through ABDM National Health Gateway.',
    profile: {
      abhaNumber: abhaId?.includes('@') ? '91-2048-5892-1144' : (abhaId || '91-2048-5892-1144'),
      abhaAddress: abhaId?.includes('@') ? abhaId : 'rajesh.kumar@abdm',
      fullName: 'Rajesh Kumar',
      gender: 'MALE',
      dateOfBirth: '1974-05-14',
      kycVerified: true,
      linkedFacilities: [
        { name: 'Dr. Lal PathLabs - Central Reference Lab', hipId: 'IN0710045', type: 'DIAGNOSTIC_LAB', recordsCount: 4 },
        { name: 'Apollo Heart Clinic OPD', hipId: 'IN0710099', type: 'CLINIC', recordsCount: 3 },
        { name: 'Max Super Speciality Hospital, Saket', hipId: 'IN0710001', type: 'HOSPITAL', recordsCount: 1 }
      ]
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`SetuHealth AI Copilot Backend running on Port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Using Rule Engine'}`);
  console.log(`=======================================================`);
});
