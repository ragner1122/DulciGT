import { SidebarLayout } from "@/components/SidebarLayout";
import { Keyboard, BookOpen, Mic } from "lucide-react";

const DRILLS = [
  {
    title: "Typing Speed Trainer",
    desc: "Improve your typing speed for the Computer-delivered IELTS Writing tasks.",
    icon: Keyboard,
    color: "bg-blue-500",
    href: "/lab/typing"
  },
  {
    title: "Reading Drills",
    desc: "Practice specific question types like Matching Headings or T/F/NG.",
    icon: BookOpen,
    color: "bg-green-500",
    href: "/lab/reading"
  },
  {
    title: "Speaking Simulator",
    desc: "Simulate a live examiner interview with AI-driven prompts and recording.",
    icon: Mic,
    color: "bg-purple-500",
    href: "/lab/speaking"
  }
];

export default function TrainingLab() {
  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Training Lab</h1>
          <p className="text-muted-foreground text-lg">Targeted drills to improve specific skills in isolation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {DRILLS.map((drill) => (
            <div 
              key={drill.title} 
              className="group relative bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${drill.color} opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500`} />
              
              <div className={`w-14 h-14 ${drill.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${drill.color}/20`}>
                <drill.icon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold mb-3">{drill.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{drill.desc}</p>
              
              <div className="font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                Start Drill <span className="text-xl">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
