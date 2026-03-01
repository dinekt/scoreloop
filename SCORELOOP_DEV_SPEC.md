# ScoreLoop 開発仕様書（Claude Code向け）

## プロジェクト概要

**ScoreLoop**は、アマチュアゴルファー向けのAIコーチングSaaSである。  
「練習 → ラウンド → AI分析 → 練習改善」のサイクルを自動化し、ゴルファーのスコア改善を支援する。

### 解決する課題

- ゴルファーは練習しているが「何が効いたのか」がわからない
- スコア管理アプリはあるが「だから何を練習すべきか」まで踏み込まない
- 練習内容とラウンド結果の相関分析ができるサービスが日本に存在しない

### ターゲットユーザー

- 年間30〜60ラウンド以上のアマチュアゴルファー
- スコア85〜105前後。80台安定/100切りを目指す層
- 練習場にも週1〜2回通う
- 40〜60代男性中心。スマホのWebアプリは問題なく使える

### 収益モデル

| プラン | 月額 | 内容 |
|--------|------|------|
| Free | 0円 | 月2ラウンド記録、基本統計のみ |
| Standard | 1,280円 | 無制限ラウンド分析、AI改善レポート、練習ログ |
| Pro | 2,480円 | Standard + AIトレーニングプラン、ループダッシュボード、コース別攻略、データエクスポート |

---

## 技術スタック

| レイヤー | 技術 | 理由 |
|----------|------|------|
| フロントエンド | Next.js 14+ (App Router) | SSR/SSG、TypeScript、Vercelデプロイの容易さ |
| UIライブラリ | shadcn/ui + Tailwind CSS | 高品質UIコンポーネント、カスタマイズ性 |
| チャートライブラリ | Recharts | Reactネイティブ、ゴルフスコアの時系列表示に適切 |
| バックエンド | Next.js API Routes (Route Handlers) | フロントと同一リポジトリで管理 |
| データベース | Supabase (PostgreSQL) | Auth統合、リアルタイム、Row Level Security |
| 認証 | Supabase Auth | メール/パスワード + Google OAuth |
| AI | OpenAI GPT-4o-mini API | コスト効率（1分析あたり約2〜5円） |
| 決済 | Stripe | サブスクリプション管理、Webhook連携 |
| ホスティング | Vercel | Next.jsとの親和性、自動デプロイ |
| モバイル対応 | PWA (next-pwa) | ネイティブアプリ不要でホーム画面追加可能 |

---

## ディレクトリ構造

