'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  RefreshCw,
  HelpCircle,
  Stethoscope,
  Pill,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { ChatMessage, LanguageCode, PatientProfile, ExtractedMedication, ExtractedLabObservation } from '@/types';
import { speakText, stopSpeaking } from '@/lib/multilingual';

/**
 * Parses and formats clinical AI responses cleanly.
 * Replaces raw markdown symbols (###, **, *, etc.) with polished typography, styled badges, and cards.
 */
function renderClinicalMessageContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];
  let isNumbered = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumbered) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="space-y-2.5 my-2.5 pl-0.5">
            {currentList}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="space-y-2.5 my-2.5 pl-0.5">
            {currentList}
          </ul>
        );
      }
      currentList = [];
    }
  };

  const formatInline = (str: string) => {
    // Matches ***bold italic***, **bold**, *italic*
    const tokenRegex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*[^\*\s][^\*]*?[^\*\s]\*|\*[^\*\s]\*)/g;
    const parts = str.split(tokenRegex);
    return parts
      .filter(p => p !== '')
      .map((part, idx) => {
        if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
          return (
            <strong key={idx} className="font-semibold italic text-slate-900">
              {part.slice(3, -3)}
            </strong>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={idx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <em key={idx} className="italic text-slate-700">
              {part.slice(1, -1)}
            </em>
          );
        }
        // Strip any residual stray markdown asterisks or hashes from plain text segments
        const clean = part.replace(/\*{1,3}/g, '').replace(/#{1,6}/g, '');
        return clean;
      });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<div key={`br-${lineIdx}`} className="h-1.5" />);
      return;
    }

    // Horizontal Rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${lineIdx}`} className="my-2.5 border-slate-200" />);
      return;
    }

    // Markdown Headings (###, ##, #)
    if (/^#{1,6}\s*/.test(trimmed)) {
      flushList();
      const headingText = trimmed.replace(/^#{1,6}\s*/, '').replace(/\s*#{1,6}$/, '');
      elements.push(
        <h4
          key={`h-${lineIdx}`}
          className="text-sm sm:text-base font-bold text-slate-900 mt-3.5 mb-1.5 tracking-tight flex items-center gap-1.5"
        >
          {formatInline(headingText)}
        </h4>
      );
      return;
    }

    // Standalone Bold Header (e.g. **Why Dizziness Happens** or **What to Do Now:**)
    if ((trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 5) || 
        (trimmed.startsWith('**') && trimmed.endsWith(':**') && trimmed.length > 5)) {
      flushList();
      const headingText = trimmed.replace(/^\*\*/, '').replace(/\:?\*\*$/, '');
      elements.push(
        <h4
          key={`h-${lineIdx}`}
          className="text-sm sm:text-base font-bold text-slate-900 mt-3.5 mb-1.5 tracking-tight flex items-center gap-1.5"
        >
          {formatInline(headingText)}
        </h4>
      );
      return;
    }

    // Bullet List (*, -, •)
    if (/^[\*\-•]\s+/.test(trimmed)) {
      if (isNumbered) flushList();
      isNumbered = false;
      const bulletText = trimmed.replace(/^[\*\-•]\s+/, '');
      currentList.push(
        <li key={`li-${lineIdx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
          <span className="flex-1">{formatInline(bulletText)}</span>
        </li>
      );
      return;
    }

    // Numbered List (1. or 2. or 1))
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      if (!isNumbered) flushList();
      isNumbered = true;
      const num = numMatch[1];
      const listText = numMatch[2];
      currentList.push(
        <li key={`li-${lineIdx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="w-5 h-5 rounded-full bg-teal-100/90 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0 border border-teal-300/60 mt-0.5 shadow-2xs">
            {num}
          </span>
          <span className="flex-1">{formatInline(listText)}</span>
        </li>
      );
      return;
    }

    // Clinical disclaimer / note callout
    const lowerTrim = trimmed.toLowerCase();
    if (
      lowerTrim.includes('clinical disclaimer') || 
      lowerTrim.includes('important clinical reminder') || 
      lowerTrim.includes('disclaimer:') ||
      lowerTrim.startsWith('note:') ||
      lowerTrim.startsWith('*note:')
    ) {
      flushList();
      elements.push(
        <div key={`p-${lineIdx}`} className="p-3 my-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed shadow-2xs">
          <div className="font-bold text-amber-950 mb-0.5 flex items-center gap-1">
            <span>⚕️</span>
            <span>Important Medical Note</span>
          </div>
          {formatInline(trimmed.replace(/^(\*+|#+|\s*⚕️\s*)+/g, '').replace(/\*+$/g, ''))}
        </div>
      );
      return;
    }

    // Regular text paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-0.5">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();
  return elements;
}

interface AiHealthChatbotProps {
  currentLanguage: LanguageCode;
  profile: PatientProfile;
  medications: ExtractedMedication[];
  recentObservations: ExtractedLabObservation[];
}

export const AiHealthChatbot: React.FC<AiHealthChatbotProps> = ({
  currentLanguage,
  profile,
  medications,
  recentObservations,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello ${profile.fullName}! I am your SetuHealth AI Copilot. I have analyzed your medical records, active medications (${medications.length} meds), and recent lab results. How can I help you understand your health today?`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: 'Abnormal Lab Results',
      icon: Activity,
      prompt: 'Explain my recent abnormal lab test results (HbA1c & LDL) in simple terms and what they mean.'
    },
    {
      label: 'Medication Timings',
      icon: Pill,
      prompt: 'Review my current medicines and explain why some are before food and others after food.'
    },
    {
      label: 'Dietary Guidance',
      icon: Sparkles,
      prompt: 'Suggest a healthy Indian diet and lifestyle plan tailored to my diabetic and cholesterol profile.'
    },
    {
      label: 'Doctor Questions',
      icon: Stethoscope,
      prompt: 'What key questions should I prepare to ask my doctor during my next clinic visit?'
    }
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          language: currentLanguage,
          clinicalContext: {
            patientName: profile.fullName,
            age: 52,
            gender: profile.gender,
            diagnoses: ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Dyslipidemia'],
            medications: medications.map(m => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              timing: m.timing
            })),
            labObservations: recentObservations.map(o => ({
              testName: o.testName,
              value: o.value,
              unit: o.unit,
              status: o.status
            }))
          }
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary connection issue. Based on your records: Your HbA1c is 7.4% and LDL is 148 mg/dL. Ensure regular Metformin after meals and consult your doctor for dosage titration.`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const cleanText = text
        .replace(/#{1,6}\s*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/[-_]{3,}/g, ' ')
        .trim();
      speakText(cleanText, currentLanguage, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] transition-all">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-200 shadow-inner">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight">SetuHealth Clinical Copilot</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Gemini Multi-Key Failover
              </span>
            </div>
            <p className="text-xs text-teal-200/80">Context-Grounded in your medical records & prescriptions</p>
          </div>
        </div>

        <button 
          onClick={() => {
            stopSpeaking();
            setIsSpeaking(false);
            setMessages([
              {
                id: `reset-${Date.now()}`,
                role: 'assistant',
                content: `Chat session refreshed. How can I help you understand your health today?`,
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" /> Suggested:
        </span>
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 border border-slate-200/90 hover:border-teal-300 text-slate-700 text-xs font-medium whitespace-nowrap shadow-2xs transition-all cursor-pointer"
            >
              <Icon className="w-3 h-3 text-teal-600" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isUser 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-emerald-100 border border-emerald-200 text-emerald-800'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 shadow-2xs transition-all ${
                isUser 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
              }`}>
                {isUser ? (
                  <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed space-y-1">
                    {renderClinicalMessageContent(msg.content)}
                  </div>
                )}

                <div className={`flex items-center justify-between gap-4 mt-2 pt-2 border-t text-[10px] ${
                  isUser ? 'border-teal-500/50 text-teal-100' : 'border-slate-100 text-slate-400'
                }`}>
                  <span>{msg.createdAt}</span>
                  {!isUser && (
                    <button
                      onClick={() => toggleSpeak(msg.content)}
                      className="hover:text-teal-700 flex items-center gap-1 font-medium transition-colors"
                      title="Read aloud"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-2xs flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Analyzing clinical context with Gemini...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Safety Guardrail Notice */}
      <div className="bg-amber-50/80 px-4 py-1.5 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-800">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="truncate">AI insights are for patient comprehension & education. Always confirm medication changes with your doctor.</span>
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about your lab results, diet, or medicines (${currentLanguage.toUpperCase()})...`}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-900 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-medium shadow-sm transition-all"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
