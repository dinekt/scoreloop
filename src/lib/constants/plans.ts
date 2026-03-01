// プラン定数

export const PLAN_LIMITS = {
  FREE: {
    maxRoundsPerMonth: 2,
    maxAnalysisPerMonth: 2,
    hasAIReport: false,
    hasPracticeLog: false,
    hasTrainingPlan: false,
    hasLoopDashboard: false,
    hasCourseStrategy: false,
    hasDataExport: false,
  },
  STANDARD: {
    maxRoundsPerMonth: Infinity,
    maxAnalysisPerMonth: Infinity,
    hasAIReport: true,
    hasPracticeLog: true,
    hasTrainingPlan: false,
    hasLoopDashboard: false,
    hasCourseStrategy: false,
    hasDataExport: false,
  },
  PRO: {
    maxRoundsPerMonth: Infinity,
    maxAnalysisPerMonth: Infinity,
    hasAIReport: true,
    hasPracticeLog: true,
    hasTrainingPlan: true,
    hasLoopDashboard: true,
    hasCourseStrategy: true,
    hasDataExport: true,
  },
} as const;

export const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  STANDARD: "Standard",
  PRO: "Pro",
};

export const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  STANDARD: 1280,
  PRO: 2480,
};