```
scoreloop/
├── .env.local                    # 環境変数（gitignore対象）
├── .env.example                  # 環境変数テンプレート
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── prisma/                       # ※SupabaseのDB管理にPrismaを使用
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # LP（未ログイン）/ ダッシュボード（ログイン済）
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/               # 認証関連ページ
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts # Supabase Auth callback
│   │   │
│   │   ├── (app)/                # ログイン後のメインアプリ
│   │   │   ├── layout.tsx        # サイドバー付きレイアウト
│   │   │   ├── dashboard/page.tsx          # ループダッシュボード
│   │   │   ├── rounds/
│   │   │   │   ├── page.tsx                # ラウンド一覧
│   │   │   │   ├── new/page.tsx            # ラウンド入力フォーム
│   │   │   │   └── [id]/page.tsx           # ラウンド詳細＆AI分析結果
│   │   │   ├── practices/
│   │   │   │   ├── page.tsx                # 練習ログ一覧
│   │   │   │   ├── new/page.tsx            # 練習ログ入力フォーム
│   │   │   │   └── [id]/page.tsx           # 練習詳細
│   │   │   ├── analysis/
│   │   │   │   ├── page.tsx                # AI分析レポート一覧
│   │   │   │   └── [id]/page.tsx           # 個別レポート詳細
│   │   │   ├── training-plan/page.tsx      # AIトレーニングプラン
│   │   │   └── settings/page.tsx           # ユーザー設定・プラン管理
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── rounds/
│   │       │   ├── route.ts              # GET: 一覧 / POST: 新規作成
│   │       │   └── [id]/
│   │       │       ├── route.ts          # GET / PUT / DELETE
│   │       │       └── analyze/route.ts  # POST: AI分析実行
│   │       ├── practices/
│   │       │   ├── route.ts              # GET / POST
│   │       │   └── [id]/route.ts         # GET / PUT / DELETE
│   │       ├── analysis/
│   │       │   ├── generate/route.ts     # POST: AI分析レポート生成
│   │       │   └── training-plan/route.ts # POST: トレーニングプラン生成
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts     # POST: Checkout Session作成
│   │       │   ├── portal/route.ts       # POST: Customer Portal
│   │       │   └── webhook/route.ts      # POST: Stripe Webhook
│   │       └── user/
│   │           └── route.ts              # GET / PUT: ユーザープロフィール
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── rounds/
│   │   │   ├── RoundInputForm.tsx        # ラウンド入力フォーム
│   │   │   ├── HoleInputRow.tsx          # 1ホール分の入力行
│   │   │   ├── RoundSummaryCard.tsx      # ラウンドサマリカード
│   │   │   └── ScoreTrendChart.tsx       # スコア推移グラフ
│   │   ├── practices/
│   │   │   ├── PracticeInputForm.tsx     # 練習ログ入力
│   │   │   └── PracticeCalendar.tsx      # 練習カレンダー表示
│   │   ├── analysis/
│   │   │   ├── AIReportCard.tsx          # AI分析結果カード
│   │   │   ├── WeaknessChart.tsx         # 弱点レーダーチャート
│   │   │   ├── PracticeImpactChart.tsx   # 練習効果相関チャート
│   │   │   └── TrainingPlanView.tsx      # トレーニングプラン表示
│   │   └── dashboard/
│   │       ├── LoopDashboard.tsx         # メインダッシュボード
│   │       ├── CurrentFocusCard.tsx      # 現在の重点テーマ
│   │       ├── NextActionCard.tsx        # 次のアクション提案
│   │       └── ProgressRing.tsx          # 目標進捗リング
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # ブラウザ用Supabaseクライアント
│   │   │   ├── server.ts         # サーバー用Supabaseクライアント
│   │   │   └── middleware.ts     # 認証ミドルウェア
│   │   ├── stripe/
│   │   │   ├── client.ts         # Stripeクライアント
│   │   │   └── plans.ts          # プラン定義
│   │   ├── openai/
│   │   │   ├── client.ts         # OpenAIクライアント
│   │   │   ├── prompts/
│   │   │   │   ├── round-analysis.ts       # ラウンド分析プロンプト
│   │   │   │   ├── training-plan.ts        # トレーニングプラン生成プロンプト
│   │   │   │   └── practice-impact.ts      # 練習効果分析プロンプト
│   │   │   └── schemas/
│   │   │       ├── round-analysis.ts       # 分析結果のZodスキーマ
│   │   │       └── training-plan.ts        # プランのZodスキーマ
│   │   ├── utils/
│   │   │   ├── golf-stats.ts     # ゴルフ統計計算ユーティリティ
│   │   │   ├── date.ts           # 日付ユーティリティ
│   │   │   └── format.ts         # フォーマットユーティリティ
│   │   └── constants/
│   │       ├── golf.ts           # ゴルフ関連定数
│   │       └── plans.ts          # プラン定数
│   │
│   ├── hooks/
│   │   ├── useRounds.ts          # ラウンドデータのSWR/React Query
│   │   ├── usePractices.ts       # 練習データのフック
│   │   ├── useUser.ts            # ユーザー情報フック
│   │   └── useSubscription.ts    # サブスク状態フック
│   │
│   └── types/
│       ├── round.ts              # ラウンド関連型定義
│       ├── practice.ts           # 練習関連型定義
│       ├── analysis.ts           # 分析関連型定義
│       └── user.ts               # ユーザー関連型定義
│
└── public/
    ├── manifest.json             # PWA マニフェスト
    ├── sw.js                     # Service Worker
    └── icons/                    # PWA アイコン
```

---

