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
import { ALL_PLATFORMS, PLATFORM_CATEGORIES, getPlatformsByTier } from "@/data/platforms";
import Sidebar from "@/components/sidebar";

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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scrapingMode, setScrapingMode] = useState<'discovery' | 'niche'>('discovery');
  const [targetNiche, setTargetNiche] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check tier access
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const userTier = (user as any)?.subscriptionTier || 'starter';
  const availablePlatforms = getPlatformsByTier(userTier);
  
  // Filter platforms by selected category
  const displayPlatforms = availablePlatforms.filter(platform => 
    selectedCategory === 'All' || platform.category === selectedCategory
  );
  
  const PLATFORMS_PER_PAGE = 30;
  const totalPages = Math.ceil(displayPlatforms.length / PLATFORMS_PER_PAGE);
  const paginatedPlatforms = showAllPlatforms 
    ? displayPlatforms 
    : displayPlatforms.slice(currentPage * PLATFORMS_PER_PAGE, (currentPage + 1) * PLATFORMS_PER_PAGE);

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

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
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
          data-testid="button-start-scraping"
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
            {/* Tier Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</span>
              </div>
              <Badge variant="outline">{availablePlatforms.length} platforms available</Badge>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Platform Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show All Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={showAllPlatforms}
                  onCheckedChange={setShowAllPlatforms}
                />
                <Label className="text-sm">Show all platforms at once</Label>
              </div>
              <Badge variant="outline">{selectedPlatforms.length} selected</Badge>
            </div>

            {/* Platform Grid */}
            <div className={`grid grid-cols-2 gap-2 ${showAllPlatforms ? 'max-h-96 overflow-y-auto' : ''}`}>
              {paginatedPlatforms.map(platform => (
                <div 
                  key={platform.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary-300 bg-primary-50 dark:bg-primary-950/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  } ${!platform.active ? 'opacity-50' : ''}`}
                  onClick={() => platform.active && togglePlatform(platform.id)}
                  data-testid={`platform-${platform.id}`}
                >
                  <Checkbox 
                    checked={selectedPlatforms.includes(platform.id)}
                    disabled={!platform.active}
                    onChange={() => {}}
                  />
                  <span className="text-sm font-medium">{platform.name}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{platform.category}</Badge>
                  {!platform.active && (
                    <Badge variant="secondary" className="text-xs">Soon</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {!showAllPlatforms && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Badge variant="outline">
                    {currentPage * PLATFORMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * PLATFORMS_PER_PAGE, displayPlatforms.length)} of {displayPlatforms.length}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Quick Select All/None */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const platformIds = displayPlatforms.filter(p => p.active).map(p => p.id);
                    setSelectedPlatforms([...new Set([...selectedPlatforms, ...platformIds])]);
                  }}
                >
                  Select All {selectedCategory !== 'All' ? selectedCategory : ''}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlatforms([]);
                  }}
                >
                  Deselect All
                </Button>
              </div>
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
    </div>
  );
}