import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function summarizeIdea(painPointText: string): Promise<{
  summaryText: string;
  problemType: string;
  confidenceScore: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting clear problem statements from user-generated content. 
          Analyze the text and extract the core pain point or opportunity. Determine the problem type:
          - "Pain Point" for frustrations or inefficiencies
          - "Opportunity" for expressed wishes or desires  
          - "Feature Gap" for missing functions in existing products
          
          Provide a confidence score between 0 and 1 indicating how clearly the content reflects a real, solvable problem.
          
          Respond with JSON in this format: {
            "summaryText": "clear problem statement",
            "problemType": "Pain Point|Opportunity|Feature Gap",
            "confidenceScore": 0.85
          }`
        },
        {
          role: "user",
          content: painPointText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      summaryText: result.summaryText || "",
      problemType: result.problemType || "Pain Point",
      confidenceScore: Math.max(0, Math.min(1, result.confidenceScore || 0.5)),
    };
  } catch (error) {
    console.error("Failed to summarize idea:", error);
    throw new Error("Failed to summarize idea: " + (error as Error).message);
  }
}

export async function classifyIdea(summaryText: string): Promise<{
  userType: string;
  domain: string;
  appType: string;
  tags: string[];
  priorityScore: number;
  isWellSolved: boolean;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at categorizing and prioritizing product ideas. 
          Analyze the problem summary and classify it with:
          
          - userType: target user (freelancer, parent, business owner, developer, student, etc.)
          - domain: problem category (productivity, finance, health, automation, education, etc.)
          - appType: solution type (habit tracker, CRM, to-do app, budgeting tool, time tracker, etc.)
          - tags: relevant keywords/topics for filtering
          - priorityScore: 1.0-10.0 based on clarity, universality, and digital solution potential
          - isWellSolved: true if market already has good solutions, false if underserved
          
          Respond with JSON in this format: {
            "userType": "freelancer",
            "domain": "productivity", 
            "appType": "habit tracker",
            "tags": ["habits", "tracking", "productivity"],
            "priorityScore": 8.5,
            "isWellSolved": false
          }`
        },
        {
          role: "user",
          content: summaryText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      userType: result.userType || "general user",
      domain: result.domain || "general",
      appType: result.appType || "web app",
      tags: Array.isArray(result.tags) ? result.tags : [],
      priorityScore: Math.max(1, Math.min(10, result.priorityScore || 5)),
      isWellSolved: Boolean(result.isWellSolved),
    };
  } catch (error) {
    console.error("Failed to classify idea:", error);
    throw new Error("Failed to classify idea: " + (error as Error).message);
  }
}

export async function generateMvpSpec(ideaSummary: string, appType: string): Promise<{
  platformSelected: string;
  mvpSpec: any;
  estimatedEffortScore: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert MVP architect. Generate a detailed MVP specification for the given idea.
          
          Choose the best platform:
          - "Lovable" for UI-first, design-heavy apps
          - "Base44" for business logic-heavy MVPs
          - "Replit" for custom development needs
          
          Create a comprehensive spec including:
          - Core features (3-5 key features)
          - UI/UX layout suggestions
          - Technical requirements
          - Integration needs
          - Effort estimation (1-10 scale)
          
          Respond with JSON in this format: {
            "platformSelected": "Lovable",
            "mvpSpec": {
              "coreFeatures": ["feature 1", "feature 2"],
              "uiLayout": "layout description",
              "techRequirements": ["req1", "req2"],
              "integrations": ["api1", "api2"]
            },
            "estimatedEffortScore": 7
          }`
        },
        {
          role: "user",
          content: `Idea: ${ideaSummary}\nApp Type: ${appType}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      platformSelected: result.platformSelected || "Replit",
      mvpSpec: result.mvpSpec || {},
      estimatedEffortScore: Math.max(1, Math.min(10, result.estimatedEffortScore || 5)),
    };
  } catch (error) {
    console.error("Failed to generate MVP spec:", error);
    throw new Error("Failed to generate MVP spec: " + (error as Error).message);
  }
}
