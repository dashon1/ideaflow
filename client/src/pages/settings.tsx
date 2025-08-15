import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Key, Bell, Crown } from "lucide-react";
import TierManagement from "@/components/tier-management";

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

  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your account, subscription, and application preferences</p>
        </div>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>API Keys & Integrations</CardTitle>
              <CardDescription>Manage external service connections and API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <Input 
                  id="openaiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  defaultValue="••••••••••••••••••••••••••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Used for AI-powered pain point analysis and idea generation</p>
              </div>
              
              <div>
                <Label htmlFor="mvpPlatform">Default MVP Platform</Label>
                <Select defaultValue="lovable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">Lovable</SelectItem>
                    <SelectItem value="base44">Base44</SelectItem>
                    <SelectItem value="replit">Replit</SelectItem>
                    <SelectItem value="v0">V0.dev</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Scraping Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoApprove" className="text-sm">Auto-approve high-confidence pain points</Label>
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
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Save API Settings</Button>
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
    </div>
  );
}