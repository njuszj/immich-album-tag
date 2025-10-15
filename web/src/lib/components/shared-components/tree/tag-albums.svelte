<script lang="ts">
  import { preferences } from '$lib/stores/user.store';
  import { getAssetThumbnailUrl } from '$lib/utils';
  import type { AlbumResponseDto, TagResponseDto } from '@immich/sdk';
  import { AssetMediaSize } from '@immich/sdk';
  import { Icon } from '@immich/ui';
  import { mdiImage, mdiImageMultiple } from '@mdi/js';

  interface Props {
    tag: TagResponseDto;
    albums: AlbumResponseDto[];
  }

  let { tag, albums }: Props = $props();

  // Filter albums that have this tag
  const tagAlbums = $derived(albums.filter((album) => album.tags?.some((t) => t.id === tag.id)) || []);
</script>

{#if $preferences?.tags?.enabled && tagAlbums.length > 0}
  <div class="px-4">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Albums</h3>
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {tagAlbums.length}
        {tagAlbums.length === 1 ? 'album' : 'albums'} with this tag
      </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {#each tagAlbums as album}
        <a
          href="/albums/{album.id}"
          class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md"
          title={album.albumName}
        >
          {#if album.albumThumbnailAssetId}
            <img
              src={getAssetThumbnailUrl({ id: album.albumThumbnailAssetId, size: AssetMediaSize.Thumbnail })}
              alt=""
              class="w-16 h-16 object-cover rounded-lg"
              loading="lazy"
            />
          {:else}
            <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Icon icon={album.assetCount === 0 ? mdiImage : mdiImageMultiple} size="24" class="text-gray-400" />
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <div class="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
              {album.albumName}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {album.assetCount}
              {album.assetCount === 1 ? 'photo' : 'photos'}
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
{/if}
