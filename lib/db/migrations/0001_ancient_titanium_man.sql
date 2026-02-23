ALTER TABLE `matches` MODIFY COLUMN `status` enum('new','in_progress','done') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `matches` ADD `started_at` timestamp;