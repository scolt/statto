-- Migration: add duration & timer_started_at columns, extend status enum, backfill old data
--> statement-breakpoint

-- 1. Add duration column (accumulated seconds, default 0)
ALTER TABLE `matches` ADD COLUMN `duration` int NOT NULL DEFAULT 0;
--> statement-breakpoint

-- 2. Add timer_started_at column (running-segment start timestamp)
ALTER TABLE `matches` ADD COLUMN `timer_started_at` timestamp NULL;
--> statement-breakpoint

-- 3. Extend the status enum to include 'paused'
ALTER TABLE `matches` MODIFY COLUMN `status` enum('new','in_progress','done','paused') NOT NULL DEFAULT 'new';
--> statement-breakpoint

-- 4. Backfill duration for finished matches (status = 'done') from started_at / finished_at
UPDATE `matches`
SET `duration` = TIMESTAMPDIFF(SECOND, `started_at`, `finished_at`)
WHERE `status` = 'done'
  AND `started_at` IS NOT NULL
  AND `finished_at` IS NOT NULL;
--> statement-breakpoint

-- 5. Backfill duration for in-progress matches from started_at to NOW()
--    (they were running without pause support; snapshot the elapsed time)
UPDATE `matches`
SET `duration`         = TIMESTAMPDIFF(SECOND, `started_at`, NOW()),
    `timer_started_at` = NOW()
WHERE `status` = 'in_progress'
  AND `started_at` IS NOT NULL;
