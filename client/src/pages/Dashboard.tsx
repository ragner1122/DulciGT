import { SidebarLayout } from "@/components/SidebarLayout";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/StatCard";
import { 
  Target, 
  Flame, 
  Brain, 
  CalendarDays, 
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttempts } from "@/hooks/use-attempts";
import { useStudyPlan } from "@/hooks/use-plans";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: attempts } = useAttempts();
  const { data: plan } = useStudyPlan();

  // Simple derived stats
  const completedTests = attempts?.filter(a => a.status === 'completed').length || 0;
  const averageScore = attempts?.filter(a => a.score?.overall).reduce((acc, curr) => acc + (curr.score?.overall || 0), 0) / (completedTests || 1);
  const formattedScore = averageScore ? averageScore.toFixed(1) : "-";

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Welcome back, {user?.firstName || "Student"}
            </h1>
            <p className="text-muted-foreground mt-1">
              You're on track for your exam on {plan?.examDate ? format(new Date(plan.examDate), 'MMMM do') : "schedule"}.
            </p>
          </div>
          <Link href="/tests">
            <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              Start Mock Test <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Current Level" 
            value={`Band ${formattedScore}`} 
            icon={Target} 
            trend="up" 
            trendValue="0.5" 
          />
          <StatCard 
            title="Tests Taken" 
            value={completedTests} 
            icon={Brain} 
            description="Last 30 days"
          />
          <StatCard 
            title="Day Streak" 
            value="3" 
            icon={Flame} 
            className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-800"
            trend="neutral"
            trendValue="High"
          />
          <StatCard 
            title="Days to Exam" 
            value={plan?.examDate ? Math.max(0, Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "Set Date"} 
            icon={CalendarDays} 
            description="Keep pushing!"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Activity / Weakest Skills */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Recommended Focus</h3>
                <span className="text-sm text-accent font-medium cursor-pointer hover:underline">View Analytics</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Weakest Area</span>
                  </div>
                  <h4 className="font-bold text-red-900 dark:text-red-200">Writing Task 1 (Letters)</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">Average Band: 5.5</p>
                  <Link href="/lab/writing">
                    <Button variant="outline" size="sm" className="mt-4 w-full bg-white dark:bg-black/20 border-red-200 hover:bg-red-100 text-red-700">Practice Now</Button>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Strongest Area</span>
                  </div>
                  <h4 className="font-bold text-green-900 dark:text-green-200">Reading Section 1</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">Average Band: 8.0</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full bg-white dark:bg-black/20 border-green-200 hover:bg-green-100 text-green-700">Maintain Level</Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Recent Attempts</h3>
              <div className="space-y-3">
                {attempts?.slice(0, 3).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${attempt.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-medium text-sm">Full Mock Test #{attempt.testId}</p>
                        <p className="text-xs text-muted-foreground">{attempt.startedAt ? format(new Date(attempt.startedAt), 'MMM d, h:mm a') : 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-primary">{attempt.score?.overall ? `Band ${attempt.score.overall}` : '-'}</span>
                      <span className="text-xs text-muted-foreground capitalize">{attempt.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
                {!attempts?.length && (
                  <p className="text-muted-foreground text-sm text-center py-4">No tests taken yet. Start one today!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Plan */}
          <div className="space-y-6">
            <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Study Plan</h3>
              <p className="text-sm text-primary-foreground/80 mb-6 relative z-10">Today's Goal: Complete 2 Reading Passages and 1 Listening Section.</p>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center"></div>
                  <span className="text-sm font-medium">Reading: Passage 1</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center"></div>
                  <span className="text-sm font-medium">Listening: Section 2</span>
                </div>
              </div>
              
              <Link href="/planner">
                <Button variant="secondary" className="w-full mt-6 text-primary hover:bg-white font-semibold">
                  View Full Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
