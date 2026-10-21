import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_quick_links_items_icon" AS ENUM('singlet', 'people', 'megaphone', 'hoodie', 'whistle', 'ball', 'calendar', 'document');
  CREATE TYPE "public"."enum_pages_blocks_quick_links_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_quick_links_items_icon" AS ENUM('singlet', 'people', 'megaphone', 'hoodie', 'whistle', 'ball', 'calendar', 'document');
  CREATE TYPE "public"."enum__pages_v_blocks_quick_links_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_blocks_film_reel_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_film_reel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Game day',
  	"title_hollow" varchar DEFAULT 'moments',
  	"kicker" varchar,
  	"include_reels" boolean DEFAULT true,
  	"reel_count" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quick_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_quick_links_items_icon" DEFAULT 'ball',
  	"label" varchar,
  	"helper" varchar,
  	"show_latest_news" boolean DEFAULT false,
  	"link_type" "enum_pages_blocks_quick_links_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_film_reel_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_film_reel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Game day',
  	"title_hollow" varchar DEFAULT 'moments',
  	"kicker" varchar,
  	"include_reels" boolean DEFAULT true,
  	"reel_count" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quick_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_quick_links_items_icon" DEFAULT 'ball',
  	"label" varchar,
  	"helper" varchar,
  	"show_latest_news" boolean DEFAULT false,
  	"link_type" "enum__pages_v_blocks_quick_links_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_instagram_feed" ADD COLUMN "exclude_reels" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_instagram_feed" ADD COLUMN "exclude_reels" boolean DEFAULT false;
  ALTER TABLE "instagram_posts" ADD COLUMN "video_id" integer;
  ALTER TABLE "pages_blocks_film_reel_frames" ADD CONSTRAINT "pages_blocks_film_reel_frames_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_film_reel_frames" ADD CONSTRAINT "pages_blocks_film_reel_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_film_reel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_film_reel" ADD CONSTRAINT "pages_blocks_film_reel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quick_links_items" ADD CONSTRAINT "pages_blocks_quick_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quick_links" ADD CONSTRAINT "pages_blocks_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_film_reel_frames" ADD CONSTRAINT "_pages_v_blocks_film_reel_frames_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_film_reel_frames" ADD CONSTRAINT "_pages_v_blocks_film_reel_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_film_reel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_film_reel" ADD CONSTRAINT "_pages_v_blocks_film_reel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quick_links_items" ADD CONSTRAINT "_pages_v_blocks_quick_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quick_links" ADD CONSTRAINT "_pages_v_blocks_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_film_reel_frames_order_idx" ON "pages_blocks_film_reel_frames" USING btree ("_order");
  CREATE INDEX "pages_blocks_film_reel_frames_parent_id_idx" ON "pages_blocks_film_reel_frames" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_film_reel_frames_image_idx" ON "pages_blocks_film_reel_frames" USING btree ("image_id");
  CREATE INDEX "pages_blocks_film_reel_order_idx" ON "pages_blocks_film_reel" USING btree ("_order");
  CREATE INDEX "pages_blocks_film_reel_parent_id_idx" ON "pages_blocks_film_reel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_film_reel_path_idx" ON "pages_blocks_film_reel" USING btree ("_path");
  CREATE INDEX "pages_blocks_quick_links_items_order_idx" ON "pages_blocks_quick_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_quick_links_items_parent_id_idx" ON "pages_blocks_quick_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quick_links_order_idx" ON "pages_blocks_quick_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_quick_links_parent_id_idx" ON "pages_blocks_quick_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quick_links_path_idx" ON "pages_blocks_quick_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_film_reel_frames_order_idx" ON "_pages_v_blocks_film_reel_frames" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_film_reel_frames_parent_id_idx" ON "_pages_v_blocks_film_reel_frames" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_film_reel_frames_image_idx" ON "_pages_v_blocks_film_reel_frames" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_film_reel_order_idx" ON "_pages_v_blocks_film_reel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_film_reel_parent_id_idx" ON "_pages_v_blocks_film_reel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_film_reel_path_idx" ON "_pages_v_blocks_film_reel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quick_links_items_order_idx" ON "_pages_v_blocks_quick_links_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quick_links_items_parent_id_idx" ON "_pages_v_blocks_quick_links_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quick_links_order_idx" ON "_pages_v_blocks_quick_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quick_links_parent_id_idx" ON "_pages_v_blocks_quick_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quick_links_path_idx" ON "_pages_v_blocks_quick_links" USING btree ("_path");
  ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "instagram_posts_video_idx" ON "instagram_posts" USING btree ("video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_film_reel_frames" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_film_reel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quick_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_film_reel_frames" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_film_reel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quick_links_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quick_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_film_reel_frames" CASCADE;
  DROP TABLE "pages_blocks_film_reel" CASCADE;
  DROP TABLE "pages_blocks_quick_links_items" CASCADE;
  DROP TABLE "pages_blocks_quick_links" CASCADE;
  DROP TABLE "_pages_v_blocks_film_reel_frames" CASCADE;
  DROP TABLE "_pages_v_blocks_film_reel" CASCADE;
  DROP TABLE "_pages_v_blocks_quick_links_items" CASCADE;
  DROP TABLE "_pages_v_blocks_quick_links" CASCADE;
  ALTER TABLE "instagram_posts" DROP CONSTRAINT "instagram_posts_video_id_media_id_fk";
  
  DROP INDEX "instagram_posts_video_idx";
  ALTER TABLE "pages_blocks_instagram_feed" DROP COLUMN "exclude_reels";
  ALTER TABLE "_pages_v_blocks_instagram_feed" DROP COLUMN "exclude_reels";
  ALTER TABLE "instagram_posts" DROP COLUMN "video_id";
  DROP TYPE "public"."enum_pages_blocks_quick_links_items_icon";
  DROP TYPE "public"."enum_pages_blocks_quick_links_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_quick_links_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_quick_links_items_link_type";`)
}