## データベーススキーマ

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ========================================
// ユーザー
// ========================================
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  displayName     String?   @map("display_name")
  
  // ゴルフプロフィール
  averageScore    Int?      @map("average_score")     // 自己申告の平均スコア
  headSpeed       Float?    @map("head_speed")        // ヘッドスピード (m/s)
  handicap        Float?                               // ハンディキャップ
  golfStartYear   Int?      @map("golf_start_year")   // ゴルフ開始年
  homeCourseName  String?   @map("home_course_name")  // ホームコース名
  
  // サブスクリプション
  plan            Plan      @default(FREE)
  stripeCustomerId    String?   @unique @map("stripe_customer_id")
  stripeSubscriptionId String?  @unique @map("stripe_subscription_id")
  planExpiresAt   DateTime? @map("plan_expires_at")
  
  // リレーション
  rounds          Round[]
  practices       Practice[]
  analysisReports AnalysisReport[]
  trainingPlans   TrainingPlan[]
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  @@map("users")
}

enum Plan {
  FREE
  STANDARD
  PRO
}

// ========================================
// ラウンドデータ
// ========================================
model Round {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // ラウンド基本情報
  playedAt    DateTime  @map("played_at")             // プレー日
  courseName  String    @map("course_name")            // コース名
  courseRating Float?   @map("course_rating")          // コースレーティング
  slopeRating Int?     @map("slope_rating")            // スロープレーティング
  weather     Weather?                                  // 天候
  wind        WindLevel?                                // 風
  temperature Float?                                    // 気温
  
  // サマリ（holesから自動計算してキャッシュ）
  totalScore  Int       @map("total_score")
  outScore    Int?      @map("out_score")               // 前半スコア
  inScore     Int?      @map("in_score")                // 後半スコア
  totalPutts  Int?      @map("total_putts")
  fairwayHit  Int?      @map("fairway_hit")             // FWキープ数
  fairwayTotal Int?     @map("fairway_total")           // FWキープ対象ホール数（Par3除く）
  girCount    Int?      @map("gir_count")               // パーオン数
  penaltyCount Int?     @map("penalty_count")           // ペナルティ数
  
  memo        String?                                    // 全体メモ
  
  // リレーション
  holes       HoleData[]
  analysisReports AnalysisReport[]
  
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  @@index([userId, playedAt(sort: Desc)])
  @@map("rounds")
}

enum Weather {
  SUNNY      // 晴れ
  CLOUDY     // 曇り
  RAINY      // 雨
  WINDY      // 強風
}

enum WindLevel {
  CALM       // 無風
  LIGHT      // 微風
  MODERATE   // やや強い
  STRONG     // 強風
}

model HoleData {
  id          String    @id @default(uuid())
  roundId     String    @map("round_id")
  round       Round     @relation(fields: [roundId], references: [id], onDelete: Cascade)
  
  holeNumber  Int       @map("hole_number")            // 1-18
  par         Int                                       // 3, 4, 5
  score       Int                                       // 実スコア
  putts       Int                                       // パット数
  
  // フェアウェイ（Par3はnull）
  fairway     FairwayResult?                            
  
  // パーオン
  greenInRegulation Boolean @default(false) @map("green_in_regulation")
  
  // ミス詳細（オプション）
  penalty     Int       @default(0)                     // ペナルティ数
  missType    MissType? @map("miss_type")               // 主なミスの種類
  missDetail  String?   @map("miss_detail")             // ミスの詳細メモ
  
  // ショット詳細（オプション・Proプラン）
  clubUsed    String?   @map("club_used")               // 使用クラブ（ティーショット）
  approachDistance Int?  @map("approach_distance")       // セカンド/アプローチ距離(y)
  approachClub String?  @map("approach_club")            // アプローチ使用クラブ
  
  @@unique([roundId, holeNumber])
  @@map("hole_data")
}

enum FairwayResult {
  HIT        // フェアウェイキープ
  LEFT       // 左ミス
  RIGHT      // 右ミス
  SHORT      // ショート
  LONG       // オーバー
}

enum MissType {
  SLICE      // スライス
  HOOK       // フック
  DUFF       // ダフリ
  TOP        // トップ
  SHANK      // シャンク
  PUSH       // プッシュ
  PULL       // 引っかけ
  FAT        // ダフリ（アプローチ）
  THIN       // トップ（アプローチ）
  THREE_PUTT // 3パット
  OTHER      // その他
}

