import type {
  Round as PrismaRound,
  HoleData as PrismaHoleData,
  Weather,
  WindLevel,
  FairwayResult,
  MissType,
} from "@prisma/client";

export type { Weather, WindLevel, FairwayResult, MissType };

export type Round = PrismaRound;
export type HoleData = PrismaHoleData;

export type RoundWithHoles = Round & {
  holes: HoleData[];
};

export type RoundSummary = Pick<
  Round,
  | "id"
  | "playedAt"
  | "courseName"
  | "totalScore"
  | "outScore"
  | "inScore"
  | "totalPutts"
  | "fairwayHit"
  | "fairwayTotal"
  | "girCount"
  | "penaltyCount"
>;

export type HoleInput = {
  holeNumber: number;
  par: number;
  score: number;
  putts: number;
  fairway?: FairwayResult | null;
  greenInRegulation: boolean;
  penalty: number;
  missType?: MissType | null;
  missDetail?: string | null;
  clubUsed?: string | null;
  approachDistance?: number | null;
  approachClub?: string | null;
};

export type RoundInput = {
  playedAt: string;
  courseName: string;
  courseRating?: number | null;
  slopeRating?: number | null;
  weather?: Weather | null;
  wind?: WindLevel | null;
  temperature?: number | null;
  memo?: string | null;
  holes: HoleInput[];
};
