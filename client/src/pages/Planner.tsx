import { SidebarLayout } from "@/components/SidebarLayout";
import { useCreateStudyPlan, useStudyPlan } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Calendar as CalendarIcon, Target, ChevronRight, CheckCircle, Clock, BookOpen, Headphones, PenTool, Mic } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyTask {
  day: number;
  week: number;
  date: string;
  section: string;
  tasks: string[];
  estimatedMinutes: number;
  completed: boolean;
}

interface PlanData {
  mode: string;
  targetBand: number;
  totalDays: number;
  focusAreas: string[];
  weeklyGoals: { week: number; goal: string; focus: string }[];
  dailyTasks: DailyTask[];
  tips: string[];
}

const sectionIcons: Record<string, any> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic,
  mixed: Target,
  full_test: Clock,
  rest: CheckCircle,
};

const sectionColors: Record<string, string> = {
  listening: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  reading: "bg-green-500/10 text-green-600 dark:text-green-400",
  writing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  speaking: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  mixed: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  full_test: "bg-red-500/10 text-red-600 dark:text-red-400",
  rest: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export default function Planner() {
  const { data: currentPlan, isLoading } = useStudyPlan();
  const { mutate: createPlan, isPending } = useCreateStudyPlan();
  
  const [targetBand, setTargetBand] = useState(7);
  const [examDate, setExamDate] = useState("");

  const handleGenerate = () => {
    if (!examDate) return;
    createPlan({
      targetBand,
      examDate: new Date(examDate),
    });
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Skeleton className="h-48 w-full rounded-3xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (currentPlan) {
    const planData = currentPlan.planData as PlanData | null;
    const completedTasks = planData?.dailyTasks?.filter(t => t.completed).length || 0;
    const totalTasks = planData?.dailyTasks?.length || 1;
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);

    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 p-4">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {planData?.mode || "30-day"} Plan
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-target-band">
                Your Path to Band {currentPlan.targetBand}
              </h1>
              <p className="text-primary-foreground/80 text-lg" data-testid="text-exam-date">
                Exam Date: {format(new Date(currentPlan.examDate), 'MMMM do, yyyy')}
              </p>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-white/20" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          </div>

          {planData?.focusAreas && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {planData.focusAreas.map((area, i) => (
                  <Badge key={i} variant="secondary">{area}</Badge>
                ))}
              </div>
            </div>
          )}

          {planData?.weeklyGoals && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Weekly Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {planData.weeklyGoals.map((weekGoal) => (
                  <Card key={weekGoal.week} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {weekGoal.week}
                      </div>
                      <div>
                        <h3 className="font-semibold">{weekGoal.goal}</h3>
                        <p className="text-sm text-muted-foreground">{weekGoal.focus}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Daily Schedule</h2>
            <div className="space-y-3">
              {planData?.dailyTasks?.slice(0, 14).map((task) => {
                const Icon = sectionIcons[task.section] || Target;
                const colorClass = sectionColors[task.section] || sectionColors.mixed;
                
                return (
                  <Card 
                    key={task.day} 
                    className={cn(
                      "p-4 transition-all",
                      task.completed && "opacity-60"
                    )}
                    data-testid={`card-day-${task.day}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Day {task.day}</span>
                            <span className="text-sm text-muted-foreground">{task.date}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.estimatedMinutes} min
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.tasks.map((t, i) => (
                            <span key={i} className="text-sm px-2 py-1 bg-secondary rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {task.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {planData?.dailyTasks && planData.dailyTasks.length > 14 && (
              <div className="text-center mt-4">
                <Button variant="outline" data-testid="button-show-more-days">
                  Show All {planData.dailyTasks.length} Days
                </Button>
              </div>
            )}
          </div>

          {planData?.tips && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-3">Study Tips</h2>
              <ul className="space-y-2">
                {planData.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                if (confirm("Create a new study plan? This will replace your current plan.")) {
                  window.location.reload();
                }
              }}
              data-testid="button-create-new-plan"
            >
              Create New Plan
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold" data-testid="text-create-plan-title">Create Your Study Plan</h1>
            <p className="text-muted-foreground mt-2">Let AI design your roadmap to success.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Band Score</label>
              <div className="flex justify-between gap-2">
                {[6, 6.5, 7, 7.5, 8, 8.5].map((band) => (
                  <button
                    key={band}
                    onClick={() => setTargetBand(band)}
                    data-testid={`button-band-${band}`}
                    className={cn(
                      "flex-1 py-3 rounded-xl border transition-all text-sm font-bold",
                      targetBand === band 
                        ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105" 
                        : "bg-background hover-elevate border-border"
                    )}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exam Date</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-exam-date"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Plan mode: {examDate && Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 15 ? "15-day intensive" : "30-day comprehensive"}
              </p>
            </div>

            <Button 
              className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20" 
              onClick={handleGenerate}
              disabled={!examDate || isPending}
              data-testid="button-generate-plan"
            >
              {isPending ? "Generating Plan..." : "Generate My Plan"}
            </Button>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