// ========================================
// 練習ログ
// ========================================
model Practice {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  practicedAt DateTime  @map("practiced_at")            // 練習日
  location    PracticeLocation                           // 練習場所
  locationName String?  @map("location_name")            // 場所名
  durationMin Int       @map("duration_min")             // 練習時間（分）
  
  // 全体の手応え
  feelRating  Int?      @map("feel_rating")              // 1-5の主観評価
  memo        String?                                     // 全体メモ（テキスト or 音声テキスト化）
  
  // リレーション
  items       PracticeItem[]
  
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  @@index([userId, practicedAt(sort: Desc)])
  @@map("practices")
}

enum PracticeLocation {
  DRIVING_RANGE    // 打ちっぱなし
  INDOOR_GOLF      // インドアゴルフ
  PUTTING_GREEN    // パター練習場
  APPROACH_AREA    // アプローチ練習場
  HOME             // 自宅（素振り等）
  COURSE           // コースでの練習
  OTHER            // その他
}

model PracticeItem {
  id          String    @id @default(uuid())
  practiceId  String    @map("practice_id")
  practice    Practice  @relation(fields: [practiceId], references: [id], onDelete: Cascade)
  
  category    PracticeCategory                           // 練習カテゴリ
  detail      String?                                     // 詳細（例: "7番アイアン 150y狙い"）
  ballCount   Int?      @map("ball_count")               // 球数
  durationMin Int?      @map("duration_min")             // この練習の時間（分）
  club        String?                                     // 使用クラブ
  
  feelRating  Int?      @map("feel_rating")              // 1-5の手応え
  notes       String?                                     // メモ
  
  @@map("practice_items")
}

enum PracticeCategory {
  DRIVER           // ドライバー
  WOOD             // フェアウェイウッド
  UTILITY          // ユーティリティ
  LONG_IRON        // ロングアイアン (3-5)
  MID_IRON         // ミドルアイアン (6-8)
  SHORT_IRON       // ショートアイアン (9, PW)
  WEDGE            // ウェッジ (AW, SW, LW)
  APPROACH         // アプローチ全般 (50y以内)
  BUNKER           // バンカー
  PUTTING          // パッティング
  SWING_DRILL      // スイングドリル/素振り
  FITNESS          // フィジカルトレーニング
  OTHER            // その他
}

// ========================================
// AI分析レポート
// ========================================
model AnalysisReport {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  roundId     String?   @map("round_id")                 // 紐づくラウンド（任意）
  round       Round?    @relation(fields: [roundId], references: [id])
  
  reportType  ReportType @map("report_type")
  
  // AI分析結果（JSON）
  content     Json                                        // 構造化された分析結果
  
  // メタデータ
  modelUsed   String    @map("model_used")               // 使用したAIモデル
  promptTokens Int?     @map("prompt_tokens")            // トークン数（コスト管理用）
  completionTokens Int? @map("completion_tokens")
  
  createdAt   DateTime  @default(now()) @map("created_at")
  
  @@index([userId, createdAt(sort: Desc)])
  @@map("analysis_reports")
}

enum ReportType {
  ROUND_ANALYSIS       // 単一ラウンド分析
  TREND_ANALYSIS       // トレンド分析（複数ラウンド）
  PRACTICE_IMPACT      // 練習効果分析
}

// ========================================
// AIトレーニングプラン
// ========================================
model TrainingPlan {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  weekStartDate DateTime @map("week_start_date")         // 対象週の開始日
  
  // プラン内容（JSON）
  content     Json                                        // 構造化された練習プラン
  
  // 基となったデータ
  basedOnRoundIds String[] @map("based_on_round_ids")    // 参考にしたラウンドID
  focusAreas  String[]    @map("focus_areas")             // 重点改善エリア
  
  createdAt   DateTime  @default(now()) @map("created_at")
  
  @@unique([userId, weekStartDate])
  @@map("training_plans")
}
```

---

## API設計

### ラウンド関連

```
GET    /api/rounds                    ラウンド一覧取得
POST   /api/rounds                    ラウンド新規作成
GET    /api/rounds/[id]               ラウンド詳細取得
PUT    /api/rounds/[id]               ラウンド更新
DELETE /api/rounds/[id]               ラウンド削除
POST   /api/rounds/[id]/analyze       ラウンドのAI分析を実行
```

### 練習ログ関連

```
GET    /api/practices                 練習ログ一覧取得
POST   /api/practices                 練習ログ新規作成
GET    /api/practices/[id]            練習ログ詳細取得
PUT    /api/practices/[id]            練習ログ更新
DELETE /api/practices/[id]            練習ログ削除
```

### AI分析関連

```
POST   /api/analysis/generate         AI分析レポート生成
  Body: { roundId: string, includeHistory: boolean }
  
