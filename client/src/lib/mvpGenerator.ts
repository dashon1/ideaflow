export type MvpPlatform = 'lovable' | 'base44' | 'replit';

export interface PainPointData {
  id: string;
  title: string | null;
  fullText: string;
  platform: string;
  problemType: string | null;
  detectedNiche: string | null;
  engagementScore: number | null;
}

export function generateMvpPrompt(painPoint: PainPointData): string {
  const niche = painPoint.detectedNiche || 'general';
  const problemType = painPoint.problemType || 'Pain Point';
  
  const prompt = `Build a modern web application MVP that solves the following ${problemType.toLowerCase()}:

## Problem Statement
${painPoint.title || 'User Problem'}

${painPoint.fullText}

## Requirements
- Create a clean, modern UI using React and Tailwind CSS
- Include user authentication (sign up/login)
- Build a functional solution that directly addresses this pain point
- Add a dashboard to track usage and results
- Make it mobile-responsive
- Include proper error handling and loading states

## Target Audience
${niche} users who are experiencing this problem

## Key Features to Include
1. Core feature that directly solves the main problem
2. User onboarding flow
3. Settings/preferences page
4. Analytics or progress tracking
5. Help/documentation section

Please generate a production-ready MVP with all necessary components, API routes, and database schema.`;

  return prompt;
}

export function generatePlatformUrl(platform: MvpPlatform, prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt);
  
  switch (platform) {
    case 'lovable':
      return `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
    
    case 'base44':
      return `https://base44.com/new?prompt=${encodedPrompt}`;
    
    case 'replit':
      return `https://replit.com/new?template=react&prompt=${encodedPrompt}`;
    
    default:
      return `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
  }
}

export function openMvpBuilder(platform: MvpPlatform, painPoint: PainPointData): string {
  const prompt = generateMvpPrompt(painPoint);
  const url = generatePlatformUrl(platform, prompt);
  
  window.open(url, '_blank', 'noopener,noreferrer');
  
  return url;
}
