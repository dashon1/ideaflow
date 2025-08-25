import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Plus,
  Users,
  Settings,
  X
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro";
  proFeaturesEnabled: number;
  totalProFeatures: number;
}

interface UserFeatures {
  // Content Agent Controls
  geminiPro: boolean;
  gpt4: boolean;
  claudeOpus: boolean;
  midjourney: boolean;
  stableDiffusion: boolean;
  dalle3: boolean;
  falAI: boolean;
  runway: boolean;
  googleVeo3: boolean;
  createomate: boolean;
  json2Video: boolean;
  falAIVideo: boolean;
  elevenLabs: boolean;
  piAPI: boolean;
  
  // Marketing Agent Controls
  genspark: boolean;
  manus: boolean;
  minimax: boolean;
  aiPlan: boolean;
  goHighLevel: boolean;
  marketingBlocksAI: boolean;
  agentXHelp: boolean;
  n8nAutomation: boolean;
}

const defaultUserFeatures: UserFeatures = {
  // Content Agent Controls
  geminiPro: false,
  gpt4: false,
  claudeOpus: false,
  midjourney: false,
  stableDiffusion: false,
  dalle3: false,
  falAI: false,
  runway: false,
  googleVeo3: false,
  createomate: false,
  json2Video: false,
  falAIVideo: false,
  elevenLabs: false,
  piAPI: false,
  
  // Marketing Agent Controls
  genspark: false,
  manus: false,
  minimax: false,
  aiPlan: false,
  goHighLevel: false,
  marketingBlocksAI: false,
  agentXHelp: false,
  n8nAutomation: false,
};

