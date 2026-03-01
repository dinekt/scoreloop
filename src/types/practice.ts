import type {
  Practice as PrismaPractice,
  PracticeItem as PrismaPracticeItem,
  PracticeLocation,
  PracticeCategory,
} from "@prisma/client";

export type { PracticeLocation, PracticeCategory };

export type Practice = PrismaPractice;
export type PracticeItem = PrismaPracticeItem;

export type PracticeWithItems = Practice & {
  items: PracticeItem[];
};

export type PracticeSummary = Pick<
  Practice,
  "id" | "practicedAt" | "location" | "locationName" | "durationMin" | "feelRating"
> & {
  items: Pick<PracticeItem, "category" | "ballCount" | "durationMin">[];
};

export type PracticeInput = {
  practicedAt: string;
  location: PracticeLocation;
  locationName?: string | null;
  durationMin: number;
  feelRating?: number | null;
  memo?: string | null;
  items: PracticeItemInput[];
};

export type PracticeItemInput = {
  category: PracticeCategory;
  detail?: string | null;
  ballCount?: number | null;
  durationMin?: number | null;
  club?: string | null;
  feelRating?: number | null;
  notes?: string | null;
};
