<script lang="ts">
  import { getAlbumDateRange } from '$lib/utils/date-time';
  import { removeAlbumTag } from '$lib/utils/album-utils';
  import { handleError } from '$lib/utils/handle-error';
  import type { AlbumResponseDto } from '@immich/sdk';
  import { Icon, modalManager } from '@immich/ui';
  import { mdiClose, mdiPlus } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import AlbumTagModal from '$lib/modals/AlbumTagModal.svelte';

  interface Props {
    album: AlbumResponseDto;
    isOwned?: boolean;
    onAlbumUpdate?: () => Promise<void>;
  }

  let { album, isOwned = false, onAlbumUpdate }: Props = $props();

  const handleRemoveTag = async (tagId: string) => {
    try {
      await removeAlbumTag({
        albumId: album.id,
        tagIds: [tagId],
        showNotification: true,
      });
      if (onAlbumUpdate) {
        await onAlbumUpdate();
      }
    } catch (error) {
      handleError(error, $t('errors.something_went_wrong'));
    }
  };

  const handleAddTag = async () => {
    await modalManager.show(AlbumTagModal, { albumId: album.id });
    if (onAlbumUpdate) {
      await onAlbumUpdate();
    }
  };
</script>

<span class="my-2 flex gap-2 text-sm font-medium text-gray-500" data-testid="album-details">
  <span>{getAlbumDateRange(album)}</span>
  <span>•</span>
  <span>{$t('items_count', { values: { count: album.assetCount } })}</span>
  {#if album.tags && album.tags.length > 0}
    <span>•</span>
    <div class="flex flex-wrap gap-1 items-center">
      {#each album.tags as tag (tag.id)}
        <div class="group relative inline-block">
          <span
            class="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 pr-6 group-hover:pr-6"
            style="background-color: {tag.color}; color: white;"
          >
            {tag.value}
          </span>
          {#if isOwned}
            <button
              class="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-opacity-70"
              onclick={() => handleRemoveTag(tag.id)}
              aria-label={$t('remove_tag')}
            >
              <Icon icon={mdiClose} size="12" />
            </button>
          {/if}
        </div>
      {/each}
      {#if isOwned}
        <button
          class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          onclick={handleAddTag}
          aria-label={$t('add_tag')}
        >
          <Icon icon={mdiPlus} size="14" />
        </button>
      {/if}
    </div>
  {:else if isOwned}
    <span>•</span>
    <button
      class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      onclick={handleAddTag}
      aria-label={$t('add_tag')}
    >
      <Icon icon={mdiPlus} size="14" />
    </button>
  {/if}
</span>
