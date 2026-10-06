'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function SentryExamplePage() {
  const [hasTested, setHasTested] = useState(false);

  const triggerError = () => {
    try {
      setHasTested(true);
      throw new Error('SetuHealth Sentry Test Error - Verification Successful!');
    } catch (err) {
      Sentry.captureException(err);
      alert('Test exception captured and sent to Sentry!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
          S
        </div>
        
        <div>
          <h1 className="text-2xl font-bold">Sentry Integration Verification</h1>
          <p className="text-slate-400 text-sm mt-2">
            Click the button below to send a sample test error to your Sentry project (<code className="text-purple-300">team_bread</code>).
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={triggerError}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 font-semibold rounded-xl transition duration-150 shadow-lg shadow-purple-600/30"
          >
            Trigger Test Sentry Error
          </button>

          {hasTested && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg">
              Event dispatched to Sentry! Check your Sentry Issues dashboard.
            </div>
          )}
        </div>

        <div>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
          >
            Back to SetuHealth Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
