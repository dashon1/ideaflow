import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Rocket, Code, Globe, Loader, Plus } from "lucide-react";

export default function MVP() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mvps = [] } = useQuery({
    queryKey: ['/api/mvps'],
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['/api/ideas'],
  });

  const createMvpMutation = useMutation({
    mutationFn: async () => {
      // Get the first approved idea to create MVP from
      const approvedIdea = ideas.find((idea: any) => idea.status === 'approved') || ideas[0];
      if (!approvedIdea) {
        throw new Error('No approved ideas available for MVP creation');
      }
      
      const response = await apiRequest('/api/mvps', 'POST', { 
        ideaId: approvedIdea.id,
        platform: 'Lovable',
        template: 'saas'
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "MVP Created!",
        description: "Successfully started building your MVP prototype.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mvps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "MVP Creation Failed",
        description: error.message || "Failed to create MVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const activeMvps = mvps.filter((mvp: any) => mvp.status === 'building');
  const deployedMvps = mvps.filter((mvp: any) => mvp.status === 'deployed');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MVP Builder</h1>
          <p className="text-gray-600">Transform approved ideas into working prototypes</p>
        </div>
        <Button 
          onClick={() => createMvpMutation.mutate()}
          disabled={createMvpMutation.isPending || ideas.length === 0}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {createMvpMutation.isPending ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4 mr-2" />
          )}
          {createMvpMutation.isPending ? 'Creating...' : 'Build MVP'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Active Projects</span>
            </CardTitle>
            <CardDescription>MVPs currently in development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Track progress of MVP projects being built by AI agents.
              </p>
              <div className="text-2xl font-bold text-gray-900">{activeMvps.length}</div>
              <div className="space-y-2">
                {activeMvps.slice(0, 2).map((mvp: any) => (
                  <div key={mvp.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{mvp.title}</span>
                    <Badge variant="secondary" className="ml-2">Building</Badge>
                  </div>
                ))}
                {activeMvps.length === 0 && (
                  <p className="text-xs text-gray-500">No active projects</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Deployed MVPs</span>
            </CardTitle>
            <CardDescription>Live prototypes ready for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                View and manage deployed MVP prototypes and their performance.
              </p>
              <div className="text-2xl font-bold text-gray-900">{deployedMvps.length}</div>
              <div className="space-y-2">
                {deployedMvps.slice(0, 2).map((mvp: any) => (
                  <div key={mvp.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{mvp.title}</span>
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">Live</Badge>
                  </div>
                ))}
                {deployedMvps.length === 0 && (
                  <p className="text-xs text-gray-500">No deployed MVPs</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Integrations</CardTitle>
            <CardDescription>Connected development platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage integrations with Lovable, Base44, and other MVP platforms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}