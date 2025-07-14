import { z } from 'zod';
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from "@langchain/core/prompts";

// Define the output schema with zod
const readmeSummarySchema = z.object({
  summary: z.string(),
  coolFacts: z.array(z.string()),
});

export type ReadmeSummary = z.infer<typeof readmeSummarySchema>;

const parser = StructuredOutputParser.fromZodSchema(readmeSummarySchema);

const prompt = new PromptTemplate({
  template: `You are an expert at summarizing GitHub README files. Given the following README content, provide:
1. A concise summary of what the project is about (as a single string).
2. A list of the coolest or most interesting facts about the project (as an array of strings).

Format your response as JSON using this schema:
{format_instructions}

README:
"""
{readme}
"""`,
  inputVariables: ['readme'],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

const model = new ChatOpenAI({
  temperature: 0.3,
  modelName: 'gpt-3.5-turbo',
});

export async function summarizeReadme(readme: string): Promise<ReadmeSummary> {
  const input = await prompt.format({ readme });
  const response = await model.invoke([{ role: 'user', content: input }]);
  // Ensure we pass a string to parser.parse
  let content: string = '';
  if (typeof response.content === 'string') {
    content = response.content;
  } else if (Array.isArray(response.content)) {
    content = response.content.filter((c) => typeof c === 'string').join(' ');
  }
  return parser.parse(content);
} 