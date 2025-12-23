import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Globe, BookOpen } from "lucide-react";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard"); // Redirect to actual dashboard page if logged in
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-accent" />
          <span className="font-bold text-xl tracking-tight text-primary">IELTS SmartPrep</span>
        </div>
        <div className="flex gap-4">
          <a href="/api/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Log In</a>
          <a href="/api/login" className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Get Started</a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-primary leading-[1.1]">
              Master IELTS <span className="text-accent">General Training</span> with AI
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
              SmartPrep intelligently adapts to your weaknesses. Practice Reading, Writing, Listening, and Speaking with real-time AI feedback and scoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg">
                View Demo
              </Button>
            </div>
            <div className="pt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> AI Scoring</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Real Exam Mode</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Personalized Plan</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/5 rounded-3xl blur-3xl -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80" 
              alt="Student studying with laptop" 
              className="rounded-2xl shadow-2xl border border-white/50 w-full object-cover aspect-[4/3]"
            />
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-card p-6 rounded-xl shadow-xl border border-border hidden md:block max-w-xs animate-in slide-in-from-bottom duration-700 delay-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-700"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold text-foreground">Writing Task 1</p>
                  <p className="text-xs text-muted-foreground">Just completed</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%]" />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Score</span>
                  <span className="text-green-600">Band 7.5</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-secondary/30 py-24 px-6 border-y border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-4">Everything you need to jump a band score</h2>
              <p className="text-muted-foreground">Comprehensive tools designed specifically for the General Training module.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Mock Tests", desc: "Full-length simulations with strict timing.", icon: BookOpen },
                { title: "AI Feedback", desc: "Instant grading for writing essays and letters.", icon: BrainCircuit },
                { title: "Study Planner", desc: "Dynamic schedule based on your exam date.", icon: Target },
              ].map((f, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6">
                    {/* Placeholder icon rendering */}
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 px-6 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2024 IELTS SmartPrep. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
