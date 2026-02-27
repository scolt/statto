"use server";

import {
  findAllSports,
  findSportById,
} from "../repository/sports.repository";
import type { Sport } from "../repository/sports.repository";

export async function getSports(): Promise<Sport[]> {
  return findAllSports();
}

export async function getSportById(id: number): Promise<Sport | null> {
  return findSportById(id);
}
