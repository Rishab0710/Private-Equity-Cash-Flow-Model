'use server';
/**
 * @fileOverview An AI agent that auto-fills fund parameters based on fund name and strategy.
 *
 * - autoFillFundParameters - A function that handles the auto-filling of fund parameters.
 * - AutoFillFundParametersInput - The input type for the autoFillFundParameters function.
 * - AutoFillFundParametersOutput - The return type for the autoFillFundParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoFillFundParametersInputSchema = z.object({
  fundName: z.string().describe('The name of the fund.'),
  fundStrategy: z.string().describe('The investment strategy of the fund (e.g., PE, VC, Infra).'),
});
export type AutoFillFundParametersInput = z.infer<typeof AutoFillFundParametersInputSchema>;

const AutoFillFundParametersOutputSchema = z.object({
  investmentPeriod: z.number().describe('The typical investment period for this fund type in years.'),
  fundLife: z.number().describe('The expected fund life in years.'),
  jCurveTemplate: z.string().describe('A suggested J-curve template to use (e.g., Private Equity, Venture Capital).'),
});
export type AutoFillFundParametersOutput = z.infer<typeof AutoFillFundParametersOutputSchema>;

export async function autoFillFundParameters(input: AutoFillFundParametersInput): Promise<AutoFillFundParametersOutput> {
  return autoFillFundParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoFillFundParametersPrompt',
  input: {schema: AutoFillFundParametersInputSchema},
  output: {schema: AutoFillFundParametersOutputSchema},
  prompt: `You are an expert in private market fund characteristics. Given the fund's name and strategy, you will suggest reasonable default values for investment period, fund life, and a suitable J-curve template.

Fund Name: {{{fundName}}}
Fund Strategy: {{{fundStrategy}}}

Provide the output in JSON format.`,
});

const autoFillFundParametersFlow = ai.defineFlow(
  {
    name: 'autoFillFundParametersFlow',
    inputSchema: AutoFillFundParametersInputSchema,
    outputSchema: AutoFillFundParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
