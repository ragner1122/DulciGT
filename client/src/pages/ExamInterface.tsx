import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useTimer } from "react-timer-hook";
import { Layout, Split, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Clock, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTests, useTest } from "@/hooks/use-tests";
import { useSubmitAnswer, useCompleteAttempt } from "@/hooks/use-attempts";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Mock passage for UI dev since DB might be empty initially
const DEMO_PASSAGE = `
  <h2>The History of Tea</h2>
  <p>The story of tea begins in China. According to legend, in 2737 BC, the Chinese emperor Shen Nung was sitting beneath a tree while his servant boiled drinking water, when some leaves from the tree blew into the water. Shen Nung, a renowned herbalist, decided to try the infusion that his servant had accidentally created. The tree was a Camellia sinensis, and the resulting drink was what we now call tea.</p>
  <p>Containers for tea have been found in tombs dating from the Han dynasty (206 BC – 220 AD) but it was under the Tang dynasty (618-906 AD), that tea became firmly established as the national drink of China. It became such a favourite that during the late eighth century a writer called Lu Yu wrote the first book entirely about tea, the Ch'a Ching, or Tea Classic. It was shortly after this that tea was first introduced to Japan, by Japanese Buddhist monks who had travelled to China to study.</p>
`;

export default function ExamInterface() {
  // Route /tests/:attemptId - NOTE: This accepts ATTEMPT ID, but we usually need to fetch the Test data too
  // For simplicity in this demo, we assume the backend endpoint for attempts returns the test structure too, or we chain requests.
  // Here assuming simpler logic for UI demonstration.
  const [match, params] = useRoute("/tests/:id");
  const attemptId = params?.id ? parseInt(params.id) : 0;
  
  // State
  const [currentSection, setCurrentSection] = useState<"reading" | "listening" | "writing" | "speaking">("reading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  
  const { mutate: submitAnswer } = useSubmitAnswer();
  const { mutate: completeAttempt } = useCompleteAttempt();

  // Timer setup (2 hours 45 mins default)
  const time = new Date();
  time.setSeconds(time.getSeconds() + 9900); 
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp: time, onExpire: () => console.warn("Time's up") });

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  // Question navigation
  const questions = [
    { id: 1, text: "When did tea become the national drink of China?", type: "short_answer" },
    { id: 2, text: "Who wrote the 'Tea Classic'?", type: "multiple_choice", options: ["Shen Nung", "Lu Yu", "Confucius"] },
    { id: 3, text: "Tea was introduced to Japan by:", type: "multiple_choice", options: ["Emperors", "Merchants", "Buddhist Monks"] },
  ];

  const handleAnswerChange = (qId: number, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    // Auto-save logic (debounced in real app)
    submitAnswer({ attemptId, questionId: qId, answer: val });
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans selection:bg-accent/20">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg text-primary">IELTS GT Mock #102</div>
          <div className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-md">
            {currentSection}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-mono font-medium text-foreground bg-secondary/50 px-4 py-1.5 rounded-lg border border-border">
            <Clock className="w-5 h-5 text-accent" />
            <span>{formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}</span>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={() => completeAttempt(attemptId)}
          >
            Finish Exam
          </Button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: Passage / Source Material */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full overflow-y-auto p-8 bg-background">
              <div className="max-w-2xl mx-auto">
                <div 
                  className="prose prose-lg dark:prose-invert font-serif text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: DEMO_PASSAGE }} 
                />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-accent/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-8 bg-muted-foreground/20 rounded-full" />
          </PanelResizeHandle>

          {/* Right Panel: Questions */}
          <Panel minSize={30}>
            <div className="h-full flex flex-col bg-muted/20">
              {/* Question Navigation Bar */}
              <div className="p-4 bg-card border-b border-border flex gap-2 overflow-x-auto">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-all border",
                      currentQuestionIndex === idx 
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : answers[q.id] 
                          ? "bg-accent/10 text-accent border-accent/20" 
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Active Question Area */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
                    <h3 className="text-xl font-medium leading-relaxed">{questions[currentQuestionIndex].text}</h3>
                    
                    {/* Dynamic Input based on type */}
                    {questions[currentQuestionIndex].type === 'short_answer' && (
                      <input 
                        type="text" 
                        className="w-full p-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-lg"
                        placeholder="Type your answer here..."
                        value={answers[questions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                      />
                    )}

                    {questions[currentQuestionIndex].type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {questions[currentQuestionIndex].options?.map((opt) => (
                          <label 
                            key={opt}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                              answers[questions[currentQuestionIndex].id] === opt 
                                ? "border-accent bg-accent/5 ring-1 ring-accent" 
                                : "border-border bg-card hover:border-primary/30"
                            )}
                          >
                            <input 
                              type="radio" 
                              name={`q-${questions[currentQuestionIndex].id}`}
                              value={opt}
                              checked={answers[questions[currentQuestionIndex].id] === opt}
                              onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, opt)}
                              className="w-5 h-5 text-accent border-gray-300 focus:ring-accent"
                            />
                            <span className="text-lg">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="p-4 border-t border-border bg-card flex justify-between items-center">
                 <Button 
                   variant="outline" 
                   onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                   disabled={currentQuestionIndex === 0}
                 >
                   <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                 </Button>
                 
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Save className="w-3 h-3" /> Auto-saving...
                 </div>

                 <Button 
                   onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                   disabled={currentQuestionIndex === questions.length - 1}
                   className="bg-primary hover:bg-primary/90"
                 >
                   Next <ChevronRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
