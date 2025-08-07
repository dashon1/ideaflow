import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance and success metrics across your MVPs</p>
        </div>
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
            <p className="text-sm text-gray-600">
              Track user engagement and conversion rates.
            </p>
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
            <p className="text-sm text-gray-600">
              Monitor growth patterns and user adoption.
            </p>
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
            <p className="text-sm text-gray-600">
              Analyze user demographics and usage patterns.
            </p>
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
            <p className="text-sm text-gray-600">
              Track marketing campaign effectiveness and ROI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}