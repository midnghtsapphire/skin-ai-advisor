import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, skinType, skinConcerns } = await req.json();

    if (!ingredients) {
      return new Response(
        JSON.stringify({ error: "Ingredients are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a skincare ingredient expert. Analyze product ingredients for compatibility with a user's skin profile.

User's Skin Profile:
- Skin Type: ${skinType || "Not specified"}
- Skin Concerns: ${skinConcerns?.length ? skinConcerns.join(", ") : "None specified"}

Analyze the ingredients list and provide a compatibility assessment. Be thorough but accessible in your explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze these ingredients: ${ingredients}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_ingredients",
              description: "Analyze skincare product ingredients for skin compatibility",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "number",
                    description: "Compatibility score from 0-100 where 100 is perfect compatibility",
                  },
                  verdict: {
                    type: "string",
                    enum: ["excellent", "good", "moderate", "caution", "avoid"],
                    description: "Overall recommendation verdict",
                  },
                  summary: {
                    type: "string",
                    description: "Brief 1-2 sentence summary of the analysis",
                  },
                  beneficialIngredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        benefit: { type: "string" },
                        relevance: { type: "string", description: "Why it's good for this skin type/concerns" },
                      },
                      required: ["name", "benefit", "relevance"],
                    },
                    description: "Ingredients that are beneficial for the user's skin",
                  },
                  concerningIngredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        concern: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                        recommendation: { type: "string" },
                      },
                      required: ["name", "concern", "severity", "recommendation"],
                    },
                    description: "Ingredients that may cause issues for the user's skin",
                  },
                  neutralIngredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        purpose: { type: "string" },
                      },
                      required: ["name", "purpose"],
                    },
                    description: "Ingredients that are neutral - not particularly beneficial or harmful",
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Usage tips or recommendations for this product",
                  },
                },
                required: ["overallScore", "verdict", "summary", "beneficialIngredients", "concerningIngredients", "neutralIngredients", "tips"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_ingredients" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis received from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in check-ingredients:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
