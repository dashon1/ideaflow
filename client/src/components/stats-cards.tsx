import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Lightbulb, Rocket, TrendingUp } from "lucide-react";

interface StatsData {
  totalPainPoints: number;
  ideasGenerated: number;
  mvpsCreated: number;
  successRate: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Pain Points",
      value: stats?.totalPainPoints || 0,
      change: "+12%",
      changeText: "from last week",
      icon: BarChart3,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Ideas Generated",
      value: stats?.ideasGenerated || 0,
      change: "+8%",
      changeText: "from last week",
      icon: Lightbulb,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "MVPs Created",
      value: stats?.mvpsCreated || 0,
      change: "+3",
      changeText: "this week",
      icon: Rocket,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      change: "+5%",
      changeText: "improvement",
      icon: TrendingUp,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stat.change}</span>
              <span className="text-gray-600 ml-1">{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
