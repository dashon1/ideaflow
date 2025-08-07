CREATE TABLE "content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mvp_id" varchar,
	"content_type" varchar NOT NULL,
	"script_text" text,
	"video_format_selected" varchar,
	"generation_platform_used" varchar,
	"link_to_generated_asset" text,
	"is_ready_for_distribution" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pain_point_id" varchar,
	"summary_text" text NOT NULL,
	"problem_type" varchar,
	"confidence_score" numeric(3, 2),
	"tags" text[],
	"user_type" varchar,
	"domain" varchar,
	"app_type" varchar,
	"priority_score" numeric(3, 1),
	"is_well_solved" boolean DEFAULT false,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mvps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"platform_selected" varchar,
	"mvp_spec" jsonb,
	"estimated_effort_score" integer,
	"is_ready_for_user_test" boolean DEFAULT false,
	"generated_link" text,
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pain_points" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar NOT NULL,
	"source_link" text,
	"title" text,
	"full_text" text NOT NULL,
	"engagement_score" integer DEFAULT 0,
	"detected_niche" varchar,
	"timestamp" timestamp DEFAULT now(),
	"mode" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"setting_key" varchar NOT NULL,
	"setting_value" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_mvp_id_mvps_id_fk" FOREIGN KEY ("mvp_id") REFERENCES "public"."mvps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_pain_point_id_pain_points_id_fk" FOREIGN KEY ("pain_point_id") REFERENCES "public"."pain_points"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mvps" ADD CONSTRAINT "mvps_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");