import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Play, Settings } from "lucide-react";

export default function Scraper() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Scraper</h1>
          <p className="text-gray-600">Discover pain points across social media platforms</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Play className="w-4 h-4 mr-2" />
          Start Scraping
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Platform Configuration</span>
            </CardTitle>
            <CardDescription>Configure which platforms to scrape</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Select and configure social media platforms for pain point discovery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Scraper Settings</span>
            </CardTitle>
            <CardDescription>Advanced scraping parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Fine-tune discovery modes, keywords, and filtering criteria.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scraping Status</CardTitle>
            <CardDescription>Monitor active scraping jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View progress and status of current scraping operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}