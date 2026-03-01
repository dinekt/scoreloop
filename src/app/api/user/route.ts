import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";

// GET /api/user - ユーザープロフィール取得
export async function GET() {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  let user = await prisma.user.findUnique({
    where: { id: auth.userId },
  });

  // ユーザーが存在しない場合は作成（初回アクセス時）
  if (!user) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = await prisma.user.create({
      data: {
        id: auth.userId,
        email: authUser?.email || "",
        displayName: authUser?.user_metadata?.display_name || null,
      },
    });
  }

  return NextResponse.json({ success: true, data: user });
}

// PUT /api/user - ユーザープロフィール更新
export async function PUT(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const body = await request.json();

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      ...(body.averageScore !== undefined && { averageScore: body.averageScore }),
      ...(body.headSpeed !== undefined && { headSpeed: body.headSpeed }),
      ...(body.handicap !== undefined && { handicap: body.handicap }),
      ...(body.golfStartYear !== undefined && { golfStartYear: body.golfStartYear }),
      ...(body.homeCourseName !== undefined && { homeCourseName: body.homeCourseName }),
    },
  });

  return NextResponse.json({ success: true, data: user });
}
