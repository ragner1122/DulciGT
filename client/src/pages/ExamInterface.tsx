import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useTimer } from "react-timer-hook";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Clock, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Save, Loader2, Trophy, XCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAttempt, useSubmitAnswer, useCompleteAttempt } from "@/hooks/use-attempts";
import type { Question, Passage } from "@shared/routes";

const DEFAULT_TEST_DURATION_MINUTES = 60;

type SectionType = "reading" | "listening" | "writing" | "speaking";

interface SectionInfo {
  name: SectionType;
  questions: Question[];
  passage?: Passage;
}

export default function ExamInterface() {
  const [match, params] = useRoute("/exam/:attemptId");
  const attemptId = params?.attemptId ? parseInt(params.attemptId) : 0;
  const [, navigate] = useLocation();

  const { data: attemptData, isLoading, error } = useAttempt(attemptId);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { mutate: submitAnswer } = useSubmitAnswer();
  const { mutate: completeAttempt, isPending: isCompleting } = useCompleteAttempt();

  const getExpiryTime = useCallback(() => {
    if (!attemptData?.startedAt) {
      const time = new Date();
      time.setSeconds(time.getSeconds() + DEFAULT_TEST_DURATION_MINUTES * 60);
      return time;
    }
    const startedAt = new Date(attemptData.startedAt);
    const durationMinutes = DEFAULT_TEST_DURATION_MINUTES;
    const expiryTime = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    if (expiryTime <= new Date()) {
      return new Date(Date.now() + 1000);
    }
    return expiryTime;
  }, [attemptData?.startedAt]);

  const { seconds, minutes, hours, restart } = useTimer({
    expiryTimestamp: getExpiryTime(),
    onExpire: () => handleFinishExam(),
    autoStart: false,
  });

  useEffect(() => {
    if (attemptData?.startedAt && attemptData.status === "in_progress") {
      restart(getExpiryTime(), true);
    }
  }, [attemptData?.startedAt, attemptData?.status, getExpiryTime, restart]);

  useEffect(() => {
    if (attemptData?.answers) {
      const existingAnswers: Record<number, any> = {};
      for (const ans of attemptData.answers) {
        if (ans.questionId && ans.answer !== null) {
          existingAnswers[ans.questionId] = ans.answer;
        }
      }
      setAnswers(existingAnswers);
    }
  }, [attemptData?.answers]);

  useEffect(() => {
    if (attemptData?.status === "completed") {
      setShowResults(true);
    }
  }, [attemptData?.status]);

  const sections: SectionInfo[] = [];
  if (attemptData?.test?.questions) {
    const questionsBySection = new Map<SectionType, Question[]>();

    for (const q of attemptData.test.questions) {
      const section = q.section as SectionType;
      if (!questionsBySection.has(section)) {
        questionsBySection.set(section, []);
      }
      questionsBySection.get(section)!.push(q);
    }

    for (const [sectionName, sectionQuestions] of questionsBySection) {
      const passage = attemptData.passages?.find(p =>
        sectionQuestions.some(q => q.passageId === p.id)
      );
      sections.push({ name: sectionName, questions: sectionQuestions, passage });
    }
  }

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const allQuestions = sections.flatMap(s => s.questions);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = allQuestions.length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  const handleAnswerChange = useCallback((qId: number, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      submitAnswer(
        { attemptId, questionId: qId, answer: val },
        {
          onSuccess: () => setIsSaving(false),
          onError: () => setIsSaving(false),
        }
      );
    }, 500);
  }, [attemptId, submitAnswer]);

  const handleFinishExam = useCallback(() => {
    completeAttempt(attemptId, {
      onSuccess: () => {
        setShowResults(true);
      },
    });
  }, [attemptId, completeAttempt]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentSection?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(sections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const calculateScore = () => {
    if (!attemptData?.test?.questions) return { correct: 0, total: 0, bandScore: 0 };

    let correct = 0;
    const questions = attemptData.test.questions;

    for (const q of questions) {
      const userAnswer = answers[q.id];
      if (userAnswer && q.correctAnswer) {
        const correctStr = typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer);
        const userStr = typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer);
        if (correctStr.toLowerCase() === userStr.toLowerCase()) {
          correct++;
        }
      }
    }

    const total = questions.length;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    let bandScore = 4.0;
    if (percentage >= 90) bandScore = 9.0;
    else if (percentage >= 80) bandScore = 8.5;
    else if (percentage >= 70) bandScore = 8.0;
    else if (percentage >= 65) bandScore = 7.5;
    else if (percentage >= 60) bandScore = 7.0;
    else if (percentage >= 55) bandScore = 6.5;
    else if (percentage >= 50) bandScore = 6.0;
    else if (percentage >= 45) bandScore = 5.5;
    else if (percentage >= 40) bandScore = 5.0;
    else if (percentage >= 35) bandScore = 4.5;

    return { correct, total, bandScore };
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load exam</h2>
        <p className="text-muted-foreground">The exam attempt could not be found or you don't have access.</p>
        <Button onClick={() => navigate("/tests")} data-testid="button-back-to-tests">
          Back to Tests
        </Button>
      </div>
    );
  }

  if (showResults) {
    const scoreData = calculateScore();
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Exam Completed</CardTitle>
              <p className="text-muted-foreground">{attemptData.test?.title || "Practice Test"}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-foreground">{scoreData.correct}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-foreground">{scoreData.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="p-4 rounded-lg bg-accent/10">
                  <div className="text-3xl font-bold text-accent">{scoreData.bandScore}</div>
                  <div className="text-sm text-muted-foreground">Band Score</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>{scoreData.total > 0 ? Math.round((scoreData.correct / scoreData.total) * 100) : 0}%</span>
                </div>
                <Progress value={(scoreData.correct / scoreData.total) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Answer Review</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {attemptData.test?.questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const correctAnswer = q.correctAnswer;
                    const isCorrect = userAnswer && correctAnswer &&
                      (typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer)).toLowerCase() ===
                      (typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer)).toLowerCase();

                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "p-3 rounded-md border text-sm flex items-start gap-3",
                          isCorrect ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"
                        )}
                        data-testid={`result-question-${q.id}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Q{idx + 1}: {q.content}</p>
                          <p className="text-muted-foreground">
                            Your answer: {userAnswer ? String(userAnswer) : "(no answer)"}
                          </p>
                          {!isCorrect && correctAnswer && (
                            <p className="text-green-600 dark:text-green-400">
                              Correct: {typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/tests")} data-testid="button-back-to-tests">
                  Back to Tests
                </Button>
                <Button className="flex-1" onClick={() => navigate("/dashboard")} data-testid="button-go-to-dashboard">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasPassage = currentSection?.passage?.content;
  const passageContent = currentSection?.passage?.content || `<p class="text-muted-foreground italic">No passage available for this section.</p>`;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans selection:bg-accent/20">
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between gap-4 z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="font-bold text-lg" data-testid="text-test-title">
            {attemptData.test?.title || "Practice Test"}
          </div>
          {sections.length > 1 && (
            <div className="flex gap-1">
              {sections.map((sec, idx) => (
                <Button
                  key={sec.name}
                  variant={currentSectionIndex === idx ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentSectionIndex(idx);
                    setCurrentQuestionIndex(0);
                  }}
                  data-testid={`button-section-${sec.name}`}
                >
                  {sec.name.charAt(0).toUpperCase() + sec.name.slice(1)}
                </Button>
              ))}
            </div>
          )}
          {currentSection && (
            <Badge variant="secondary" data-testid="badge-current-section">
              {currentSection.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{answeredCount}/{totalQuestions}</span>
          </div>
          <div
            className="flex items-center gap-2 text-xl font-mono font-medium text-foreground bg-secondary/50 px-4 py-1.5 rounded-lg border border-border"
            data-testid="text-timer"
          >
            <Clock className="w-5 h-5 text-accent" />
            <span>{formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}</span>
          </div>
          <Button
            onClick={handleFinishExam}
            disabled={isCompleting}
            data-testid="button-finish-exam"
          >
            {isCompleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Finish Exam
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={25}>
            <div className="h-full overflow-y-auto p-8 bg-background">
              <div className="max-w-2xl mx-auto">
                {currentSection?.passage?.title && (
                  <h2 className="text-xl font-semibold mb-4">{currentSection.passage.title}</h2>
                )}
                <div
                  className="prose prose-lg dark:prose-invert font-serif text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: passageContent }}
                  data-testid="text-passage-content"
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-accent/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-8 bg-muted-foreground/20 rounded-full" />
          </PanelResizeHandle>

          <Panel minSize={30}>
            <div className="h-full flex flex-col bg-muted/20">
              <div className="p-4 bg-card border-b border-border flex gap-2 overflow-x-auto">
                {currentSection?.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-all border",
                      currentQuestionIndex === idx
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : answers[q.id]
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "bg-background text-muted-foreground border-border"
                    )}
                    data-testid={`button-question-${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                {currentQuestion ? (
                  <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <h3 className="text-xl font-medium leading-relaxed" data-testid="text-question-content">
                        {currentQuestion.content}
                      </h3>

                      {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'sentence_completion') && (
                        <input
                          type="text"
                          className="w-full p-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-lg"
                          placeholder="Type your answer here..."
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          data-testid="input-short-answer"
                        />
                      )}

                      {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false_not_given') && (
                        <div className="space-y-3">
                          {(currentQuestion.options as string[] || []).map((opt) => (
                            <label
                              key={opt}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                answers[currentQuestion.id] === opt
                                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                                  : "border-border bg-card"
                              )}
                              data-testid={`option-${opt}`}
                            >
                              <input
                                type="radio"
                                name={`q-${currentQuestion.id}`}
                                value={opt}
                                checked={answers[currentQuestion.id] === opt}
                                onChange={() => handleAnswerChange(currentQuestion.id, opt)}
                                className="w-5 h-5 text-accent border-gray-300 focus:ring-accent"
                              />
                              <span className="text-lg">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(currentQuestion.type === 'essay' || currentQuestion.type === 'letter') && (
                        <textarea
                          className="w-full p-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-base min-h-[200px] resize-y"
                          placeholder="Write your response here..."
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          data-testid="textarea-essay"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No questions available
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-card flex justify-between items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" /> Auto-saved
                    </>
                  )}
                </div>

                <Button
                  onClick={handleNextQuestion}
                  disabled={
                    currentSectionIndex === sections.length - 1 &&
                    currentQuestionIndex === (currentSection?.questions.length || 0) - 1
                  }
                  data-testid="button-next"
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
