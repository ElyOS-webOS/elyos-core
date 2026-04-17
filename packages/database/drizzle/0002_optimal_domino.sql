CREATE TABLE "platform"."ai_avatars" (
	"id" serial PRIMARY KEY NOT NULL,
	"idname" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"manifest" jsonb NOT NULL,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_avatars_idname_unique" UNIQUE("idname")
);
--> statement-breakpoint
CREATE TABLE "platform"."user_avatar_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"avatar_idname" varchar(100) NOT NULL,
	"quality" varchar(2) DEFAULT 'sd' NOT NULL,
	"custom_name" varchar(255),
	CONSTRAINT "user_avatar_configs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "platform"."user_avatar_configs" ADD CONSTRAINT "user_avatar_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."user_avatar_configs" ADD CONSTRAINT "user_avatar_configs_avatar_idname_ai_avatars_idname_fk" FOREIGN KEY ("avatar_idname") REFERENCES "platform"."ai_avatars"("idname") ON DELETE restrict ON UPDATE no action;