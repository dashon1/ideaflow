import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Play, 
  Settings, 
  Loader, 
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";

interface ScrapingJob {
  id: string;
  jobType: string;
  targetNiche?: string;
  platforms: string[];
  status: string;
  progress: number;
  currentAgent?: string;
  totalTargets: number;
  completedTargets: number;
  foundPainPoints: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export default function Scraper() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Reddit', 'TikTok', 'Quora']);
  const [scrapingMode, setScrapingMode] = useState<'discovery' | 'niche'>('discovery');
  const [targetNiche, setTargetNiche] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const platforms = [
    { name: 'Reddit', icon: '🔴', active: true },
    { name: 'TikTok', icon: '⚫', active: true },
    { name: 'Quora', icon: '🔴', active: true },
    { name: 'YouTube', icon: '🔴', active: false },
    { name: 'LinkedIn', icon: '🔵', active: false },
    { name: 'Twitter/X', icon: '⚫', active: false }
  ];

  const niches = [
    'Productivity', 'Finance', 'Gaming', 'Education', 'Fitness', 'Health',
    'Technology', 'Business', 'Marketing', 'Design', 'Travel', 'Food',
    'Fashion', 'Real Estate', 'Entertainment', 'Sports'
  ];

  // Fetch active scraping jobs
  const { data: scrapingJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/scraping-jobs'],
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  // Cast to proper type for TypeScript
  const typedScrapingJobs = scrapingJobs as ScrapingJob[];

  const startScrapingMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        jobType: scrapingMode,
        platforms: selectedPlatforms,
        ...(scrapingMode === 'niche' && targetNiche && { targetNiche })
      };
      
      const response = await apiRequest('/api/scraper/start', 'POST', payload);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Scraping Started!",
        description: `${scrapingMode === 'niche' ? 'Niche-targeted' : 'Discovery'} scraping initiated across ${selectedPlatforms.length} platforms.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pain-points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to start scraping. Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePlatform = (platformName: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformName) 
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleStartScraping = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to scrape.",
        variant: "destructive",
      });
      return;
    }

    if (scrapingMode === 'niche' && !targetNiche) {
      toast({
        title: "Niche Required",
        description: "Please specify a target niche for niche-based scraping.",
        variant: "destructive",
      });
      return;
    }

    startScrapingMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'scraper': return <Search className="w-4 h-4" />;
      case 'analyzer': return <Zap className="w-4 h-4" />;
      case 'filter': return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const currentJob = typedScrapingJobs.find((job: ScrapingJob) => job.status === 'running');
  const recentJobs = typedScrapingJobs.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Web Scraper</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover pain points across social media platforms</p>
        </div>
        <Button 
          onClick={handleStartScraping}
          disabled={startScrapingMutation.isPending || !!currentJob}
          className="bg-primary-600 hover:bg-primary-700"
          size="lg"
        >
          {startScrapingMutation.isPending || currentJob ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {startScrapingMutation.isPending || currentJob ? 'Scraping...' : 'Start Scraping'}
        </Button>
      </div>

      {/* Active Scraping Job Status */}
      {currentJob && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
              <span>Active Scraping Job</span>
              <Badge variant="secondary" className="ml-auto">{currentJob.jobType}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {currentJob.completedTargets}/{currentJob.totalTargets} targets</span>
              <span className="font-medium">{currentJob.progress}%</span>
            </div>
            <Progress value={currentJob.progress} className="w-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getAgentIcon(currentJob.currentAgent)}
                <span className="text-sm capitalize">{currentJob.currentAgent || 'Processing'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{currentJob.foundPainPoints} pain points found</span>
              </div>
            </div>
            <div className="flex gap-2">
              {currentJob.platforms.map((platform: string) => (
                <Badge key={platform} variant="outline">{platform}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Platform Configuration</span>
            </CardTitle>
            <CardDescription>Select platforms to scrape for pain points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(platform => (
                <div 
                  key={platform.name}
                  className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.name)
                      ? 'border-primary-300 bg-primary-50 dark:bg-primary-950/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  } ${!platform.active ? 'opacity-50' : ''}`}
                  onClick={() => platform.active && togglePlatform(platform.name)}
                >
                  <Checkbox 
                    checked={selectedPlatforms.includes(platform.name)}
                    disabled={!platform.active}
                    onChange={() => {}}
                  />
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                  {!platform.active && (
                    <Badge variant="secondary" className="text-xs ml-auto">Soon</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scraper Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Scraper Settings</span>
            </CardTitle>
            <CardDescription>Configure scraping mode and parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Scraping Mode</Label>
              <Select value={scrapingMode} onValueChange={(value: 'discovery' | 'niche') => setScrapingMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery Mode</SelectItem>
                  <SelectItem value="niche">Niche Targeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {scrapingMode === 'niche' && (
              <div className="space-y-2">
                <Label>Target Niche</Label>
                <Select value={targetNiche} onValueChange={setTargetNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map(niche => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="pt-2">
              <Badge variant={scrapingMode === 'discovery' ? 'default' : 'secondary'} className="mr-2">
                {scrapingMode === 'discovery' ? 'General Discovery' : 'Niche Focused'}
              </Badge>
              {scrapingMode === 'niche' && targetNiche && (
                <Badge variant="outline">{targetNiche}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scraping Status */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest scraping job history</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="w-5 h-5 animate-spin" />
              </div>
            ) : recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job: ScrapingJob) => (
                  <div key={job.id} className="flex items-center justify-between p-2 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <div>
                        <div className="text-sm font-medium capitalize">{job.jobType}</div>
                        <div className="text-xs text-gray-500">
                          {job.targetNiche || job.platforms.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.foundPainPoints}</div>
                      <div className="text-xs text-gray-500">pain points</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent scraping activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}