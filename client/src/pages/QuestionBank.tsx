import { SidebarLayout } from "@/components/SidebarLayout";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionBank() {
  const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);
  const { data: questions, isLoading } = useQuestions({ section: sectionFilter });

  return (
    <SidebarLayout>
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Practice individual questions by type or skill.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search questions..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 w-64"
            />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {["All", "Reading", "Listening", "Writing", "Speaking"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSectionFilter(tab === "All" ? undefined : tab.toLowerCase())}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              (tab === "All" && !sectionFilter) || (sectionFilter === tab.toLowerCase())
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
        ) : (
          questions?.map((q) => (
            <div key={q.id} className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-bold uppercase">{q.section}</span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium capitalize">{q.type.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-medium text-lg leading-relaxed">{q.content.length > 100 ? q.content.substring(0, 100) + '...' : q.content}</h3>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0">Practice</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
}
