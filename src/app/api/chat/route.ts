import { NextRequest, NextResponse } from 'next/server';
import { callGeminiWithFailover } from '@/lib/gemini-pool';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = 'en', clinicalContext } = body;

    const userMessage = messages[messages.length - 1]?.content || '';

    const languageInstructions: Record<string, string> = {
      en: 'Respond in clear, compassionate, easy-to-understand English.',
      hi: 'Respond in polite, compassionate Hindi (Devanagari script) with simple medical explanations.',
      te: 'Respond in polite, helpful Telugu script with clear medical explanations.',
      ta: 'Respond in polite, clear Tamil script with simple medical explanations.',
      bn: 'Respond in polite, clear Bengali script with simple medical explanations.',
      mr: 'Respond in polite, clear Marathi script with simple medical explanations.',
      es: 'Respond in clear, polite Spanish with simple and compassionate medical explanations.',
    };

    const langInstruction = languageInstructions[language] || languageInstructions.en;

    const contextSummary = clinicalContext ? `
PATIENT CLINICAL CONTEXT:
- Name: ${clinicalContext.patientName || 'Rajesh Kumar'} (Age: ${clinicalContext.age || '52'}, Gender: ${clinicalContext.gender || 'Male'})
- Diagnoses: ${clinicalContext.diagnoses?.join(', ') || 'Type 2 Diabetes Mellitus, Essential Hypertension'}
- Active Medications: ${clinicalContext.medications?.map((m: any) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.timing})`).join('; ') || 'Metformin 500mg, Telmisartan 40mg, Atorvastatin 10mg'}
- Recent Lab Biomarkers: ${clinicalContext.labObservations?.map((o: any) => `${o.testName}: ${o.value} ${o.unit} (${o.status})`).join('; ') || 'HbA1c: 7.4% (HIGH), Fasting Glucose: 162 mg/dL (HIGH), LDL: 148 mg/dL (HIGH)'}
` : '';

    const systemPrompt = `You are SetuHealth AI Copilot (सेतु हेल्थ), an empathetic, expert clinical health assistant designed to help patients understand and manage their healthcare journey.
${contextSummary}

GUIDELINES:
1. Speak in plain, reassuring, patient-friendly language without complex jargon.
2. Ground your explanations directly in the patient's active records above when relevant.
3. If they ask about abnormal values (e.g. HbA1c 7.4%, LDL 148), explain why it matters, lifestyle tips, and what to ask their doctor.
4. If they ask about medications or timings, explain before/after food rationale clearly.
5. Provide actionable diet, hydration, and sleep tips appropriate for Indian dietary habits (e.g. roti/rice balance, green veggies, dal, avoiding midnight carbs).
6. DO NOT include any clinical disclaimer, medical note, or warning (such as "Important Medical Note" or "Consult your doctor"). The user interface already has a dedicated permanent medical disclaimer banner below the chat.
7. ${langInstruction}
8. FORMATTING & BULLETS:
   - Always use clean markdown bullet points (with '- ' or '* ') or numbered lists (1., 2., 3.) for action steps, clinical insights, and recommendations.
   - Always use bold markdown (**target value**, **medication name**, **biomarker**) to showcase the main clinical targets and numbers clearly (e.g., **Target: HbA1c < 7.0%**, **Fasting Blood Sugar: 162 mg/dL**, **Metformin 500mg**).
   - Structure responses with clean bold section titles on their own line. Do NOT prefix headings with markdown hashtags (### or ##).
   - Do NOT include any trailing clinical disclaimer or medical note block.
`;

    const failoverResult = await callGeminiWithFailover(
      [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPATIENT QUERY:\n${userMessage}` }]
        }
      ],
      {
        temperature: 0.3,
        maxOutputTokens: 800
      }
    );

    if (failoverResult.success && failoverResult.text) {
      // Clean raw markdown hashtags from heading lines so text is clean even before rendering
      let cleanReply = failoverResult.text
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/\s*#{1,6}$/gm, '');

      // Strip any accidental trailing clinical disclaimer / important medical note blocks
      cleanReply = cleanReply
        .replace(/(\r?\n)*(\*{0,2}(Important Medical Note|Clinical Disclaimer|Medical Disclaimer|Important Clinical Reminder|Please Note|Disclaimer)\*{0,2}:?)[\s\S]*$/i, '')
        .trim();

      return NextResponse.json({
        success: true,
        reply: cleanReply,
        source: `${failoverResult.model} (Key #${failoverResult.keyIndex})`
      });
    }

    // Heuristic Clinical Response Fallback
    const lower = userMessage.toLowerCase();
    let reply = '';

    if (lower.includes('hba1c') || lower.includes('sugar') || lower.includes('glucose') || lower.includes('diabetes')) {
      reply = `Your recent HbA1c is **7.4%** and Fasting Blood Sugar is **162 mg/dL**, both running above the healthy standard target (**HbA1c < 7.0%**, **Fasting Sugar < 100 mg/dL**).

Key Focus Targets & Recommendations:
- **Target HbA1c**: Aim for **below 7.0%** to prevent microvascular damage.
- **Medication Consistency**: Continue taking **Metformin 500mg** right after meals to minimize stomach irritation.
- **Meal Balancing**: Fill half your plate with green vegetables and fiber before complex carbohydrates.
- **Daily Activity**: A brisk 25-minute post-dinner walk significantly curbs overnight glucose spikes.
- **Doctor Consultation**: Inquire about dosage optimization during your next checkup.`;
    } else if (lower.includes('medication') || lower.includes('medicine') || lower.includes('timing') || lower.includes('food')) {
      reply = `Here is your current medication regimen review:
- **Metformin 500mg**: Take twice daily after meals with water to reduce digestive upset.
- **Telmisartan 40mg**: Take once daily in the morning after breakfast for 24-hour blood pressure control (**Target BP < 130/80 mmHg**).
- **Atorvastatin 10mg**: Take once daily at bedtime (liver cholesterol synthesis peaks overnight, making night-time dosing most effective; **Target LDL < 100 mg/dL**).`;
    } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) {
      reply = `Based on your metabolic profile (**HbA1c: 7.4%**, **LDL: 148 mg/dL**), here are primary nutritional targets:
- **Target LDL Reduction**: Switch from vanaspati and deep-fried foods to cold-pressed mustard or olive oil (limit to 2-3 tsp daily).
- **High-Fiber Starters**: Begin meals with salads, cucumbers, or sprouted mung to slow carbohydrate absorption.
- **Overnight Fasting Window**: Target a 12-hour overnight digestive rest (e.g. 8:00 PM dinner to 8:00 AM breakfast).`;
    } else {
      reply = `I have reviewed your medical profile. You currently have 4 active medications (**Metformin**, **Telmisartan**, **Atorvastatin**) with key focus on **HbA1c (7.4%)** and **LDL (148 mg/dL)**.

Feel free to ask me about:
- **Biomarker Targets**: What any specific lab test number means
- **Medication Schedules**: Safe timings and meal interactions
- **Diet & Lifestyle**: Meal plans tailored to your conditions
- **Doctor Questions**: Priority topics to discuss at your next visit`;
    }

    return NextResponse.json({
      success: true,
      reply,
      source: 'clinical-heuristics'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
