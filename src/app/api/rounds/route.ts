import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { calculateRoundStats } from "@/lib/utils/golf-stats";
import { checkRoundLimit } from "@/lib/utils/plan-limits";
import { z } from "zod";

const HoleSchema = z.object({
  holeNumber: z.number().min(1).max(18),
  par: z.number().min(3).max(5),
  score: z.number().min(1).max(20),
  putts: z.number().min(0).max(10),
  fairway: z.enum(["HIT", "LEFT", "RIGHT", "SHORT", "LONG"]).nullable().optional(),
  greenInRegulation: z.boolean(),
  penalty: z.number().min(0).default(0),
  missType: z
    .enum(["SLICE", "HOOK", "DUFF", "TOP", "SHANK", "PUSH", "PULL", "FAT", "THIN", "THREE_PUTT", "OTHER"])
    .nullable()
    .optional(),
  missDetail: z.string().nullable().optional(),
  clubUsed: z.string().nullable().optional(),
  approachDistance: z.number().nullable().optional(),
  approachClub: z.string().nullable().optional(),
});

const CreateRoundSchema = z.object({
  playedAt: z.string(),
  courseName: z.string().min(1),
  courseRating: z.number().nullable().optional(),
  slopeRating: z.number().nullable().optional(),
  weather: z.enum(["SUNNY", "CLOUDY", "RAINY", "WINDY"]).nullable().optional(),
  wind: z.enum(["CALM", "LIGHT", "MODERATE", "STRONG"]).nullable().optional(),
  temperature: z.number().nullable().optional(),
  memo: z.string().nullable().optional(),
  holes: z.array(HoleSchema).min(1).max(18),
});

// GET /api/rounds - ラウンド一覧取得
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [rounds, total] = await Promise.all([
    prisma.round.findMany({
      where: { userId: auth.userId },
      orderBy: { playedAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { holes: true } },
      },
    }),
    prisma.round.count({ where: { userId: auth.userId } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      rounds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

// POST /api/rounds - ラウンド新規作成
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  // プラン制限チェック
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { plan: true },
  });

  if (user) {
    const limit = await checkRoundLimit(auth.userId, user.plan);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PLAN_LIMIT",
            message: `今月のラウンド記録上限（${limit.max}件）に達しました。プランをアップグレードしてください。`,
          },
        },
        { status: 403 }
      );
    }
  }

  let body;
  try {
    body = CreateRoundSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: err.issues[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "リクエストの形式が不正です" } },
      { status: 400 }
    );
  }

  const stats = calculateRoundStats(body.holes);

  const round = await prisma.round.create({
    data: {
      userId: auth.userId,
      playedAt: new Date(body.playedAt),
      courseName: body.courseName,
      courseRating: body.courseRating ?? null,
      slopeRating: body.slopeRating ?? null,
      weather: body.weather ?? null,
      wind: body.wind ?? null,
      temperature: body.temperature ?? null,
      memo: body.memo ?? null,
      ...stats,
      holes: {
        create: body.holes.map((hole) => ({
          holeNumber: hole.holeNumber,
          par: hole.par,
          score: hole.score,
          putts: hole.putts,
          fairway: hole.fairway ?? null,
          greenInRegulation: hole.greenInRegulation,
          penalty: hole.penalty,
          missType: hole.missType ?? null,
          missDetail: hole.missDetail ?? null,
          clubUsed: hole.clubUsed ?? null,
          approachDistance: hole.approachDistance ?? null,
          approachClub: hole.approachClub ?? null,
        })),
      },
    },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });

  return NextResponse.json({ success: true, data: round }, { status: 201 });
}
