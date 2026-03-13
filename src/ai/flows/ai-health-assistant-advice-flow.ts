'use server';
/**
 * @fileOverview An AI health assistant that provides personalized advice and recommendations
 * based on a user's health profile and questions, including personalized curiosities (INS).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiHealthAssistantAdviceInputSchema = z.object({
  question: z.string().describe('A pergunta relacionada com saúde do utilizador.').min(1),
  userProfile: z
    .object({
      age: z.number().optional(),
      gender: z.string().optional(),
      chronicDiseases: z.array(z.string()).optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      alcoholFreq: z.string().optional(),
      tobaccoFreq: z.string().optional(),
      physicalActivityLevel: z.string().optional(),
      motivationToChange: z.boolean().optional(),
      diabetesInfo: z.any().optional(),
      hypertensionInfo: z.any().optional(),
      cholesterolInfo: z.any().optional(),
      recentHealthConcerns: z.string().optional(),
    })
    .describe('O perfil de saúde abrangente do utilizador.'),
});
export type AiHealthAssistantAdviceInput = z.infer<
  typeof AiHealthAssistantAdviceInputSchema
>;

const AiHealthAssistantAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Conselho de saúde personalizado com base na pergunta e no perfil.')
    .min(1),
  recommendations: z
    .array(z.string())
    .describe('Recomendações específicas para gerir a saúde ou próximos passos.')
    .optional(),
  didYouKnow: z
    .string()
    .describe('Uma curiosidade personalizada baseada em dados estatísticos de saúde (INS) ou boas práticas para as patologias do utilizador.')
    .optional(),
  disclaimer: z.string().describe('Um aviso médico.').min(1),
});
export type AiHealthAssistantAdviceOutput = z.infer<
  typeof AiHealthAssistantAdviceOutputSchema
>;

export async function aiHealthAssistantAdvice(
  input: AiHealthAssistantAdviceInput
): Promise<AiHealthAssistantAdviceOutput> {
  return aiHealthAssistantAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHealthAssistantAdvicePrompt',
  input: {schema: AiHealthAssistantAdviceInputSchema},
  output: {schema: AiHealthAssistantAdviceOutputSchema},
  prompt: `És um assistente de saúde com IA em PORTUGUÊS DE PORTUGAL (PT-PT).

### DIRETRIZES:
1. **Tom:** Empático e profissional. Frases curtas e claras para seniores.
2. **Acessibilidade:** Incentiva o uso de voz.
3. **Segurança:** Sem diagnósticos. Se grave (dor peito, falta ar), instrui ligar 112 ou SNS 24 (808 24 24 24).
4. **Informação Útil (Sabia que...?):** Gera sempre uma curiosidade relevante no campo 'didYouKnow'. Baseia-te em dados de saúde reais (tipo INS/DGS) adequados às patologias do utilizador (Ex: "Sabia que em Portugal X% dos seniores com hipertensão controlam-na com caminhadas diárias?").

### Perfil do Utilizador:
Doenças: {{#each userProfile.chronicDiseases}}{{{this}}}{{^last}}, {{/last}}{{/each}}
Dados: Idade {{userProfile.age}}, Peso {{userProfile.weight}}kg, Altura {{userProfile.height}}cm.
Atividade: {{userProfile.physicalActivityLevel}}. Motivação: {{#if userProfile.motivationToChange}}Sim{{else}}Não{{/if}}.
Detalhes Diabetes: {{{userProfile.diabetesInfo}}}
Detalhes Hipertensão: {{{userProfile.hypertensionInfo}}}

Pergunta: "{{{question}}}"`,
});

const aiHealthAssistantAdviceFlow = ai.defineFlow(
  {
    name: 'aiHealthAssistantAdviceFlow',
    inputSchema: AiHealthAssistantAdviceInputSchema,
    outputSchema: AiHealthAssistantAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
