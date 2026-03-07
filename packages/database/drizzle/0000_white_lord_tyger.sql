CREATE TABLE "auth"."accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider_account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" varchar(255),
	"id_token" text,
	"is_active" boolean DEFAULT true,
	"password" varchar(255),
	"failed_login_attempts" integer DEFAULT 0,
	"last_login_at" timestamp with time zone,
	"password_changed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_id" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"version" varchar(20) NOT NULL,
	"icon" varchar(100) NOT NULL,
	"icon_style" varchar(20) DEFAULT 'icon',
	"category" varchar(50) NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"multi_instance" boolean DEFAULT false,
	"default_size" jsonb NOT NULL,
	"min_size" jsonb NOT NULL,
	"max_size" jsonb,
	"author" varchar(100),
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"help_id" integer,
	"is_active" boolean DEFAULT true,
	"is_public" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"app_type" varchar(20) DEFAULT 'core',
	"plugin_version" varchar(20),
	"plugin_author" varchar(255),
	"plugin_description" text,
	"plugin_permissions" jsonb,
	"plugin_dependencies" jsonb,
	"plugin_min_webos_version" varchar(20),
	"plugin_status" varchar(20) DEFAULT 'active',
	"plugin_installed_at" timestamp with time zone,
	"plugin_updated_at" timestamp with time zone,
	CONSTRAINT "apps_app_id_unique" UNIQUE("app_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" varchar(50) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" integer,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant1_id" integer NOT NULL,
	"participant2_id" integer NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."desktop_shortcuts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"app_id" varchar(100) NOT NULL,
	"position" jsonb NOT NULL,
	"label" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar(255),
	"recipient" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"template_type" varchar(100),
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now(),
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_type" varchar(100) NOT NULL,
	"locale" varchar(10) DEFAULT 'hu' NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject_template" text NOT NULL,
	"html_template" text NOT NULL,
	"text_template" text NOT NULL,
	"required_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"optional_data" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_templates_type_locale_unique" UNIQUE("template_type","locale")
);
--> statement-breakpoint
CREATE TABLE "platform"."error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"source" varchar(50) NOT NULL,
	"stack" text,
	"context" jsonb,
	"user_id" varchar(255),
	"url" varchar(2048),
	"method" varchar(10),
	"route_id" varchar(255),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."files" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(36) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"scope" varchar(20) NOT NULL,
	"user_id" integer,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"thumbnail_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."group_app_access" (
	"group_id" integer NOT NULL,
	"app_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "group_app_access_group_id_app_id_pk" PRIMARY KEY("group_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."group_permissions" (
	"group_id" serial NOT NULL,
	"permission_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "group_permissions_group_id_permission_id_pk" PRIMARY KEY("group_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "locales_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "platform"."messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	"is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "platform"."notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"app_name" text,
	"title" jsonb NOT NULL,
	"message" jsonb NOT NULL,
	"details" jsonb,
	"type" text DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "auth"."permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"resource_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "platform"."plugin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(255) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_data" jsonb,
	"user_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."plugin_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(255) NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"metric_value" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."plugin_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(255) NOT NULL,
	"role_id" varchar(255),
	"group_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"enabled" boolean DEFAULT true,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth"."resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "resources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth"."role_app_access" (
	"role_id" integer NOT NULL,
	"app_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "role_app_access_role_id_app_id_pk" PRIMARY KEY("role_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."role_permissions" (
	"role_id" serial NOT NULL,
	"permission_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(255),
	"user_agent" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "platform"."theme_presets" (
	"id" serial PRIMARY KEY NOT NULL,
	"locale" varchar(10) DEFAULT 'hu' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"settings" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "theme_presets_locale_name_unique" UNIQUE("locale","name")
);
--> statement-breakpoint
CREATE TABLE "platform"."translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"locale" varchar(10) NOT NULL,
	"namespace" varchar(100) NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."two_factors" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user_groups" (
	"user_id" integer,
	"group_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."user_roles" (
	"user_id" integer,
	"role_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"username" varchar(50),
	"image" varchar(255),
	"oauth_image" varchar(255),
	"user_settings" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "auth"."verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_provider_id_providers_name_fk" FOREIGN KEY ("provider_id") REFERENCES "auth"."providers"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."desktop_shortcuts" ADD CONSTRAINT "desktop_shortcuts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."group_app_access" ADD CONSTRAINT "group_app_access_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "auth"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."group_app_access" ADD CONSTRAINT "group_app_access_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "platform"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."group_permissions" ADD CONSTRAINT "group_permissions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "auth"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."group_permissions" ADD CONSTRAINT "group_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "auth"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."permissions" ADD CONSTRAINT "permissions_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "auth"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."plugin_logs" ADD CONSTRAINT "plugin_logs_plugin_id_apps_app_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "platform"."apps"("app_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."plugin_metrics" ADD CONSTRAINT "plugin_metrics_plugin_id_apps_app_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "platform"."apps"("app_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."plugin_permissions" ADD CONSTRAINT "plugin_permissions_plugin_id_apps_app_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "platform"."apps"("app_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."role_app_access" ADD CONSTRAINT "role_app_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."role_app_access" ADD CONSTRAINT "role_app_access_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "platform"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "auth"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_groups" ADD CONSTRAINT "user_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_groups" ADD CONSTRAINT "user_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "auth"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_apps_app_type" ON "platform"."apps" USING btree ("app_type");--> statement-breakpoint
CREATE INDEX "idx_apps_plugin_status" ON "platform"."apps" USING btree ("plugin_status");--> statement-breakpoint
CREATE INDEX "desktop_shortcuts_user_id_idx" ON "platform"."desktop_shortcuts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "desktop_shortcuts_app_id_idx" ON "platform"."desktop_shortcuts" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "email_logs_recipient_idx" ON "platform"."email_logs" USING btree ("recipient");--> statement-breakpoint
CREATE INDEX "email_logs_status_idx" ON "platform"."email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_logs_created_at_idx" ON "platform"."email_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_logs_message_id_idx" ON "platform"."email_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "email_logs_recipient_status_idx" ON "platform"."email_logs" USING btree ("recipient","status");--> statement-breakpoint
CREATE INDEX "email_logs_status_created_at_idx" ON "platform"."email_logs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "email_templates_type_idx" ON "platform"."email_templates" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "email_templates_locale_idx" ON "platform"."email_templates" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "email_templates_is_active_idx" ON "platform"."email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "email_templates_type_locale_active_idx" ON "platform"."email_templates" USING btree ("template_type","locale","is_active");--> statement-breakpoint
CREATE INDEX "email_templates_created_at_idx" ON "platform"."email_templates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_templates_updated_at_idx" ON "platform"."email_templates" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "error_logs_level_idx" ON "platform"."error_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "error_logs_source_idx" ON "platform"."error_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "error_logs_created_at_idx" ON "platform"."error_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "error_logs_level_created_at_idx" ON "platform"."error_logs" USING btree ("level","created_at");--> statement-breakpoint
CREATE INDEX "idx_plugin_logs_plugin_id" ON "platform"."plugin_logs" USING btree ("plugin_id");--> statement-breakpoint
CREATE INDEX "idx_plugin_logs_event_type" ON "platform"."plugin_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_plugin_logs_created_at" ON "platform"."plugin_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_plugin_metrics_plugin_id" ON "platform"."plugin_metrics" USING btree ("plugin_id");--> statement-breakpoint
CREATE INDEX "idx_plugin_metrics_metric_type" ON "platform"."plugin_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_plugin_metrics_created_at" ON "platform"."plugin_metrics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_plugin_permissions_plugin_id" ON "platform"."plugin_permissions" USING btree ("plugin_id");--> statement-breakpoint
CREATE INDEX "idx_plugin_permissions_role_id" ON "platform"."plugin_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_plugin_permissions_group_id" ON "platform"."plugin_permissions" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "theme_presets_locale_idx" ON "platform"."theme_presets" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_translation_idx" ON "platform"."translations" USING btree ("locale","namespace","key");