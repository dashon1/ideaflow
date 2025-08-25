import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Rocket, Code, Globe, Loader, Plus, X, Calendar, TrendingUp, Users } from "lucide-react";

export default function MVP() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMvpOpen, setIsAddMvpOpen] = useState(false);
  const [mvpForm, setMvpForm] = useState({
    title: '',
    description: '',
    status: 'development',
    url: '',
    launchDate: ''
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['/api/mvps'],
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['/api/ideas'],
  });

  const createMvpMutation = useMutation({
    mutationFn: async (mvpData: any) => {
      const response = await apiRequest('/api/mvps', 'POST', mvpData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "MVP Created!",
        description: "Successfully created your MVP project.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mvps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsAddMvpOpen(false);
      setMvpForm({ title: '', description: '', status: 'development', url: '', launchDate: '' });
    },
    onError: (error: any) => {
      toast({
        title: "MVP Creation Failed",
        description: error.message || "Failed to create MVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddMvp = () => {
    if (!mvpForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your MVP.",
        variant: "destructive",
      });
      return;
    }
    
    createMvpMutation.mutate({
      title: mvpForm.title,
      description: mvpForm.description,
      status: mvpForm.status,
      url: mvpForm.url,
      launchDate: mvpForm.launchDate || null,
      platform: 'Custom',
      template: 'custom'
    });
  };

  const activeMvps = mvps.filter((mvp: any) => mvp.status === 'development' || mvp.status === 'building');
  const deployedMvps = mvps.filter((mvp: any) => mvp.status === 'deployed' || mvp.status === 'live');
  const totalMvps = mvps.length;
  const avgConversion = totalMvps > 0 ? 3.2 : 0;

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
          <p className="text-gray-600">Loading MVPs...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">MVPs</h1>
              <p className="text-gray-600 mt-1">Create and manage your minimum viable products to track performance and growth.</p>
            </div>
            <Button 
              onClick={() => setIsAddMvpOpen(true)}
              className="flex items-center space-x-2"
              data-testid="button-add-mvp"
            >
              <Plus className="w-4 h-4" />
              <span>Add New MVP</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* MVP Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total MVPs</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMvps}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeMvps.length} in development
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgConversion}%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active MVPs</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deployedMvps.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {deployedMvps.length} live now
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* MVP List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Your MVPs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mvps.length === 0 ? (
                  <div className="text-center py-12">
                    <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No MVPs yet</h3>
                    <p className="text-gray-600 mb-4">Create your first minimum viable product to track its performance and growth.</p>
                    <Button onClick={() => setIsAddMvpOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New MVP
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mvps.map((mvp: any) => (
                      <div 
                        key={mvp.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
                        data-testid={`mvp-${mvp.id}`}
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{mvp.title || mvp.ideaId}</h3>
                          <p className="text-sm text-gray-600">{mvp.description || 'No description'}</p>
                          {mvp.url && (
                            <a href={mvp.url} className="text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              {mvp.url}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={
                              mvp.status === 'deployed' || mvp.status === 'live' ? 'default' : 
                              mvp.status === 'development' || mvp.status === 'building' ? 'secondary' : 'outline'
                            }
                          >
                            {mvp.status || 'Unknown'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add New MVP Modal */}
      <Dialog open={isAddMvpOpen} onOpenChange={setIsAddMvpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Add New MVP</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddMvpOpen(false)}
                data-testid="button-close-mvp-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogDescription>
              Create a new minimum viable product to track its performance and growth.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="mvp-title">Title</Label>
              <Input
                id="mvp-title"
                value={mvpForm.title}
                onChange={(e) => setMvpForm({...mvpForm, title: e.target.value})}
                placeholder="Enter MVP title"
                className="mt-2"
                data-testid="input-mvp-title"
              />
            </div>

            <div>
              <Label htmlFor="mvp-description">Description</Label>
              <Textarea
                id="mvp-description"
                value={mvpForm.description}
                onChange={(e) => setMvpForm({...mvpForm, description: e.target.value})}
                placeholder="Describe your MVP"
                className="mt-2 min-h-[80px]"
                data-testid="textarea-mvp-description"
              />
            </div>

            <div>
              <Label htmlFor="mvp-status">Status</Label>
              <Select value={mvpForm.status} onValueChange={(value) => setMvpForm({...mvpForm, status: value})}>
                <SelectTrigger className="mt-2" data-testid="select-mvp-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mvp-url">URL (optional)</Label>
              <Input
                id="mvp-url"
                value={mvpForm.url}
                onChange={(e) => setMvpForm({...mvpForm, url: e.target.value})}
                placeholder="https://your-mvp.com"
                className="mt-2"
                data-testid="input-mvp-url"
              />
            </div>

            <div>
              <Label htmlFor="mvp-launch-date">Launch Date</Label>
              <Input
                id="mvp-launch-date"
                type="date"
                value={mvpForm.launchDate}
                onChange={(e) => setMvpForm({...mvpForm, launchDate: e.target.value})}
                className="mt-2"
                data-testid="input-mvp-launch-date"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddMvpOpen(false)}
              data-testid="button-cancel-mvp"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMvp}
              disabled={createMvpMutation.isPending}
              data-testid="button-add-mvp"
            >
              {createMvpMutation.isPending ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {createMvpMutation.isPending ? 'Adding...' : 'Add MVP'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}