"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

type SettingsFormProps = {
  displayName: string;
  averageScore: number | null;
  headSpeed: number | null;
  handicap: number | null;
  golfStartYear: number | null;
  homeCourseName: string;
};

export function SettingsForm(props: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState(props.displayName);
  const [averageScore, setAverageScore] = useState(
    props.averageScore?.toString() || ""
  );
  const [headSpeed, setHeadSpeed] = useState(
    props.headSpeed?.toString() || ""
  );
  const [handicap, setHandicap] = useState(
    props.handicap?.toString() || ""
  );
  const [golfStartYear, setGolfStartYear] = useState(
    props.golfStartYear?.toString() || ""
  );
  const [homeCourseName, setHomeCourseName] = useState(props.homeCourseName);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName || null,
        averageScore: averageScore ? parseInt(averageScore) : null,
        headSpeed: headSpeed ? parseFloat(headSpeed) : null,
        handicap: handicap ? parseFloat(handicap) : null,
        golfStartYear: golfStartYear ? parseInt(golfStartYear) : null,
        homeCourseName: homeCourseName || null,
      }),
    });

    setSaving(false);
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">表示名</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ゴルフ太郎"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="averageScore">平均スコア</Label>
            <Input
              id="averageScore"
              type="number"
              value={averageScore}
              onChange={(e) => setAverageScore(e.target.value)}
              placeholder="95"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handicap">ハンディキャップ</Label>
            <Input
              id="handicap"
              type="number"
              step="0.1"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="18.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="headSpeed">ヘッドスピード (m/s)</Label>
            <Input
              id="headSpeed"
              type="number"
              step="0.1"
              value={headSpeed}
              onChange={(e) => setHeadSpeed(e.target.value)}
              placeholder="40.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="golfStartYear">ゴルフ開始年</Label>
            <Input
              id="golfStartYear"
              type="number"
              value={golfStartYear}
              onChange={(e) => setGolfStartYear(e.target.value)}
              placeholder="2015"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="homeCourseName">ホームコース</Label>
          <Input
            id="homeCourseName"
            value={homeCourseName}
            onChange={(e) => setHomeCourseName(e.target.value)}
            placeholder="○○カントリークラブ"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            保存
          </Button>
          {success && (
            <span className="text-sm text-green-600">保存しました</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
