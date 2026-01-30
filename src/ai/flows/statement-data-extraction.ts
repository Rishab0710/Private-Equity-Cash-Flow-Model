'use server';

/**
 * @fileOverview A flow to extract data from quarterly PDF statements for a fund.
 *
 * - extractStatementData - A function that handles the data extraction process.
 * - ExtractStatementDataInput - The input type for the extractStatementData function.
 * - ExtractStatementDataOutput - The return type for the extractStatementData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractStatementDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF statement as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractStatementDataInput = z.infer<typeof ExtractStatementDataInputSchema>;

const ExtractStatementDataOutputSchema = z.object({
  capitalCalls: z.array(z.object({
    value: z.number().describe('The amount of the capital call.'),
    period: z.string().describe('The period the capital call applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  })).describe('Capital calls extracted from the statement.'),
  distributions: z.array(z.object({
    value: z.number().describe('The amount of the distribution.'),
    period: z.string().describe('The period the distribution applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  })).describe('Distributions extracted from the statement.'),
  navValues: z.array(z.object({
    value: z.number().describe('The NAV value.'),
    period: z.string().describe('The period the NAV value applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  })).describe('NAV values extracted from the statement.'),
  feesAndExpenses: z.array(z.object({
    value: z.number().describe('The amount of fees and expenses.'),
    period: z.string().describe('The period the fees and expenses apply to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  })).describe('Fees and expenses extracted from the statement.'),
  remainingUnfundedCommitment: z.object({
    value: z.number().describe('The remaining unfunded commitment amount.'),
    period: z.string().describe('The period the remaining unfunded commitment applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  }).describe('Remaining unfunded commitment extracted from the statement.'),
  dpi: z.object({
    value: z.number().describe('The DPI value.'),
    period: z.string().describe('The period the DPI value applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  }).optional().describe('DPI extracted from the statement, if present.'),
  tvpi: z.object({
    value: z.number().describe('The TVPI value.'),
    period: z.string().describe('The period the TVPI value applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  }).optional().describe('TVPI extracted from the statement, if present.'),
  irr: z.object({
    value: z.number().describe('The IRR value.'),
    period: z.string().describe('The period the IRR value applies to.'),
    confidence: z.number().describe('The confidence score of the extraction.'),
    sourcePage: z.number().describe('The page number in the PDF where the data was extracted from.'),
  }).optional().describe('IRR extracted from the statement, if present.'),
});
export type ExtractStatementDataOutput = z.infer<typeof ExtractStatementDataOutputSchema>;

export async function extractStatementData(input: ExtractStatementDataInput): Promise<ExtractStatementDataOutput> {
  return extractStatementDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractStatementDataPrompt',
  input: {schema: ExtractStatementDataInputSchema},
  output: {schema: ExtractStatementDataOutputSchema},
  prompt: `You are an expert financial data extractor. You will extract data from a PDF statement.

You will extract the following information:
- Capital calls
- Distributions
- NAV values
- Fees & expenses (if available)
- Remaining unfunded commitment
- DPI (if present)
- TVPI (if present)
- IRR (if present)

Here is the PDF statement:
{{media url=pdfDataUri}}

Return the extracted data in JSON format.
`,
});

const extractStatementDataFlow = ai.defineFlow(
  {
    name: 'extractStatementDataFlow',
    inputSchema: ExtractStatementDataInputSchema,
    outputSchema: ExtractStatementDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
