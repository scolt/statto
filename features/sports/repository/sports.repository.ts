import { db } from "@/lib/db";
import { sportsTable } from "@/lib/db/schemas/sports";
import { eq } from "drizzle-orm";

export type Sport = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};

export async function findAllSports(): Promise<Sport[]> {
  return db
    .select({
      id: sportsTable.id,
      name: sportsTable.name,
      slug: sportsTable.slug,
      icon: sportsTable.icon,
    })
    .from(sportsTable)
    .orderBy(sportsTable.name);
}

export async function findSportById(id: number): Promise<Sport | null> {
  const rows = await db
    .select({
      id: sportsTable.id,
      name: sportsTable.name,
      slug: sportsTable.slug,
      icon: sportsTable.icon,
    })
    .from(sportsTable)
    .where(eq(sportsTable.id, id))
    .limit(1);

  return rows[0] ?? null;
}
