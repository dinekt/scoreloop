import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { z } from "zod";

const PracticeItemSchema = z.object({
  category: z.enum([
    "DRIVER", "WOOD", "UTILITY", "LONG_IRON", "MID_IRON",
    "SHORT_IRON", "WEDGE", "APPROACH", "BUNKER", "PUTTING",
    "SWING_DRILL", "FITNESS", "OTHER",
  ]),
  detail: z.string().nullable().optional(),
  ballCount: z.number().min(0).nullable().optional(),
  durationMin: z.number().min(0).nullable().optional(),
  club: z.string().nullable().optional(),
  feelRating: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const CreatePracticeSchema = z.object({
  practicedAt: z.string(),
  location: z.enum([
    "DRIVING_RANGE", "INDOOR_GOLF", "PUTTING_GREEN",
    "APPROACH_AREA", "HOME", "COURSE", "OTHER",
  ]),
  locationName: z.string().nullable().optional(),
  durationMin: z.number().min(1),
  feelRating: z.number().min(1).max(5).nullable().optional(),
  memo: z.string().nullable().optional(),
  items: z.array(PracticeItemSchema).min(1),
});

// GET /api/practices - 練習ログ一覧
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [practices, total] = await Promise.all([
    prisma.practice.findMany({
      where: { userId: auth.userId },
      orderBy: { practicedAt: "desc" },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.practice.count({ where: { userId: auth.userId } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      practices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

// POST /api/practices - 練習ログ新規作成
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  let body;
  try {
    body = CreatePracticeSchema.parse(await request.json());
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

  const practice = await prisma.practice.create({
    data: {
      userId: auth.userId,
      practicedAt: new Date(body.practicedAt),
      location: body.location,
      locationName: body.locationName ?? null,
      durationMin: body.durationMin,
      feelRating: body.feelRating ?? null,
      memo: body.memo ?? null,
      items: {
        create: body.items.map((item) => ({
          category: item.category,
          detail: item.detail ?? null,
          ballCount: item.ballCount ?? null,
          durationMin: item.durationMin ?? null,
          club: item.club ?? null,
          feelRating: item.feelRating ?? null,
          notes: item.notes ?? null,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ success: true, data: practice }, { status: 201 });
}
