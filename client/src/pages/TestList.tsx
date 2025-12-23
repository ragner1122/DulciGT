import { SidebarLayout } from "@/components/SidebarLayout";
import { useTests } from "@/hooks/use-tests";
import { useCreateAttempt } from "@/hooks/use-attempts";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function TestList() {
  const { data: tests, isLoading } = useTests();
  const { mutate: createAttempt, isPending } = useCreateAttempt();
  const [, setLocation] = useLocation();

  const handleStartTest = (testId: number) => {
    createAttempt(
      { testId, status: "in_progress" },
      {
        onSuccess: (attempt) => {
          setLocation(`/tests/${attempt.id}`); // Navigate to attempt interface, NOT test ID directly
        },
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mock Tests</h1>
        <p className="text-muted-foreground mt-1">Select a test to begin your simulation.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests?.map((test) => (
            <div 
              key={test.id} 
              className="group bg-card border border-border hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-24 h-24 text-primary" />
              </div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                
                <h3 className="font-bold text-lg mb-1">{test.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2h 45m</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 4 Sections</span>
                </div>

                <Button 
                  onClick={() => handleStartTest(test.id)}
                  disabled={isPending}
                  className="w-full bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/10"
                >
                  {isPending ? "Starting..." : "Start Test"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}
