import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Attempt, type InsertAttempt, type AttemptWithDetails } from "@shared/routes";

export function useAttempts() {
  return useQuery({
    queryKey: [api.attempts.list.path],
    queryFn: async () => {
      const res = await fetch(api.attempts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return api.attempts.list.responses[200].parse(await res.json());
    },
  });
}

export function useAttempt(id: number) {
  return useQuery<AttemptWithDetails | null>({
    queryKey: ['/api/attempts', id],
    queryFn: async () => {
      const url = buildUrl(api.attempts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return await res.json();
    },
    enabled: !!id && id > 0,
  });
}

export function useCreateAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAttempt) => {
      const res = await fetch(api.attempts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start attempt");
      return api.attempts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.attempts.list.path] }),
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ attemptId, questionId, answer }: { attemptId: number; questionId: number; answer: any }) => {
      const url = buildUrl(api.attempts.submitAnswer.path, { id: attemptId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.attempts.submitAnswer.responses[200].parse(await res.json());
    },
  });
}

export function useCompleteAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attemptId: number) => {
      const url = buildUrl(api.attempts.complete.path, { id: attemptId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to complete attempt");
      return api.attempts.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.attempts.list.path] }),
  });
}
