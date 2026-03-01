type HoleInfo = {
  holeNumber: number;
  par: number;
  score: number;
  putts: number;
  fairway: string | null;
  greenInRegulation: boolean;
  penalty: number;
  missType: string | null;
  missDetail: string | null;
};

type RoundInfo = {
  courseName: string;
  playedAt: string;
  weather: string | null;
  wind: string | null;
  totalScore: number;
  outScore: number | null;
  inScore: number | null;
  holes: HoleInfo[];
};

type RecentRound = {
  playedAt: string;
  courseName: string;
  totalScore: number;
  fairwayHit: number | null;
  fairwayTotal: number | null;
  girCount: number | null;
  totalPutts: number | null;
};

type RecentPractice = {
  practicedAt: string;
  location: string;
  durationMin: number;
  feelRating: number | null;
  items: { category: string; ballCount: number | null }[];
};

type UserProfile = {
  averageScore: number | null;
  headSpeed: number | null;
  handicap: number | null;
  golfStartYear: number | null;
};

export function buildRoundAnalysisPrompt(data: {
  round: RoundInfo;
  recentRounds: RecentRound[];
  recentPractices: RecentPractice[];
  userProfile: UserProfile;
}): string {
  const currentYear = new Date().getFullYear();

  return `あなたはPGAツアーのコーチ経験20年のゴルフ分析AIです。
アマチュアゴルファーのデータを分析し、具体的で実践的な改善提案を行ってください。

## 分析対象ゴルファーのプロフィール
- 平均スコア: ${data.userProfile.averageScore ?? "不明"}
- ヘッドスピード: ${data.userProfile.headSpeed ? `${data.userProfile.headSpeed}m/s` : "不明"}
- ハンディキャップ: ${data.userProfile.handicap ?? "不明"}
- ゴルフ歴: ${data.userProfile.golfStartYear ? `${currentYear - data.userProfile.golfStartYear}年` : "不明"}

## 今回のラウンドデータ
コース: ${data.round.courseName}
日付: ${data.round.playedAt}
天候: ${data.round.weather || "不明"} / 風: ${data.round.wind || "不明"}
トータルスコア: ${data.round.totalScore} (OUT: ${data.round.outScore ?? "-"} / IN: ${data.round.inScore ?? "-"})

### ホール別データ
${data.round.holes
  .map(
    (h) =>
      `H${h.holeNumber}(Par${h.par}): スコア${h.score} パット${h.putts} FW:${h.fairway || "-"} GIR:${h.greenInRegulation ? "○" : "×"} ペナ:${h.penalty} ミス:${h.missType || "-"} ${h.missDetail || ""}`
  )
  .join("\n")}

## 直近のラウンド履歴（新しい順）
${
  data.recentRounds.length > 0
    ? data.recentRounds
        .map(
          (r) =>
            `${r.playedAt} ${r.courseName}: ${r.totalScore} (FW${r.fairwayHit ?? "-"}/${r.fairwayTotal ?? "-"} GIR${r.girCount ?? "-"}/18 パット${r.totalPutts ?? "-"})`
        )
        .join("\n")
    : "データなし"
}

## 直近4週間の練習ログ
${
  data.recentPractices.length > 0
    ? data.recentPractices
        .map(
          (p) =>
            `${p.practicedAt} ${p.location}(${p.durationMin}分): ${p.items.map((i) => `${i.category}${i.ballCount ? "(" + i.ballCount + "球)" : ""}`).join(", ")} 手応え:${p.feelRating ?? "-"}/5`
        )
        .join("\n")
    : "データなし"
}

## 出力形式（以下のJSON形式で厳密に出力してください。JSON以外のテキストは含めないでください）

{
  "overallAssessment": "今回のラウンド全体の評価（2-3文）",
  "scoreBreakdown": {
    "teeShot": { "rating": 1-5, "comment": "ティーショットの評価" },
    "approach": { "rating": 1-5, "comment": "アプローチの評価" },
    "shortGame": { "rating": 1-5, "comment": "ショートゲームの評価" },
    "putting": { "rating": 1-5, "comment": "パッティングの評価" },
    "courseManagement": { "rating": 1-5, "comment": "コースマネジメントの評価" }
  },
  "scoreLossAnalysis": [
    { "category": "カテゴリ名", "lostStrokes": 0.0, "percentage": 0, "detail": "詳細" }
  ],
  "trends": {
    "improving": ["改善傾向にある項目"],
    "declining": ["悪化傾向にある項目"],
    "stable": ["安定している項目"]
  },
  "practiceImpact": {
    "observed": "練習の影響分析",
    "correlations": [
      { "practice": "練習内容", "roundImpact": "影響", "confidence": "high/medium/low" }
    ]
  },
  "improvementPlan": {
    "primaryFocus": {
      "area": "最優先改善エリア",
      "currentLevel": "現在の状態",
      "targetLevel": "目標の状態",
      "expectedImpact": "期待スコア削減",
      "specificDrills": ["ドリル1", "ドリル2"]
    },
    "secondaryFocus": {
      "area": "次点の改善エリア",
      "specificDrills": ["ドリル"]
    },
    "nextRoundStrategy": "次のラウンドで意識すべきこと（2-3文）"
  },
  "motivationalComment": "ポジティブな一言コメント"
}`;
}
