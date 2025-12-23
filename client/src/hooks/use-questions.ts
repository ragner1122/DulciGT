import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Question, type InsertQuestion, type Test } from "@shared/routes";

export function useQuestions(filters?: { section?: string; type?: string; limit?: number }) {
  return useQuery({
    queryKey: [api.questions.list.path, filters],
    queryFn: async () => {
      const url = buildUrl(api.questions.list.path);
      const params = new URLSearchParams();
      if (filters?.section) params.append("section", filters.section);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.limit) params.append("limit", String(filters.limit));
      
      const res = await fetch(`${url}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const res = await fetch(api.questions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create question");
      return api.questions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.questions.list.path] }),
  });
}

export function useGenerateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sections: string[]; difficulty?: number }) => {
      const res = await fetch(api.questions.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate test");
      return api.questions.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tests.list.path] }),
  });
}
