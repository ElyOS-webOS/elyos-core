CREATE TABLE "platform"."activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_key" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"resource_type" varchar(100),
	"resource_id" varchar(255),
	"context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "platform"."activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_action_key_idx" ON "platform"."activity_logs" USING btree ("action_key");--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "platform"."activity_logs" USING btree ("created_at");