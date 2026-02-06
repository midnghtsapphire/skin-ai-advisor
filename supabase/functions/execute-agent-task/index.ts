import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { task_id } = await req.json();

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch the task
    const taskRes = await fetch(`${supabaseUrl}/rest/v1/agent_tasks?id=eq.${task_id}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const tasks = await taskRes.json();
    const task = tasks[0];

    if (!task) {
      throw new Error("Task not found");
    }

    // Get project info if available
    let projectInfo = null;
    if (task.project_id) {
      const projectRes = await fetch(
        `${supabaseUrl}/rest/v1/projects?id=eq.${task.project_id}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const projects = await projectRes.json();
      projectInfo = projects[0];
    }

    // Build prompt based on task type
    const prompts: Record<string, string> = {
      generate_docs: `Generate comprehensive technical documentation for ${projectInfo?.name || "the project"}. 
        Include: overview, architecture, setup instructions, API reference, and deployment guide.
        Project details: ${JSON.stringify(projectInfo || {})}
        User input: ${task.input_data?.prompt || "Generate standard documentation"}`,
      
      create_wireframe: `Create a detailed wireframe specification for ${projectInfo?.name || "the project"}.
        Include: page layouts, component hierarchy, user flow, and responsive considerations.
        User input: ${task.input_data?.prompt || "Create wireframes for main pages"}`,
      
      analyze_competitors: `Analyze competitors for ${projectInfo?.name || "a skincare/beauty product"}.
        Include: market positioning, feature comparison, pricing analysis, and recommendations.
        User input: ${task.input_data?.prompt || "Analyze top 5 competitors"}`,
      
      generate_tests: `Generate test cases for ${projectInfo?.name || "the project"}.
        Include: unit tests, integration tests, e2e scenarios, and edge cases.
        User input: ${task.input_data?.prompt || "Generate comprehensive test suite"}`,
      
      create_api_spec: `Create an OpenAPI specification for ${projectInfo?.name || "the project"}.
        Include: endpoints, request/response schemas, authentication, and examples.
        User input: ${task.input_data?.prompt || "Create REST API specification"}`,
      
      research: `Conduct research on: ${task.input_data?.prompt || "industry best practices"}.
        Include: findings summary, recommendations, sources, and action items.`,
      
      generate_api_spec: `Generate a complete OpenAPI 3.0 specification in YAML format for ${projectInfo?.name || "the project"}.
        Include: all endpoints with HTTP methods, request/response schemas with examples, authentication schemes (JWT, API keys),
        error responses (400, 401, 403, 404, 500), pagination parameters, rate limiting headers, and webhook definitions if applicable.
        Project details: ${JSON.stringify(projectInfo || {})}
        User input: ${task.input_data?.prompt || "Generate full OpenAPI spec for all endpoints"}`,
      
      write_business_plan: `Write a comprehensive business plan for ${projectInfo?.name || "the project"}.
        Include: executive summary, market analysis, target audience personas, revenue model, pricing strategy,
        competitive advantages, go-to-market strategy, financial projections (3-year), key metrics/KPIs,
        risk analysis, and growth roadmap with milestones.
        Project details: ${JSON.stringify(projectInfo || {})}
        User input: ${task.input_data?.prompt || "Create a complete business plan"}`,
      
      analyze_error_logs: `Analyze the following error logs and provide actionable insights for ${projectInfo?.name || "the project"}.
        Include: error categorization by severity and type, root cause analysis for each error pattern,
        impact assessment, prioritized fix recommendations, prevention strategies,
        and monitoring/alerting suggestions.
        Error logs to analyze: ${task.input_data?.prompt || "No logs provided - please paste error logs"}
        Project details: ${JSON.stringify(projectInfo || {})}`,
    };

    const systemPrompt = `You are an expert software architect and technical writer following Agile/XP methodologies.
      You create documentation following W3C standards and eco-friendly web design principles.
      Always provide structured, actionable output in JSON format.
      Your output should be comprehensive yet concise.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompts[task.task_type] || task.input_data?.prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const aiData = await aiResponse.json();
    const output = aiData.choices?.[0]?.message?.content || "No output generated";

    // Update task with result
    await fetch(`${supabaseUrl}/rest/v1/agent_tasks?id=eq.${task_id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "completed",
        output_data: { result: output },
        completed_at: new Date().toISOString(),
      }),
    });

    // If it's a docs task, also create a document
    if (task.task_type === "generate_docs" && task.project_id) {
      await fetch(`${supabaseUrl}/rest/v1/project_documents`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          project_id: task.project_id,
          doc_type: "tech_spec",
          title: `Auto-generated: ${task.task_type}`,
          content: output,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
