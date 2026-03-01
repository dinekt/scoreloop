"use client";

import { useState } from "react";
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
import {
  PRACTICE_LOCATION_LABELS,
  PRACTICE_CATEGORY_LABELS,
} from "@/lib/constants/golf";
import type { PracticeItemInput, PracticeLocation, PracticeCategory } from "@/types/practice";
import { Plus, Trash2, Save, Loader2, Star } from "lucide-react";

function createDefaultItem(): PracticeItemInput {
  return {
    category: "DRIVER" as PracticeCategory,
    detail: null,
    ballCount: null,
    durationMin: null,
    club: null,
    feelRating: null,
    notes: null,
  };
}

export function PracticeInputForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [practicedAt, setPracticedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [location, setLocation] = useState<PracticeLocation>("DRIVING_RANGE");
  const [locationName, setLocationName] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [feelRating, setFeelRating] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [items, setItems] = useState<PracticeItemInput[]>([createDefaultItem()]);

  const addItem = () => {
    setItems([...items, createDefaultItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, partial: Partial<PracticeItemInput>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...partial };
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practicedAt,
          location,
          locationName: locationName || null,
          durationMin: parseInt(durationMin) || 60,
          feelRating,
          memo: memo || null,
          items,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "保存に失敗しました");
        setSubmitting(false);
        return;
      }

      router.push("/practices");
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="practicedAt">練習日</Label>
              <Input
                id="practicedAt"
                type="date"
                value={practicedAt}
                onChange={(e) => setPracticedAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMin">練習時間 (分)</Label>
              <Input
                id="durationMin"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>場所</Label>
              <Select
                value={location}
                onValueChange={(v) => setLocation(v as PracticeLocation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRACTICE_LOCATION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationName">場所名</Label>
              <Input
                id="locationName"
                placeholder="例: ○○ゴルフ練習場"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>

          {/* 手応え */}
          <div className="space-y-2">
            <Label>全体の手応え</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setFeelRating(feelRating === rating ? null : rating)
                  }
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      feelRating && rating <= feelRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 練習項目 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>練習項目</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />
              項目追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  項目 {index + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">カテゴリ</Label>
                  <Select
                    value={item.category}
                    onValueChange={(v) =>
                      updateItem(index, { category: v as PracticeCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRACTICE_CATEGORY_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">球数</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="30"
                    value={item.ballCount ?? ""}
                    onChange={(e) =>
                      updateItem(index, {
                        ballCount: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">詳細</Label>
                <Input
                  placeholder="例: 7番アイアン 150y狙い"
                  value={item.detail ?? ""}
                  onChange={(e) =>
                    updateItem(index, { detail: e.target.value || null })
                  }
                />
              </div>

              {/* 項目ごとの手応え */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">手応え</Label>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        updateItem(index, {
                          feelRating:
                            item.feelRating === rating ? null : rating,
                        })
                      }
                      className="p-0.5"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          item.feelRating && rating <= item.feelRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* メモ */}
      <Card>
        <CardHeader>
          <CardTitle>メモ</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="今日の練習の感想、気づいたこと..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
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
    </div>
  );
}
