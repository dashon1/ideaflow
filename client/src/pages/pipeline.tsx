import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pause, 
  RefreshCw, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  FileText,
  Zap,
  Database,
  Palette,
  Smartphone,
  Video,
  BarChart3,
  Target
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed";
  description: string;
  tasksCompleted: number;
  tasksQueued: number;
  processingTime: number;
  icon: any;
}

interface PipelineStats {
  status: "Active" | "Paused" | "Idle";
  totalTasks: number;
  completed: number;
  avgProcessingTime: number;
  successRate: number;
}

export default function Pipeline() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isPipelinePaused, setIsPipelinePaused] = useState(false);

  // Mock data - in real app this would come from API
  const pipelineStats: PipelineStats = {
    status: "Active",
    totalTasks: 6,
    completed: 3,
    avgProcessingTime: 2930,
    successRate: 50
  };

  const agents: Agent[] = [
    {
      id: "scraper",
      name: "Scraper Agent",
      type: "scraper",
      status: "queued",
      description: "Pulls pain points from 10 platforms",
      tasksCompleted: 2,
      tasksQueued: 0,
      processingTime: 2340,
      icon: Search
    },
    {
      id: "summarizer", 
      name: "Summarizer Agent",
      type: "summarizer",
      status: "completed",
      description: "Condenses problems into product opportunities",
      tasksCompleted: 1,
      tasksQueued: 0,
      processingTime: 1890,
      icon: FileText
    },
    {
      id: "classifier",
      name: "Classifier Agent", 
      type: "classifier",
      status: "processing",
      description: "Tags and prioritizes by market potential",
      tasksCompleted: 1,
      tasksQueued: 0,
      processingTime: 0,
      icon: Zap
    },
    {
      id: "storage",
      name: "Storage Agent",
      type: "storage", 
      status: "queued",
      description: "Persist data across platforms",
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: Database
    },
    {
      id: "mvp_designer",
      name: "MVP Designer",
      type: "mvp_designer",
      status: "completed", 
      description: "Creates app specifications and wireframes",
      tasksCompleted: 1,
      tasksQueued: 0,
      processingTime: 4560,
      icon: Palette
    },
    {
      id: "app_builder",
      name: "App Builder",
      type: "app_builder",
      status: "processing",
      description: "Builds MVP via Lovable, Base44, Cursor, Replit",
      tasksCompleted: 1,
      tasksQueued: 0,
      processingTime: 0,
      icon: Smartphone
    },
    {
      id: "mvp_storage",
      name: "MVP Storage",
      type: "mvp_storage",
      status: "queued",
      description: "Stores MVP metadata and links", 
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: Database
    },
    {
      id: "content_designer",
      name: "Content Designer",
      type: "content_designer", 
      status: "queued",
      description: "Creates viral marketing content",
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: Palette
    },
    {
      id: "video_generator",
      name: "Video Generator",
      type: "video_generator",
      status: "queued",
      description: "Generates videos via Veo3, Runway, Json2Video",
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: Video
    },
    {
      id: "marketing_agent",
      name: "Marketing Agent",
      type: "marketing_agent",
      status: "queued",
      description: "Launches campaigns across social platforms",
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: BarChart3
    },
    {
      id: "market_tester",
      name: "Market Tester",
      type: "market_tester",
      status: "queued", 
      description: "Analyzes performance and iterates",
      tasksCompleted: 0,
      tasksQueued: 0,
      processingTime: 0,
      icon: Target
    }
  ];

  const taskQueue = [
    { id: "1", name: "Scraper Agent", status: "queued", count: 1 },
    { id: "2", name: "Classifier Agent", status: "processing", count: 2 },
    { id: "3", name: "App Builder Agent", status: "processing", count: 2 },
    { id: "4", name: "Scraper Agent", status: "completed", count: 2, time: "2340ms" },
    { id: "5", name: "Summarizer Agent", status: "completed", count: 2, time: "1890ms" }
  ];

  const handlePausePipeline = () => {
    setIsPipelinePaused(!isPipelinePaused);
    toast({
      title: isPipelinePaused ? "Pipeline Resumed" : "Pipeline Paused",
      description: isPipelinePaused ? "AI agents will continue processing tasks" : "All agent activities have been paused",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Pipeline Refreshed", 
      description: "Updated agent status and task queue",
    });
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
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Pipeline Monitor</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring of your multi-agent system from pain point discovery to market testing.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePausePipeline}
                variant={isPipelinePaused ? "default" : "destructive"}
                className="flex items-center space-x-2"
                data-testid="button-pause-pipeline"
              >
                <Pause className="w-4 h-4" />
                <span>{isPipelinePaused ? "Resume Pipeline" : "Pause Pipeline"}</span>
              </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center space-x-2"
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Pipeline Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pipeline Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Activity className="w-4 h-4 text-green-500" />
                      <p className="text-xl font-bold text-gray-900">{pipelineStats.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-xl font-bold text-gray-900">{pipelineStats.totalTasks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-gray-900">{pipelineStats.completed}</p>
                    <p className="text-xs text-gray-500">{pipelineStats.successRate}% success rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Processing</p>
                    <p className="text-xl font-bold text-gray-900">{pipelineStats.avgProcessingTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Pipeline Flow */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Agent Pipeline Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={agent.id}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                      data-testid={`agent-card-${agent.type}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-600">{agent.description}</p>
                          </div>
                        </div>
                        {getStatusIcon(agent.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{agent.tasksCompleted} tasks</span>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                        {agent.processingTime > 0 && (
                          <p className="text-xs text-gray-500">Avg: {agent.processingTime}ms</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Task Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Queue Status Tabs */}
                <div className="flex space-x-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2 pb-2 border-b-2 border-blue-500">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">Queued</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                  <div className="flex items-center space-x-2 pb-2">
                    <Activity className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">Processing</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex items-center space-x-2 pb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {taskQueue.map((task) => (
                    <div 
                      key={task.id}
                      className={`p-3 rounded-lg border ${
                        task.status === "processing" ? "bg-yellow-50 border-yellow-200" :
                        task.status === "completed" ? "bg-green-50 border-green-200" :
                        "bg-blue-50 border-blue-200"
                      }`}
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(task.status)}
                          <span className="font-medium text-gray-900">{task.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          {task.time && (
                            <span className="text-sm text-gray-500">Time: {task.time}</span>
                          )}
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}