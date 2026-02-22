DROP INDEX "credentials_status_idx";--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_photo" varchar(500);