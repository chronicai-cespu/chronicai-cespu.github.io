/**
 * Triagem de urgência (PT-PT) com Firebase AI Logic + Gemini Developer API.
 */
import { Schema } from 'firebase/ai';
import { jsonModel } from '@/lib/firebase';

export type UrgentCareGuidanceInput = { symptoms: string };
export type UrgentCareGuidanceOutput = { isUrgent: boolean; guidance: string };

const outputSchema = Schema.object({
  properties: {
    isUrgent: Schema.boolean({
      description: 'Verdadeiro se os sintomas sugerirem uma situação de saúde urgente, falso caso contrário.',
    }),
    guidance: Schema.string({
      description:
        'Instruções claras para contactar serviços de emergência ou unidades de saúde locais se for urgente, ou conselhos gerais para situações não urgentes.',
    }),
  },
});

const SYSTEM = `És um Assistente de Saúde com IA treinado para identificar situações de emergência em PORTUGUÊS DE PORTUGAL (PT-PT).

### DIRETRIZES DE SEGURANÇA E ACESSIBILIDADE:
1. **Emergência:** Se detetares sinais de alerta como dor no peito intensa, falta de ar súbita, desorientação ou hemorragias graves, marca 'isUrgent' como verdadeiro.
2. **Acessibilidade:** Usa frases curtas, claras e diretas. Considera que o utilizador pode ter dificuldades de visão ou artrite.
3. **Incentivo:** Lembra o utilizador que pode usar o microfone do dispositivo para falar se escrever for difícil.

### RESPOSTA:
Se URGENTE:
- 'isUrgent': true.
- 'guidance': "A situação parece grave. Ligue já para o **112** ou para o **SNS 24 (808 24 24 24)**. Não tente conduzir. Aguarde por ajuda. Pode usar a voz se for mais fácil."

Se NÃO URGENTE:
- 'isUrgent': false.
- 'guidance': "Não parece ser uma emergência agora, mas vigie o seu estado. Ligue para o **SNS 24 (808 24 24 24)** para falar com um profissional. Pode também marcar uma consulta com o seu médico em breve."

Mantém um tom calmo, profissional e muito direto. Responde APENAS em PT-PT.`;

export async function urgentCareGuidance(input: UrgentCareGuidanceInput): Promise<UrgentCareGuidanceOutput> {
  const result = await jsonModel(outputSchema, SYSTEM).generateContent(`Sintomas: ${input.symptoms}`);
  const out = JSON.parse(result.response.text()) as UrgentCareGuidanceOutput;
  if (typeof out?.isUrgent !== 'boolean' || !out.guidance) {
    throw new Error('A IA não devolveu uma resposta válida.');
  }
  return out;
}
