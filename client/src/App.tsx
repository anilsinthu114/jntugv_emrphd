import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
// import Home from "./pages/Home";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Register} />
      {/* <Route path="/register" component={Register} /> */}
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>

        {/* 🔥 BACKGROUND ANIMATION LAYER */}
        <div className="bg-animation">
          <div className="bg-circle circle1"></div>
          <div className="bg-circle circle2"></div>
        </div>

        <Toaster />
        <Router />

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;