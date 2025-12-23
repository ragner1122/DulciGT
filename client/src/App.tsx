import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TestList from "@/pages/TestList";
import ExamInterface from "@/pages/ExamInterface";
import QuestionBank from "@/pages/QuestionBank";
import TrainingLab from "@/pages/TrainingLab";
import Planner from "@/pages/Planner";
import Analytics from "@/pages/Analytics";
import Uploads from "@/pages/Uploads";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect logic handled by use-auth hook or auth-utils usually, but here for safety:
    window.location.href = "/api/login";
    return null;
  }

  return <Component />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/" className="text-accent hover:underline">Return Home</Link>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : Landing} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/tests">
        <ProtectedRoute component={TestList} />
      </Route>
      <Route path="/tests/:id">
        <ProtectedRoute component={ExamInterface} />
      </Route>
      <Route path="/bank">
        <ProtectedRoute component={QuestionBank} />
      </Route>
      <Route path="/lab">
        <ProtectedRoute component={TrainingLab} />
      </Route>
      <Route path="/planner">
        <ProtectedRoute component={Planner} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/upload">
        <ProtectedRoute component={Uploads} />
      </Route>
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
