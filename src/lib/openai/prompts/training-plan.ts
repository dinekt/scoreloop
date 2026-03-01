type AnalysisSummary = {
  improvementPlan?: {
    primaryFocus?: { area: string; specificDrills: string[] };
    secondaryFocus?: { area: string; specificDrills: string[] };
  };
};

type PracticeSummary = {
  practicedAt: string;
  location: string;
  durationMin: number;
  items: { category: string; ballCount: number | null }[];
};

type UserProfile = {
  averageScore: number | null;
  headSpeed: number | null;
  handicap: number | null;
  golfStartYear: number | null;
};

export function buildTrainingPlanPrompt(data: {
  recentAnalysis: AnalysisSummary[];
  recentPractices: PracticeSummary[];
  userProfile: UserProfile;
  weekStartDate: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `あなたはアマチュアゴルファー専門のトレーニングコーチAIです。
直近のラウンド分析結果と練習履歴を踏まえ、来週の練習プランを作成してください。

## ゴルファーのプロフィール
- 平均スコア: ${data.userProfile.averageScore ?? "不明"}
- ヘッドスピード: ${data.userProfile.headSpeed ? `${data.userProfile.headSpeed}m/s` : "不明"}
- ハンディキャップ: ${data.userProfile.handicap ?? "不明"}
- ゴルフ歴: ${data.userProfile.golfStartYear ? `${currentYear - data.userProfile.golfStartYear}年` : "不明"}

## 直近のAI分析で特定された改善ポイント
${
  data.recentAnalysis.length > 0
    ? data.recentAnalysis
        .map((a) => JSON.stringify(a.improvementPlan || {}))
        .join("\n")
    : "データなし"
}

## 直近の練習履歴
${
  data.recentPractices.length > 0
    ? data.recentPractices
        .map(
          (p) =>
            `${p.practicedAt} ${p.location}(${p.durationMin}分): ${p.items.map((i) => `${i.category}${i.ballCount ? "(" + i.ballCount + "球)" : ""}`).join(", ")}`
        )
        .join("\n")
    : "データなし"
}

## 対象週
${data.weekStartDate} の週

## 前提条件
- ゴルファーは週に2〜3回、1回あたり60〜90分の練習が可能
- 利用可能な施設: 打ちっぱなし、パター練習グリーン、アプローチ練習場
- 練習の継続性を重視し、過度に厳しいメニューは避ける

## 出力形式（以下のJSON形式で厳密に出力してください。JSON以外のテキストは含めないでください）

{
  "weeklyGoal": "今週の目標（1文）",
  "focusAreas": [
    { "area": "重点エリア", "priority": 1, "timeAllocation": 40, "reason": "理由" }
  ],
  "sessions": [
    {
      "dayOfWeek": "月",
      "sessionType": "打ちっぱなし",
      "durationMin": 60,
      "warmup": "ウォームアップ内容（5分）",
      "mainDrills": [
        {
          "drill": "ドリル名",
          "category": "APPROACH",
          "description": "具体的なやり方",
          "ballCount": 30,
          "durationMin": 15,
          "successCriteria": "成功の基準",
          "tips": "コツやポイント"
        }
      ],
      "cooldown": "クールダウン内容（5分）"
    }
  ],
  "weeklyCheckpoint": "週末に確認すべきポイント",
  "connectionToNextRound": "この練習が次のラウンドでどう活きるか"
}`;
}
