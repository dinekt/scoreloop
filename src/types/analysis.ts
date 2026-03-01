import type {
  AnalysisReport as PrismaAnalysisReport,
  TrainingPlan as PrismaTrainingPlan,
  ReportType,
} from "@prisma/client";

export type { ReportType };

export type AnalysisReport = PrismaAnalysisReport;
export type TrainingPlan = PrismaTrainingPlan;

// AI分析結果の構造化型
export type ScoreBreakdownItem = {
  rating: number; // 1-5
  comment: string;
};

export type ScoreLossItem = {
  category: string;
  lostStrokes: number;
  percentage: number;
  detail: string;
};

export type PracticeCorrelation = {
  practice: string;
  roundImpact: string;
  confidence: "high" | "medium" | "low";
};

export type RoundAnalysisContent = {
  overallAssessment: string;
  scoreBreakdown: {
    teeShot: ScoreBreakdownItem;
    approach: ScoreBreakdownItem;
    shortGame: ScoreBreakdownItem;
    putting: ScoreBreakdownItem;
    courseManagement: ScoreBreakdownItem;
  };
  scoreLossAnalysis: ScoreLossItem[];
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
  practiceImpact: {
    observed: string;
    correlations: PracticeCorrelation[];
  };
  improvementPlan: {
    primaryFocus: {
      area: string;
      currentLevel: string;
      targetLevel: string;
      expectedImpact: string;
      specificDrills: string[];
    };
    secondaryFocus: {
      area: string;
      specificDrills: string[];
    };
    nextRoundStrategy: string;
  };
  motivationalComment: string;
};

export type TrainingPlanContent = {
  weeklyGoal: string;
  focusAreas: {
    area: string;
    priority: number;
    timeAllocation: number;
    reason: string;
  }[];
  sessions: {
    dayOfWeek: string;
    sessionType: string;
    durationMin: number;
    warmup: string;
    mainDrills: {
      drill: string;
      category: string;
      description: string;
      ballCount?: number;
      durationMin: number;
      successCriteria: string;
      tips: string;
    }[];
    cooldown: string;
  }[];
  weeklyCheckpoint: string;
  connectionToNextRound: string;
};
