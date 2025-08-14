import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Target, Loader, Zap } from "lucide-react";

export default function NicheScraper() {
  const [nicheInput, setNicheInput] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Reddit', 'TikTok', 'Quora']);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availablePlatforms = [
    { name: 'Reddit', active: true },
    { name: 'TikTok', active: true },
    { name: 'Quora', active: true },
    { name: 'YouTube', active: false },
    { name: 'LinkedIn', active: false },
    { name: 'Twitter/X', active: false }
  ];

  const popularNiches = [
    'AI & Machine Learning', 'SaaS Tools', 'E-commerce', 'Digital Marketing',
    'Remote Work', 'Health & Wellness', 'Personal Finance', 'Productivity',
    'EdTech', 'Gaming', 'Real Estate', 'Food Tech', 'Fintech', 'Travel'
  ];

  const scrapeNicheMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        jobType: 'niche',
        platforms: selectedPlatforms,
        targetNiche: nicheInput
      };
      
      const response = await apiRequest('/api/scraper/start', 'POST', payload);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Niche Scraping Started!",
        description: `Now searching for "${nicheInput}" pain points across ${selectedPlatforms.length} platforms.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pain-points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setNicheInput("");
      setIsExpanded(false);
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to start niche scraping. Please try again.",
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

  const handleScrapeNiche = () => {
    if (!nicheInput.trim()) {
      toast({
        title: "Niche Required",
        description: "Please enter a niche to search for pain points.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to scrape.",
        variant: "destructive",
      });
      return;
    }

    scrapeNicheMutation.mutate();
  };

  const handleQuickNiche = (niche: string) => {
    setNicheInput(niche);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span>Scrape New Niche</span>
        </CardTitle>
        <CardDescription>
          Discover pain points for any specific niche or industry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter niche (e.g., 'AI startups', 'small business owners', 'freelancers')"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              className="w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleScrapeNiche()}
            />
          </div>
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="icon"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleScrapeNiche}
            disabled={scrapeNicheMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {scrapeNicheMutation.isPending ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {scrapeNicheMutation.isPending ? 'Scraping...' : 'Scrape'}
          </Button>
        </div>

        {/* Quick Niche Selection */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Popular niches:</p>
          <div className="flex flex-wrap gap-2">
            {popularNiches.slice(0, isExpanded ? popularNiches.length : 6).map(niche => (
              <Badge 
                key={niche}
                variant="outline" 
                className="cursor-pointer hover:bg-blue-100 hover:border-blue-300"
                onClick={() => handleQuickNiche(niche)}
              >
                {niche}
              </Badge>
            ))}
            {!isExpanded && popularNiches.length > 6 && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setIsExpanded(true)}
              >
                +{popularNiches.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-blue-200">
            <p className="text-sm text-gray-600">Select platforms to scrape:</p>
            <div className="grid grid-cols-3 gap-2">
              {availablePlatforms.map(platform => (
                <Button
                  key={platform.name}
                  variant={selectedPlatforms.includes(platform.name) ? "default" : "outline"}
                  size="sm"
                  disabled={!platform.active}
                  onClick={() => platform.active && togglePlatform(platform.name)}
                  className="justify-start"
                >
                  {platform.name}
                  {!platform.active && <span className="ml-1 text-xs">(Soon)</span>}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected platforms preview */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Platforms:</span>
          <div className="flex gap-1">
            {selectedPlatforms.map(platform => (
              <Badge key={platform} variant="secondary" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}