"use client";

import { cn } from "@/lib/utils";
import { scoreToParClass, scoreToPar } from "@/lib/utils/golf-stats";
import { FAIRWAY_LABELS, MISS_TYPE_LABELS } from "@/lib/constants/golf";
import type { HoleData } from "@/types/round";

type ScoreCardProps = {
  holes: HoleData[];
  outScore: number | null;
  inScore: number | null;
  totalScore: number;
};

export function ScoreCard({ holes, outScore, inScore, totalScore }: ScoreCardProps) {
  const outHoles = holes.filter((h) => h.holeNumber <= 9);
  const inHoles = holes.filter((h) => h.holeNumber > 9);
  const outPar = outHoles.reduce((s, h) => s + h.par, 0);
  const inPar = inHoles.reduce((s, h) => s + h.par, 0);

  return (
    <div className="overflow-x-auto">
      {/* OUT */}
      <table className="mb-4 w-full min-w-[600px] text-center text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-1 py-2 text-left font-medium">OUT</th>
            {outHoles.map((h) => (
              <th key={h.holeNumber} className="px-1 py-2 font-medium">
                {h.holeNumber}
              </th>
            ))}
            <th className="px-2 py-2 font-bold">計</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">Par</td>
            {outHoles.map((h) => (
              <td key={h.holeNumber} className="px-1 py-1 text-xs text-muted-foreground">
                {h.par}
              </td>
            ))}
            <td className="px-2 py-1 text-xs font-medium">{outPar}</td>
          </tr>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">スコア</td>
            {outHoles.map((h) => (
              <td
                key={h.holeNumber}
                className={cn("px-1 py-1 text-base", scoreToParClass(h.score, h.par))}
              >
                {h.score}
              </td>
            ))}
            <td className="px-2 py-1 text-base font-bold">{outScore}</td>
          </tr>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">パット</td>
            {outHoles.map((h) => (
              <td key={h.holeNumber} className="px-1 py-1 text-xs">
                {h.putts}
              </td>
            ))}
            <td className="px-2 py-1 text-xs font-medium">
              {outHoles.reduce((s, h) => s + h.putts, 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* IN */}
      <table className="mb-4 w-full min-w-[600px] text-center text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-1 py-2 text-left font-medium">IN</th>
            {inHoles.map((h) => (
              <th key={h.holeNumber} className="px-1 py-2 font-medium">
                {h.holeNumber}
              </th>
            ))}
            <th className="px-2 py-2 font-bold">計</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">Par</td>
            {inHoles.map((h) => (
              <td key={h.holeNumber} className="px-1 py-1 text-xs text-muted-foreground">
                {h.par}
              </td>
            ))}
            <td className="px-2 py-1 text-xs font-medium">{inPar}</td>
          </tr>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">スコア</td>
            {inHoles.map((h) => (
              <td
                key={h.holeNumber}
                className={cn("px-1 py-1 text-base", scoreToParClass(h.score, h.par))}
              >
                {h.score}
              </td>
            ))}
            <td className="px-2 py-1 text-base font-bold">{inScore}</td>
          </tr>
          <tr className="border-b">
            <td className="px-1 py-1 text-left text-xs text-muted-foreground">パット</td>
            {inHoles.map((h) => (
              <td key={h.holeNumber} className="px-1 py-1 text-xs">
                {h.putts}
              </td>
            ))}
            <td className="px-2 py-1 text-xs font-medium">
              {inHoles.reduce((s, h) => s + h.putts, 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* トータル */}
      <div className="flex items-center justify-end gap-4 rounded-lg bg-muted p-3">
        <span className="text-sm text-muted-foreground">TOTAL</span>
        <span className="text-3xl font-bold">{totalScore}</span>
        <span className="text-sm text-muted-foreground">
          ({outPar + inPar}+{totalScore - (outPar + inPar)})
        </span>
      </div>
    </div>
  );
}
