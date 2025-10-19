<script lang="ts">
  import { page } from '$app/state';
  import { shortcut } from '$lib/actions/shortcut';
  import type { OnAction } from '$lib/components/asset-viewer/actions/action';
  import MenuOption from '$lib/components/shared-components/context-menu/menu-option.svelte';
  import { AssetAction } from '$lib/constants';
  import AlbumPickerModal from '$lib/modals/AlbumPickerModal.svelte';
  import { removeAssetsFromAlbum } from '$lib/utils/album-utils';
  import { addAssetsToAlbum, addAssetsToAlbums } from '$lib/utils/asset-utils';
  import { toTimelineAsset } from '$lib/utils/timeline-util';
  import type { AssetResponseDto } from '@immich/sdk';
  import { modalManager } from '@immich/ui';
  import { mdiImageAlbum, mdiShareVariantOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';

  interface Props {
    asset: AssetResponseDto;
    onAction: OnAction;
    shared?: boolean;
  }

  let { asset, onAction, shared = false }: Props = $props();

  // Check if we're currently in an album view
  const currentPage = $derived(page);
  const isAlbumView = $derived(currentPage.route.id?.startsWith('/(user)/albums/[albumId=id]'));
  const currentAlbumId = $derived(isAlbumView ? currentPage.params.albumId : null);
  let removeFromCurrentAlbum = $state(false);

  const onClick = async () => {
    const albums = await modalManager.show(AlbumPickerModal, {
      shared,
      onFooterMount: isAlbumView
        ? (element) => {
            // Create the footer content dynamically
            const footerDiv = document.createElement('div');
            footerDiv.className = 'flex items-center mt-2';
            footerDiv.innerHTML = `
              <input 
                type="checkbox" 
                id="remove-from-current-album"
                class="mr-2 h-4 w-4 rounded border-gray-300 text-immich-primary focus:ring-immich-primary dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-immich-primary"
              />
              <label for="remove-from-current-album" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                ${$t('remove_from_album')}
              </label>
            `;
            element.append(footerDiv);

            const checkbox = element.querySelector('#remove-from-current-album') as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = removeFromCurrentAlbum;
              checkbox.addEventListener('change', (e) => {
                removeFromCurrentAlbum = (e.target as HTMLInputElement).checked;
              });
            }
          }
        : undefined,
    });

    if (!albums || albums.length === 0) {
      return;
    }

    if (albums.length === 1) {
      const album = albums[0];
      await addAssetsToAlbum(album.id, [asset.id]);
      onAction({ type: AssetAction.ADD_TO_ALBUM, asset: toTimelineAsset(asset), album });
    } else {
      await addAssetsToAlbums(
        albums.map((a) => a.id),
        [asset.id],
      );
      onAction({ type: AssetAction.ADD_TO_ALBUM, asset: toTimelineAsset(asset), album: albums[0] });
    }

    // If we're in an album view and the checkbox is checked, remove assets from current album
    if (currentAlbumId && removeFromCurrentAlbum) {
      await removeAssetsFromAlbum(currentAlbumId, [asset.id]);
    }
  };
</script>

<svelte:document use:shortcut={{ shortcut: { key: 'l', shift: shared }, onShortcut: onClick }} />

<MenuOption
  icon={shared ? mdiShareVariantOutline : mdiImageAlbum}
  text={shared ? $t('add_to_shared_album') : $t('add_to_album')}
  {onClick}
/>