"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HoleInputRow } from "./HoleInputRow";
import { DEFAULT_PAR, WEATHER_LABELS, WIND_LABELS } from "@/lib/constants/golf";
import { calculateRoundStats } from "@/lib/utils/golf-stats";
import type { HoleInput, RoundInput, Weather, WindLevel } from "@/types/round";
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";

const STORAGE_KEY = "scoreloop_round_draft";

function createDefaultHoles(): HoleInput[] {
  return Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: DEFAULT_PAR[i],
    score: DEFAULT_PAR[i],
    putts: 2,
    fairway: null,
    greenInRegulation: false,
    penalty: 0,
    missType: null,
    missDetail: null,
    clubUsed: null,
    approachDistance: null,
    approachClub: null,
  }));
}

export function RoundInputForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Step 1: 基本情報
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [courseName, setCourseName] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [wind, setWind] = useState<WindLevel | null>(null);
  const [temperature, setTemperature] = useState<string>("");

  // Step 2: ホールデータ
  const [holes, setHoles] = useState<HoleInput[]>(createDefaultHoles);

  // Step 3: メモ
  const [memo, setMemo] = useState("");

  // localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.playedAt) setPlayedAt(data.playedAt);
        if (data.courseName) setCourseName(data.courseName);
        if (data.weather) setWeather(data.weather);
        if (data.wind) setWind(data.wind);
        if (data.temperature) setTemperature(data.temperature);
        if (data.holes) setHoles(data.holes);
        if (data.memo) setMemo(data.memo);
        if (data.step) setStep(data.step);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // localStorage に自動保存
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ playedAt, courseName, weather, wind, temperature, holes, memo, step })
      );
    } catch {
      // ignore quota errors
    }
  }, [playedAt, courseName, weather, wind, temperature, holes, memo, step]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  const updateHole = (index: number, hole: HoleInput) => {
    setHoles((prev) => {
      const next = [...prev];
      next[index] = hole;
      return next;
    });
  };

  const stats = calculateRoundStats(holes);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const roundData: RoundInput = {
      playedAt,
      courseName,
      weather,
      wind,
      temperature: temperature ? parseFloat(temperature) : null,
      memo: memo || null,
      holes,
    };

    try {
      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roundData),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "保存に失敗しました");
        setSubmitting(false);
        return;
      }

      // 下書きクリア
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/rounds/${json.data.id}`);
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* ステップインジケーター */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              s === step
                ? "bg-primary text-primary-foreground"
                : s < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: 基本情報 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playedAt">プレー日</Label>
              <Input
                id="playedAt"
                type="date"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">コース名</Label>
              <Input
                id="courseName"
                placeholder="例: 太平洋クラブ御殿場"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>天候</Label>
                <Select
                  value={weather || "NONE"}
                  onValueChange={(v) =>
                    setWeather(v === "NONE" ? null : (v as Weather))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {Object.entries(WEATHER_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>風</Label>
                <Select
                  value={wind || "NONE"}
                  onValueChange={(v) =>
                    setWind(v === "NONE" ? null : (v as WindLevel))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {Object.entries(WIND_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">気温 (°C)</Label>
              <Input
                id="temperature"
                type="number"
                placeholder="例: 22"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!courseName}>
                次へ <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: スコア入力 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">スコア入力</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="h-4 w-4"
              />
              詳細入力
            </label>
          </div>

          {/* スコアサマリー */}
          <Card>
            <CardContent className="flex items-center justify-around py-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">OUT</p>
                <p className="text-xl font-bold">{stats.outScore ?? "-"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">IN</p>
                <p className="text-xl font-bold">{stats.inScore ?? "-"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">TOTAL</p>
                <p className="text-2xl font-bold">{stats.totalScore}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">パット</p>
                <p className="text-xl font-bold">{stats.totalPutts}</p>
              </div>
            </CardContent>
          </Card>

          {/* OUT (1-9) */}
          <h3 className="font-semibold text-muted-foreground">OUT (1-9)</h3>
          {holes.slice(0, 9).map((hole, i) => (
            <HoleInputRow
              key={hole.holeNumber}
              hole={hole}
              onChange={(h) => updateHole(i, h)}
              showAdvanced={showAdvanced}
            />
          ))}

          {/* IN (10-18) */}
          <h3 className="font-semibold text-muted-foreground">IN (10-18)</h3>
          {holes.slice(9, 18).map((hole, i) => (
            <HoleInputRow
              key={hole.holeNumber}
              hole={hole}
              onChange={(h) => updateHole(i + 9, h)}
              showAdvanced={showAdvanced}
            />
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> 戻る
            </Button>
            <Button onClick={() => setStep(3)}>
              次へ <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: メモ */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>全体メモ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="今日のラウンドの感想、気づいたことなど..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={6}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> 戻る
              </Button>
              <Button onClick={() => setStep(4)}>
                確認へ <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: 確認 */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>入力内容の確認</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">プレー日</p>
                <p className="font-medium">{playedAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground">コース</p>
                <p className="font-medium">{courseName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">天候</p>
                <p className="font-medium">
                  {weather ? WEATHER_LABELS[weather] : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">風</p>
                <p className="font-medium">
                  {wind ? WIND_LABELS[wind] : "-"}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">OUT</p>
                  <p className="text-xl font-bold">{stats.outScore ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IN</p>
                  <p className="text-xl font-bold">{stats.inScore ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TOTAL</p>
                  <p className="text-2xl font-bold">{stats.totalScore}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">パット</p>
                  <p className="text-xl font-bold">{stats.totalPutts}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">FWキープ</p>
                  <p className="font-medium">
                    {stats.fairwayHit}/{stats.fairwayTotal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">パーオン</p>
                  <p className="font-medium">{stats.girCount}/18</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ペナルティ</p>
                  <p className="font-medium">{stats.penaltyCount}</p>
                </div>
              </div>
            </div>

            {memo && (
              <div>
                <p className="text-sm text-muted-foreground">メモ</p>
                <p className="text-sm">{memo}</p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> 戻る
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    保存する
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
