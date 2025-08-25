import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Search, 
  Lightbulb, 
  Rocket, 
  FileText, 
  BarChart3, 
  Settings,
  Zap,
  Activity,
  Bot,
  Users,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "MVPs", href: "/mvp", icon: Rocket },
  { name: "Content Assets", href: "/content", icon: FileText },
  { name: "Marketing", href: "/marketing", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Idea Discovery", href: "/ideas", icon: Lightbulb },
  { name: "Scraper", href: "/scraper", icon: Search },
  { name: "Pipeline", href: "/pipeline", icon: Activity },
  { name: "Agent Management", href: "/agent-management", icon: Bot },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Global Settings", href: "/global-settings", icon: Globe },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">IdeaFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100">
        <Link 
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => window.location.href = '/api/logout'}
          className="w-full mt-2 flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