POST   /api/analysis/training-plan    AIトレーニングプラン生成
  Body: { weekStartDate: string }
```

### Stripe関連

```
POST   /api/stripe/checkout           Stripe Checkout Session作成
POST   /api/stripe/portal             Stripe Customer Portal URL取得
POST   /api/stripe/webhook            Stripe Webhook受信
```

### レスポンス形式

すべてのAPIは以下の形式で返す:

```typescript
// 成功
{ success: true, data: T }

// エラー
{ success: false, error: { code: string, message: string } }
```

---

## AI プロンプト設計

### ラウンド分析プロンプト

```typescript
// src/lib/openai/prompts/round-analysis.ts

export function buildRoundAnalysisPrompt(data: {
  round: RoundWithHoles;
  recentRounds: RoundSummary[];     // 直近5〜10ラウンド
  recentPractices: PracticeSummary[]; // 直近4週間の練習ログ
  userProfile: UserGolfProfile;
}): string {
  return `あなたはPGAツアーのコーチ経験20年のゴルフ分析AIです。
アマチュアゴルファーのデータを分析し、具体的で実践的な改善提案を行ってください。

## 分析対象ゴルファーのプロフィール
- 平均スコア: ${data.userProfile.averageScore}
- ヘッドスピード: ${data.userProfile.headSpeed || '不明'}m/s
- ハンディキャップ: ${data.userProfile.handicap || '不明'}
- ゴルフ歴: ${data.userProfile.golfStartYear ? `${new Date().getFullYear() - data.userProfile.golfStartYear}年` : '不明'}

## 今回のラウンドデータ
コース: ${data.round.courseName}
日付: ${data.round.playedAt}
天候: ${data.round.weather || '不明'} / 風: ${data.round.wind || '不明'}
トータルスコア: ${data.round.totalScore} (OUT: ${data.round.outScore} / IN: ${data.round.inScore})

### ホール別データ
${data.round.holes.map(h => 
  `H${h.holeNumber}(Par${h.par}): スコア${h.score} パット${h.putts} FW:${h.fairway || '-'} GIR:${h.greenInRegulation ? '○' : '×'} ペナ:${h.penalty} ミス:${h.missType || '-'} ${h.missDetail || ''}`
).join('\n')}

## 直近のラウンド履歴（新しい順）
${data.recentRounds.map(r => 
  `${r.playedAt} ${r.courseName}: ${r.totalScore} (FW${r.fairwayHit}/${r.fairwayTotal} GIR${r.girCount}/18 パット${r.totalPutts})`
).join('\n')}

## 直近4週間の練習ログ
${data.recentPractices.map(p => 
  `${p.practicedAt} ${p.location}(${p.durationMin}分): ${p.items.map(i => `${i.category}${i.ballCount ? '(' + i.ballCount + '球)' : ''}`).join(', ')} 手応え:${p.feelRating}/5`
).join('\n')}

## 出力形式（以下のJSON形式で厳密に出力してください）

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
    {
      "category": "カテゴリ名",
      "lostStrokes": 0.0,
      "percentage": 0,
      "detail": "具体的にどこでスコアを落としたか"
    }
  ],
  "trends": {
    "improving": ["改善傾向にある項目"],
    "declining": ["悪化傾向にある項目"],
    "stable": ["安定している項目"]
  },
  "practiceImpact": {
    "observed": "最近の練習がこのラウンドに与えた影響の分析",
    "correlations": [
      {
        "practice": "練習内容",
        "roundImpact": "ラウンドへの影響",
        "confidence": "high/medium/low"
      }
    ]
  },
  "improvementPlan": {
    "primaryFocus": {
      "area": "最優先の改善エリア",
      "currentLevel": "現在の状態",
      "targetLevel": "目標の状態",
      "expectedImpact": "改善による期待スコア削減数",
      "specificDrills": ["具体的な練習ドリル1", "具体的な練習ドリル2"]
    },
    "secondaryFocus": {
      "area": "次点の改善エリア",
      "specificDrills": ["具体的な練習ドリル"]
    },
    "nextRoundStrategy": "次のラウンドで意識すべきこと（2-3文）"
  },
  "motivationalComment": "ポジティブな一言コメント"
}`;
}
```

### トレーニングプラン生成プロンプト

```typescript
// src/lib/openai/prompts/training-plan.ts

