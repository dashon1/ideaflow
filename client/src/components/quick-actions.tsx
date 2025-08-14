import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, Lightbulb, Rocket, FileText } from "lucide-react";

const quickActions = [
  {
    icon: Search,
    title: "Run Scraper",
    description: "Start discovering new pain points",
    action: "scraper",
  },
  {
    icon: Lightbulb,
    title: "Generate Ideas",
    description: "Process pending pain points",
    action: "ideas",
  },
  {
    icon: Rocket,
    title: "Build MVP",
    description: "Create prototype from idea",
    action: "mvp",
  },
  {
    icon: FileText,
    title: "Create Content",
    description: "Generate marketing materials",
    action: "content",
  },
];

export default function QuickActions() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string>("discovery");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scraperMutation = useMutation({
    mutationFn: async () => {
      const mode = selectedNiche === "discovery" ? "discovery" : "niche";
      const niche = selectedNiche === "discovery" ? undefined : selectedNiche;
      
      await apiRequest("/api/scraper/start", "POST", {
        platforms: ["reddit", "tiktok", "quora"],
        mode,
        niche,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pain-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: data.message || "Scraper started successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to start scraper",
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: string) => {
    setActiveAction(action);
    
    switch (action) {
      case "scraper":
        scraperMutation.mutate();
        break;
      case "ideas":
        toast({
          title: "Coming Soon",
          description: "Idea generation feature is in development",
        });
        break;
      case "mvp":
        toast({
          title: "Coming Soon",
          description: "MVP builder feature is in development",
        });
        break;
      case "content":
        toast({
          title: "Coming Soon",
          description: "Content generation feature is in development",
        });
        break;
    }
    
    setTimeout(() => setActiveAction(null), 2000);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Scraper Mode:
          </label>
          <Select value={selectedNiche} onValueChange={setSelectedNiche}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select discovery mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discovery">🌐 Auto Discovery (Trending)</SelectItem>
              <SelectItem value="productivity">⚡ Productivity Tools</SelectItem>
              <SelectItem value="finance">💰 Personal Finance</SelectItem>
              <SelectItem value="fitness">🏃 Health & Fitness</SelectItem>
              <SelectItem value="education">📚 EdTech & Learning</SelectItem>
              <SelectItem value="business">🏢 Small Business</SelectItem>
              <SelectItem value="parenting">👨‍👩‍👧‍👦 Parenting & Family</SelectItem>
              <SelectItem value="mental-health">🧠 Mental Health</SelectItem>
              <SelectItem value="remote-work">🏠 Remote Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const isActive = activeAction === action.action;
            const isLoading = action.action === "scraper" && scraperMutation.isPending;
            
            return (
              <Button
                key={action.action}
                variant="outline"
                className="p-4 h-auto border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                onClick={() => handleAction(action.action)}
                disabled={isLoading}
              >
                <div className="text-center">
                  <action.icon className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    isActive || isLoading 
                      ? "text-primary-500" 
                      : "text-gray-400 group-hover:text-primary-500"
                  } ${isLoading ? "animate-spin" : ""}`} />
                  <p className="text-sm font-medium text-gray-900">
                    {isLoading ? "Running..." : action.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
