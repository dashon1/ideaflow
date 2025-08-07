import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Search, Lightbulb } from "lucide-react";

const activities = [
  {
    id: 1,
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: 'MVP created for "Habit Tracker" idea',
    time: "2 hours ago",
  },
  {
    id: 2,
    icon: Search,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Scraped 127 new pain points from Reddit",
    time: "5 hours ago",
  },
  {
    id: 3,
    icon: Lightbulb,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "AI generated content for 3 approved ideas",
    time: "1 day ago",
  },
];

export default function RecentActivity() {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
