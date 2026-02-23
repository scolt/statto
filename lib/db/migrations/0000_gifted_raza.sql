CREATE TABLE `game_marks` (
	`game_id` bigint unsigned NOT NULL,
	`mark_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `game_marks_game_id_mark_id_pk` PRIMARY KEY(`game_id`,`mark_id`)
);
--> statement-breakpoint
CREATE TABLE `game_scores` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`game_id` bigint unsigned NOT NULL,
	`player_id` bigint unsigned NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`match_id` bigint unsigned NOT NULL,
	`comment` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marks_id` PRIMARY KEY(`id`),
	CONSTRAINT `marks_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `match_players` (
	`match_id` bigint unsigned NOT NULL,
	`player_id` bigint unsigned NOT NULL,
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `match_players_match_id_player_id_pk` PRIMARY KEY(`match_id`,`player_id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('new','done') NOT NULL DEFAULT 'new',
	`comment` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players_groups` (
	`playerId` bigint unsigned NOT NULL,
	`groupId` bigint unsigned NOT NULL,
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `players_groups_playerId_groupId_pk` PRIMARY KEY(`playerId`,`groupId`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned NOT NULL,
	`nickname` varchar(100) NOT NULL,
	`favouriteSports` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(255),
	`externalId` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `game_marks` ADD CONSTRAINT `game_marks_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `game_marks` ADD CONSTRAINT `game_marks_mark_id_marks_id_fk` FOREIGN KEY (`mark_id`) REFERENCES `marks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `game_scores` ADD CONSTRAINT `game_scores_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `game_scores` ADD CONSTRAINT `game_scores_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `games` ADD CONSTRAINT `games_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players_groups` ADD CONSTRAINT `players_groups_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players_groups` ADD CONSTRAINT `players_groups_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;