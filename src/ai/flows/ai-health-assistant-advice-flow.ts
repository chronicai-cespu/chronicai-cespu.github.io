/**
 * Assistente de saúde com IA (Firebase AI Logic + Gemini Developer API).
 * Corre no browser; não precisa de servidor nem de faturação.
 */
import { Schema } from 'firebase/ai';
import { jsonModel } from '@/lib/firebase';

export type AiHealthAssistantAdviceInput = {
  question: string;
  userProfile: {
    age?: number;
    gender?: string;
    chronicDiseases?: string[];
    weight?: number;
    height?: number;
    alcoholFreq?: string;
    tobaccoFreq?: string;
    physicalActivityLevel?: string;
    motivationToChange?: boolean;
    diabetesInfo?: any;
    hypertensionInfo?: any;
    cholesterolInfo?: any;
    recentHealthConcerns?: string;
    medications?: any[];
    allergies?: string[];
    [key: string]: any;
  };
};

export type AiHealthAssistantAdviceOutput = {
  advice: string;
  recommendations?: string[];
  didYouKnow?: string;
  disclaimer: string;
};

const outputSchema = Schema.object({
  properties: {
    advice: Schema.string({ description: 'Conselho de saúde personalizado com base na pergunta e no perfil.' }),
    recommendations: Schema.array({
      items: Schema.string(),
      description: 'Recomendações específicas para gerir a saúde ou próximos passos.',
    }),
    didYouKnow: Schema.string({
      description:
        'Uma curiosidade personalizada baseada em dados estatísticos de saúde (INS) ou boas práticas para as patologias do utilizador.',
    }),
    disclaimer: Schema.string({ description: 'Um aviso médico.' }),
  },
  optionalProperties: ['recommendations', 'didYouKnow'],
});

const SYSTEM = `És um assistente de saúde com IA em PORTUGUÊS DE PORTUGAL (PT-PT).

### DIRETRIZES:
1. **Tom:** Empático e profissional. Frases curtas e claras para seniores.
2. **Acessibilidade:** Incentiva o uso de voz.
3. **Segurança:** Sem diagnósticos. Se grave (dor peito, falta ar), instrui ligar 112 ou SNS 24 (808 24 24 24).
4. **Informação Útil (Sabia que...?):** Gera sempre uma curiosidade relevante no campo 'didYouKnow'. Baseia-te em dados de saúde reais (tipo INS/DGS) adequados às patologias do utilizador (Ex: "Sabia que em Portugal X% dos seniores com hipertensão controlam-na com caminhadas diárias?").`;

const fmt = (v: any) => (v === undefined || v === null || v === '' ? 'não indicado' : typeof v === 'object' ? JSON.stringify(v) : String(v));

export async function aiHealthAssistantAdvice(
  input: AiHealthAssistantAdviceInput
): Promise<AiHealthAssistantAdviceOutput> {
  const p = input.userProfile || {};
  const prompt = `### Perfil do Utilizador:
Doenças: ${(p.chronicDiseases || []).join(', ') || 'não indicado'}
Dados: Idade ${fmt(p.age)}, Género ${fmt(p.gender)}, Peso ${fmt(p.weight)}kg, Altura ${fmt(p.height)}cm.
Atividade: ${fmt(p.physicalActivityLevel)}. Motivação: ${p.motivationToChange ? 'Sim' : 'Não'}.
Detalhes Diabetes: ${fmt(p.diabetesInfo)}
Detalhes Hipertensão: ${fmt(p.hypertensionInfo)}
Detalhes Colesterol: ${fmt(p.cholesterolInfo)}
Medicação: ${fmt(p.medications)}
Alergias: ${fmt(p.allergies)}
Preocupações recentes: ${fmt(p.recentHealthConcerns)}

Pergunta: "${input.question}"`;

  const result = await jsonModel(outputSchema, SYSTEM).generateContent(prompt);
  return JSON.parse(result.response.text()) as AiHealthAssistantAdviceOutput;
}
