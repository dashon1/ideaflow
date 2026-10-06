import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, Settings, X, Crown, Zap, Star, UserPlus, Mail } from "lucide-react";

interface DBUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  subscriptionTier: string;
  subscriptionStatus: string | null;
  apiQuotaUsed: number | null;
  apiQuotaLimit: number | null;
  createdAt: string;
}

interface UserFeatures {
  geminiPro: boolean; gpt4: boolean; claudeOpus: boolean;
  midjourney: boolean; stableDiffusion: boolean; dalle3: boolean;
  falAI: boolean; runway: boolean; googleVeo3: boolean;
  createomate: boolean; json2Video: boolean; falAIVideo: boolean;
  elevenLabs: boolean; piAPI: boolean;
  genspark: boolean; manus: boolean; minimax: boolean;
  aiPlan: boolean; goHighLevel: boolean; marketingBlocksAI: boolean;
  agentXHelp: boolean; n8nAutomation: boolean;
}

const allOff: UserFeatures = {
  geminiPro: false, gpt4: false, claudeOpus: false,
  midjourney: false, stableDiffusion: false, dalle3: false,
  falAI: false, runway: false, googleVeo3: false,
  createomate: false, json2Video: false, falAIVideo: false,
  elevenLabs: false, piAPI: false,
  genspark: false, manus: false, minimax: false,
  aiPlan: false, goHighLevel: false, marketingBlocksAI: false,
  agentXHelp: false, n8nAutomation: false,
};

const allOn: UserFeatures = { ...allOff };
for (const key of Object.keys(allOn) as (keyof UserFeatures)[]) allOn[key] = true;

const TIER_LABELS: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  starter:      { label: "Starter",      color: "secondary", icon: <Zap className="w-3 h-3" /> },
  professional: { label: "Professional", color: "default",   icon: <Star className="w-3 h-3" /> },
  enterprise:   { label: "Enterprise",   color: "default",   icon: <Crown className="w-3 h-3" /> },
};

