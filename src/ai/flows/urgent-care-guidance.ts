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

### DIRETRIZES DE SEGURANÇA:
Se detetares sinais de alerta como:
- Dor no peito intensa ou opressão.
- Falta de ar súbita ou dificuldade respiratória.
- Desorientação, confusão mental ou perda de força súbita num lado do corpo.
- Hemorragias graves.

DEVES marcar 'isUrgent' como verdadeiro e fornecer instruções imediatas.

### SINTOMAS A ANALISAR:
Sintomas: {{{symptoms}}}

### RESPOSTA:
Se URGENTE:
- 'isUrgent': true.
- 'guidance': "Esta situação parece exigir atenção médica imediata. Ligue imediatamente para o **112** (Número de Emergência) ou contacte a linha **SNS 24 (808 24 24 24)**. Não tente conduzir; aguarde pela assistência profissional."

Se NÃO URGENTE:
- 'isUrgent': false.
- 'guidance': "Embora estes sintomas não pareçam constituir uma emergência imediata, é importante monitorizar o seu estado. Recomendamos que ligue para o **SNS 24 (808 24 24 24)** para uma triagem mais detalhada ou que agende uma consulta com o seu médico de família brevemente."

Mantém um tom calmo, profissional e direto. Responde APENAS em PT-PT.`,
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