import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Plus, 
  ExternalLink,
  Rocket 
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Reddit: true,
    TikTok: true,
  });

  const { data: painPoints = [], isLoading } = useQuery<PainPoint[]>({
    queryKey: ["/api/pain-points"],
  });

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Idea Discovery</h1>
          <p className="text-gray-600 mt-1">Select the best ideas from each platform to approve for MVP generation.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Pain Point
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search all ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
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
  );
}