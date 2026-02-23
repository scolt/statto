import { relations } from 'drizzle-orm';
import { usersTable } from './schemas/users';
import { playersTable } from './schemas/players';
import { groupsTable } from './schemas/groups';
import { playersGroupsTable } from './schemas/players-groups';

export const usersRelations = relations(usersTable, ({ one }) => ({
  player: one(playersTable, {
    fields: [usersTable.id],
    references: [playersTable.userId],
  }),
}));

export const playersRelations = relations(playersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [playersTable.userId],
    references: [usersTable.id],
  }),
  playersGroups: many(playersGroupsTable),
}));

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  playersGroups: many(playersGroupsTable),
}));

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
