"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { deleteGroupById } from "../repository/groups.repository";

export async function deleteGroup(groupId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await deleteGroupById(groupId);
}
