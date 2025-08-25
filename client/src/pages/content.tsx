import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  FileText,
  Video,
  Image,
  Download,
  Eye,
  Calendar,
  Users
} from "lucide-react";

interface ContentAsset {
  id: string;
  name: string;
  type: "Template" | "Marketing" | "Design" | "Documentation";
  description: string;
  fileSize: string;
  downloads: number;
  views: number;
  createdAt: string;
  category?: string;
}

export default function Content() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mock content assets data
  const [assets] = useState<ContentAsset[]>([
    {
      id: "1",
      name: "SaaS Landing Page Template",
      type: "Template",
      description: "High-converting landing page template with modern design",
      fileSize: "2.4 MB",
      downloads: 1247,
      views: 5832,
      createdAt: "1/14/2024",
      category: "SaaS"
    },
    {
      id: "2", 
      name: "Product Demo Video",
      type: "Marketing",
      description: "Professional product demonstration video template",
      fileSize: "45.2 MB",
      downloads: 892,
      views: 3421,
      createdAt: "2/2/2024",
      category: "Video"
    },
    {
      id: "3",
      name: "User Onboarding Flow",
      type: "Design",
      description: "Complete user onboarding design system",
      fileSize: "8.7 MB",
      downloads: 634,
      views: 2105,
      createdAt: "2/11/2024",
      category: "UX"
    },
    {
      id: "4",
      name: "API Documentation Template",
      type: "Documentation", 
      description: "Comprehensive API documentation structure",
      fileSize: "1.2 MB",
      downloads: 421,
      views: 1876,
      createdAt: "2/19/2024",
      category: "Technical"
    }
  ]);

  const handleUploadAsset = () => {
    toast({
      title: "Upload Asset",
      description: "Asset upload modal would open here.",
    });
  };

  const handlePreview = (assetId: string) => {
    toast({
      title: "Preview Asset",
      description: `Opening preview for asset ${assetId}`,
    });
  };

  const handleDownload = (assetId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading asset ${assetId}`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Template": return <FileText className="w-4 h-4 text-blue-600" />;
      case "Marketing": return <Video className="w-4 h-4 text-green-600" />;
      case "Design": return <Image className="w-4 h-4 text-purple-600" />;
      case "Documentation": return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Template": return "bg-blue-100 text-blue-800";
      case "Marketing": return "bg-green-100 text-green-800";
      case "Design": return "bg-purple-100 text-purple-800";
      case "Documentation": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <p className="text-gray-600">Loading content assets...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Content Assets</h1>
              <p className="text-gray-600 mt-1">Manage your reusable templates, designs, and marketing materials</p>
            </div>
            <Button 
              onClick={handleUploadAsset}
              className="flex items-center space-x-2"
              data-testid="button-upload-asset"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Asset</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(asset.type)}
                      <Badge className={`text-xs ${getTypeBadgeColor(asset.type)}`}>
                        {asset.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{asset.fileSize}</span>
                  </div>
                  <CardTitle className="text-base leading-tight">{asset.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{asset.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{asset.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {asset.createdAt}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => handlePreview(asset.id)}
                      data-testid={`button-preview-${asset.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs bg-gray-900 hover:bg-gray-800"
                      onClick={() => handleDownload(asset.id)}
                      data-testid={`button-download-${asset.id}`}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Asset Card */}
            <Card 
              className="border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
              onClick={handleUploadAsset}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Upload New Asset</h3>
                <p className="text-sm text-gray-600">
                  Add templates, designs, or marketing materials to your library
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}