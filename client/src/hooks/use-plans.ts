import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StudyPlan, type InsertPlan } from "@shared/routes";

export function useStudyPlan() {
  return useQuery({
    queryKey: [api.plans.get.path],
    queryFn: async () => {
      const res = await fetch(api.plans.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch study plan");
      return api.plans.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlan) => {
      // Need to cast date to string for JSON serialization if it's a Date object
      const payload = {
        ...data,
        examDate: data.examDate instanceof Date ? data.examDate.toISOString() : data.examDate,
      };
      
      const res = await fetch(api.plans.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create study plan");
      return api.plans.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.plans.get.path] }),
  });
}
