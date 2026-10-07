'use client';

import React, { useState, useEffect } from 'react';

interface OpeningSplashProps {
  onFinish?: () => void;
}

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    // 1-second total cinematic intro: 700ms display + 400ms fadeout
    const fadeTimer = setTimeout(() => {
      setStage('fading');
    }, 750);

    const finishTimer = setTimeout(() => {
      setStage('hidden');
      onFinish?.();
    }, 1150);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (stage === 'hidden') return null;

  return (
    <div 
      className={`fixed inset-0 z-100 flex items-center justify-center bg-white transition-opacity duration-400 ease-out ${
        stage === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={stage === 'fading'}
    >
      <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500 ease-out">
        {/* Centered Favicon with subtle glow */}
        <div className="relative mb-4">
          <div className="absolute -inset-3 bg-teal-100/60 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-3 border border-slate-100 shadow-xl flex items-center justify-center">
            <img 
              src="/brand/favicon.png" 
              alt="Setu" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Setu Brand Name & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Setu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 tracking-wide">
          Bridging Medical Jargon to Human Understanding
        </p>

        {/* Minimal Progress Indicator */}
        <div className="w-24 h-0.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
          <div className="w-full h-full bg-teal-600 rounded-full animate-[progress_1s_ease-in-out]" />
        </div>
      </div>
    </div>
  );
};
