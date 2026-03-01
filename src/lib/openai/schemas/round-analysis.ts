import { z } from "zod";

export const RoundAnalysisSchema = z.object({
  overallAssessment: z.string(),
  scoreBreakdown: z.object({
    teeShot: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    approach: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    shortGame: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    putting: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    courseManagement: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
  }),
  scoreLossAnalysis: z.array(
    z.object({
      category: z.string(),
      lostStrokes: z.number(),
      percentage: z.number(),
      detail: z.string(),
    })
  ),
  trends: z.object({
    improving: z.array(z.string()),
    declining: z.array(z.string()),
    stable: z.array(z.string()),
  }),
  practiceImpact: z.object({
    observed: z.string(),
    correlations: z.array(
      z.object({
        practice: z.string(),
        roundImpact: z.string(),
        confidence: z.enum(["high", "medium", "low"]),
      })
    ),
  }),
  improvementPlan: z.object({
    primaryFocus: z.object({
      area: z.string(),
      currentLevel: z.string(),
      targetLevel: z.string(),
      expectedImpact: z.string(),
      specificDrills: z.array(z.string()),
    }),
    secondaryFocus: z.object({
      area: z.string(),
      specificDrills: z.array(z.string()),
    }),
    nextRoundStrategy: z.string(),
  }),
  motivationalComment: z.string(),
});

export type RoundAnalysis = z.infer<typeof RoundAnalysisSchema>;
