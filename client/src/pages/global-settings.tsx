import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Globe,
  Users,
  Cpu,
  Image,
  Video,
  Volume2,
  BarChart3,
  Shield,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

interface GlobalTool {
  id: string;
  name: string;
  type: "LLM" | "Image" | "Video" | "Audio" | "Marketing" | "CRM";
  isEnabled: boolean;
}

export default function GlobalSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Admin Controls
  const [enableAllProFeatures, setEnableAllProFeatures] = useState(true);
  
  // Content Agent Controls - Language Models
  const [geminiProLLM, setGeminiProLLM] = useState(true);
  const [gpt4LLM, setGpt4LLM] = useState(false);
  const [claudeOpusLLM, setClaudeOpusLLM] = useState(false);
  
  // Content Agent Controls - Image Generation
  const [midjourneyImage, setMidjourneyImage] = useState(true);
  const [stableDiffusionImage, setStableDiffusionImage] = useState(false);
  const [dalle3Image, setDalle3Image] = useState(false);
  const [falAIImage, setFalAIImage] = useState(true);
  
  // Content Agent Controls - Video Generation
  const [runwayVideo, setRunwayVideo] = useState(true);
  const [googleVeo3Video, setGoogleVeo3Video] = useState(false);
  const [createomateVideo, setCreateomateVideo] = useState(false);
  const [json2VideoVideo, setJson2VideoVideo] = useState(false);
  const [falAIVideo, setFalAIVideo] = useState(false);
  
  // Marketing Agent Controls - Audio
  const [falAIVideoMarketing, setFalAIVideoMarketing] = useState(false);
  const [elevenLabsAudio, setElevenLabsAudio] = useState(true);
  const [piAPIAudio, setPiAPIAudio] = useState(false);
  const [gensparkMarketing, setGensparkMarketing] = useState(true);
  const [manusMarketing, setManusMarketing] = useState(false);
  const [minimaxMarketing, setMinimaxMarketing] = useState(false);
  const [aiPlanMarketing, setAiPlanMarketing] = useState(false);
  const [goHighLevelCRM, setGoHighLevelCRM] = useState(true);
  const [marketingBlocksAICRM, setMarketingBlocksAICRM] = useState(true);
  const [agentXHelpCRM, setAgentXHelpCRM] = useState(false);
  const [n8nAutomationCRM, setN8nAutomationCRM] = useState(false);

  // Tools & Models
  const [tools, setTools] = useState<GlobalTool[]>([
    { id: "1", name: "GPT-4", type: "LLM", isEnabled: true },
    { id: "2", name: "Claude Opus", type: "LLM", isEnabled: true },
    { id: "3", name: "Midjourney", type: "Image", isEnabled: true },
    { id: "4", name: "Runway", type: "Video", isEnabled: true }
  ]);

  const handleOpenUserManagement = () => {
    window.location.href = "/crm";
  };

  const handleGlobeProAccess = () => {
    toast({
      title: "Globe Pro Access",
      description: "Opening advanced global pro features panel.",
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Global settings have been updated successfully.",
    });
  };

  const handleAddTool = () => {
    toast({
      title: "Add Tool/Model",
      description: "Tool addition modal would open here.",
    });
  };

  const handleEditTool = (toolId: string) => {
    toast({
      title: "Edit Tool",
      description: `Edit modal for tool ID: ${toolId}`,
    });
  };

  const handleRemoveTool = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
    toast({
      title: "Tool Removed",
      description: "Tool has been removed from the system.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "LLM": return <Cpu className="w-4 h-4" />;
      case "Image": return <Image className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      case "Audio": return <Volume2 className="w-4 h-4" />;
      case "Marketing": return <BarChart3 className="w-4 h-4" />;
      case "CRM": return <Users className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
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
          <p className="text-gray-600">Loading global settings...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
              <p className="text-gray-600 mt-1">Manage global access to premium features and integrations.</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-8">
            {/* Admin Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Admin Controls</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Manage access to premium features and integrations for your users.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-all-pro" className="text-base font-medium">
                      Enable All Pro Features
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Globally enable or disable all "Pro" tier features for users.
                    </p>
                  </div>
                  <Switch
                    id="enable-all-pro"
                    checked={enableAllProFeatures}
                    onCheckedChange={setEnableAllProFeatures}
                    data-testid="switch-enable-all-pro"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Globe Pro Button</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      One-click access to global pro features and advanced settings.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleGlobeProAccess}
                      className="flex items-center space-x-2"
                      data-testid="button-globe-pro"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Globe Pro</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleOpenUserManagement}
                      className="flex items-center space-x-2"
                      data-testid="button-open-user-management"
                    >
                      <Users className="w-4 h-4" />
                      <span>Open User Management</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Agent Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <span>Content Agent Controls</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Control which AI models and services are available to users.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Models (LLM) */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <Label className="text-base font-medium">Language Models (LLM)</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gemini-pro-llm" className="text-sm">Gemini Pro (LLM)</Label>
                      <Switch
                        id="gemini-pro-llm"
                        checked={geminiProLLM}
                        onCheckedChange={setGeminiProLLM}
                        data-testid="switch-gemini-pro-llm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gpt4-llm" className="text-sm">GPT-4 (LLM)</Label>
                      <Switch
                        id="gpt4-llm"
                        checked={gpt4LLM}
                        onCheckedChange={setGpt4LLM}
                        data-testid="switch-gpt4-llm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="claude-opus-llm" className="text-sm">Claude Opus (LLM)</Label>
                      <Switch
                        id="claude-opus-llm"
                        checked={claudeOpusLLM}
                        onCheckedChange={setClaudeOpusLLM}
                        data-testid="switch-claude-opus-llm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Image Generation */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Image className="w-4 h-4 text-green-600" />
                    <Label className="text-base font-medium">Image Generation</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="midjourney-image" className="text-sm">Midjourney (Image)</Label>
                      <Switch
                        id="midjourney-image"
                        checked={midjourneyImage}
                        onCheckedChange={setMidjourneyImage}
                        data-testid="switch-midjourney-image"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fal-ai-image" className="text-sm">Fal AI (Image)</Label>
                      <Switch
                        id="fal-ai-image"
                        checked={falAIImage}
                        onCheckedChange={setFalAIImage}
                        data-testid="switch-fal-ai-image"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stable-diffusion-image" className="text-sm">Stable Diffusion (Image)</Label>
                      <Switch
                        id="stable-diffusion-image"
                        checked={stableDiffusionImage}
                        onCheckedChange={setStableDiffusionImage}
                        data-testid="switch-stable-diffusion-image"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dalle3-image" className="text-sm">DALL-E 3 (Image)</Label>
                      <Switch
                        id="dalle3-image"
                        checked={dalle3Image}
                        onCheckedChange={setDalle3Image}
                        data-testid="switch-dalle3-image"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Video Generation */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Video className="w-4 h-4 text-red-600" />
                    <Label className="text-base font-medium">Video Generation</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="runway-video" className="text-sm">Runway (Video)</Label>
                      <Switch
                        id="runway-video"
                        checked={runwayVideo}
                        onCheckedChange={setRunwayVideo}
                        data-testid="switch-runway-video"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fal-ai-video" className="text-sm">Fal AI (Video)</Label>
                      <Switch
                        id="fal-ai-video"
                        checked={falAIVideo}
                        onCheckedChange={setFalAIVideo}
                        data-testid="switch-fal-ai-video"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="google-veo3-video" className="text-sm">Google Veo3 (Video)</Label>
                      <Switch
                        id="google-veo3-video"
                        checked={googleVeo3Video}
                        onCheckedChange={setGoogleVeo3Video}
                        data-testid="switch-google-veo3-video"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="createomate-video" className="text-sm">Createomate (Video)</Label>
                      <Switch
                        id="createomate-video"
                        checked={createomateVideo}
                        onCheckedChange={setCreateomateVideo}
                        data-testid="switch-createomate-video"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="json2video-video" className="text-sm">JSON2Video (Video)</Label>
                      <Switch
                        id="json2video-video"
                        checked={json2VideoVideo}
                        onCheckedChange={setJson2VideoVideo}
                        data-testid="switch-json2video-video"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Agent Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Marketing Agent Controls</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Control which marketing tools and integrations are available.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Generation */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <Label className="text-base font-medium">Audio Generation</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="elevenlabs-audio" className="text-sm">ElevenLabs (Audio)</Label>
                      <Switch
                        id="elevenlabs-audio"
                        checked={elevenLabsAudio}
                        onCheckedChange={setElevenLabsAudio}
                        data-testid="switch-elevenlabs-audio"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pi-api-audio" className="text-sm">Pi API (Audio)</Label>
                      <Switch
                        id="pi-api-audio"
                        checked={piAPIAudio}
                        onCheckedChange={setPiAPIAudio}
                        data-testid="switch-pi-api-audio"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="genspark-marketing" className="text-sm">Genspark (Marketing)</Label>
                      <Switch
                        id="genspark-marketing"
                        checked={gensparkMarketing}
                        onCheckedChange={setGensparkMarketing}
                        data-testid="switch-genspark-marketing"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Marketing Tools */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <Label className="text-base font-medium">Marketing Tools</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manus-marketing" className="text-sm">Manus (Marketing)</Label>
                      <Switch
                        id="manus-marketing"
                        checked={manusMarketing}
                        onCheckedChange={setManusMarketing}
                        data-testid="switch-manus-marketing"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minimax-marketing" className="text-sm">Minimax (Marketing)</Label>
                      <Switch
                        id="minimax-marketing"
                        checked={minimaxMarketing}
                        onCheckedChange={setMinimaxMarketing}
                        data-testid="switch-minimax-marketing"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-plan-marketing" className="text-sm">AI.plan (Marketing)</Label>
                      <Switch
                        id="ai-plan-marketing"
                        checked={aiPlanMarketing}
                        onCheckedChange={setAiPlanMarketing}
                        data-testid="switch-ai-plan-marketing"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gohighlevel-crm" className="text-sm">GoHighLevel (CRM)</Label>
                      <Switch
                        id="gohighlevel-crm"
                        checked={goHighLevelCRM}
                        onCheckedChange={setGoHighLevelCRM}
                        data-testid="switch-gohighlevel-crm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketingblocks-ai-crm" className="text-sm">MarketingBlocks AI (CRM)</Label>
                      <Switch
                        id="marketingblocks-ai-crm"
                        checked={marketingBlocksAICRM}
                        onCheckedChange={setMarketingBlocksAICRM}
                        data-testid="switch-marketingblocks-ai-crm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="agentx-help-crm" className="text-sm">AgentXHelp.com (CRM)</Label>
                      <Switch
                        id="agentx-help-crm"
                        checked={agentXHelpCRM}
                        onCheckedChange={setAgentXHelpCRM}
                        data-testid="switch-agentx-help-crm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="n8n-automation-crm" className="text-sm">N8N Automation (CRM)</Label>
                      <Switch
                        id="n8n-automation-crm"
                        checked={n8nAutomationCRM}
                        onCheckedChange={setN8nAutomationCRM}
                        data-testid="switch-n8n-automation-crm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools & Models */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span>Tools & Models</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Add or edit any tool/model available in the app.
                    </p>
                  </div>
                  <Button
                    onClick={handleAddTool}
                    className="flex items-center space-x-2"
                    data-testid="button-add-tool-model"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Tool/Model</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tools.map((tool) => (
                    <div 
                      key={tool.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white"
                      data-testid={`tool-row-${tool.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(tool.type)}
                        <div>
                          <span className="font-medium text-gray-900">{tool.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Select value={tool.type} disabled>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LLM">LLM</SelectItem>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="Video">Video</SelectItem>
                            <SelectItem value="Audio">Audio</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="CRM">CRM</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTool(tool.id)}
                            data-testid={`button-edit-${tool.id}`}
                          >
                            <Edit className="w-4 h-4" />
                            <span className="ml-1">Edit ID</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTool(tool.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-remove-${tool.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="ml-1">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Management Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>User Management</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Configure user access levels and feature permissions.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">User management settings will be available here.</p>
                  <Button
                    variant="outline"
                    onClick={handleOpenUserManagement}
                    className="flex items-center space-x-2 mx-auto"
                    data-testid="button-user-management-link"
                  >
                    <Users className="w-4 h-4" />
                    <span>Open User Management</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveChanges}
                size="lg"
                className="flex items-center space-x-2"
                data-testid="button-save-changes"
              >
                <Settings className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}