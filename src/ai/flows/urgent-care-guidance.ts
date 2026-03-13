'use server';
/**
 * @fileOverview This file implements the Urgent Care Guidance Genkit flow in Portuguese (PT-PT),
 * strictly adhering to emergency protocols.
 *
 * - urgentCareGuidance - A function that assesses user-provided symptoms for urgency and provides appropriate guidance.
 * - UrgentCareGuidanceInput - The input type for the urgentCareGuidance function.
 * - UrgentCareGuidanceOutput - The return type for the urgentCareGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UrgentCareGuidanceInputSchema = z.object({
  symptoms: z.string().describe('Uma descrição detalhada dos sintomas do utilizador.'),
});
export type UrgentCareGuidanceInput = z.infer<typeof UrgentCareGuidanceInputSchema>;

const UrgentCareGuidanceOutputSchema = z.object({
  isUrgent: z.boolean().describe('Verdadeiro se os sintomas sugerirem uma situação de saúde urgente, falso caso contrário.'),
  guidance: z.string().describe('Instruções claras para contactar serviços de emergência ou unidades de saúde locais se for urgente, ou conselhos gerais para situações não urgentes.'),
});
export type UrgentCareGuidanceOutput = z.infer<typeof UrgentCareGuidanceOutputSchema>;

export async function urgentCareGuidance(input: UrgentCareGuidanceInput): Promise<UrgentCareGuidanceOutput> {
  return urgentCareGuidanceFlow(input);
}

const urgentCareGuidancePrompt = ai.definePrompt({
  name: 'urgentCareGuidancePrompt',
  input: {schema: UrgentCareGuidanceInputSchema},
  output: {schema: UrgentCareGuidanceOutputSchema},
  prompt: `És um Assistente de Saúde com IA treinado para identificar situações de emergência em PORTUGUÊS DE PORTUGAL (PT-PT).

### DIRETRIZES DE SEGURANÇA E ACESSIBILIDADE:
1. **Emergência:** Se detetares sinais de alerta como dor no peito intensa, falta de ar súbita, desorientação ou hemorragias graves, marca 'isUrgent' como verdadeiro.
2. **Acessibilidade:** Usa frases curtas, claras e diretas. Considera que o utilizador pode ter dificuldades de visão ou artrite.
3. **Incentivo:** Lembra o utilizador que pode usar o microfone do dispositivo para falar se escrever for difícil.

### SINTOMAS A ANALISAR:
Sintomas: {{{symptoms}}}

### RESPOSTA:
Se URGENTE:
- 'isUrgent': true.
- 'guidance': "A situação parece grave. Ligue já para o **112** ou para o **SNS 24 (808 24 24 24)**. Não tente conduzir. Aguarde por ajuda. Pode usar a voz se for mais fácil."

Se NÃO URGENTE:
- 'isUrgent': false.
- 'guidance': "Não parece ser uma emergência agora, mas vigie o seu estado. Ligue para o **SNS 24 (808 24 24 24)** para falar com um profissional. Pode também marcar uma consulta com o seu médico em breve."

Mantém um tom calmo, profissional e muito direto. Responde APENAS em PT-PT.`,
});

const urgentCareGuidanceFlow = ai.defineFlow(
  {
    name: 'urgentCareGuidanceFlow',
    inputSchema: UrgentCareGuidanceInputSchema,
    outputSchema: UrgentCareGuidanceOutputSchema,
  },
  async (input) => {
    const {output} = await urgentCareGuidancePrompt(input);
    if (!output) {
      throw new Error('AI prompt did not return output.');
    }
    return output;
  }
);
