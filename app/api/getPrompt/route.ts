import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { framework, agentName, agentPurpose, targetUsers } = body;

    // Validate required fields
    if (!framework || !agentName || !agentPurpose || !targetUsers) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a transform stream for streaming the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Create the prompt for OpenAI
    const prompt = `
Create a system message for an AI agent named "${agentName}" using the ${framework} structure.

### Agent Details:
- Name: ${agentName}
- Purpose: ${agentPurpose}
- Target Users: ${targetUsers}

### Framework Information:
${getFrameworkInfo(framework)}

Please generate a detailed system message in markdown format that follows the ${framework} structure. 
The message should be specific to the agent's purpose and target users. Include clear instructions and avoid generic language.
Format your response as clean markdown with appropriate headings, bullet points, and emphasis.
`;

    // Process in the background
    (async () => {
      try {
        // Call OpenAI API with streaming
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating system messages for AI agents. Output your response in markdown format.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: true,
        });

        // Process the stream and write to our transform stream
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            await writer.write(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        // Write error to the stream if needed
        await writer.write(encoder.encode("\n\n**Error occurred during generation.**"));
      } finally {
        // Close the writer when done
        await writer.close();
      }
    })();

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to get framework details
function getFrameworkInfo(framework: string): string {
  const frameworkDetails: Record<string, string> = {
    "CARE Framework": `
The CARE Framework consists of:
- Context: Describe the situation or background to set the stage for the AI's response.
- Ask: Clearly state the specific request or question.
- Rules: Provide any constraints or guidelines the AI should follow.
- Examples: Offer sample responses or scenarios to illustrate the desired outcome.
`,
    "APE Framework": `
The APE Framework consists of:
- Action: Define the specific action the AI should perform.
- Process: Outline the steps or methodology to accomplish the action.
- Explanation: Provide reasoning or context behind the action and process.
`,
    "CREATE Framework": `
The CREATE Framework consists of:
- Clarify: Define the problem or task clearly.
- Reflect: Encourage the AI to consider relevant information or past experiences.
- Evaluate: Assess possible solutions or responses.
- Act: Choose and implement the best solution.
- Tell: Explain the reasoning behind the chosen action.
- Examine: Review the outcome and learn from the experience.
`,
    "RACE Framework": `
The RACE Framework consists of:
- Role: Specify the role the AI should assume.
- Action: Describe the task the AI needs to perform.
- Context: Provide background information to inform the AI's response.
- Expectation: Define the desired outcome or criteria for success.
`,
    "SPEAR Framework": `
The SPEAR Framework consists of:
- Start: Initiate the interaction with a clear objective.
- Provide: Offer necessary information or data.
- Explain: Clarify any complex points or instructions.
- Ask: Pose questions to guide the AI or gather more information.
- Rinse & Repeat: Iterate the process as needed to refine the outcome.
`,
    "RPG Framework": `
The RPG Framework consists of:
- Role: Define the role or persona the AI should embody.
- Purpose: Specify the main goal or objective of the interaction.
- Guidelines: Set any rules or constraints the AI should adhere to.
`
  };

  return frameworkDetails[framework] || "No specific framework details available.";
}