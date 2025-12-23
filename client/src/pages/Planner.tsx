import { SidebarLayout } from "@/components/SidebarLayout";
import { useCreateStudyPlan, useStudyPlan } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Calendar as CalendarIcon, Target, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Planner() {
  const { data: currentPlan, isLoading } = useStudyPlan();
  const { mutate: createPlan, isPending } = useCreateStudyPlan();
  
  const [step, setStep] = useState(1);
  const [targetBand, setTargetBand] = useState(7);
  const [examDate, setExamDate] = useState("");

  const handleGenerate = () => {
    createPlan({
      userId: "current", // Backend handles user context
      targetBand,
      examDate: new Date(examDate),
      planData: {} // Backend generates this
    });
  };

  if (currentPlan) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
           <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
             <div className="relative z-10">
               <h1 className="text-3xl font-bold mb-4">Your Path to Band {currentPlan.targetBand}</h1>
               <p className="text-primary-foreground/80 text-lg">Exam Date: {format(new Date(currentPlan.examDate), 'MMMM do, yyyy')}</p>
             </div>
             {/* Decorative Background Circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
           </div>

           <div className="grid gap-6">
             {/* Placeholder for Plan Timeline - Would map over planData JSON */}
             <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">1</div>
                 <div className="w-0.5 h-full bg-border my-2"></div>
               </div>
               <div className="pb-8">
                 <h3 className="font-bold text-lg mb-1">Week 1: Foundations</h3>
                 <p className="text-muted-foreground">Focus on understanding test format and initial diagnostics.</p>
                 <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium">Listening Test 1</span>
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium">Reading Passage 1</span>
                 </div>
               </div>
             </div>

             <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex gap-4 opacity-50">
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">2</div>
                 <div className="w-0.5 h-full bg-border my-2"></div>
               </div>
               <div>
                 <h3 className="font-bold text-lg mb-1">Week 2: Writing Intensity</h3>
                 <p className="text-muted-foreground">Deep dive into Task 1 letters and Task 2 essays.</p>
               </div>
             </div>
           </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Create Your Study Plan</h1>
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
                    className={cn(
                      "flex-1 py-3 rounded-xl border transition-all text-sm font-bold",
                      targetBand === band 
                        ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105" 
                        : "bg-background hover:bg-muted border-border"
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
               />
            </div>

            <Button 
              className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20" 
              onClick={handleGenerate}
              disabled={!examDate || isPending}
            >
              {isPending ? "Generating Plan..." : "Generate My Plan"}
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
