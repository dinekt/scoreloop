import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the authenticated user's ID from Supabase, or return an error response.
 */
export async function getAuthenticatedUserId(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      ),
    };
  }

  return { userId: user.id };
}
