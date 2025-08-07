import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Code, Globe } from "lucide-react";

export default function MVP() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MVP Builder</h1>
          <p className="text-gray-600">Transform approved ideas into working prototypes</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Rocket className="w-4 h-4 mr-2" />
          Build MVP
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
            <p className="text-sm text-gray-600">
              Track progress of MVP projects being built by AI agents.
            </p>
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
            <p className="text-sm text-gray-600">
              View and manage deployed MVP prototypes and their performance.
            </p>
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