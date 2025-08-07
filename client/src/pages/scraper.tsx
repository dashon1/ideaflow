import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Play, Settings, Loader } from "lucide-react";

export default function Scraper() {
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/scraper/start', {
        method: 'POST',
        body: JSON.stringify({ platforms: ['Reddit', 'TikTok', 'Quora'] })
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Started!",
        description: data.message || "Successfully started scraping for pain points.",
      });
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

  const handleStartScraping = () => {
    setIsScrapingInProgress(true);
    startScrapingMutation.mutate();
    // Reset loading state after 3 seconds
    setTimeout(() => setIsScrapingInProgress(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Scraper</h1>
          <p className="text-gray-600">Discover pain points across social media platforms</p>
        </div>
        <Button 
          onClick={handleStartScraping}
          disabled={startScrapingMutation.isPending || isScrapingInProgress}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {startScrapingMutation.isPending || isScrapingInProgress ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {startScrapingMutation.isPending || isScrapingInProgress ? 'Scraping...' : 'Start Scraping'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Platform Configuration</span>
            </CardTitle>
            <CardDescription>Configure which platforms to scrape</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Select and configure social media platforms for pain point discovery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Scraper Settings</span>
            </CardTitle>
            <CardDescription>Advanced scraping parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Fine-tune discovery modes, keywords, and filtering criteria.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scraping Status</CardTitle>
            <CardDescription>Monitor active scraping jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View progress and status of current scraping operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}