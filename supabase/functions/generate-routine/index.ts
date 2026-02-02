import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skinType, skinConcerns } = await req.json();

    if (!skinType || !skinConcerns || skinConcerns.length === 0) {
      return new Response(
        JSON.stringify({ error: "Skin type and concerns are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Aura, an expert AI skincare advisor. You provide personalized, science-backed skincare routines based on skin type and concerns. You recommend products from various brands (brand-agnostic) and explain why each step is important. Be warm, encouraging, and educational.`;

    const userPrompt = `Create a personalized skincare routine for someone with ${skinType} skin and the following concerns: ${skinConcerns.join(", ")}.

Please provide:
1. A morning routine with 4-5 steps
2. An evening routine with 4-5 steps
3. Weekly treatments (1-2 recommendations)
4. Key ingredients to look for
5. Ingredients to avoid

For each routine step, include:
- The product type (e.g., cleanser, serum)
- Why it's important for their skin
- How to use it
- Example product recommendations from different brands`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_skincare_routine",
                description:
                  "Generate a complete personalized skincare routine",
                parameters: {
                  type: "object",
                  properties: {
                    morningRoutine: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          step: { type: "number" },
                          productType: { type: "string" },
                          importance: { type: "string" },
                          howToUse: { type: "string" },
                          recommendations: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                brand: { type: "string" },
                                product: { type: "string" },
                                priceRange: { type: "string" },
                              },
                              required: ["brand", "product", "priceRange"],
                            },
                          },
                        },
                        required: [
                          "step",
                          "productType",
                          "importance",
                          "howToUse",
                          "recommendations",
                        ],
                      },
                    },
                    eveningRoutine: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          step: { type: "number" },
                          productType: { type: "string" },
                          importance: { type: "string" },
                          howToUse: { type: "string" },
                          recommendations: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                brand: { type: "string" },
                                product: { type: "string" },
                                priceRange: { type: "string" },
                              },
                              required: ["brand", "product", "priceRange"],
                            },
                          },
                        },
                        required: [
                          "step",
                          "productType",
                          "importance",
                          "howToUse",
                          "recommendations",
                        ],
                      },
                    },
                    weeklyTreatments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          treatment: { type: "string" },
                          frequency: { type: "string" },
                          benefits: { type: "string" },
                          recommendations: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                brand: { type: "string" },
                                product: { type: "string" },
                              },
                              required: ["brand", "product"],
                            },
                          },
                        },
                        required: [
                          "treatment",
                          "frequency",
                          "benefits",
                          "recommendations",
                        ],
                      },
                    },
                    keyIngredients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ingredient: { type: "string" },
                          benefit: { type: "string" },
                        },
                        required: ["ingredient", "benefit"],
                      },
                    },
                    ingredientsToAvoid: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ingredient: { type: "string" },
                          reason: { type: "string" },
                        },
                        required: ["ingredient", "reason"],
                      },
                    },
                    summary: { type: "string" },
                  },
                  required: [
                    "morningRoutine",
                    "eveningRoutine",
                    "weeklyTreatments",
                    "keyIngredients",
                    "ingredientsToAvoid",
                    "summary",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_skincare_routine" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable. Please try again later.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate routine");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_skincare_routine") {
      throw new Error("Invalid response from AI");
    }

    const routine = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ routine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating routine:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to generate routine",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
