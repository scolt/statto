"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { deleteMatchById } from "../repository/matches.repository";

export async function deleteMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await deleteMatchById(matchId);
}
