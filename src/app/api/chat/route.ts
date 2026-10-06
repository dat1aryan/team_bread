import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = 'en', clinicalContext } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    const userMessage = messages[messages.length - 1]?.content || '';

    const languageInstructions: Record<string, string> = {
      en: 'Respond in clear, compassionate, easy-to-understand English.',
      hi: 'Respond in polite, compassionate Hindi (Devanagari script) with simple medical explanations.',
      te: 'Respond in polite, helpful Telugu script with clear medical explanations.',
      ta: 'Respond in polite, clear Tamil script with simple medical explanations.',
      bn: 'Respond in polite, clear Bengali script with simple medical explanations.',
      mr: 'Respond in polite, clear Marathi script with simple medical explanations.',
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
6. Always include a brief clinical disclaimer reminding the patient to confirm dosage adjustments with their treating physician.
7. ${langInstruction}
`;

    if (apiKey && apiKey !== 'your-gemini-api-key') {
      const activeModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
      for (const model of activeModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const contents = [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nPATIENT QUERY:\n${userMessage}` }]
            }
          ];

          const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800
              }
            })
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return NextResponse.json({
                success: true,
                reply: text,
                source: model
              });
            }
          }
        } catch (geminiError) {
          console.warn(`Gemini model ${model} error, trying next:`, geminiError);
        }
      }
    }

    // Heuristic Clinical Response Fallback
    const lower = userMessage.toLowerCase();
    let reply = '';

    if (lower.includes('hba1c') || lower.includes('sugar') || lower.includes('glucose') || lower.includes('diabetes')) {
      reply = `Your recent HbA1c of 7.4% and Fasting Blood Sugar of 162 mg/dL show that blood glucose has been running above the standard target (which is below 7.0%). 
      
Here is what helps right now:
1. **Medication Consistency**: Ensure you take Metformin 500mg right after meals as prescribed to reduce digestive irritation.
2. **Meal Balancing**: Fill half your plate with non-starchy vegetables (cucumber, greens, methi) before taking carbs like rotis or brown rice.
3. **Daily Walk**: A 25-minute brisk walk after dinner significantly lowers overnight liver glucose spikes.
4. **Doctor Visit**: Schedule a follow-up in the next 7-10 days to ask if dosage titration is required.`;
    } else if (lower.includes('medication') || lower.includes('medicine') || lower.includes('timing') || lower.includes('food')) {
      reply = `Here is your current medication regimen review:
- **Metformin 500mg**: Take twice daily *after food* with a glass of water.
- **Telmisartan 40mg**: Take once daily in the *morning after breakfast* for consistent blood pressure control.
- **Atorvastatin 10mg**: Take once daily *at bedtime* — cholesterol synthesis in the liver peaks overnight, making night-time dosing most effective.

*Note: Never discontinue medications without consulting your prescribing physician.*`;
    } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) {
      reply = `Based on your glycemic and lipid profile (HbA1c 7.4%, LDL 148 mg/dL), here are key dietary recommendations:
1. **Reduce Refined Fats**: Switch from vanaspati and deep frying to cold-pressed mustard, olive, or groundnut oil (limited to 2-3 tsp daily).
2. **High-Fiber Starters**: Begin lunches and dinners with a salad or sprout bowl to blunt post-meal sugar spikes.
3. **Avoid Night Snacking**: Maintain a minimum 12-hour overnight fasting window (e.g. 8:00 PM dinner to 8:00 AM breakfast).`;
    } else {
      reply = `I have reviewed your medical profile. You currently have 4 active medications (Metformin, Telmisartan, Atorvastatin) and records showing sub-optimally controlled glucose and elevated LDL cholesterol. 

Feel free to ask me about:
- What any specific lab test number means
- Safe medication timings & drug interactions
- Meal and exercise recommendations
- Questions to prepare for your next doctor's appointment!`;
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
