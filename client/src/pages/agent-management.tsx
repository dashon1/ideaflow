import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus,
  Search,
  FileText,
  Code,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings2,
  MessageSquare
} from "lucide-react";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isExpanded: boolean;
  icon: any;
  type: string;
}

interface PlatformConfig {
  name: string;
  isEnabled: boolean;
}

export default function AgentManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Scraper Agent Platform Configuration
  const [prioritizedPlatforms, setPrioritizedPlatforms] = useState<PlatformConfig[]>([
    { name: "Reddit", isEnabled: true },
    { name: "Quora", isEnabled: true },
    { name: "TikTok", isEnabled: false },
    { name: "Twitter/X", isEnabled: true },
    { name: "Product Hunt", isEnabled: true },
    { name: "YouTube Comments", isEnabled: false },
    { name: "Amazon Reviews", isEnabled: false },
    { name: "GitHub Issues", isEnabled: false },
    { name: "Hacker News", isEnabled: false }
  ]);

  const [proExtenders, setProExtenders] = useState<PlatformConfig[]>([
    { name: "Discord", isEnabled: false },
    { name: "Glassdoor", isEnabled: false },
    { name: "Indie Hackers", isEnabled: true },
    { name: "LinkedIn", isEnabled: false },
    { name: "Google Play", isEnabled: false },
    { name: "Facebook Groups", isEnabled: false },
    { name: "Medium", isEnabled: false }
  ]);

  const [resultsPerPlatform, setResultsPerPlatform] = useState(10);
  const [nicheFilter, setNicheFilter] = useState("Standard Niches");

  // Agent Configurations
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: "scraper",
      name: "Scraper Agent",
      description: "Configure which platforms to scrape and how.",
      isActive: true,
      isExpanded: true,
      icon: Search,
      type: "scraper"
    },
    {
      id: "summarizer",
      name: "Pain Point Summarizer Agent", 
      description: "This agent reads raw user feedback and transforms it into a structured summary.",
      isActive: true,
      isExpanded: false,
      icon: FileText,
      type: "summarizer"
    },
    {
      id: "content",
      name: "Content Agent",
      description: "Set preferences for AI models, builders, and content formats.",
      isActive: true,
      isExpanded: false,
      icon: MessageSquare,
      type: "content"
    },
    {
      id: "template_discovery",
      name: "Template Discovery Agent",
      description: "Configure where the AI agent searches for starter kits, templates, and code snippets.",
      isActive: true,
      isExpanded: false,
      icon: Code,
      type: "template_discovery"
    },
    {
      id: "marketing",
      name: "Marketing Agent",
      description: "Connect platforms and manage API keys for automated content posting.",
      isActive: true,
      isExpanded: false,
      icon: BarChart3,
      type: "marketing"
    }
  ]);

  // Content Agent Settings
  const [summarizerPrompt, setSummarizerPrompt] = useState(`You are an AI assistant tasked with summarizing user-generated content to identify potential SaaS product opportunities. Your goal is to distill the user's original text into a concise summary, identify the type of problem (Pain Point, Opportunity, or Feature Gap), assign a confidence score reflecting the clarity of the problem, and suggest relevant tags.

Original Text: {{{original_text}}}
Source Platform: {{{source_platform}}}
Source Link: {{{source_link}}}
Timestamp: {{{timestamp}}}`);

  const [contentPrompt, setContentPrompt] = useState(`You are the Content Agent, adept at producing engaging, viral-ready multimedia content. You will generate content communicating the purpose, value, or function of an MVP app or tool.

Here are the details about the MVP:
Summary: {{{summaryText}}}
App Type: {{{appType}}}
Key Features: {{{keyFeatures}}}
Tone: {{{tone}}}
Content Goal: {{{contentGoal}}}`);

  const [prioritizedLLM, setPrioritizedLLM] = useState("Gemini (Free Tier)");
  const [imageGeneration, setImageGeneration] = useState("Gemini (Free Tier)");
  const [videoGeneration, setVideoGeneration] = useState("Basic Gen (Watermarked)");
  const [audioGeneration, setAudioGeneration] = useState("Standard Voice (Free Tier)");

  // Template Discovery Settings
  const [templateSources, setTemplateSources] = useState({
    appTemplates: true,
    codeSnippets: true,
    starterKits: true,
    githubRepos: true,
    goHighLevelSnapshots: false
  });

  // Marketing Agent Settings
  const [platformIntegrations, setPlatformIntegrations] = useState({
    twitter: true,
    youtube: true,
    tiktok: false,
    linkedin: false,
    facebook: false,
    instagram: false
  });

  const [marketingTools, setMarketingTools] = useState({
    goHighLevel: true,
    marketingBlocksAI: true,
    agentXHelp: false,
    n8nAutomation: false
  });

  const [crmIntegration, setCrmIntegration] = useState("MarketingBlocks AI (Free)");
  const [contentAgent, setContentAgent] = useState("Standard AI (Free Tier)");

  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, isExpanded: !agent.isExpanded }
        : agent
    ));
  };

  const toggleAgentActive = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, isActive: !agent.isActive }
        : agent
    ));
  };

  const togglePlatform = (platformName: string, isPrioritized: boolean) => {
    if (isPrioritized) {
      setPrioritizedPlatforms(platforms => 
        platforms.map(p => 
          p.name === platformName ? { ...p, isEnabled: !p.isEnabled } : p
        )
      );
    } else {
      setProExtenders(platforms => 
        platforms.map(p => 
          p.name === platformName ? { ...p, isEnabled: !p.isEnabled } : p
        )
      );
    }
  };

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "Agent settings have been updated successfully.",
    });
  };

  const handleAddAgent = () => {
    toast({
      title: "Add Agent",
      description: "Agent creation modal would open here.",
    });
  };

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
              <p className="text-gray-600 mt-1">View, create, and update the prompts and configurations for your AI agents.</p>
            </div>
            <Button 
              onClick={handleAddAgent}
              className="flex items-center space-x-2"
              data-testid="button-add-agent"
            >
              <Plus className="w-4 h-4" />
              <span>Add Agent</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card key={agent.id}>
                  <Collapsible 
                    open={agent.isExpanded}
                    onOpenChange={() => toggleAgent(agent.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={agent.isActive ? "default" : "secondary"}>
                              {agent.isActive ? "active" : "inactive"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add-on functionality would go here
                              }}
                              data-testid={`button-addon-${agent.id}`}
                            >
                              <Settings2 className="w-4 h-4" />
                              <span className="ml-2">Add-on</span>
                            </Button>
                            {agent.isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {/* Scraper Agent Configuration */}
                        {agent.type === "scraper" && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-base font-medium mb-4">Prioritized Top 10</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {prioritizedPlatforms.map((platform) => (
                                  <div key={platform.name} className="flex items-center justify-between">
                                    <Label htmlFor={platform.name} className="text-sm">
                                      {platform.name}
                                    </Label>
                                    <Switch
                                      id={platform.name}
                                      checked={platform.isEnabled}
                                      onCheckedChange={() => togglePlatform(platform.name, true)}
                                      data-testid={`switch-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-base font-medium mb-4">Pro Section Extenders (Add-on)</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {proExtenders.map((platform) => (
                                  <div key={platform.name} className="flex items-center justify-between">
                                    <Label htmlFor={`pro-${platform.name}`} className="text-sm">
                                      {platform.name}
                                    </Label>
                                    <Switch
                                      id={`pro-${platform.name}`}
                                      checked={platform.isEnabled}
                                      onCheckedChange={() => togglePlatform(platform.name, false)}
                                      data-testid={`switch-pro-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="results-per-platform" className="text-sm font-medium">
                                  Results per Platform
                                </Label>
                                <Select value={resultsPerPlatform.toString()} onValueChange={(value) => setResultsPerPlatform(parseInt(value))}>
                                  <SelectTrigger className="mt-2" data-testid="select-results-per-platform">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="niche-filter" className="text-sm font-medium">
                                  Niche Filter
                                </Label>
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="standard-niches"
                                      name="niche-filter"
                                      value="Standard Niches"
                                      checked={nicheFilter === "Standard Niches"}
                                      onChange={(e) => setNicheFilter(e.target.value)}
                                      data-testid="radio-standard-niches"
                                    />
                                    <Label htmlFor="standard-niches" className="text-sm">Standard Niches</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="custom-niche"
                                      name="niche-filter"
                                      value="Custom Niche"
                                      checked={nicheFilter === "Custom Niche"}
                                      onChange={(e) => setNicheFilter(e.target.value)}
                                      data-testid="radio-custom-niche"
                                    />
                                    <Label htmlFor="custom-niche" className="text-sm">Custom Niche</Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summarizer Agent Configuration */}
                        {agent.type === "summarizer" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="summarizer-prompt" className="text-sm font-medium">
                                System Prompt
                              </Label>
                              <Textarea
                                id="summarizer-prompt"
                                value={summarizerPrompt}
                                onChange={(e) => setSummarizerPrompt(e.target.value)}
                                className="mt-2 min-h-[200px]"
                                data-testid="textarea-summarizer-prompt"
                              />
                            </div>
                          </div>
                        )}

                        {/* Content Agent Configuration */}
                        {agent.type === "content" && (
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="content-prompt" className="text-sm font-medium">
                                System Prompt
                              </Label>
                              <Textarea
                                id="content-prompt"
                                value={contentPrompt}
                                onChange={(e) => setContentPrompt(e.target.value)}
                                className="mt-2 min-h-[120px]"
                                data-testid="textarea-content-prompt"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <Label className="text-sm font-medium">Prioritized LLM</Label>
                                <Select value={prioritizedLLM} onValueChange={setPrioritizedLLM}>
                                  <SelectTrigger className="mt-2" data-testid="select-prioritized-llm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Gemini (Free Tier)">Gemini (Free Tier)</SelectItem>
                                    <SelectItem value="GPT-4 (Pro)">GPT-4 (Pro)</SelectItem>
                                    <SelectItem value="Claude (Pro)">Claude (Pro)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Image Generation</Label>
                                <Select value={imageGeneration} onValueChange={setImageGeneration}>
                                  <SelectTrigger className="mt-2" data-testid="select-image-generation">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Gemini (Free Tier)">Gemini (Free Tier)</SelectItem>
                                    <SelectItem value="Midjourney (Pro)">Midjourney (Pro)</SelectItem>
                                    <SelectItem value="DALL-E 3 (Pro)">DALL-E 3 (Pro)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Video Generation</Label>
                                <Select value={videoGeneration} onValueChange={setVideoGeneration}>
                                  <SelectTrigger className="mt-2" data-testid="select-video-generation">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Basic Gen (Watermarked)">Basic Gen (Watermarked)</SelectItem>
                                    <SelectItem value="Runway (Pro)">Runway (Pro)</SelectItem>
                                    <SelectItem value="Google Veo3 (Elite)">Google Veo3 (Elite)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Audio Generation</Label>
                                <Select value={audioGeneration} onValueChange={setAudioGeneration}>
                                  <SelectTrigger className="mt-2" data-testid="select-audio-generation">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Standard Voice (Free Tier)">Standard Voice (Free Tier)</SelectItem>
                                    <SelectItem value="ElevenLabs (Pro)">ElevenLabs (Pro)</SelectItem>
                                    <SelectItem value="Pi API (Elite)">Pi API (Elite)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Template Discovery Agent Configuration */}
                        {agent.type === "template_discovery" && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-4 block">Prioritized Sources</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="app-templates" className="text-sm">App Templates</Label>
                                  <Switch
                                    id="app-templates"
                                    checked={templateSources.appTemplates}
                                    onCheckedChange={(checked) => setTemplateSources({...templateSources, appTemplates: checked})}
                                    data-testid="switch-app-templates"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="code-snippets" className="text-sm">Code Snippets</Label>
                                  <Switch
                                    id="code-snippets"
                                    checked={templateSources.codeSnippets}
                                    onCheckedChange={(checked) => setTemplateSources({...templateSources, codeSnippets: checked})}
                                    data-testid="switch-code-snippets"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="starter-kits" className="text-sm">Starter Kits</Label>
                                  <Switch
                                    id="starter-kits"
                                    checked={templateSources.starterKits}
                                    onCheckedChange={(checked) => setTemplateSources({...templateSources, starterKits: checked})}
                                    data-testid="switch-starter-kits"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="github-repos" className="text-sm">GitHub Repositories</Label>
                                  <Switch
                                    id="github-repos"
                                    checked={templateSources.githubRepos}
                                    onCheckedChange={(checked) => setTemplateSources({...templateSources, githubRepos: checked})}
                                    data-testid="switch-github-repos"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="gohighlevel-snapshots" className="text-sm">GoHighLevel Snapshots</Label>
                                  <Switch
                                    id="gohighlevel-snapshots"
                                    checked={templateSources.goHighLevelSnapshots}
                                    onCheckedChange={(checked) => setTemplateSources({...templateSources, goHighLevelSnapshots: checked})}
                                    data-testid="switch-gohighlevel-snapshots"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Marketing Agent Configuration */}
                        {agent.type === "marketing" && (
                          <div className="space-y-6">
                            <div>
                              <Label className="text-sm font-medium mb-4 block">Platform Integrations</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(platformIntegrations).map(([platform, enabled]) => (
                                  <div key={platform} className="flex items-center justify-between">
                                    <Label htmlFor={`platform-${platform}`} className="text-sm capitalize">
                                      {platform === "twitter" ? "Twitter/X" : platform}
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`platform-${platform}`}
                                        checked={enabled}
                                        onCheckedChange={(checked) => setPlatformIntegrations({...platformIntegrations, [platform]: checked})}
                                        data-testid={`switch-platform-${platform}`}
                                      />
                                      <span className="text-xs text-gray-500">
                                        {enabled ? "API Key: ••••••••••" : "API Key: Not set"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-4 block">Marketing & Distribution Tools</Label>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(marketingTools).map(([tool, enabled]) => (
                                  <div key={tool} className="flex items-center justify-between">
                                    <Label htmlFor={`tool-${tool}`} className="text-sm">
                                      {tool.charAt(0).toUpperCase() + tool.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </Label>
                                    <Switch
                                      id={`tool-${tool}`}
                                      checked={enabled}
                                      onCheckedChange={(checked) => setMarketingTools({...marketingTools, [tool]: checked})}
                                      data-testid={`switch-tool-${tool}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <Label className="text-sm font-medium">CRM Integration</Label>
                                <Select value={crmIntegration} onValueChange={setCrmIntegration}>
                                  <SelectTrigger className="mt-2" data-testid="select-crm-integration">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MarketingBlocks AI (Free)">MarketingBlocks AI (Free)</SelectItem>
                                    <SelectItem value="GoHighLevel (Pro)">GoHighLevel (Pro)</SelectItem>
                                    <SelectItem value="AgentXHelp.com (Pro)">AgentXHelp.com (Pro)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Content Agent</Label>
                                <Select value={contentAgent} onValueChange={setContentAgent}>
                                  <SelectTrigger className="mt-2" data-testid="select-content-agent">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Standard AI (Free Tier)">Standard AI (Free Tier)</SelectItem>
                                    <SelectItem value="Advanced AI (Pro)">Advanced AI (Pro)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <Button 
                            onClick={handleSaveConfiguration}
                            className="flex items-center space-x-2"
                            data-testid={`button-save-${agent.id}`}
                          >
                            <Settings2 className="w-4 h-4" />
                            <span>Save Configuration</span>
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}