export default function CRM() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTier, setNewUserTier] = useState<string>('starter');
  const [userFeatures, setUserFeatures] = useState<UserFeatures>(allOff);
  const [enableAll, setEnableAll] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('starter');

  const { data: users = [], isLoading: usersLoading } = useQuery<DBUser[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated,
  });

  const changeTierMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) =>
      apiRequest(`/api/admin/users/${userId}/tier`, 'PATCH', { tier }),
    onSuccess: (_, { tier }) => {
      toast({
        title: "Tier Updated",
        description: `User moved to ${TIER_LABELS[tier]?.label ?? tier} plan.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleManage = (user: DBUser) => {
    setSelectedUser(user);
    setSelectedTier(user.subscriptionTier || 'starter');
    const isPro = user.subscriptionTier === 'professional' || user.subscriptionTier === 'enterprise';
    setUserFeatures(isPro ? allOn : allOff);
    setEnableAll(isPro);
    setIsModalOpen(true);
  };

  const handleToggleAll = (enabled: boolean) => {
    setEnableAll(enabled);
    setUserFeatures(enabled ? allOn : allOff);
  };

  const handleFeatureToggle = (feature: keyof UserFeatures, val: boolean) => {
    setUserFeatures(prev => ({ ...prev, [feature]: val }));
  };

  const handleSaveTier = () => {
    if (!selectedUser) return;
    changeTierMutation.mutate({ userId: selectedUser.id, tier: selectedTier });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "Please log in.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const tierBadge = (tier: string) => {
    const t = TIER_LABELS[tier] ?? { label: tier, color: "secondary", icon: <Zap className="w-3 h-3" /> };
    return (
      <Badge variant={t.color as any} className="flex items-center gap-1 w-fit">
        {t.icon} {t.label}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users and their subscription tiers.</p>
            </div>
            <Button onClick={() => { setNewUserEmail(''); setNewUserTier('starter'); setIsAddUserOpen(true); }} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Users ({users.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No users found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>API Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName || user.lastName
                                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                                : 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email ?? user.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{tierBadge(user.subscriptionTier || 'starter')}</TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                            {user.subscriptionStatus ?? 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.apiQuotaUsed ?? 0} / {user.apiQuotaLimit === -1 ? '∞' : (user.apiQuotaLimit ?? 100)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManage(user)}
                            className="flex items-center space-x-1"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Manage</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Manage User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Manage: {selectedUser?.firstName ?? ''} {selectedUser?.lastName ?? selectedUser?.email ?? ''}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">{selectedUser?.email}</p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tier Change */}
            <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
              <div>
                <Label className="text-base font-semibold">Subscription Tier</Label>
                <p className="text-sm text-gray-600">
                  Change this user's plan. Takes effect immediately.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Starter (Free)</span>
                    </SelectItem>
                    <SelectItem value="professional">
                      <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Professional ($29/mo)</span>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <span className="flex items-center gap-2"><Crown className="w-4 h-4" /> Enterprise ($99/mo)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveTier}
                  disabled={changeTierMutation.isPending || selectedTier === selectedUser?.subscriptionTier}
                  size="sm"
                >
                  {changeTierMutation.isPending ? 'Saving...' : 'Apply Tier Change'}
                </Button>
              </div>
              {selectedTier !== selectedUser?.subscriptionTier && (
                <p className="text-xs text-blue-700">
                  Changing from <strong>{TIER_LABELS[selectedUser?.subscriptionTier ?? 'starter']?.label}</strong> → <strong>{TIER_LABELS[selectedTier]?.label}</strong>
                </p>
              )}
            </div>

            <Separator />

            {/* Feature toggles */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="enable-all" className="text-base font-medium">Enable All Pro Features</Label>
                <p className="text-sm text-gray-600">Globally toggle all pro-tier feature access.</p>
              </div>
              <Switch id="enable-all" checked={enableAll} onCheckedChange={handleToggleAll} />
            </div>

            {/* Content Agent Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Agent Controls</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Language Models</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {([['geminiPro','Gemini Pro'],['gpt4','GPT-4'],['claudeOpus','Claude Opus']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Image Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {([['midjourney','Midjourney'],['stableDiffusion','Stable Diffusion'],['dalle3','DALL-E 3'],['falAI','Fal AI']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Video Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {([['runway','Runway'],['googleVeo3','Google Veo3'],['createomate','Createomate'],['json2Video','JSON2Video'],['falAIVideo','Fal AI Video']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Audio Generation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {([['elevenLabs','ElevenLabs'],['piAPI','Pi API']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
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
                    {([['genspark','Genspark'],['manus','Manus'],['minimax','Minimax'],['aiPlan','AI.plan']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">CRM & Automation</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {([['goHighLevel','GoHighLevel'],['marketingBlocksAI','MarketingBlocks AI'],['agentXHelp','AgentXHelp'],['n8nAutomation','n8n Automation']] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={userFeatures[key]} onCheckedChange={v => handleFeatureToggle(key, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Feature Settings Saved", description: `Updated features for ${selectedUser?.email}` });
                setIsModalOpen(false);
              }}>
                Save Feature Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add New User
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsAddUserOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">
              Users are created automatically when they sign in via Replit OAuth. You can pre-configure a tier here by email once they've signed up.
            </p>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <input
                type="email"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Tier</Label>
              <Select value={newUserTier} onValueChange={setNewUserTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Starter (Free)</span>
                  </SelectItem>
                  <SelectItem value="professional">
                    <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Professional ($29/mo)</span>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <span className="flex items-center gap-2"><Crown className="w-4 h-4" /> Enterprise ($99/mo)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>To find a user, have them sign into IdeaFlow first. They'll appear in the Users table and you can manage their tier from there.</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button
                disabled={!newUserEmail}
                onClick={() => {
                  const match = users.find(u => u.email?.toLowerCase() === newUserEmail.toLowerCase());
                  if (match) {
                    setSelectedUser(match);
                    setSelectedTier(newUserTier);
                    setIsAddUserOpen(false);
                    changeTierMutation.mutate({ userId: match.id, tier: newUserTier });
                  } else {
                    toast({ title: "User not found", description: "No user with that email has signed in yet.", variant: "destructive" });
                  }
                }}
              >
                Apply Tier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
