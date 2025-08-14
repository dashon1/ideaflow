import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Video, Image, Volume2, Loader, Plus } from "lucide-react";

export default function Content() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content = [] } = useQuery({
    queryKey: ['/api/content'],
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['/api/ideas'],
  });

  const createContentMutation = useMutation({
    mutationFn: async () => {
      // Get the first approved idea to create content for
      const approvedIdea = ideas.find((idea: any) => idea.status === 'approved') || ideas[0];
      if (!approvedIdea) {
        throw new Error('No approved ideas available for content creation');
      }
      
      const response = await apiRequest('/api/content', 'POST', { 
        mvpId: approvedIdea.id,
        contentType: 'text',
        scriptText: `Create marketing content for: ${approvedIdea.summaryText}`,
        metadata: { platform: 'OpenAI' }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Created!",
        description: "Successfully generated marketing content for your idea.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Content Creation Failed",
        description: error.message || "Failed to create content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const textContent = content.filter((c: any) => c.type === 'text');
  const videoContent = content.filter((c: any) => c.type === 'video');
  const imageContent = content.filter((c: any) => c.type === 'image');
  const audioContent = content.filter((c: any) => c.type === 'audio');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Creation</h1>
          <p className="text-gray-600">AI-generated marketing materials for your MVPs</p>
        </div>
        <Button 
          onClick={() => createContentMutation.mutate()}
          disabled={createContentMutation.isPending || ideas.length === 0}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {createContentMutation.isPending ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          {createContentMutation.isPending ? 'Creating...' : 'Create Content'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Text Content</span>
            </CardTitle>
            <CardDescription>Blog posts, social media, ads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Generate compelling text content for marketing campaigns.
              </p>
              <div className="text-2xl font-bold text-gray-900">{textContent.length}</div>
              <div className="space-y-2">
                {textContent.slice(0, 2).map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{content.title}</span>
                    <Badge variant="secondary" className="ml-2">{content.status}</Badge>
                  </div>
                ))}
                {textContent.length === 0 && (
                  <p className="text-xs text-gray-500">No text content yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Video Content</span>
            </CardTitle>
            <CardDescription>Promotional videos and demos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Create product demo videos and promotional content.
              </p>
              <div className="text-2xl font-bold text-gray-900">{videoContent.length}</div>
              <div className="space-y-2">
                {videoContent.slice(0, 2).map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{content.title}</span>
                    <Badge variant="secondary" className="ml-2">{content.status}</Badge>
                  </div>
                ))}
                {videoContent.length === 0 && (
                  <p className="text-xs text-gray-500">No video content yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span>Visual Assets</span>
            </CardTitle>
            <CardDescription>Graphics, logos, illustrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Generate visual assets and branding materials.
              </p>
              <div className="text-2xl font-bold text-gray-900">{imageContent.length}</div>
              <div className="space-y-2">
                {imageContent.slice(0, 2).map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{content.title}</span>
                    <Badge variant="secondary" className="ml-2">{content.status}</Badge>
                  </div>
                ))}
                {imageContent.length === 0 && (
                  <p className="text-xs text-gray-500">No visual content yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5" />
              <span>Audio Content</span>
            </CardTitle>
            <CardDescription>Voiceovers and podcasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Create professional voiceovers and audio content.
              </p>
              <div className="text-2xl font-bold text-gray-900">{audioContent.length}</div>
              <div className="space-y-2">
                {audioContent.slice(0, 2).map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{content.title}</span>
                    <Badge variant="secondary" className="ml-2">{content.status}</Badge>
                  </div>
                ))}
                {audioContent.length === 0 && (
                  <p className="text-xs text-gray-500">No audio content yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}