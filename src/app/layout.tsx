import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Setu | AI-Powered Personal Health Copilot',
  description: 'AI-Powered Personal Health Copilot bridging medical prescriptions, lab reports, and discharge summaries to human understanding and ABDM FHIR standard.',
  keywords: [
    'Setu',
    'AI Health Copilot',
    'Medical Record OCR',
    'ABDM',
    'ABHA ID',
    'FHIR R4',
    'Prescription Reader',
    'Lab Report Explainer',
    'Health Tech'
  ],
  authors: [{ name: 'Setu Team' }],
  icons: {
    icon: '/brand/favicon.png',
    shortcut: '/brand/favicon.png',
    apple: '/brand/favicon.png',
  },
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
        <link rel="icon" href="/brand/favicon.png" type="image/png" />
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
