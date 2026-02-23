"use server";

import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { eq } from "drizzle-orm";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export async function deleteGroup(groupId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
}
