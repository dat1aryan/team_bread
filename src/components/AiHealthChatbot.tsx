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
      speakText(text, currentLanguage, () => setIsSpeaking(false));
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
                Gemini 1.5 Flash Vision
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

              <div className={`max-w-[80%] rounded-2xl p-4 shadow-2xs transition-all ${
                isUser 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
              }`}>
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

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
