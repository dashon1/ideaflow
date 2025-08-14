import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FiltersProps {
  onFiltersChange?: (filters: {
    platform?: string;
    category?: string;
    niche?: string;
    timeRange?: string;
    search?: string;
  }) => void;
}

export default function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    platform: "all",
    category: "all",
    niche: "all",
    timeRange: "7",
    search: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Select 
              value={filters.platform} 
              onValueChange={(value) => handleFilterChange("platform", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="Reddit">Reddit</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Quora">Quora</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.niche} 
              onValueChange={(value) => handleFilterChange("niche", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Niches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                <SelectItem value="productivity">Productivity Tools</SelectItem>
                <SelectItem value="finance">Personal Finance</SelectItem>
                <SelectItem value="fitness">Health & Fitness</SelectItem>
                <SelectItem value="education">EdTech & Learning</SelectItem>
                <SelectItem value="business">Small Business</SelectItem>
                <SelectItem value="parenting">Parenting & Family</SelectItem>
                <SelectItem value="mental-health">Mental Health</SelectItem>
                <SelectItem value="remote-work">Remote Work</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.timeRange} 
              onValueChange={(value) => handleFilterChange("timeRange", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Filter existing data..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <Button variant="outline" className="px-4 py-2">
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
