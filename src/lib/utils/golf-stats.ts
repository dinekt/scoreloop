import type { HoleInput } from "@/types/round";

export function calculateRoundStats(holes: HoleInput[]) {
  const outHoles = holes.filter((h) => h.holeNumber <= 9);
  const inHoles = holes.filter((h) => h.holeNumber > 9);

  const totalScore = holes.reduce((sum, h) => sum + h.score, 0);
  const outScore = outHoles.length > 0 ? outHoles.reduce((sum, h) => sum + h.score, 0) : null;
  const inScore = inHoles.length > 0 ? inHoles.reduce((sum, h) => sum + h.score, 0) : null;
  const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0);

  // FW: Par3以外のホールのみ対象
  const fwHoles = holes.filter((h) => h.par !== 3);
  const fairwayTotal = fwHoles.length;
  const fairwayHit = fwHoles.filter((h) => h.fairway === "HIT").length;

  const girCount = holes.filter((h) => h.greenInRegulation).length;
  const penaltyCount = holes.reduce((sum, h) => sum + h.penalty, 0);

  return {
    totalScore,
    outScore,
    inScore,
    totalPutts,
    fairwayHit,
    fairwayTotal,
    girCount,
    penaltyCount,
  };
}

export function scoreToPar(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "Par";
  if (diff === -1) return "Birdie";
  if (diff === -2) return "Eagle";
  if (diff <= -3) return "Albatross";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  if (diff === 3) return "Triple";
  return `+${diff}`;
}

export function scoreToParClass(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -2) return "text-yellow-600 font-bold";
  if (diff === -1) return "text-red-500 font-semibold";
  if (diff === 0) return "text-foreground";
  if (diff === 1) return "text-blue-500";
  if (diff === 2) return "text-blue-700";
  return "text-blue-900 font-semibold";
}
