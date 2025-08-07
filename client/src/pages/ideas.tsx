import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, Filter } from "lucide-react";

export default function Ideas() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generated Ideas</h1>
          <p className="text-gray-600">AI-processed product concepts from discovered pain points</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Generate Ideas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Approved Ideas</span>
            </CardTitle>
            <CardDescription>Ready for MVP development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Browse and manage approved product ideas ready for prototyping.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Idea Pipeline</span>
            </CardTitle>
            <CardDescription>Track idea processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Monitor ideas through the approval and development pipeline.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>View AI-generated insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Explore AI analysis including market potential and feasibility scores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}