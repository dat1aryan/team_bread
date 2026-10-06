import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SetuHealth AI Copilot | Personal Health Intelligence & ABDM Platform',
  description: 'AI-Powered Personal Health Copilot bridging medical prescriptions, lab reports, and discharge summaries to human understanding and ABDM FHIR standard.',
  keywords: [
    'AI Health Copilot',
    'Medical Record OCR',
    'ABDM',
    'ABHA ID',
    'FHIR R4',
    'Prescription Reader',
    'Lab Report Explainer',
    'Health Tech',
    'Altrix Labs'
  ],
  authors: [{ name: 'SetuHealth Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
