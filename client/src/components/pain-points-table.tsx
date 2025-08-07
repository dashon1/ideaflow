import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Progress } from "@/components/ui/progress";
import { PainPoint } from "@shared/schema";

const platformColors = {
  Reddit: "bg-orange-100 text-orange-600",
  TikTok: "bg-pink-100 text-pink-600",
  Quora: "bg-red-100 text-red-600",
  YouTube: "bg-red-100 text-red-600",
  LinkedIn: "bg-blue-100 text-blue-600",
  Twitter: "bg-blue-100 text-blue-600",
};

const categoryColors = {
  Productivity: "bg-blue-100 text-blue-800",
  Finance: "bg-green-100 text-green-800",
  Health: "bg-purple-100 text-purple-800",
  Education: "bg-indigo-100 text-indigo-800",
  Business: "bg-gray-100 text-gray-800",
  "E-commerce": "bg-yellow-100 text-yellow-800",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  "in-review": "bg-gray-100 text-gray-800",
};

export default function PainPointsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: painPoints = [], isLoading } = useQuery<PainPoint[]>({
    queryKey: ["/api/pain-points", { limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage }],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/pain-points/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pain-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Pain point approved and idea generated!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to approve pain point",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Recent Pain Points</CardTitle>
          <CardDescription>AI-discovered problems ready for MVP development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(painPoints.length / itemsPerPage);

  return (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Pain Points</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          AI-discovered problems ready for MVP development
        </CardDescription>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {painPoints.map((painPoint: PainPoint) => (
              <tr key={painPoint.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {painPoint.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {painPoint.fullText?.substring(0, 100)}...
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      platformColors[painPoint.platform as keyof typeof platformColors] || "bg-gray-100"
                    }`}>
                      <span className="text-xs font-bold">
                        {painPoint.platform?.charAt(0) || "?"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{painPoint.platform}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="secondary"
                    className={categoryColors[painPoint.detectedNiche as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}
                  >
                    {painPoint.detectedNiche || "General"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {painPoint.engagementScore?.toLocaleString() || 0} pts
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="secondary"
                    className={statusColors[painPoint.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                  >
                    {painPoint.status || "pending"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {painPoint.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(painPoint.id)}
                        disabled={approveMutation.isPending}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {approveMutation.isPending ? "..." : "Approve"}
                      </Button>
                    )}
                    {painPoint.status === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Build MVP
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, painPoints.length)}
              </span>{" "}
              of <span className="font-medium">{painPoints.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-l-md"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="rounded-none"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-r-md"
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </Card>
  );
}
