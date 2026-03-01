import { z } from "zod";

export const TrainingPlanSchema = z.object({
  weeklyGoal: z.string(),
  focusAreas: z.array(
    z.object({
      area: z.string(),
      priority: z.number(),
      timeAllocation: z.number(),
      reason: z.string(),
    })
  ),
  sessions: z.array(
    z.object({
      dayOfWeek: z.string(),
      sessionType: z.string(),
      durationMin: z.number(),
      warmup: z.string(),
      mainDrills: z.array(
        z.object({
          drill: z.string(),
          category: z.string(),
          description: z.string(),
          ballCount: z.number().optional(),
          durationMin: z.number(),
          successCriteria: z.string(),
          tips: z.string(),
        })
      ),
      cooldown: z.string(),
    })
  ),
  weeklyCheckpoint: z.string(),
  connectionToNextRound: z.string(),
});

export type TrainingPlanContent = z.infer<typeof TrainingPlanSchema>;
