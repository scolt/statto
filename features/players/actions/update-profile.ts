"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  findFullUserByExternalId,
  findFullPlayerByUserId,
  isNicknameTaken,
  updateUserName,
  updatePlayerNickname,
} from "../repository/players.repository";

export type UpdateProfileState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    nickname?: string;
  };
  success?: boolean;
};

export async function updateProfile(data: {
  name: string;
  nickname: string;
}): Promise<UpdateProfileState> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const name = data.name.trim();
  const nickname = data.nickname.trim();

  // Validate fields
  const fieldErrors: UpdateProfileState["fieldErrors"] = {};

  if (!name || name.length === 0) {
    fieldErrors.name = "Name is required.";
  } else if (name.length > 255) {
    fieldErrors.name = "Name must be 255 characters or fewer.";
  }

  if (!nickname || nickname.length === 0) {
    fieldErrors.nickname = "Nickname is required.";
  } else if (nickname.length > 100) {
    fieldErrors.nickname = "Nickname must be 100 characters or fewer.";
  } else if (!/^[a-zA-Z0-9_\-. ]+$/.test(nickname)) {
    fieldErrors.nickname =
      "Nickname can only contain letters, numbers, spaces, dots, hyphens and underscores.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Look up the current user and player
  const user = await findFullUserByExternalId(session.user.sub);
  if (!user) {
    return { error: "User not found." };
  }

  const player = await findFullPlayerByUserId(user.id);
  if (!player) {
    return { error: "Player profile not found." };
  }

  // Check nickname uniqueness (exclude current player)
  const taken = await isNicknameTaken(nickname, player.id);
  if (taken) {
    return {
      fieldErrors: {
        nickname: "This nickname is already taken. Please choose another.",
      },
    };
  }

  // Update user name and player nickname
  if (user.name !== name) {
    await updateUserName(user.id, name);
  }

  if (player.nickname !== nickname) {
    await updatePlayerNickname(player.id, nickname);
  }

  revalidatePath("/profile");
  revalidatePath("/");

  return { success: true };
}

export async function checkNicknameAvailability(
  nickname: string,
  currentPlayerId: number
): Promise<boolean> {
  const trimmed = nickname.trim();
  if (!trimmed || trimmed.length === 0) return true;

  const taken = await isNicknameTaken(trimmed, currentPlayerId);
  return !taken;
}
