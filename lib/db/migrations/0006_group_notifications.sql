-- Migration: group_notifications table
--> statement-breakpoint

CREATE TABLE `group_notifications` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `group_id`   bigint unsigned NOT NULL,
  `provider`   enum('telegram') NOT NULL,
  `enabled`    boolean NOT NULL DEFAULT true,
  `config`     json NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `group_notifications_group_id_groups_id_fk`
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`)
    ON DELETE CASCADE
);
