-- Step 1: Drop FK constraints on players_groups so we can modify PK
ALTER TABLE `players_groups` DROP FOREIGN KEY `players_groups_playerId_players_id_fk`;
ALTER TABLE `players_groups` DROP FOREIGN KEY `players_groups_groupId_groups_id_fk`;

-- Step 2: Drop and recreate the PK on players_groups (needed for Drizzle PK naming consistency)
ALTER TABLE `players_groups` DROP PRIMARY KEY;
ALTER TABLE `players_groups` ADD PRIMARY KEY(`playerId`, `groupId`);

-- Step 3: Re-add FK constraints on players_groups
ALTER TABLE `players_groups` ADD CONSTRAINT `players_groups_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `players_groups` ADD CONSTRAINT `players_groups_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;

-- Step 4: Add PKs to game_marks and match_players (if missing)
ALTER TABLE `game_marks` ADD PRIMARY KEY(`game_id`, `mark_id`);
ALTER TABLE `match_players` ADD PRIMARY KEY(`match_id`, `player_id`);

-- Step 5: Add status column to matches
ALTER TABLE `matches` ADD `status` enum('new','done') DEFAULT 'new' NOT NULL;

-- Step 6: Add all missing FK constraints
ALTER TABLE `game_marks` ADD CONSTRAINT `game_marks_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `game_marks` ADD CONSTRAINT `game_marks_mark_id_marks_id_fk` FOREIGN KEY (`mark_id`) REFERENCES `marks`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `game_scores` ADD CONSTRAINT `game_scores_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `game_scores` ADD CONSTRAINT `game_scores_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `games` ADD CONSTRAINT `games_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `matches` ADD CONSTRAINT `matches_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;
