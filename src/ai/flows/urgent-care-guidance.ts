'use server';
/**
 * @fileOverview This file implements the Urgent Care Guidance Genkit flow.
 *
 * - urgentCareGuidance - A function that assesses user-provided symptoms for urgency and provides appropriate guidance.
 * - UrgentCareGuidanceInput - The input type for the urgentCareGuidance function.
 * - UrgentCareGuidanceOutput - The return type for the urgentCareGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UrgentCareGuidanceInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
});
export type UrgentCareGuidanceInput = z.infer<typeof UrgentCareGuidanceInputSchema>;

const UrgentCareGuidanceOutputSchema = z.object({
  isUrgent: z.boolean().describe('True if the symptoms suggest an urgent health situation, false otherwise.'),
  guidance: z.string().describe('Clear instructions for contacting emergency services or local health units if urgent, or general advice for non-urgent situations.'),
});
export type UrgentCareGuidanceOutput = z.infer<typeof UrgentCareGuidanceOutputSchema>;

export async function urgentCareGuidance(input: UrgentCareGuidanceInput): Promise<UrgentCareGuidanceOutput> {
  return urgentCareGuidanceFlow(input);
}

const urgentCareGuidancePrompt = ai.definePrompt({
  name: 'urgentCareGuidancePrompt',
  input: {schema: UrgentCareGuidanceInputSchema},
  output: {schema: UrgentCareGuidanceOutputSchema},
  prompt: `You are an AI Health Assistant designed to identify urgent health situations based on user-provided symptoms and provide immediate, clear instructions.

Analyze the following symptoms:
Symptoms: {{{symptoms}}}

Based on these symptoms, determine if the situation requires urgent medical attention (e.g., calling emergency services, going to an emergency room).

If the situation is urgent:
Set 'isUrgent' to true.
Provide clear, actionable instructions in 'guidance' to contact emergency services immediately (e.g., "Dial 911 or your local emergency number right away. Do not wait for symptoms to worsen. Seek immediate medical attention.") and what to do while waiting for help. Emphasize not to delay.

If the situation is NOT urgent:
Set 'isUrgent' to false.
Provide reassuring, general advice in 'guidance', suggesting they consult their primary care physician or a local health clinic for non-urgent concerns, and to monitor their symptoms. Do NOT provide specific diagnoses or treatment plans.`,
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
