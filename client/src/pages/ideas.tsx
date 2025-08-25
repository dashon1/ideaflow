import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Plus, 
  ExternalLink,
  Rocket,
  X,
  Loader
} from "lucide-react";
import { PainPoint } from "@shared/schema";

const platformColors = {
  Reddit: "bg-orange-100 text-orange-600 border-orange-200",
  TikTok: "bg-pink-100 text-pink-600 border-pink-200",
  Quora: "bg-red-100 text-red-600 border-red-200",
  YouTube: "bg-red-100 text-red-600 border-red-200",
  "Product Hunt": "bg-yellow-100 text-yellow-600 border-yellow-200",
  "Twitter/X": "bg-blue-100 text-blue-600 border-blue-200",
  "Hacker News": "bg-gray-100 text-gray-600 border-gray-200",
  LinkedIn: "bg-blue-100 text-blue-600 border-blue-200",
  "Indie Hackers": "bg-green-100 text-green-600 border-green-200",
};

const problemTypeColors = {
  "Pain Point": "bg-red-100 text-red-700 border-red-200",
  "Opportunity": "bg-blue-100 text-blue-700 border-blue-200",
  "Feature Gap": "bg-purple-100 text-purple-700 border-purple-200",
};

interface PlatformSection {
  platform: string;
  count: number;
  painPoints: PainPoint[];
  isExpanded: boolean;
}

