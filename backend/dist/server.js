"use strict";
// Express server with Gemini Vision OCR, ABDM FHIR, and Clinical AI endpoints
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const gemini_1 = require("./gemini");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Allow Vercel frontend & local development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
// Multer memory storage for direct file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});
// Render Healthcheck Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'HEALTHY',
        service: 'Setu AI Copilot Backend',
        platform: 'Render Web Service',
        geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key'),
        timestamp: new Date().toISOString()
    });
});
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Setu AI Copilot Backend API is running on Render.',
        endpoints: {
            health: 'GET /health',
            analyze: 'POST /api/ocr-analyze',
            fhir: 'POST /api/fhir-generate',
            abdmVerify: 'POST /api/abdm/verify-otp'
        }
    });
});
// OCR & Clinical Analysis Endpoint
app.post('/api/ocr-analyze', upload.single('file'), async (req, res) => {
    try {
        let imageBase64 = req.body.imageBase64;
        let mimeType = req.body.mimeType || 'image/jpeg';
        const rawText = req.body.rawText;
        if (req.file) {
            imageBase64 = req.file.buffer.toString('base64');
            mimeType = req.file.mimetype;
        }
        const result = await (0, gemini_1.analyzeMedicalDocument)(imageBase64, mimeType, rawText);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error in /api/ocr-analyze:', error);
        res.status(500).json({
            success: false,
            error: error?.message || 'Failed to analyze medical document'
        });
    }
});
// Mock ABDM OTP Verification
app.post('/api/abdm/verify-otp', (req, res) => {
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
    console.log(`Setu AI Copilot Backend running on Port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Using Rule Engine'}`);
    console.log(`=======================================================`);
});
