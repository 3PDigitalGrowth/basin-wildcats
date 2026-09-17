import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items_children" ADD COLUMN "description" varchar;
  ALTER TABLE "header_nav_items_children" ADD COLUMN "image_id" integer;
  ALTER TABLE "header_nav_items" ADD COLUMN "panel_blurb" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "panel_image_id" integer;
  ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_panel_image_id_media_id_fk" FOREIGN KEY ("panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_nav_items_children_image_idx" ON "header_nav_items_children" USING btree ("image_id");
  CREATE INDEX "header_nav_items_panel_panel_image_idx" ON "header_nav_items" USING btree ("panel_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items_children" DROP CONSTRAINT "header_nav_items_children_image_id_media_id_fk";
  
  ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_nav_items_panel_image_id_media_id_fk";
  
  DROP INDEX "header_nav_items_children_image_idx";
  DROP INDEX "header_nav_items_panel_panel_image_idx";
  ALTER TABLE "header_nav_items_children" DROP COLUMN "description";
  ALTER TABLE "header_nav_items_children" DROP COLUMN "image_id";
  ALTER TABLE "header_nav_items" DROP COLUMN "panel_blurb";
  ALTER TABLE "header_nav_items" DROP COLUMN "panel_image_id";`)
}
