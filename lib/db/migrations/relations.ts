import { relations } from "drizzle-orm/relations";
import { users, players, groups, playersGroups } from "./schema";

export const playersRelations = relations(players, ({one, many}) => ({
	user: one(users, {
		fields: [players.userId],
		references: [users.id]
	}),
	playersGroups: many(playersGroups),
}));

export const usersRelations = relations(users, ({many}) => ({
	players: many(players),
}));

export const playersGroupsRelations = relations(playersGroups, ({one}) => ({
	group: one(groups, {
		fields: [playersGroups.groupId],
		references: [groups.id]
	}),
	player: one(players, {
		fields: [playersGroups.playerId],
		references: [players.id]
	}),
}));

export const groupsRelations = relations(groups, ({many}) => ({
	playersGroups: many(playersGroups),
}));