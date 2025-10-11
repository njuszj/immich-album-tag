import { AlbumTable } from 'src/schema/tables/album.table';
import { TagTable } from 'src/schema/tables/tag.table';
import { ForeignKeyColumn, Index, Table } from 'src/sql-tools';

@Index({ columns: ['albumsId', 'tagsId'] })
@Table('tag_album')
export class TagAlbumTable {
  @ForeignKeyColumn(() => AlbumTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE', primary: true, index: true })
  albumsId!: string;

  @ForeignKeyColumn(() => TagTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE', primary: true, index: true })
  tagsId!: string;
}