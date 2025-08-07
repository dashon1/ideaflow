import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, Key, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your account and application preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Update your profile details and preferences.
            </p>
            <Button variant="outline" className="mt-4">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>API Keys</span>
            </CardTitle>
            <CardDescription>Manage external service integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Configure API keys for OpenAI, social platforms, and MVP builders.
            </p>
            <Button variant="outline" className="mt-4">
              Manage Keys
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Configure alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Set up notifications for scraping completion, idea approval, and MVP updates.
            </p>
            <Button variant="outline" className="mt-4">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>System Settings</span>
            </CardTitle>
            <CardDescription>Application preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Configure system-wide settings and preferences.
            </p>
            <Button variant="outline" className="mt-4">
              System Config
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}