export default function Ideas() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Reddit: true,
    TikTok: true,
  });
  const [isAddPainPointOpen, setIsAddPainPointOpen] = useState(false);
  const [painPointForm, setPainPointForm] = useState({
    title: '',
    fullText: '',
    platform: 'Reddit',
    problemType: 'Pain Point',
    detectedNiche: '',
    sourceUrl: ''
  });

  const { data: painPoints = [], isLoading: isPainPointsLoading } = useQuery<PainPoint[]>({
    queryKey: ["/api/pain-points"],
  });

  const createPainPointMutation = useMutation({
    mutationFn: async (painPointData: any) => {
      const response = await apiRequest('/api/pain-points', 'POST', painPointData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pain Point Added!",
        description: "Successfully added your pain point.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pain-points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsAddPainPointOpen(false);
      setPainPointForm({ title: '', fullText: '', platform: 'Reddit', problemType: 'Pain Point', detectedNiche: '', sourceUrl: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Pain Point Creation Failed",
        description: error.message || "Failed to add pain point. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddPainPoint = () => {
    if (!painPointForm.title.trim() || !painPointForm.fullText.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter both title and description for your pain point.",
        variant: "destructive",
      });
      return;
    }
    
    createPainPointMutation.mutate({
      title: painPointForm.title,
      fullText: painPointForm.fullText,
      platform: painPointForm.platform,
      problemType: painPointForm.problemType,
      detectedNiche: painPointForm.detectedNiche || null,
      sourceUrl: painPointForm.sourceUrl || null,
      engagementScore: Math.floor(Math.random() * 100) + 1, // Mock engagement score
      postDate: new Date().toISOString()
    });
  };

  // Group pain points by platform
  const platformSections: PlatformSection[] = Object.entries(
    painPoints.reduce((acc, painPoint) => {
      const platform = painPoint.platform || "Unknown";
      if (!acc[platform]) {
        acc[platform] = [];
      }
      acc[platform].push(painPoint);
      return acc;
    }, {} as Record<string, PainPoint[]>)
  ).map(([platform, points]) => ({
    platform,
    count: points.length,
    painPoints: points,
    isExpanded: expandedSections[platform] || false,
  }));

  const toggleSection = (platform: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
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
          <p className="text-gray-600">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isPainPointsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Idea Discovery</h1>
              <p className="text-gray-600 mt-1">Select the best ideas from each platform to approve for MVP generation.</p>
            </div>
            <Button 
              onClick={() => setIsAddPainPointOpen(true)}
              className="flex items-center space-x-2"
              data-testid="button-add-pain-point"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pain Point</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search all ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                  data-testid="input-search-ideas"
                />
              </div>
              <div className="text-sm text-gray-600">
                Niche: <span className="text-gray-400">None selected.</span>{" "}
                <button className="text-blue-600 hover:text-blue-700">Select a niche</button>
              </div>
            </div>

            {/* Platform Sections */}
            <div className="space-y-4">
        {platformSections.map((section) => (
          <Card key={section.platform} className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection(section.platform)}
              >
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {section.platform} ({section.count} ideas)
                </CardTitle>
                {section.isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            
            {section.isExpanded && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.painPoints.map((painPoint) => (
                    <Card key={painPoint.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              platformColors[section.platform as keyof typeof platformColors] || "bg-gray-100"
                            }`}>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{section.platform}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              problemTypeColors[painPoint.problemType as keyof typeof problemTypeColors] || 
                              problemTypeColors["Pain Point"]
                            }`}
                          >
                            {painPoint.problemType || "Pain Point"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2">
                            {painPoint.title || "Untitled Pain Point"}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {painPoint.fullText?.substring(0, 120) + "..." || "No description available"}
                          </p>
                        </div>

                        {/* Categories/Tags */}
                        <div className="flex flex-wrap gap-1">
                          {painPoint.detectedNiche && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {painPoint.detectedNiche}
                            </Badge>
                          )}
                          {["Innovation", "Productivity", "Tools"].slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Potential Score */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-600">Potential Score</span>
                            <span className="text-xs text-gray-500">
                              {Math.round((painPoint.engagementScore || 0) / 10)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.round((painPoint.engagementScore || 0) / 10)} 
                            className="h-2 bg-gray-100"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs border-gray-300 hover:bg-gray-50"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Source
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Rocket className="w-3 h-3 mr-1" />
                            Generate MVP
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {section.painPoints.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No ideas found for {section.platform}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
            </div>

            {platformSections.length === 0 && (
              <Card className="bg-white shadow-sm">
                <CardContent className="text-center py-12">
                  <div className="text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No ideas discovered yet</h3>
                    <p className="text-sm">Run the scraper to start discovering pain points from social media platforms.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Add Pain Point Modal */}
      <Dialog open={isAddPainPointOpen} onOpenChange={setIsAddPainPointOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Add Pain Point</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddPainPointOpen(false)}
                data-testid="button-close-pain-point-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogDescription>
              Manually add a pain point or problem you've discovered.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pain-point-title">Title</Label>
              <Input
                id="pain-point-title"
                value={painPointForm.title}
                onChange={(e) => setPainPointForm({...painPointForm, title: e.target.value})}
                placeholder="Brief title describing the pain point"
                className="mt-2"
                data-testid="input-pain-point-title"
              />
            </div>

            <div>
              <Label htmlFor="pain-point-description">Description</Label>
              <Textarea
                id="pain-point-description"
                value={painPointForm.fullText}
                onChange={(e) => setPainPointForm({...painPointForm, fullText: e.target.value})}
                placeholder="Detailed description of the problem or pain point"
                className="mt-2 min-h-[80px]"
                data-testid="textarea-pain-point-description"
              />
            </div>

            <div>
              <Label htmlFor="pain-point-platform">Platform</Label>
              <Select value={painPointForm.platform} onValueChange={(value) => setPainPointForm({...painPointForm, platform: value})}>
                <SelectTrigger className="mt-2" data-testid="select-pain-point-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reddit">Reddit</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Quora">Quora</SelectItem>
                  <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Product Hunt">Product Hunt</SelectItem>
                  <SelectItem value="Hacker News">Hacker News</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pain-point-type">Problem Type</Label>
              <Select value={painPointForm.problemType} onValueChange={(value) => setPainPointForm({...painPointForm, problemType: value})}>
                <SelectTrigger className="mt-2" data-testid="select-pain-point-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pain Point">Pain Point</SelectItem>
                  <SelectItem value="Opportunity">Opportunity</SelectItem>
                  <SelectItem value="Feature Gap">Feature Gap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pain-point-niche">Niche (optional)</Label>
              <Input
                id="pain-point-niche"
                value={painPointForm.detectedNiche}
                onChange={(e) => setPainPointForm({...painPointForm, detectedNiche: e.target.value})}
                placeholder="e.g., SaaS, E-commerce, Productivity"
                className="mt-2"
                data-testid="input-pain-point-niche"
              />
            </div>

            <div>
              <Label htmlFor="pain-point-url">Source URL (optional)</Label>
              <Input
                id="pain-point-url"
                value={painPointForm.sourceUrl}
                onChange={(e) => setPainPointForm({...painPointForm, sourceUrl: e.target.value})}
                placeholder="https://..."
                className="mt-2"
                data-testid="input-pain-point-url"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddPainPointOpen(false)}
              data-testid="button-cancel-pain-point"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPainPoint}
              disabled={createPainPointMutation.isPending}
              data-testid="button-add-pain-point"
            >
              {createPainPointMutation.isPending ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {createPainPointMutation.isPending ? 'Adding...' : 'Add Pain Point'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}