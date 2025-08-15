import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import Filters from "@/components/filters";
import PainPointsTable from "@/components/pain-points-table";
import RecentActivity from "@/components/recent-activity";
import QuickActions from "@/components/quick-actions";
import NicheScraper from "@/components/niche-scraper";
import InteractiveDemo from "@/components/interactive-demo";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState({
    platform: "all",
    category: "all", 
    niche: "all",
    timeRange: "7",
    search: "",
  });

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
          <p className="text-gray-600">Loading dashboard...</p>
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
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Discover trending pain points and build MVPs</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/scraper"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium flex items-center space-x-2 no-underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Start Scraper</span>
              </a>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">DU</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          
          {/* Niche Scraper - Primary Action */}
          <div className="mb-8">
            <NicheScraper />
          </div>
          
          {/* Data Filters */}
          <Filters onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />
          <PainPointsTable filters={filters} />
          
          {/* Interactive Demo */}
          <div className="mb-8">
            <InteractiveDemo />
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity />
            <QuickActions />
          </div>
        </main>
      </div>
    </div>
  );
}
