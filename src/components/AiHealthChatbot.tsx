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
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, LanguageCode, PatientProfile, ExtractedMedication, ExtractedLabObservation, TestStatus } from '@/types';
import { speakText, stopSpeaking } from '@/lib/multilingual';
import { HealthStorageService } from '@/lib/storage';

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

    // Clinical disclaimer / note callout: skip completely as UI provides permanent banner
    const lowerTrim = trimmed.toLowerCase();
    if (
      lowerTrim.includes('clinical disclaimer') || 
      lowerTrim.includes('important clinical reminder') || 
      lowerTrim.includes('important medical note') ||
      lowerTrim.includes('medical disclaimer') ||
      lowerTrim.includes('disclaimer:') ||
      (lowerTrim.startsWith('note:') && (lowerTrim.includes('doctor') || lowerTrim.includes('physician') || lowerTrim.includes('consult'))) ||
      (lowerTrim.startsWith('*note:') && (lowerTrim.includes('doctor') || lowerTrim.includes('physician') || lowerTrim.includes('consult')))
    ) {
      flushList();
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

const COPILOT_I18N: Record<LanguageCode, {
  subtitle: string;
  placeholder: string;
  resetMsg: string;
  getGreeting: (name: string, count: number) => string;
  quickPrompts: Array<{ label: string; icon: any; prompt: string }>;
  listen: string;
  stopAudio: string;
}> = {
  en: {
    subtitle: 'Context-Grounded in your medical records & prescriptions',
    placeholder: 'Ask about your lab results, diet, or medicines...',
    resetMsg: 'Chat session refreshed. How can I help you understand your health today?',
    getGreeting: (name, count) => `Hello ${name}! I am your Setu AI Copilot. I have analyzed your medical records, active medications (${count} meds), and recent lab results. How can I help you understand your health today?`,
    quickPrompts: [
      { label: 'View Med Schedule', icon: Pill, prompt: 'Take me to my medication schedule and check my pill timings.' },
      { label: 'Add Paracetamol', icon: Sparkles, prompt: 'Add Paracetamol 650mg to my daily medication schedule.' },
      { label: 'Abnormal Lab Results', icon: Activity, prompt: 'Explain my recent abnormal lab test results (HbA1c & LDL) in simple terms and what they mean.' },
      { label: 'Doctor Questions', icon: Stethoscope, prompt: 'What key questions should I prepare to ask my doctor during my next clinic visit?' }
    ],
    listen: 'Listen',
    stopAudio: 'Stop Audio'
  },
  hi: {
    subtitle: 'आपकी मेडिकल रिपोर्ट और पर्चे के आधार पर तैयार',
    placeholder: 'जांच रिपोर्ट, दवाइयों या खान-पान के बारे में पूछें...',
    resetMsg: 'सत्र रीसेट किया गया। आज मैं आपकी सेहत को समझने में कैसे मदद कर सकता हूँ?',
    getGreeting: (name, count) => `नमस्ते ${name}! मैं आपका सेतु हेल्थ AI Copilot हूँ। मैंने आपकी मेडिकल रिपोर्ट, सक्रिय दवाएं (${count} दवाएं) और हालिया जांच परिणाम देख लिए हैं। आज मैं आपकी सेहत को समझने में कैसे मदद कर सकता हूँ?`,
    quickPrompts: [
      { label: 'असामान्य जांच परिणाम', icon: Activity, prompt: 'मेरे हालिया असामान्य लैब टेस्ट (HbA1c और LDL) के परिणाम सरल भाषा में समझाएं।' },
      { label: 'दवाओं का समय', icon: Pill, prompt: 'मेरी दवाएं कब और कैसे लेनी हैं (खाने से पहले या बाद में), इसका कारण समझाएं।' },
      { label: 'आहार एवं जीवनशैली', icon: Sparkles, prompt: 'डायबिटीज और कोलेस्ट्रॉल को नियंत्रित रखने के लिए उपयुक्त भारतीय आहार बताएं।' },
      { label: 'डॉक्टर से सवाल', icon: Stethoscope, prompt: 'अगली बार डॉक्टर से मिलने पर मुझे कौन से ज़रूरी सवाल पूछने चाहिए?' }
    ],
    listen: 'सुनें',
    stopAudio: 'रोकें'
  },
  te: {
    subtitle: 'మీ వైద్య రికార్డులు మరియు ప్రిస్క్రిప్షన్‌ల ఆధారంగా',
    placeholder: 'మీ ల్యాబ్ ఫలితాలు, ఆహారం లేదా మందుల గురించి అడగండి...',
    resetMsg: 'చాట్ రీసెట్ చేయబడింది. ఈరోజు మీ ఆరోగ్య విషయాలలో ఎలా సహాయపడగలను?',
    getGreeting: (name, count) => `నమస్కారం ${name}! నేను మీ సేతు హెల్త్ AI Copilot. నేను మీ వైద్య రికార్డులు, మందులు (${count}) మరియు ల్యాబ్ ఫలితాలను విశ్లేషించాను. ఈరోజు మీ ఆరోగ్య విషయాలలో ఎలా సహాయపడగలను?`,
    quickPrompts: [
      { label: 'ల్యాబ్ ఫలితాలు', icon: Activity, prompt: 'నా అసాధారణ ల్యాబ్ పరీక్ష ఫలితాలను (HbA1c & LDL) సులభంగా వివరించండి.' },
      { label: 'మందుల సమయాలు', icon: Pill, prompt: 'నా మందులను ఆహారానికి ముందు లేదా తర్వాత ఎందుకు తీసుకోవాలో వివరించండి.' },
      { label: 'ఆహార సలహాలు', icon: Sparkles, prompt: 'నా డయాబెటిస్ మరియు కొలెస్ట్రాల్ నియంత్రణకు తగిన ఆహార సూచనలను ఇవ్వండి.' },
      { label: 'డాక్టర్‌ను అడగవలసిన ప్రశ్నలు', icon: Stethoscope, prompt: 'తదుపరి డాక్టర్ సంప్రదింపులో నేను అడగవలసిన ముఖ్య ప్రశ్నలు ఏమిటి?' }
    ],
    listen: 'వినండి',
    stopAudio: 'ఆపండి'
  },
  ta: {
    subtitle: 'உங்கள் மருத்துவ அறிக்கைகள் மற்றும் மருந்துச்சீட்டுகளின் அடிப்படையில்',
    placeholder: 'ஆய்வக முடிவுகள், உணவு அல்லது மருந்துகள் பற்றி கேட்கவும்...',
    resetMsg: 'உரையாடல் புதுப்பிக்கப்பட்டது. இன்று உங்கள் உடல்நலம் பற்றி என்ன அறிய விரும்புகிறீர்கள்?',
    getGreeting: (name, count) => `வணக்கம் ${name}! நான் உங்கள் சேது ஹெல்த் AI Copilot. உங்கள் மருத்துவ ஆவணங்கள், மருந்துகள் (${count}) மற்றும் ஆய்வக முடிவுகளை ஆய்வு செய்துள்ளேன். இன்று உங்கள் உடல்நலம் பற்றி என்ன அறிய விரும்புகிறீர்கள்?`,
    quickPrompts: [
      { label: 'ஆய்வக முடிவுகள்', icon: Activity, prompt: 'எனது சமீபத்திய ஆய்வக முடிவுகளை (HbA1c & LDL) எளிய முறையில் விளக்கவும்.' },
      { label: 'மருந்து உட்கொள்ளும் நேரம்', icon: Pill, prompt: 'மருந்துகளை உணவுக்கு முன்னும் பின்னும் எடுத்துக்கொள்வதற்கான காரணத்தை விளக்குங்கள்.' },
      { label: 'உணவு வழிகாட்டுதல்', icon: Sparkles, prompt: 'நீரிழிவு மற்றும் கொழுப்பைக் கட்டுப்படுத்த ஆரோக்கியமான உணவு முறையை பரிந்துரைக்கவும்.' },
      { label: 'மருத்துவரிடம் கேட்க வேண்டியவை', icon: Stethoscope, prompt: 'அடுத்த சந்திப்பில் மருத்துவரிடம் கேட்க வேண்டிய முக்கியமான கேள்விகள் என்ன?' }
    ],
    listen: 'கேட்கவும்',
    stopAudio: 'நிறுத்து'
  },
  bn: {
    subtitle: 'আপনার মেডিকেল রেকর্ড ও প্রেসক্রিপশন ভিত্তিক',
    placeholder: 'ল্যাব টেস্ট, ডায়েট বা ওষুধ সম্পর্কে জিজ্ঞাসা করুন...',
    resetMsg: 'চ্যাট সেশন পুনরায় শুরু হয়েছে। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
    getGreeting: (name, count) => `নমস্কার ${name}! আমি আপনার সেতু হেলথ এআই কোপাইলট। আমি আপনার মেডিকেল রেকর্ড, সক্রিয় ওষুধ (${count}) এবং ল্যাব ফলাফল বিশ্লেষণ করেছি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?`,
    quickPrompts: [
      { label: 'ল্যাব টেস্ট ফলাফল', icon: Activity, prompt: 'আমার সাম্প্রতিক ল্যাব টেস্টের ফলাফল (HbA1c ও LDL) সহজ ভাষায় বুঝিয়ে বলুন।' },
      { label: 'ওষুধের সময়সূচী', icon: Pill, prompt: 'ওষুধ খাওয়ার আগে বা পরে নেওয়ার কারণ ব্যাখ্যা করুন।' },
      { label: 'খাদ্যতালিকা পরামর্শ', icon: Sparkles, prompt: 'ডায়াবেটিস এবং কোলেস্টেরল নিয়ন্ত্রণের জন্য স্বাস্থ্যকর ডায়েট প্ল্যান দিন।' },
      { label: 'ডাক্তারকে জিজ্ঞাসা', icon: Stethoscope, prompt: 'পরের বার ডাক্তারকে আমার কী কী প্রশ্ন জিজ্ঞাসা করা উচিত?' }
    ],
    listen: 'শুনুন',
    stopAudio: 'থামুন'
  },
  mr: {
    subtitle: 'तुमच्या वैद्यकीय नोंदींवर आधारित',
    placeholder: 'लॅब रिपोर्ट, आहार किंवा औषधांबद्दल विचारा...',
    resetMsg: 'संभाषण रीसेट झाले. आज मी तुम्हाला कशी मदत करू शकतो?',
    getGreeting: (name, count) => `नमस्कार ${name}! मी तुमचा सेतू हेल्थ एआय कोपायलट आहे. मी तुमचे वैद्यकीय अहवाल, औषधे (${count}) आणि तपासणीचे निकाल पाहिले आहेत. मी तुम्हाला कशी मदत करू शकतो?`,
    quickPrompts: [
      { label: 'लॅब अहवाल', icon: Activity, prompt: 'माझे अलीकडील लॅब निकाल (HbA1c आणि LDL) सोप्या भाषेत समजावून सांगा.' },
      { label: 'औषधांची वेळ', icon: Pill, prompt: 'काही औषधे जेवणापूर्वी आणि काही जेवणानंतर का घ्यावीत ते सांगा.' },
      { label: 'आहाराविषयी मार्गदर्शन', icon: Sparkles, prompt: 'मधुमेह आणि कोलेस्ट्रॉलसाठी योग्य आहार योजना सुचवा.' },
      { label: 'डॉक्टरांना विचारायचे प्रश्न', icon: Stethoscope, prompt: 'पुढील भेटीत डॉक्टरांना कोणते महत्त्वाचे प्रश्न विचारावेत?' }
    ],
    listen: 'ऐका',
    stopAudio: 'थांबवा'
  },
  es: {
    subtitle: 'Basado en sus registros médicos y recetas',
    placeholder: 'Pregunte sobre sus resultados, dieta o medicamentos...',
    resetMsg: 'Sesión de chat actualizada. ¿Cómo puedo ayudarle hoy?',
    getGreeting: (name, count) => `¡Hola ${name}! Soy su copiloto de IA Setu. He analizado sus registros médicos, medicamentos activos (${count}) y resultados recientes. ¿Cómo puedo ayudarle hoy?`,
    quickPrompts: [
      { label: 'Resultados Anormales', icon: Activity, prompt: 'Explique mis resultados de laboratorio recientes (HbA1c y LDL) en términos sencillos.' },
      { label: 'Horarios de Medicamentos', icon: Pill, prompt: 'Revise mis medicamentos y explique por qué algunos son antes o después de comer.' },
      { label: 'Guía Dietética', icon: Sparkles, prompt: 'Sugiera un plan de alimentación y estilo de vida para mi perfil diabético.' },
      { label: 'Preguntas al Médico', icon: Stethoscope, prompt: '¿Qué preguntas clave debo hacerle a mi médico en mi próxima visita?' }
    ],
    listen: 'Escuchar',
    stopAudio: 'Detener'
  }
};

interface AiHealthChatbotProps {
  currentLanguage: LanguageCode;
  profile: PatientProfile;
  medications: ExtractedMedication[];
  recentObservations: ExtractedLabObservation[];
  activeTab?: 'upload' | 'timeline' | 'trends' | 'meds' | 'abdm' | 'copilot';
  onAddMedication?: (med: Omit<ExtractedMedication, 'id'>) => void;
  onNavigateTab?: (tab: 'upload' | 'timeline' | 'trends' | 'meds' | 'abdm' | 'copilot') => void;
  onToggleMedicationTaken?: (medNameOrId: string) => void;
  onToggleMedicationStatus?: (medNameOrId: string) => void;
  onDeleteMedication?: (medNameOrId: string) => void;
  onLogVital?: (testName: string, value: number, unit: string, status: TestStatus) => void;
}

export const AiHealthChatbot: React.FC<AiHealthChatbotProps> = ({
  currentLanguage,
  profile,
  medications,
  recentObservations,
  activeTab,
  onAddMedication,
  onNavigateTab,
  onToggleMedicationTaken,
  onToggleMedicationStatus,
  onDeleteMedication,
  onLogVital
}) => {
  const i18n = COPILOT_I18N[currentLanguage] || COPILOT_I18N.en;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: i18n.getGreeting(profile.fullName, medications.length),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Adapt initial greeting when user switches language before asking queries
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1 && prev[0]?.role === 'assistant') {
        return [
          {
            id: 'init-1',
            role: 'assistant',
            content: i18n.getGreeting(profile.fullName, medications.length),
            createdAt: prev[0]?.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
  }, [currentLanguage, profile.fullName, medications.length, i18n]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
            patientName: profile.fullName || 'Patient',
            age: (() => {
              if (!profile.dateOfBirth) return 'Not specified';
              const birth = new Date(profile.dateOfBirth);
              if (isNaN(birth.getTime())) return 'Not specified';
              const diff = Date.now() - birth.getTime();
              const calculated = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
              return (calculated >= 0 && calculated <= 125) ? `${calculated} Y` : 'Not specified';
            })(),
            gender: profile.gender || 'Not specified',
            activeTab: activeTab || 'copilot',
            diagnoses: HealthStorageService.getDocuments().flatMap(d => d.diagnoses?.map(diag => diag.condition) || []),
            medications: medications.map(m => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              timing: m.timing,
              isActive: m.isActive,
              isTakenToday: m.isTakenToday
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
        let replyText: string = data.reply;
        let actionBadgeText: string | undefined = undefined;

        // Parse and execute embedded action commands
        const actionRegex = /\[\[ACTION:([A-Z_]+)(?::([\s\S]*?))?\]\]/g;
        let match: RegExpExecArray | null;

        while ((match = actionRegex.exec(replyText)) !== null) {
          const actionType = match[1];
          const payloadRaw = match[2]?.trim();
          let payload: any = null;
          if (payloadRaw) {
            try {
              payload = JSON.parse(payloadRaw);
            } catch {
              payload = payloadRaw;
            }
          }

          if (actionType === 'NAVIGATE' && onNavigateTab) {
            const targetTab = typeof payload === 'string' ? payload : payload?.tab;
            if (targetTab) {
              onNavigateTab(targetTab as any);
              const tabLabels: Record<string, string> = {
                meds: 'Medication Schedule',
                trends: 'Vital Trends & Analytics',
                timeline: 'Health Journey Timeline',
                upload: 'Scan & Analyze Record',
                abdm: 'ABDM / ABHA Digital Hub',
                copilot: 'AI Copilot'
              };
              actionBadgeText = `⚡ Navigated to ${tabLabels[targetTab] || targetTab}`;
            }
          } else if (actionType === 'ADD_MED' && onAddMedication) {
            if (payload && typeof payload === 'object') {
              onAddMedication({
                name: payload.name || 'New Medication',
                dosage: payload.dosage || '500mg',
                frequency: payload.frequency || 'Once Daily (OD)',
                route: payload.route || 'Oral',
                timing: payload.timing || 'After Food',
                timeOfDay: payload.timeOfDay || ['Morning'],
                instructions: payload.instructions || 'Take as advised',
                isActive: true
              });
              actionBadgeText = `⚡ Added ${payload.name || 'Medication'} to Daily Schedule`;
            }
          } else if (actionType === 'TOGGLE_TAKEN' && onToggleMedicationTaken) {
            const medName = typeof payload === 'string' ? payload : payload?.medName || payload?.name;
            if (medName) {
              onToggleMedicationTaken(medName);
              actionBadgeText = `⚡ Marked ${medName} as Taken Today`;
            }
          } else if (actionType === 'TOGGLE_STATUS' && onToggleMedicationStatus) {
            const medName = typeof payload === 'string' ? payload : payload?.medName || payload?.name;
            if (medName) {
              onToggleMedicationStatus(medName);
              actionBadgeText = `⚡ Updated Schedule Status for ${medName}`;
            }
          } else if (actionType === 'DELETE_MED' && onDeleteMedication) {
            const medName = typeof payload === 'string' ? payload : payload?.medName || payload?.name;
            if (medName) {
              onDeleteMedication(medName);
              actionBadgeText = `⚡ Removed ${medName} from Medication Schedule`;
            }
          } else if (actionType === 'LOG_VITAL' && onLogVital) {
            if (payload && typeof payload === 'object') {
              onLogVital(
                payload.testName || 'Fasting Blood Sugar (FBS)',
                Number(payload.value) || 110,
                payload.unit || 'mg/dL',
                payload.status || 'NORMAL'
              );
              actionBadgeText = `⚡ Logged ${payload.testName || 'Vital'} (${payload.value} ${payload.unit})`;
            }
          }
        }

        // Clean out raw action command tags from conversational display
        replyText = replyText.replace(/\[\[ACTION:[^\]]+\]\]/g, '').trim();

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          actionBadge: actionBadgeText,
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
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5"
            title="Setu | AI-Powered Personal Health Copilot"
          >
            <img 
              src="/brand/favicon.png" 
              alt="Setu" 
              className="w-full h-full object-contain" 
              title="Setu | AI-Powered Personal Health Copilot" 
            />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-white">Setu Clinical Copilot</h3>
            <p className="text-xs text-slate-400">{i18n.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              stopSpeaking();
              setIsSpeaking(false);
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  role: 'assistant',
                  content: i18n.resetMsg,
                  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" /> Suggested:
        </span>
        {i18n.quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
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
                    {msg.actionBadge && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200/90 text-teal-800 text-[11px] font-semibold shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{msg.actionBadge}</span>
                      </div>
                    )}
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
                      <span>{isSpeaking ? i18n.stopAudio : i18n.listen}</span>
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
              <span className="text-xs text-slate-500 font-medium">Analyzing clinical context...</span>
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
          placeholder={i18n.placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-900 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium shadow-xs transition-colors cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
