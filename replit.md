# AI-Powered Idea Discovery & MVP Builder

## Overview

IdeaFlow is a full-stack SaaS application that uses AI agents to automatically discover real-world problems from popular platforms and generate app solutions. The system scrapes pain points from social media platforms (Reddit, TikTok, Quora, YouTube, etc.), uses AI to summarize and classify them, then facilitates MVP generation and content creation for rapid product testing and launch.

The application follows a pipeline architecture where raw pain points are discovered, processed through AI summarization, approved by users, and then routed to MVP builders and content creation tools. It's designed to identify trending problems and automatically generate actionable product ideas with supporting marketing materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for bundling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Replit-based OAuth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple

### Database Design
The schema uses PostgreSQL with the following core entities:
- **Users**: Stores user profiles with subscription tier management (standard/pro/elite), API quotas, and platform access controls
- **Pain Points**: Raw discovered problems from platforms with engagement metrics
- **Ideas**: AI-processed and summarized product concepts derived from pain points
- **MVPs**: Generated prototypes linked to approved ideas
- **Content**: Marketing materials and assets created for ideas
- **Settings**: User preferences and configuration

### CRM System Architecture
- **3-Tier Subscription Model**:
  - **Standard**: 5 platforms (Reddit, TikTok, Quora, Product Hunt, Indie Hackers), 100 API calls/month, 3 jobs/day
  - **Pro**: 27 platforms (adds professional networks, review sites, developer communities), 500 API calls/month, 10 jobs/day
  - **Elite**: 50+ platforms (full access including emerging platforms), unlimited API calls, unlimited jobs
- **Tier Management**: Complete subscription upgrade/downgrade system with real-time platform access updates
- **Usage Tracking**: API quota monitoring and platform access enforcement
- **Individual Settings**: Per-user configuration for scraping preferences, notifications, and integrations

### AI Integration
- **OpenAI Integration**: Uses GPT-4o for pain point summarization and classification
- **Intelligent Processing**: Extracts problem types (Pain Point, Opportunity, Feature Gap) with confidence scoring
- **Content Generation**: Planned integration with multiple AI services (Gemini Pro, Claude) for diverse content creation

### Scraper Architecture
- **Multi-Platform Support**: Comprehensive scraper covering 50+ platforms including:
  - **Social Media**: Reddit, TikTok, Twitter/X, Facebook, Instagram, LinkedIn, YouTube
  - **Review Platforms**: Amazon, Google Play, App Store, Trustpilot, G2, Capterra, Yelp, BBB, Etsy
  - **Developer Communities**: GitHub Issues, Stack Overflow, Stack Exchange, Dev.to, Hacker News
  - **Professional Networks**: LinkedIn, Glassdoor, Indeed, Blind
  - **Content Platforms**: Medium, Substack, Pinterest, Tumblr
  - **Messaging & Communities**: Discord, Slack, Telegram, WhatsApp Communities
  - **Streaming**: Twitch, Kick, Snapchat
  - **Innovation**: Kickstarter, Indiegogo, ProductBoard, Canny, UserVoice
  - **Emerging**: Mastodon, Bluesky, Lemmy, Kbin
- **Tier-Based Access**: Standard (5 platforms), Pro (27 platforms), Elite (50+ platforms)
- **Dual Modes**: Discovery mode for trending problems and Niche mode for targeted searches
- **Mock Implementation**: Currently uses mock data with planned integration to actual platform APIs
- **Category Filtering**: Platforms organized by Social, Professional, Reviews, Development, etc.
- **Deduplication**: Built-in scoring and filtering to prevent duplicate content

### MVP Generation Pipeline
- **External Integrations**: Planned connections to Lovable, Base44, and Replit for automated prototype creation
- **Template System**: Support for prebuilt templates via GoHighLevel or GitHub
- **Workflow Automation**: Seamless routing from approved ideas to MVP generation

### Content Creation System
- **Multi-Modal Content**: Planned integration with video generation (Veo3, Runway), voiceover (Eleven Labs), and visual creation (Fal.AI)
- **Marketing Automation**: Integration with GoHighLevel, MarketingBlocks for campaign management
- **Social Distribution**: Automated posting to TikTok, LinkedIn, Instagram, Twitter/X

### Deployment Architecture
- **Development**: Vite dev server with HMR and Express backend
- **Production**: Static file serving with Express API routes
- **Database**: Neon PostgreSQL with connection pooling
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OAuth provider with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### AI Services
- **OpenAI**: GPT-4o for text summarization and classification
- **Planned AI Integrations**: Gemini Pro, Claude (via Genspark)

### Platform Integrations
- **Social Media APIs**: Reddit, TikTok, Quora, YouTube, LinkedIn, Twitter/X APIs (planned)
- **Additional Sources**: Indie Hackers, Product Hunt, Medium for content discovery

### MVP Building Services
- **Lovable**: Low-code app generation platform
- **Base44**: Development platform integration
- **Replit**: Automated coding environment

### Content Creation Services
- **Video Generation**: Veo3, Runway ML, Jason2Video
- **Voice Synthesis**: Eleven Labs for voiceover generation
- **Visual Creation**: Fal.AI, Createomate for graphics and animations

### Marketing Automation
- **Campaign Management**: GoHighLevel, MarketingBlocks, AgentXHelp
- **Analytics**: Built-in tracking for engagement metrics and success rates
- **A/B Testing**: Planned integration for ad creative and landing page optimization

### Development Tools
- **Build Tools**: Vite, esbuild, PostCSS with Tailwind
- **Type Safety**: TypeScript with Drizzle for database type generation
- **Development Experience**: Replit integration with cartographer plugin for enhanced debugging