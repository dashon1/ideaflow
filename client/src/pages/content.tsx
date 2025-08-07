import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Image, Volume2 } from "lucide-react";

export default function Content() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Creation</h1>
          <p className="text-gray-600">AI-generated marketing materials for your MVPs</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <FileText className="w-4 h-4 mr-2" />
          Create Content
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
            <p className="text-sm text-gray-600">
              Generate compelling text content for marketing campaigns.
            </p>
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
            <p className="text-sm text-gray-600">
              Create product demo videos and promotional content.
            </p>
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
            <p className="text-sm text-gray-600">
              Generate visual assets and branding materials.
            </p>
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
            <p className="text-sm text-gray-600">
              Create professional voiceovers and audio content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}