import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AskAIRequest {
  question: string;
  user_type: string;
  input_json: any;
  result_json: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { question, user_type, input_json, result_json }: AskAIRequest = await req.json();

    if (!question || !user_type || !input_json || !result_json) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = buildSystemPrompt(user_type);
    const userPrompt = buildUserPrompt(question, input_json, result_json);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const answer = anthropicData.content[0].text;

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ask-ai function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildSystemPrompt(userType: string): string {
  const basePrompt = `You are an expert scientific advisor for the Quantum-Morph AI Lab, specializing in biochar production, activated carbon synthesis, and CO2 adsorption materials.

Your role is to explain experiment results and answer questions based ONLY on the provided experimental data. You must NEVER invent new values or suggest modifications to the experiment parameters.

CRITICAL RULES:
- Only explain and interpret the existing data provided
- Never suggest running new experiments
- Never invent or extrapolate values not in the data
- Base all answers strictly on the provided input_json and result_json
- If data is missing, acknowledge it rather than guessing`;

  const profileAdjustments = {
    student: `
AUDIENCE: Student / Learning Mode
- Use simple, clear explanations
- Define technical terms when you use them
- Use analogies and examples to clarify concepts
- Be encouraging and educational
- Break down complex ideas into digestible steps`,
    researcher: `
AUDIENCE: Researcher / Scientist
- Use precise technical language
- Reference scientific principles and mechanisms
- Discuss experimental methodology and confidence levels
- Explain statistical significance and model predictions
- Include relevant chemistry and materials science details`,
    industrial: `
AUDIENCE: Industrial User / Factory
- Focus on practical implementation and scalability
- Emphasize cost implications and efficiency
- Highlight safety concerns and risk factors
- Discuss production feasibility and yield
- Address quality control and process optimization`,
  };

  return basePrompt + (profileAdjustments[userType as keyof typeof profileAdjustments] || profileAdjustments.researcher);
}

function buildUserPrompt(question: string, inputJson: any, resultJson: any): string {
  return `EXPERIMENT INPUT DATA:
${JSON.stringify(inputJson, null, 2)}

EXPERIMENT RESULTS:
${JSON.stringify(resultJson, null, 2)}

USER QUESTION:
${question}

Please answer the question based strictly on the experimental data provided above. Do not invent new values or suggest changes to the experiment.`;
}
