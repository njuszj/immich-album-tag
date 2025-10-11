import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TABLE "tag_album" ("albumsId" uuid NOT NULL, "tagsId" uuid NOT NULL);`.execute(db);
  await sql`ALTER TABLE "tag_album" ADD CONSTRAINT "PK_tag_album_albumsId_tagsId" PRIMARY KEY ("albumsId", "tagsId");`.execute(
    db,
  );
  await sql`ALTER TABLE "tag_album" ADD CONSTRAINT "FK_tag_album_albumsId" FOREIGN KEY ("albumsId") REFERENCES "album" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(
    db,
  );
  await sql`ALTER TABLE "tag_album" ADD CONSTRAINT "FK_tag_album_tagsId" FOREIGN KEY ("tagsId") REFERENCES "tag" ("id") ON UPDATE CASCADE ON DELETE CASCADE;`.execute(
    db,
  );
  await sql`CREATE INDEX "IDX_tag_album_albumsId" ON "tag_album" ("albumsId");`.execute(db);
  await sql`CREATE INDEX "IDX_tag_album_tagsId" ON "tag_album" ("tagsId");`.execute(db);
  await sql`CREATE INDEX "IDX_tag_album_albumsId_tagsId" ON "tag_album" ("albumsId", "tagsId");`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX "IDX_tag_album_albumsId_tagsId";`.execute(db);
  await sql`DROP INDEX "IDX_tag_album_tagsId";`.execute(db);
  await sql`DROP INDEX "IDX_tag_album_albumsId";`.execute(db);
  await sql`ALTER TABLE "tag_album" DROP CONSTRAINT "FK_tag_album_tagsId";`.execute(db);
  await sql`ALTER TABLE "tag_album" DROP CONSTRAINT "FK_tag_album_albumsId";`.execute(db);
  await sql`ALTER TABLE "tag_album" DROP CONSTRAINT "PK_tag_album_albumsId_tagsId";`.execute(db);
  await sql`DROP TABLE "tag_album";`.execute(db);
}
