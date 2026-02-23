import { mysqlTable, mysqlSchema, AnyMySqlColumn, bigint, timestamp, primaryKey, unique, serial, int, text, varchar, foreignKey } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const gameMarks = mysqlTable("game_marks", {
	gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
	markId: bigint("mark_id", { mode: "number", unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
});

export const gameScores = mysqlTable("game_scores", {
	id: serial().notNull(),
	gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
	playerId: bigint("player_id", { mode: "number", unsigned: true }).notNull(),
	score: int().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "game_scores_id"}),
	unique("id").on(table.id),
]);

export const games = mysqlTable("games", {
	id: serial().notNull(),
	matchId: bigint("match_id", { mode: "number", unsigned: true }).notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "games_id"}),
	unique("id").on(table.id),
]);

export const groups = mysqlTable("groups", {
	id: serial().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "groups_id"}),
	unique("id").on(table.id),
]);

export const marks = mysqlTable("marks", {
	id: serial().notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "marks_id"}),
	unique("id").on(table.id),
	unique("marks_name_unique").on(table.name),
]);

export const matchPlayers = mysqlTable("match_players", {
	matchId: bigint("match_id", { mode: "number", unsigned: true }).notNull(),
	playerId: bigint("player_id", { mode: "number", unsigned: true }).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`(now())`),
});

export const matches = mysqlTable("matches", {
	id: serial().notNull(),
	groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "matches_id"}),
	unique("id").on(table.id),
]);

export const players = mysqlTable("players", {
	id: serial().notNull(),
	userId: bigint({ mode: "number", unsigned: true }).notNull().references(() => users.id),
	nickname: varchar({ length: 100 }).notNull(),
	favouriteSports: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "players_id"}),
	unique("id").on(table.id),
	unique("players_userId_unique").on(table.userId),
]);

export const playersGroups = mysqlTable("players_groups", {
	playerId: bigint({ mode: "number", unsigned: true }).notNull().references(() => players.id, { onDelete: "cascade" } ),
	groupId: bigint({ mode: "number", unsigned: true }).notNull().references(() => groups.id, { onDelete: "cascade" } ),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.playerId, table.groupId], name: "players_groups_playerId_groupId"}),
]);

export const users = mysqlTable("users", {
	id: serial().notNull(),
	name: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }),
	externalId: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("id").on(table.id),
]);