export function buildTrainingPlanPrompt(data: {
  recentAnalysis: AnalysisReport[];   // 直近の分析レポート
  recentPractices: PracticeSummary[]; // 直近の練習ログ
  userProfile: UserGolfProfile;
  weekStartDate: string;
}): string {
  return `あなたはアマチュアゴルファー専門のトレーニングコーチAIです。
直近のラウンド分析結果と練習履歴を踏まえ、来週の練習プランを作成してください。

## ゴルファーのプロフィール
${/* userProfile展開 */}

## 直近のAI分析で特定された改善ポイント
${data.recentAnalysis.map(a => JSON.stringify(a.content.improvementPlan)).join('\n')}

## 直近の練習履歴
${/* 練習ログ展開 */}

## 前提条件
- ゴルファーは週に2〜3回、1回あたり60〜90分の練習が可能
- 利用可能な施設: 打ちっぱなし、パター練習グリーン、アプローチ練習場
- 練習の継続性を重視し、過度に厳しいメニューは避ける

## 出力形式（JSON）

{
  "weeklyGoal": "今週の目標（1文）",
  "focusAreas": [
    {
      "area": "重点エリア",
      "priority": 1,
      "timeAllocation": 40,
      "reason": "なぜこのエリアを重点にするか"
    }
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
```

### AI応答のバリデーション

```typescript
// src/lib/openai/schemas/round-analysis.ts
import { z } from 'zod';

export const RoundAnalysisSchema = z.object({
  overallAssessment: z.string(),
  scoreBreakdown: z.object({
    teeShot: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    approach: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    shortGame: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    putting: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
    courseManagement: z.object({ rating: z.number().min(1).max(5), comment: z.string() }),
  }),
  scoreLossAnalysis: z.array(z.object({
    category: z.string(),
    lostStrokes: z.number(),
    percentage: z.number(),
    detail: z.string(),
  })),
  trends: z.object({
    improving: z.array(z.string()),
    declining: z.array(z.string()),
    stable: z.array(z.string()),
  }),
  practiceImpact: z.object({
    observed: z.string(),
    correlations: z.array(z.object({
      practice: z.string(),
      roundImpact: z.string(),
      confidence: z.enum(['high', 'medium', 'low']),
    })),
  }),
  improvementPlan: z.object({
    primaryFocus: z.object({
      area: z.string(),
      currentLevel: z.string(),
      targetLevel: z.string(),
      expectedImpact: z.string(),
      specificDrills: z.array(z.string()),
    }),
    secondaryFocus: z.object({
      area: z.string(),
      specificDrills: z.array(z.string()),
    }),
    nextRoundStrategy: z.string(),
  }),
  motivationalComment: z.string(),
});

export type RoundAnalysis = z.infer<typeof RoundAnalysisSchema>;
```

---

## 主要画面仕様

### 1. ダッシュボード (`/dashboard`)

**ループダッシュボード** — アプリのホーム画面。練習↔ラウンドのサイクルを可視化する。

構成要素:
- **ヘッダー**: ユーザー名、現在のプラン表示
- **現在の重点テーマカード**: AI分析に基づく最優先改善エリアとその進捗率
- **スコア推移グラフ**: 直近10〜20ラウンドのスコア折れ線グラフ（目標ライン付き）
- **次のアクションカード**: 「次の練習でやるべきこと」をAIが提案
- **直近のラウンド/練習タイムライン**: 時系列で交互に表示
- **今週の練習達成率**: トレーニングプランに対する達成度プログレスバー

### 2. ラウンド入力 (`/rounds/new`)

**ステップ形式のフォーム** — 入力の負荷を下げる設計。

- Step 1: 基本情報（日付、コース名、天候）
- Step 2: スコア入力（18ホール分。Par設定後、スコアとパット数を入力）
  - 最低限の必須入力: スコア + パット数のみ
  - オプション: FW、GIR、ミスタイプ、使用クラブ
- Step 3: 全体メモ（テキスト自由入力）
- Step 4: 確認 → 保存 → AI分析実行ボタン

**UI要件**:
- スマホでの片手入力を考慮した大きなボタン/入力フィールド
- ホールごとにスワイプで移動できるカルーセルUI
- Parの初期値はコース情報から自動設定（可能であれば）
- 入力途中の自動保存（localStorage）

### 3. 練習ログ入力 (`/practices/new`)

- 日付、場所、時間の入力
- 練習項目の追加（カテゴリ選択 → 詳細入力）
  - テンプレートから選択 or フリー入力
  - 球数 or 時間を入力
- 主観的な手応え（1-5スター）
- メモ（テキスト入力）

### 4. AI分析レポート (`/rounds/[id]`)

ラウンド詳細ページ内にAI分析結果を表示:

- **総合評価**: テキスト + 5段階レーダーチャート（ティーショット/アプローチ/ショートゲーム/パッティング/マネジメント）
- **スコアロス分析**: 棒グラフで「どこでスコアを落としたか」を可視化
- **トレンド**: 改善↑/悪化↓/安定→のアイコン付きリスト
- **練習効果分析**: 「先月のアプローチ練習強化の結果、50-100yの成功率が6%改善」
- **改善プラン**: 優先度順のアクションリスト + 具体的ドリル
- **次回ラウンドの戦略**: コンパクトなアドバイスカード

### 5. トレーニングプラン (`/training-plan`)

- 週単位のカレンダー表示
- 各セッションの詳細（ドリル、球数、時間、ポイント）
- チェックボックスで実施記録
- 「この練習は次のラウンドでこう活きる」の関連付け表示

---

## 環境変数

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o-mini

# Stripe
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxx
STRIPE_STANDARD_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 開発フェーズ

### Phase 1: 基盤構築（Day 1-4）

```
タスク:
1. Next.js プロジェクト初期化 (create-next-app --typescript)
2. Tailwind CSS + shadcn/ui セットアップ
3. Supabase プロジェクト作成 + Auth設定
4. Prisma スキーマ定義 + マイグレーション実行
5. 認証フロー実装（サインアップ/ログイン/ログアウト）
6. 基本レイアウト（サイドバー + ヘッダー + モバイルナビ）
```

### Phase 2: ラウンド機能（Day 5-8）

```
タスク:
1. ラウンド入力フォーム（ステップ形式）
2. ホール入力コンポーネント（スワイプ対応）
3. ラウンド一覧ページ
4. ラウンド詳細ページ（スコアカード表示）
5. ラウンドAPI (CRUD)
6. スコア推移グラフ（Recharts）
```

### Phase 3: 練習ログ機能（Day 9-11）

```
タスク:
1. 練習ログ入力フォーム
2. 練習項目テンプレート
3. 練習ログ一覧 + カレンダー表示
4. 練習ログAPI (CRUD)
```

### Phase 4: AI分析機能（Day 12-17）

```
タスク:
1. OpenAI API連携基盤
2. ラウンド分析プロンプト実装 + Zodバリデーション
3. 分析結果の表示UI（レーダーチャート、棒グラフ、テキスト）
4. 練習効果分析（練習ログ × ラウンドデータの相関）
5. トレーニングプラン生成プロンプト実装
6. トレーニングプランUI
7. 分析結果のDB保存とキャッシュ
```

### Phase 5: ダッシュボード（Day 18-20）

```
タスク:
1. ループダッシュボード実装
2. 現在の重点テーマ表示
3. 次のアクション提案
4. ラウンド/練習タイムライン
5. 練習達成率プログレスバー
```

### Phase 6: 課金 + 仕上げ（Day 21-25）

```
タスク:
1. Stripe連携（Checkout, Customer Portal, Webhook）
2. プラン制限の実装（Free: 月2ラウンド、Standard/Pro機能制限）
3. PWA設定（manifest.json, Service Worker）
4. レスポンシブ最適化（スマホでの操作性テスト）
5. エラーハンドリング + ローディング状態
```

### Phase 7: テスト + ローンチ（Day 26-30）

```
タスク:
1. E2Eテスト（主要フロー）
2. βテスター配布 + フィードバック収集
3. バグ修正
4. Vercel本番デプロイ
5. 独自ドメイン設定
6. ローンチ
```

---

## 実装上の注意事項

### パフォーマンス

- AI分析はバックグラウンドで実行し、完了通知を表示する（Streaming or Polling）
- ラウンド一覧はページネーション（20件ずつ）
- スコア推移グラフのデータは集計テーブルにキャッシュ

### セキュリティ

- Supabase RLS（Row Level Security）を全テーブルに設定
- API Routesでも認証チェックを二重で実施
- OpenAI APIキーはサーバーサイドのみ
- Stripe Webhookの署名検証必須

### UX

- ラウンド入力中の離脱防止（localStorageに自動保存）
- AI分析中のローディングアニメーション（ゴルフボールが回転する等）
- 初回ユーザー向けオンボーディング（3ステップ）
- スマホでのゴルフ場からの入力を想定（屋外で見やすい配色）

### API コスト管理

- GPT-4o-miniを使用（GPT-4oの約1/10のコスト）
- 1ラウンド分析: 約2,000〜3,000トークン入力 + 1,500トークン出力 ≈ $0.01-0.03
- 月間50ユーザー × 月4回分析 = 200回 × $0.02 = $4/月（約600円）
- Freeプランのユーザーには分析機能を制限（月2回まで）

---

## コマンドリファレンス

```bash
# プロジェクト初期化
npx create-next-app@latest scoreloop --typescript --tailwind --eslint --app --src-dir
cd scoreloop

# shadcn/ui セットアップ
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea tabs chart badge dialog dropdown-menu sheet separator progress avatar

# 主要パッケージ
npm install @supabase/supabase-js @supabase/ssr
npm install @prisma/client prisma
npm install openai
npm install stripe @stripe/stripe-js
npm install recharts
npm install zod
npm install date-fns
npm install next-pwa

# Prisma
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio  # DB GUI

# 開発
npm run dev

# デプロイ
vercel --prod
```

---

## ファイル作成順序（Claude Code向け推奨順）

```
1.  package.json + 依存関係インストール
2.  prisma/schema.prisma → マイグレーション
3.  src/types/*.ts（型定義を先に作る）
4.  src/lib/supabase/*.ts（認証基盤）
5.  src/lib/constants/*.ts（定数）
6.  src/app/layout.tsx + globals.css
7.  src/components/ui/*（shadcn/ui）
8.  src/components/layout/*（サイドバー等）
9.  src/app/(auth)/*（認証ページ）
10. src/app/(app)/layout.tsx
11. src/app/api/rounds/*（ラウンドAPI）
12. src/components/rounds/*（ラウンドUI）
13. src/app/(app)/rounds/*（ラウンドページ）
14. src/app/api/practices/*（練習API）
15. src/components/practices/*（練習UI）
16. src/app/(app)/practices/*（練習ページ）
17. src/lib/openai/*（AI連携）
18. src/app/api/analysis/*（分析API）
19. src/components/analysis/*（分析UI）
20. src/components/dashboard/*（ダッシュボード）
21. src/app/(app)/dashboard/page.tsx
22. src/lib/stripe/*（Stripe連携）
23. src/app/api/stripe/*（Stripe API）
24. PWA設定（manifest.json, sw.js）
```

---

*この仕様書はClaude Codeでの段階的実装を前提に設計されています。各フェーズ完了後にテストを行い、次フェーズに進んでください。*
