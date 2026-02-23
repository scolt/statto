import { relations } from 'drizzle-orm';
import { usersTable } from './schemas/users';
import { playersTable } from './schemas/players';
import { groupsTable } from './schemas/groups';
import { playersGroupsTable } from './schemas/players-groups';
import { matchesTable } from './schemas/matches';
import { matchPlayersTable } from './schemas/match-players';
import { gamesTable } from './schemas/games';
import { gameScoresTable } from './schemas/game-scores';
import { marksTable } from './schemas/marks';
import { gameMarksTable } from './schemas/game-marks';

// ── Users ──────────────────────────────────────────────
export const usersRelations = relations(usersTable, ({ one }) => ({
  player: one(playersTable, {
    fields: [usersTable.id],
    references: [playersTable.userId],
  }),
}));

// ── Players ────────────────────────────────────────────
export const playersRelations = relations(playersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [playersTable.userId],
    references: [usersTable.id],
  }),
  playersGroups: many(playersGroupsTable),
  matchPlayers: many(matchPlayersTable),
  gameScores: many(gameScoresTable),
}));

// ── Groups ─────────────────────────────────────────────
export const groupsRelations = relations(groupsTable, ({ many }) => ({
  playersGroups: many(playersGroupsTable),
  matches: many(matchesTable),
}));

// ── Players ↔ Groups (join table) ─────────────────────
export const playersGroupsRelations = relations(playersGroupsTable, ({ one }) => ({
  player: one(playersTable, {
    fields: [playersGroupsTable.playerId],
    references: [playersTable.id],
  }),
  group: one(groupsTable, {
    fields: [playersGroupsTable.groupId],
    references: [groupsTable.id],
  }),
}));

// ── Matches ────────────────────────────────────────────
export const matchesRelations = relations(matchesTable, ({ one, many }) => ({
  group: one(groupsTable, {
    fields: [matchesTable.groupId],
    references: [groupsTable.id],
  }),
  matchPlayers: many(matchPlayersTable),
  games: many(gamesTable),
}));

// ── Match ↔ Players (join table) ──────────────────────
export const matchPlayersRelations = relations(matchPlayersTable, ({ one }) => ({
  match: one(matchesTable, {
    fields: [matchPlayersTable.matchId],
    references: [matchesTable.id],
  }),
  player: one(playersTable, {
    fields: [matchPlayersTable.playerId],
    references: [playersTable.id],
  }),
}));

// ── Games ──────────────────────────────────────────────
export const gamesRelations = relations(gamesTable, ({ one, many }) => ({
  match: one(matchesTable, {
    fields: [gamesTable.matchId],
    references: [matchesTable.id],
  }),
  scores: many(gameScoresTable),
  gameMarks: many(gameMarksTable),
}));

// ── Game Scores ────────────────────────────────────────
export const gameScoresRelations = relations(gameScoresTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [gameScoresTable.gameId],
    references: [gamesTable.id],
  }),
  player: one(playersTable, {
    fields: [gameScoresTable.playerId],
    references: [playersTable.id],
  }),
}));

// ── Marks (lookup) ─────────────────────────────────────
export const marksRelations = relations(marksTable, ({ many }) => ({
  gameMarks: many(gameMarksTable),
}));

// ── Games ↔ Marks (join table) ────────────────────────
export const gameMarksRelations = relations(gameMarksTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [gameMarksTable.gameId],
    references: [gamesTable.id],
  }),
  mark: one(marksTable, {
    fields: [gameMarksTable.markId],
    references: [marksTable.id],
  }),
}));