export default function CRM() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isManageFeaturesOpen, setIsManageFeaturesOpen] = useState(false);
  const [userFeatures, setUserFeatures] = useState<UserFeatures>(defaultUserFeatures);
  const [enableAllProFeatures, setEnableAllProFeatures] = useState(false);

  // Mock users data - in real app this would come from API
  const users: User[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      plan: "Pro",
      proFeaturesEnabled: 23,
      totalProFeatures: 23
    },
    {
      id: "2", 
      name: "Bob Williams",
      email: "bob@example.com",
      plan: "Free",
      proFeaturesEnabled: 0,
      totalProFeatures: 23
    },
    {
      id: "3",
      name: "Charlie Brown", 
      email: "charlie@example.com",
      plan: "Pro",
      proFeaturesEnabled: 21,
      totalProFeatures: 23
    },
    {
      id: "4",
      name: "Diana Prince",
      email: "diana@example.com", 
      plan: "Free",
      proFeaturesEnabled: 1,
      totalProFeatures: 23
    }
  ];

  const handleManageFeatures = (user: User) => {
    setSelectedUser(user);
    
    // Load user's current features (mock data)
    if (user.plan === "Pro") {
      setUserFeatures({
        ...defaultUserFeatures,
        geminiPro: true,
        gpt4: true,
        claudeOpus: true,
        midjourney: true,
        stableDiffusion: true,
        dalle3: true,
        falAI: true,
        runway: true,
        googleVeo3: true,
        createomate: true,
        json2Video: true,
        falAIVideo: true,
        elevenLabs: true,
        piAPI: true,
        genspark: true,
        manus: true,
        minimax: true,
        aiPlan: true,
        goHighLevel: true,
        marketingBlocksAI: true,
        agentXHelp: true,
        n8nAutomation: true,
      });
      setEnableAllProFeatures(true);
    } else {
      setUserFeatures(defaultUserFeatures);
      setEnableAllProFeatures(false);
    }
    
    setIsManageFeaturesOpen(true);
  };

  const handleAddUser = () => {
    toast({
      title: "Add User",
      description: "User creation modal would open here.",
    });
  };

  const handleToggleAllProFeatures = (enabled: boolean) => {
    setEnableAllProFeatures(enabled);
    if (enabled) {
      // Enable all pro features
      setUserFeatures({
        geminiPro: true,
        gpt4: true,
        claudeOpus: true,
        midjourney: true,
        stableDiffusion: true,
        dalle3: true,
        falAI: true,
        runway: true,
        googleVeo3: true,
        createomate: true,
        json2Video: true,
        falAIVideo: true,
        elevenLabs: true,
        piAPI: true,
        genspark: true,
        manus: true,
        minimax: true,
        aiPlan: true,
        goHighLevel: true,
        marketingBlocksAI: true,
        agentXHelp: true,
        n8nAutomation: true,
      });
    } else {
      // Disable all pro features
      setUserFeatures(defaultUserFeatures);
    }
  };

  const handleFeatureToggle = (feature: keyof UserFeatures, enabled: boolean) => {
    setUserFeatures(prev => ({
      ...prev,
      [feature]: enabled
    }));
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: `Features updated for ${selectedUser?.name}`,
    });
    setIsManageFeaturesOpen(false);
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
          <p className="text-gray-600">Loading CRM...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage your users and their feature access levels.</p>
            </div>
            <Button 
              onClick={handleAddUser}
              className="flex items-center space-x-2"
              data-testid="button-add-user"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Pro Features Enabled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
                          {user.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {user.proFeaturesEnabled} / {user.totalProFeatures}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageFeatures(user)}
                          className="flex items-center space-x-2"
                          data-testid={`button-manage-features-${user.id}`}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Manage Features</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Manage Features Modal */}
      <Dialog open={isManageFeaturesOpen} onOpenChange={setIsManageFeaturesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Manage Features for {selectedUser?.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageFeaturesOpen(false)}
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Enable or disable specific pro features for this user.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Global Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="enable-all" className="text-base font-medium">
                  Enable All Pro Features
                </Label>
                <p className="text-sm text-gray-600">
                  Globally enable or disable all "Pro" tier features for this user.
                </p>
              </div>
              <Switch
                id="enable-all"
                checked={enableAllProFeatures}
                onCheckedChange={handleToggleAllProFeatures}
                data-testid="switch-enable-all-pro-features"
              />
            </div>

            {/* Content Agent Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Agent Controls</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Language Models (LLM)</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gemini-pro" className="text-sm">Gemini Pro (LLM)</Label>
                      <Switch
                        id="gemini-pro"
                        checked={userFeatures.geminiPro}
                        onCheckedChange={(checked) => handleFeatureToggle('geminiPro', checked)}
                        data-testid="switch-gemini-pro"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gpt4" className="text-sm">GPT-4 (LLM)</Label>
                      <Switch
                        id="gpt4"
                        checked={userFeatures.gpt4}
                        onCheckedChange={(checked) => handleFeatureToggle('gpt4', checked)}
                        data-testid="switch-gpt4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="claude-opus" className="text-sm">Claude Opus (LLM)</Label>
                      <Switch
                        id="claude-opus"
                        checked={userFeatures.claudeOpus}
                        onCheckedChange={(checked) => handleFeatureToggle('claudeOpus', checked)}
                        data-testid="switch-claude-opus"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Image Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="midjourney" className="text-sm">Midjourney (Image)</Label>
                      <Switch
                        id="midjourney"
                        checked={userFeatures.midjourney}
                        onCheckedChange={(checked) => handleFeatureToggle('midjourney', checked)}
                        data-testid="switch-midjourney"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stable-diffusion" className="text-sm">Stable Diffusion (Image)</Label>
                      <Switch
                        id="stable-diffusion"
                        checked={userFeatures.stableDiffusion}
                        onCheckedChange={(checked) => handleFeatureToggle('stableDiffusion', checked)}
                        data-testid="switch-stable-diffusion"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dalle3" className="text-sm">DALL-E 3 (Image)</Label>
                      <Switch
                        id="dalle3"
                        checked={userFeatures.dalle3}
                        onCheckedChange={(checked) => handleFeatureToggle('dalle3', checked)}
                        data-testid="switch-dalle3"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fal-ai" className="text-sm">Fal AI (Image)</Label>
                      <Switch
                        id="fal-ai"
                        checked={userFeatures.falAI}
                        onCheckedChange={(checked) => handleFeatureToggle('falAI', checked)}
                        data-testid="switch-fal-ai"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Video Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="runway" className="text-sm">Runway (Video)</Label>
                      <Switch
                        id="runway"
                        checked={userFeatures.runway}
                        onCheckedChange={(checked) => handleFeatureToggle('runway', checked)}
                        data-testid="switch-runway"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="google-veo3" className="text-sm">Google Veo3 (Video)</Label>
                      <Switch
                        id="google-veo3"
                        checked={userFeatures.googleVeo3}
                        onCheckedChange={(checked) => handleFeatureToggle('googleVeo3', checked)}
                        data-testid="switch-google-veo3"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="createomate" className="text-sm">Createomate (Video)</Label>
                      <Switch
                        id="createomate"
                        checked={userFeatures.createomate}
                        onCheckedChange={(checked) => handleFeatureToggle('createomate', checked)}
                        data-testid="switch-createomate"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="json2video" className="text-sm">JSON2Video (Video)</Label>
                      <Switch
                        id="json2video"
                        checked={userFeatures.json2Video}
                        onCheckedChange={(checked) => handleFeatureToggle('json2Video', checked)}
                        data-testid="switch-json2video"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fal-ai-video" className="text-sm">Fal AI (Video)</Label>
                      <Switch
                        id="fal-ai-video"
                        checked={userFeatures.falAIVideo}
                        onCheckedChange={(checked) => handleFeatureToggle('falAIVideo', checked)}
                        data-testid="switch-fal-ai-video"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Audio Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="elevenlabs" className="text-sm">ElevenLabs (Audio)</Label>
                      <Switch
                        id="elevenlabs"
                        checked={userFeatures.elevenLabs}
                        onCheckedChange={(checked) => handleFeatureToggle('elevenLabs', checked)}
                        data-testid="switch-elevenlabs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pi-api" className="text-sm">Pi API (Audio)</Label>
                      <Switch
                        id="pi-api"
                        checked={userFeatures.piAPI}
                        onCheckedChange={(checked) => handleFeatureToggle('piAPI', checked)}
                        data-testid="switch-pi-api"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Marketing Agent Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Marketing Agent Controls</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Marketing Tools</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="genspark" className="text-sm">Genspark (Marketing)</Label>
                      <Switch
                        id="genspark"
                        checked={userFeatures.genspark}
                        onCheckedChange={(checked) => handleFeatureToggle('genspark', checked)}
                        data-testid="switch-genspark"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manus" className="text-sm">Manus (Marketing)</Label>
                      <Switch
                        id="manus"
                        checked={userFeatures.manus}
                        onCheckedChange={(checked) => handleFeatureToggle('manus', checked)}
                        data-testid="switch-manus"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minimax" className="text-sm">Minimax (Marketing)</Label>
                      <Switch
                        id="minimax"
                        checked={userFeatures.minimax}
                        onCheckedChange={(checked) => handleFeatureToggle('minimax', checked)}
                        data-testid="switch-minimax"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-plan" className="text-sm">AI.plan (Marketing)</Label>
                      <Switch
                        id="ai-plan"
                        checked={userFeatures.aiPlan}
                        onCheckedChange={(checked) => handleFeatureToggle('aiPlan', checked)}
                        data-testid="switch-ai-plan"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">CRM Integration</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gohighlevel" className="text-sm">GoHighLevel (CRM)</Label>
                      <Switch
                        id="gohighlevel"
                        checked={userFeatures.goHighLevel}
                        onCheckedChange={(checked) => handleFeatureToggle('goHighLevel', checked)}
                        data-testid="switch-gohighlevel"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketingblocks-ai" className="text-sm">MarketingBlocks AI (CRM)</Label>
                      <Switch
                        id="marketingblocks-ai"
                        checked={userFeatures.marketingBlocksAI}
                        onCheckedChange={(checked) => handleFeatureToggle('marketingBlocksAI', checked)}
                        data-testid="switch-marketingblocks-ai"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="agentx-help" className="text-sm">AgentXHelp.com (CRM)</Label>
                      <Switch
                        id="agentx-help"
                        checked={userFeatures.agentXHelp}
                        onCheckedChange={(checked) => handleFeatureToggle('agentXHelp', checked)}
                        data-testid="switch-agentx-help"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="n8n-automation" className="text-sm">N8N Automation (CRM)</Label>
                      <Switch
                        id="n8n-automation"
                        checked={userFeatures.n8nAutomation}
                        onCheckedChange={(checked) => handleFeatureToggle('n8nAutomation', checked)}
                        data-testid="switch-n8n-automation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button 
                onClick={handleSaveChanges}
                className="flex items-center space-x-2"
                data-testid="button-save-changes"
              >
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}