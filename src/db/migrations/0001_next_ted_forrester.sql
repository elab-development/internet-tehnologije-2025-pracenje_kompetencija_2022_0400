ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "credential_competencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profile_shares" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "audit_logs" CASCADE;--> statement-breakpoint
DROP TABLE "credential_competencies" CASCADE;--> statement-breakpoint
DROP TABLE "profile_shares" CASCADE;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
DROP TABLE "user_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "competencies" DROP CONSTRAINT "competencies_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_moderated_by_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "competencies_category_idx";--> statement-breakpoint
DROP INDEX "credentials_type_idx";--> statement-breakpoint
DROP INDEX "profiles_public_idx";--> statement-breakpoint
DROP INDEX "user_competencies_featured_idx";--> statement-breakpoint
DROP INDEX "users_name_idx";--> statement-breakpoint
DROP INDEX "credentials_status_idx";--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE INDEX "credentials_status_idx" ON "credentials" USING btree ("status");--> statement-breakpoint
ALTER TABLE "competencies" DROP COLUMN "created_by_user_id";--> statement-breakpoint
ALTER TABLE "credentials" DROP COLUMN "moderation_status";--> statement-breakpoint
ALTER TABLE "credentials" DROP COLUMN "moderated_by_user_id";--> statement-breakpoint
ALTER TABLE "credentials" DROP COLUMN "moderated_at";--> statement-breakpoint
ALTER TABLE "credentials" DROP COLUMN "moderation_note";