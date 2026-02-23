"use server";

import { db } from "@/lib/db";
import { matchesTable } from "@/lib/db/schemas/matches";
import { eq } from "drizzle-orm";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export async function deleteMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await db.delete(matchesTable).where(eq(matchesTable.id, matchId));
}
