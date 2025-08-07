import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Target, RefreshCw } from "lucide-react";

export default function Analytics() {
  const { data: stats = {}, refetch } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['/api/mvps'],
  });

  const { data: content = [] } = useQuery({
    queryKey: ['/api/content'],
  });

  // Calculate metrics
  const totalEngagement = mvps.reduce((sum: number, mvp: any) => sum + (mvp.views || 0), 0);
  const conversionRate = mvps.length > 0 ? (mvps.filter((mvp: any) => mvp.status === 'deployed').length / mvps.length * 100).toFixed(1) : 0;
  const activeContent = content.filter((c: any) => c.status === 'published').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance and success metrics across your MVPs</p>
        </div>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          className="bg-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance</span>
            </CardTitle>
            <CardDescription>MVP success metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Track user engagement and conversion rates.
              </p>
              <div className="text-3xl font-bold text-gray-900">{stats.totalPainPoints || 0}</div>
              <p className="text-xs text-gray-500">Pain points discovered</p>
              <div className="text-sm text-green-600">+{stats.ideasGenerated || 0} ideas generated</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Growth</span>
            </CardTitle>
            <CardDescription>User acquisition trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Monitor growth patterns and user adoption.
              </p>
              <div className="text-3xl font-bold text-gray-900">{totalEngagement.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Total MVP views</p>
              <div className="text-sm text-blue-600">↗ {stats.mvpsCreated || 0} MVPs created</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Audience</span>
            </CardTitle>
            <CardDescription>User demographics and behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Analyze user demographics and usage patterns.
              </p>
              <div className="text-3xl font-bold text-gray-900">{activeContent}</div>
              <p className="text-xs text-gray-500">Active content pieces</p>
              <div className="text-sm text-purple-600">↗ {stats.contentCreated || 0} total created</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Conversion</span>
            </CardTitle>
            <CardDescription>Marketing campaign results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Track marketing campaign effectiveness and ROI.
              </p>
              <div className="text-3xl font-bold text-gray-900">{conversionRate}%</div>
              <p className="text-xs text-gray-500">Idea to MVP conversion</p>
              <div className="text-sm text-orange-600">↗ {((parseFloat(conversionRate as string) / 100) * mvps.length).toFixed(0)} successful launches</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}