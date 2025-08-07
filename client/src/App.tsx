import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Scraper from "@/pages/scraper";
import Ideas from "@/pages/ideas";
import MVP from "@/pages/mvp";
import Content from "@/pages/content";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/" component={Dashboard} />
      <Route path="/scraper" component={Scraper} />
      <Route path="/ideas" component={Ideas} />
      <Route path="/mvp" component={MVP} />
      <Route path="/content" component={Content} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
