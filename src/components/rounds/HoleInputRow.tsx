"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FAIRWAY_LABELS, MISS_TYPE_LABELS } from "@/lib/constants/golf";
import { scoreToParClass } from "@/lib/utils/golf-stats";
import type { HoleInput, FairwayResult, MissType } from "@/types/round";

type HoleInputRowProps = {
  hole: HoleInput;
  onChange: (hole: HoleInput) => void;
  showAdvanced?: boolean;
};

export function HoleInputRow({ hole, onChange, showAdvanced = false }: HoleInputRowProps) {
  const update = (partial: Partial<HoleInput>) => {
    onChange({ ...hole, ...partial });
  };

  const isPar3 = hole.par === 3;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">
          Hole {hole.holeNumber}
        </h3>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Par</Label>
          <Select
            value={String(hole.par)}
            onValueChange={(v) => update({ par: parseInt(v) })}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* スコア */}
        <div className="space-y-1">
          <Label className="text-xs">スコア</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={hole.score || ""}
            onChange={(e) => update({ score: parseInt(e.target.value) || 0 })}
            className={cn("text-center text-lg font-bold", scoreToParClass(hole.score, hole.par))}
          />
        </div>

        {/* パット */}
        <div className="space-y-1">
          <Label className="text-xs">パット</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={hole.putts ?? ""}
            onChange={(e) => update({ putts: parseInt(e.target.value) || 0 })}
            className="text-center text-lg"
          />
        </div>

        {/* フェアウェイ（Par3以外） */}
        {!isPar3 && (
          <div className="space-y-1">
            <Label className="text-xs">フェアウェイ</Label>
            <Select
              value={hole.fairway || "NONE"}
              onValueChange={(v) =>
                update({ fairway: v === "NONE" ? null : (v as FairwayResult) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">-</SelectItem>
                {Object.entries(FAIRWAY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* GIR */}
        <div className="flex items-end space-y-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
            <input
              type="checkbox"
              checked={hole.greenInRegulation}
              onChange={(e) => update({ greenInRegulation: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm">パーオン</span>
          </label>
        </div>
      </div>

      {/* 詳細入力 */}
      {showAdvanced && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">ペナルティ</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={hole.penalty}
              onChange={(e) => update({ penalty: parseInt(e.target.value) || 0 })}
              className="text-center"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">ミスタイプ</Label>
            <Select
              value={hole.missType || "NONE"}
              onValueChange={(v) =>
                update({ missType: v === "NONE" ? null : (v as MissType) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">-</SelectItem>
                {Object.entries(MISS_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">使用クラブ</Label>
            <Input
              value={hole.clubUsed || ""}
              onChange={(e) => update({ clubUsed: e.target.value || null })}
              placeholder="1W, 7I..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
