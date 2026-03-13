'use server';
/**
 * @fileOverview This file implements the Urgent Care Guidance Genkit flow in Portuguese.
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
  prompt: `És um Assistente de Saúde com IA concebido para identificar situações de saúde urgentes com base nos sintomas fornecidos pelo utilizador e fornecer instruções imediatas e claras EM PORTUGUÊS.

Analisa os seguintes sintomas:
Sintomas: {{{symptoms}}}

Com base nestes sintomas, determina se a situação requer atenção médica urgente (por exemplo, ligar para os serviços de emergência, ir a uma urgência).

Se a situação for urgente:
Define 'isUrgent' como verdadeiro.
Fornece instruções claras e acionáveis em 'guidance' EM PORTUGUÊS para contactar os serviços de emergência imediatamente (por exemplo, "Ligue para o 112 ou para o número de emergência local imediatamente. Não espere que os sintomas piorem. Procure assistência médica imediata.") e o que fazer enquanto espera por ajuda. Enfatiza que não deve haver atrasos.

Se a situação NÃO for urgente:
Define 'isUrgent' como falso.
Fornece conselhos gerais e tranquilizadores em 'guidance' EM PORTUGUÊS, sugerindo que consultem o seu médico de família ou uma clínica de saúde local para preocupações não urgentes, e que monitorizem os seus sintomas. NÃO forneças diagnósticos específicos ou planos de tratamento.`,
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
