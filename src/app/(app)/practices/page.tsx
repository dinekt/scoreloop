import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PracticeSummaryCard } from "@/components/practices/PracticeSummaryCard";
import { Plus } from "lucide-react";

export default async function PracticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [practices, total] = await Promise.all([
    prisma.practice.findMany({
      where: { userId: user.id },
      orderBy: { practicedAt: "desc" },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.practice.count({ where: { userId: user.id } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">練習ログ</h1>
        <Link href="/practices/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            新規記録
          </Button>
        </Link>
      </div>

      {practices.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            まだ練習ログがありません
          </p>
          <Link href="/practices/new" className="mt-4 inline-block">
            <Button variant="outline">最初の練習を記録する</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {practices.map((practice) => (
            <PracticeSummaryCard
              key={practice.id}
              id={practice.id}
              practicedAt={practice.practicedAt.toISOString()}
              location={practice.location}
              locationName={practice.locationName}
              durationMin={practice.durationMin}
              feelRating={practice.feelRating}
              items={practice.items.map((item) => ({
                category: item.category,
                ballCount: item.ballCount,
              }))}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/practices?page=${page - 1}`}>
              <Button variant="outline" size="sm">前へ</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} ページ
          </span>
          {page < totalPages && (
            <Link href={`/practices?page=${page + 1}`}>
              <Button variant="outline" size="sm">次へ</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
