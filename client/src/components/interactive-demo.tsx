import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Zap, CheckCircle, Clock, Play } from "lucide-react";

export default function InteractiveDemo() {
  const [demoStep, setDemoStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const demoSteps = [
    {
      title: "Approve Pain Points",
      description: "Convert discovered problems into actionable insights",
      action: "approve-pain-points"
    },
    {
      title: "Generate Ideas", 
      description: "AI analyzes pain points and creates solution concepts",
      action: "generate-ideas"
    },
    {
      title: "Build MVPs",
      description: "Transform approved ideas into working prototypes",
      action: "build-mvps"
    },
    {
      title: "Create Content",
      description: "Generate marketing materials for your MVPs",
      action: "create-content"
    }
  ];

  const runDemoMutation = useMutation({
    mutationFn: async (step: number) => {
      const currentStep = demoSteps[step];
      
      switch (currentStep.action) {
        case 'approve-pain-points':
          // Approve multiple pain points
          await apiRequest('/api/pain-points/1/approve', 'PATCH');
          await apiRequest('/api/pain-points/2/approve', 'PATCH');
          await apiRequest('/api/pain-points/3/approve', 'PATCH');
          break;
          
        case 'generate-ideas':
          // Ideas should be generated automatically when pain points are approved
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
          break;
          
        case 'build-mvps':
          // Create MVPs from approved ideas - use actual idea if available
          const ideaResponse = await apiRequest('/api/ideas', 'GET');
          const ideas = Array.isArray(ideaResponse) ? ideaResponse : [];
          const ideaId = ideas.length > 0 ? ideas[0].id : 'demo-idea-1';
          
          await apiRequest('/api/mvps', 'POST', {
            name: 'AI-Powered Solution MVP',
            ideaId: ideaId,
            description: 'Prototype for solving user pain points with innovative features',
            platformSelected: 'Lovable',
            mvpSpec: {
              coreFeatures: ['User Authentication', 'Problem Tracker', 'Solution Generator'],
              techStack: ['React', 'Node.js', 'PostgreSQL'],
              deployment: 'Replit'
            },
            estimatedEffortScore: 7,
            isReadyForUserTest: true
          });
          break;
          
        case 'create-content':
          // Create content for MVPs - use actual MVP ID if available
          const mvpResponse = await apiRequest('/api/mvps', 'GET');
          const mvps = Array.isArray(mvpResponse) ? mvpResponse : [];
          const mvpId = mvps.length > 0 ? mvps[0].id : 'demo-mvp-1';
          
          await apiRequest('/api/content', 'POST', {
            mvpId: mvpId,
            contentType: 'video',
            scriptText: 'Compelling marketing content for our innovative solution - showcasing the key features and benefits that solve real user pain points.',
            videoFormatSelected: 'short-form',
            generationPlatformUsed: 'OpenAI GPT-4',
            linkToGeneratedAsset: `https://content.demo.com/${mvpId}/video`,
            isReadyForDistribution: true,
            metadata: { 
              platform: 'TikTok',
              targetAudience: 'entrepreneurs',
              duration: '30s'
            }
          });
          break;
      }
      
      return currentStep;
    },
    onSuccess: (step) => {
      toast({
        title: `${step.title} Complete!`,
        description: step.description,
      });
      
      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ['/api/pain-points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mvps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      // Move to next step
      if (demoStep < demoSteps.length - 1) {
        setDemoStep(demoStep + 1);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Demo Step Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const resetDemo = () => {
    setDemoStep(0);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <span>Interactive Demo</span>
        </CardTitle>
        <CardDescription>
          Experience the complete workflow from pain point discovery to MVP creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {demoSteps.map((step, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                index < demoStep
                  ? 'bg-green-50 border-green-200'
                  : index === demoStep
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {index < demoStep ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : index === demoStep ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                )}
                <span className="text-xs font-medium">
                  Step {index + 1}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-purple-200">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white">
              {demoStep + 1} of {demoSteps.length}
            </Badge>
            <span className="text-sm text-gray-600">
              {demoStep < demoSteps.length ? demoSteps[demoStep].title : 'Demo Complete!'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {demoStep === demoSteps.length ? (
              <Button onClick={resetDemo} variant="outline" size="sm">
                Reset Demo
              </Button>
            ) : (
              <Button 
                onClick={() => runDemoMutation.mutate(demoStep)}
                disabled={runDemoMutation.isPending}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {runDemoMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Step
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}