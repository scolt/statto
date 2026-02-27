-- Migration: sports table + group sport reference
--> statement-breakpoint

-- 1. Create the sports reference table
CREATE TABLE `sports` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`       varchar(100) NOT NULL,
  `slug`       varchar(100) NOT NULL,
  `icon`       varchar(100) NOT NULL DEFAULT 'trophy',
  `config`     json,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sports_slug_unique` (`slug`)
);
--> statement-breakpoint

-- 2. Seed initial sports (icon = lucide icon name)
INSERT INTO `sports` (`name`, `slug`, `icon`) VALUES
  ('Table Tennis',  'table_tennis',  'table-2'),
  ('Football',      'football',      'circle-dot'),
  ('Basketball',    'basketball',    'dumbbell'),
  ('Tennis',        'tennis',        'circle'),
  ('Badminton',     'badminton',     'wind'),
  ('Volleyball',    'volleyball',    'circle-dot'),
  ('Pool / Snooker','pool',          'target'),
  ('Darts',         'darts',         'crosshair'),
  ('Chess',         'chess',         'crown'),
  ('Other',         'other',         'trophy');
--> statement-breakpoint

-- 3. Add sport_id column to groups (nullable — existing groups keep NULL until edited)
ALTER TABLE `groups` ADD COLUMN `sport_id` bigint unsigned NULL;
--> statement-breakpoint

-- 4. Add FK constraint
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_sport_id_sports_id_fk`
  FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`)
  ON DELETE SET NULL;
