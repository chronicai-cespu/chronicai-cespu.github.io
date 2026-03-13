'use server';
/**
 * @fileOverview An AI health assistant that provides personalized advice and recommendations
 * based on a user's health profile and questions.
 *
 * - aiHealthAssistantAdvice - A function that handles health-related questions and provides tailored advice.
 * - AiHealthAssistantAdviceInput - The input type for the aiHealthAssistantAdvice function.
 * - AiHealthAssistantAdviceOutput - The return type for the aiHealthAssistantAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiHealthAssistantAdviceInputSchema = z.object({
  question: z.string().describe('A pergunta relacionada com saúde do utilizador.').min(1),
  userProfile: z
    .object({
      age: z.number().describe('A idade do utilizador.').optional(),
      gender: z.string().describe('O género do utilizador.').optional(),
      chronicDiseases: z
        .array(z.string())
        .describe('Lista de doenças crónicas do utilizador.')
        .optional(),
      medications: z
        .array(z.string())
        .describe('Lista de medicamentos que o utilizador está a tomar.')
        .optional(),
      allergies: z
        .array(z.string())
        .describe('Lista de alergias conhecidas.')
        .optional(),
      recentHealthConcerns: z
        .string()
        .describe('Preocupações de saúde recentes ou sintomas reportados.')
        .optional(),
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
  disclaimer: z.string().describe('Um aviso médico indicando que isto não substitui aconselhamento médico profissional.').min(1),
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
  prompt: `És um assistente de saúde com IA dedicado a fornecer conselhos e recomendações de saúde personalizados, úteis e empáticos em PORTUGUÊS. O teu principal objetivo é capacitar os utilizadores a compreender e gerir melhor as suas condições de saúde com base no perfil de saúde fornecido.

DEVES incluir SEMPRE um aviso médico no final da tua resposta, indicando claramente que o teu conselho é apenas para fins informativos e não substitui uma consulta médica profissional. Nunca diagnostiques nem prescrevas tratamento.

Perfil de Saúde do Utilizador:
{{#if userProfile.age}}Idade: {{{userProfile.age}}}\n{{/if}}
{{#if userProfile.gender}}Género: {{{userProfile.gender}}}\n{{/if}}
{{#if userProfile.chronicDiseases.length}}
Doenças Crónicas: {{#each userProfile.chronicDiseases}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.medications.length}}
Medicamentos: {{#each userProfile.medications}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.allergies.length}}
Alergias: {{#each userProfile.allergies}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.recentHealthConcerns}}
Preocupações de Saúde Recentes: {{{userProfile.recentHealthConcerns}}}\n{{/if}}

Pergunta do Utilizador: "{{{question}}}"

Com base no perfil de saúde do utilizador e na sua pergunta, fornece conselhos personalizados e recomendações específicas EM PORTUGUÊS. Foca-te em informações úteis, bem-estar geral e informação educativa relacionada com as suas condições. Evita responder diretamente a perguntas que exijam um diagnóstico médico ou planos de tratamento específicos. Em vez disso, orienta-os sobre como discutir estes assuntos com o seu profissional de saúde.

Responde APENAS no formato JSON especificado.`,
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
