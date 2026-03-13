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
  question: z.string().describe('The health-related question from the user.').min(1),
  userProfile: z
    .object({
      age: z.number().describe('The age of the user.').optional(),
      gender: z.string().describe('The gender of the user.').optional(),
      chronicDiseases: z
        .array(z.string())
        .describe('List of chronic diseases the user has.')
        .optional(),
      medications: z
        .array(z.string())
        .describe('List of medications the user is currently taking.')
        .optional(),
      allergies: z
        .array(z.string())
        .describe('List of known allergies.')
        .optional(),
      recentHealthConcerns: z
        .string()
        .describe('Any recent health concerns or symptoms reported by the user.')
        .optional(),
    })
    .describe('The comprehensive health profile of the user.'),
});
export type AiHealthAssistantAdviceInput = z.infer<
  typeof AiHealthAssistantAdviceInputSchema
>;

const AiHealthAssistantAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Personalized health advice based on the question and profile.')
    .min(1),
  recommendations: z
    .array(z.string())
    .describe('Specific recommendations for managing health or next steps.')
    .optional(),
  disclaimer: z.string().describe('A medical disclaimer stating that this is not a substitute for professional medical advice.').min(1),
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
  prompt: `You are an AI health assistant dedicated to providing personalized, helpful, and empathetic health advice and recommendations. Your primary goal is to empower users to better understand and manage their health conditions based on their provided health profile.

ALWAYS include a medical disclaimer at the end of your response, clearly stating that your advice is for informational purposes only and not a substitute for professional medical consultation. Never diagnose or prescribe treatment.

User's Health Profile:
{{#if userProfile.age}}Age: {{{userProfile.age}}}\n{{/if}}
{{#if userProfile.gender}}Gender: {{{userProfile.gender}}}\n{{/if}}
{{#if userProfile.chronicDiseases.length}}
Chronic Diseases: {{#each userProfile.chronicDiseases}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.medications.length}}
Medications: {{#each userProfile.medications}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.allergies.length}}
Allergies: {{#each userProfile.allergies}}{{{this}}}{{^last}}, {{/last}}{{/each}}\n{{/if}}
{{#if userProfile.recentHealthConcerns}}
Recent Health Concerns: {{{userProfile.recentHealthConcerns}}}\n{{/if}}

User's Question: "{{{question}}}"

Based on the user's health profile and their question, provide tailored advice and specific recommendations. Focus on actionable insights, general wellness, and educational information related to their conditions. Avoid directly answering questions that require a medical diagnosis or specific treatment plans. Instead, guide them on how to discuss these with their healthcare provider.

Output ONLY in the specified JSON format.`,
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
