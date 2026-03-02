import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Mockup } from "@/pages/Mockup";
import { ContentPlanner } from "@/pages/ContentPlanner";
import { AnimationLab } from "@/pages/AnimationLab";
import { PreviewPage } from "@/pages/PreviewPage";
import { FactleCapTuning } from "@/pages/FactleCapTuning";

function AdminNav() {
  const [location] = useLocation();
  const isPlanner = location === "/planner";

  if (!isPlanner) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#111113] border-b border-[#2c2c2e] z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-lg tracking-tight">Underground</span>
          <Link
            href="/planner"
            className="text-white hover:text-white/80 text-sm font-medium"
          >
            Content Planner
          </Link>
        </div>
        <Link
          href="/"
          className="text-[#8b8b8e] hover:text-white text-sm"
        >
          Preview App
        </Link>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/factle-tuning" component={FactleCapTuning} />
      <Route path="/lab" component={AnimationLab} />
      <Route path="/planner" component={ContentPlanner} />
      <Route path="/preview/:date" component={PreviewPage} />
      <Route path="/" component={Mockup} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AdminNav />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
