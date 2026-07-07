import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Key, Bell, Crown, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TierManagement from "@/components/tier-management";
import Sidebar from "@/components/sidebar";

const PLATFORM_KEYS = [
  {
    key: "TWITTER_BEARER_TOKEN",
    label: "Twitter/X Bearer Token",
    platform: "Twitter/X",
    help: "Get from developer.twitter.com → Projects & Apps → Keys and Tokens",
    placeholder: "AAAAAAAAAAAAAAAA...",
  },
  {
    key: "YOUTUBE_API_KEY",
    label: "YouTube API Key",
    platform: "YouTube",
    help: "Get from console.cloud.google.com → APIs & Services → Credentials",
    placeholder: "AIzaSy...",
  },
  {
    key: "TIKTOK_CLIENT_TOKEN",
    label: "TikTok Research API Token",
    platform: "TikTok",
    help: "Get from developers.tiktok.com → Research API (requires application approval)",
    placeholder: "clt.xxxxx...",
  },
  {
    key: "LINKEDIN_ACCESS_TOKEN",
    label: "LinkedIn Access Token",
    platform: "LinkedIn",
    help: "Get from linkedin.com/developers → OAuth 2.0 Access Token",
    placeholder: "AQV...",
  },
];

export default function Settings() {
  const [notifications, setNotifications] = useState({
    painPointsFound: true,
    mvpCompleted: true,
    contentReady: false,
    weeklyDigest: true,
  });

  const [scrapingSettings, setScrapingSettings] = useState({
    autoApprove: false,
    confidenceThreshold: "75",
    maxPainPointsPerJob: "50",
  });

  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuth();

  const { data: keyStatus = {} } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/platform-keys'],
    enabled: isAuthenticated,
  });

  const saveKeysMutation = useMutation({
    mutationFn: (keys: Record<string, string>) => apiRequest('/api/platform-keys', 'POST', keys),
    onSuccess: (_, vars) => {
      const count = Object.keys(vars).filter(k => vars[k]).length;
      toast({ title: "API Keys Saved", description: `${count} key(s) saved for this session. Add them to Secrets for permanent storage.` });
      queryClient.invalidateQueries({ queryKey: ['/api/platform-keys'] });
      setKeyValues({});
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save API keys.", variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your account, subscription, and application preferences</p>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="subscription" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subscription" className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>API & Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="space-y-6">
              <TierManagement />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Demo" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="User" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="demo@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Standard Time</SelectItem>
                        <SelectItem value="pst">Pacific Standard Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveSettings}>Save Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              {/* Platform API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Platform API Keys
                  </CardTitle>
                  <CardDescription>
                    Connect premium platforms to unlock more data sources. Free platforms (Reddit, GitHub, Hacker News, Stack Overflow) are always active — no key needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Free platforms status */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-green-800">✅ Always active — no key required</p>
                    <div className="flex flex-wrap gap-2">
                      {['Reddit', 'GitHub', 'Hacker News', 'Stack Overflow', 'Product Hunt'].map(p => (
                        <Badge key={p} variant="secondary" className="bg-green-100 text-green-700">{p}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Premium platform keys */}
                  <div className="space-y-5">
                    {PLATFORM_KEYS.map(({ key, label, platform, help, placeholder }) => {
                      const isSet = keyStatus[key];
                      const inputVal = keyValues[key] ?? '';
                      const visible = showKey[key];
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">{label}</Label>
                            {isSet ? (
                              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Connected
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 text-gray-500">
                                <XCircle className="w-3 h-3" /> Not set
                              </Badge>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              type={visible ? 'text' : 'password'}
                              placeholder={isSet ? '••••••••••••••••••••' : placeholder}
                              value={inputVal}
                              onChange={e => setKeyValues(prev => ({ ...prev, [key]: e.target.value }))}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowKey(prev => ({ ...prev, [key]: !prev[key] }))}
                            >
                              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">{help}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Button
                      onClick={() => saveKeysMutation.mutate(keyValues)}
                      disabled={saveKeysMutation.isPending || Object.values(keyValues).every(v => !v)}
                      className="w-full"
                    >
                      {saveKeysMutation.isPending ? 'Saving...' : 'Save API Keys'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Keys are active immediately for this session. For permanent storage, also add them to your Replit Secrets.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Scraping Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Scraping Settings</CardTitle>
                  <CardDescription>Configure how the scraper processes and filters pain points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoApprove" className="text-sm font-medium">Auto-approve high-confidence pain points</Label>
                      <p className="text-xs text-gray-500">Skip manual review for pain points above the threshold</p>
                    </div>
                    <Switch
                      id="autoApprove"
                      checked={scrapingSettings.autoApprove}
                      onCheckedChange={(checked) =>
                        setScrapingSettings(prev => ({ ...prev, autoApprove: checked }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Confidence Threshold (%)</Label>
                    <Select
                      value={scrapingSettings.confidenceThreshold}
                      onValueChange={(value) =>
                        setScrapingSettings(prev => ({ ...prev, confidenceThreshold: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxPainPoints">Max Pain Points per Job</Label>
                    <Select
                      value={scrapingSettings.maxPainPointsPerJob}
                      onValueChange={(value) =>
                        setScrapingSettings(prev => ({ ...prev, maxPainPointsPerJob: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveSettings}>Save Scraping Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose which events trigger notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="painPointsFound">Pain Points Discovered</Label>
                        <p className="text-xs text-gray-500">Notify when new pain points are found during scraping</p>
                      </div>
                      <Switch
                        id="painPointsFound"
                        checked={notifications.painPointsFound}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, painPointsFound: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mvpCompleted">MVP Generation Complete</Label>
                        <p className="text-xs text-gray-500">Notify when MVP prototypes are ready for testing</p>
                      </div>
                      <Switch
                        id="mvpCompleted"
                        checked={notifications.mvpCompleted}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, mvpCompleted: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="contentReady">Marketing Content Ready</Label>
                        <p className="text-xs text-gray-500">Notify when marketing materials are generated</p>
                      </div>
                      <Switch
                        id="contentReady"
                        checked={notifications.contentReady}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, contentReady: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                        <p className="text-xs text-gray-500">Receive a weekly summary of discoveries and activities</p>
                      </div>
                      <Switch
                        id="weeklyDigest"
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, weeklyDigest: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
