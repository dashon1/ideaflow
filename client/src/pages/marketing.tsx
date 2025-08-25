import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Play,
  Eye,
  Share2,
  Calendar,
  Plus,
  ExternalLink
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  platform: string;
  reach: number;
  engagement: number;
  conversions: number;
  budget: number;
  spent: number;
}

interface MarketingMetrics {
  totalReach: number;
  totalEngagement: number;
  totalConversions: number;
  activeCampaigns: number;
  conversionRate: number;
  avgCostPerClick: number;
}

export default function Marketing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [metrics] = useState<MarketingMetrics>({
    totalReach: 125430,
    totalEngagement: 8942,
    totalConversions: 347,
    activeCampaigns: 5,
    conversionRate: 3.9,
    avgCostPerClick: 0.85
  });

  const [campaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "SaaS Product Launch Campaign",
      status: "active",
      platform: "LinkedIn",
      reach: 25430,
      engagement: 1842,
      conversions: 89,
      budget: 2500,
      spent: 1850
    },
    {
      id: "2", 
      name: "Content Marketing Push",
      status: "active",
      platform: "Twitter/X",
      reach: 18920,
      engagement: 2156,
      conversions: 67,
      budget: 1500,
      spent: 890
    },
    {
      id: "3",
      name: "Video Demo Series",
      status: "active", 
      platform: "TikTok",
      reach: 45200,
      engagement: 3890,
      conversions: 123,
      budget: 3000,
      spent: 2450
    },
    {
      id: "4",
      name: "MVP Showcase",
      status: "paused",
      platform: "YouTube",
      reach: 12340,
      engagement: 890,
      conversions: 45,
      budget: 1000,
      spent: 650
    },
    {
      id: "5",
      name: "Community Outreach",
      status: "completed",
      platform: "Reddit",
      reach: 8540,
      engagement: 654,
      conversions: 23,
      budget: 500,
      spent: 500
    }
  ]);

  const handleCreateCampaign = () => {
    toast({
      title: "Create Campaign",
      description: "Campaign creation modal would open here.",
    });
  };

  const handleViewAnalytics = (campaignId: string) => {
    toast({
      title: "View Analytics",
      description: `Opening detailed analytics for campaign ${campaignId}`,
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
          <p className="text-gray-600">Loading marketing dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
              <p className="text-gray-600 mt-1">Manage campaigns, track performance, and optimize your marketing efforts.</p>
            </div>
            <Button 
              onClick={handleCreateCampaign}
              className="flex items-center space-x-2"
              data-testid="button-create-campaign"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalEngagement.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalConversions}</div>
                  <p className="text-xs text-muted-foreground">
                    +15.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    2 campaigns paused
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.7% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Cost per Click</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.avgCostPerClick}</div>
                  <p className="text-xs text-muted-foreground">
                    -$0.12 from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Marketing Campaigns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white"
                      data-testid={`campaign-${campaign.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.platform}</p>
                        </div>
                        <Badge 
                          variant={
                            campaign.status === "active" ? "default" : 
                            campaign.status === "paused" ? "secondary" : "outline"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.reach.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Reach</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.engagement.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Engagement</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.conversions}
                          </div>
                          <div className="text-xs text-gray-500">Conversions</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            ${campaign.spent} / ${campaign.budget}
                          </div>
                          <div className="text-xs text-gray-500">Budget</div>
                          <Progress 
                            value={(campaign.spent / campaign.budget) * 100} 
                            className="w-20 mt-1"
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAnalytics(campaign.id)}
                          className="flex items-center space-x-2"
                          data-testid={`button-analytics-${campaign.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Analytics</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2 h-12">
                    <Share2 className="w-4 h-4" />
                    <span>Schedule Social Post</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-12">
                    <Calendar className="w-4 h-4" />
                    <span>Plan Content Calendar</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-12">
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch A/B Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}