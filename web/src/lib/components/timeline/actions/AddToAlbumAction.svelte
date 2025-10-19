<script lang="ts">
  import { page } from '$app/state';
  import MenuOption from '$lib/components/shared-components/context-menu/menu-option.svelte';
  import { getAssetControlContext } from '$lib/components/timeline/AssetSelectControlBar.svelte';
  import AlbumPickerModal from '$lib/modals/AlbumPickerModal.svelte';
  import type { OnAddToAlbum } from '$lib/utils/actions';
  import { removeAssetsFromAlbum } from '$lib/utils/album-utils';
  import { addAssetsToAlbum, addAssetsToAlbums } from '$lib/utils/asset-utils';
  import { modalManager } from '@immich/ui';
  import { mdiImageAlbum, mdiShareVariantOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';

  interface Props {
    shared?: boolean;
    onAddToAlbum?: OnAddToAlbum;
  }

  let { shared = false, onAddToAlbum = () => {} }: Props = $props();

  const { getAssets, clearSelect } = getAssetControlContext();

  // Check if we're currently in an album view
  const currentPage = $derived(page);
  const isAlbumView = $derived(currentPage.route.id?.startsWith('/(user)/albums/[albumId=id]'));
  const currentAlbumId = $derived(isAlbumView ? currentPage.params.albumId : null);
  let removeFromCurrentAlbum = $state(false);

  const onClick = async () => {
    // Reset the checkbox state before opening the modal
    removeFromCurrentAlbum = false;

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

    const assetIds = [...getAssets()].map(({ id }) => id);
    if (albums.length === 1) {
      const album = albums[0];
      await addAssetsToAlbum(album.id, assetIds);
      onAddToAlbum(assetIds, album.id, false);
    } else {
      await addAssetsToAlbums(
        albums.map(({ id }) => id),
        assetIds,
      );
      onAddToAlbum(assetIds, albums[0].id, false);
    }

    // If we're in an album view and the checkbox is checked, remove assets from current album
    if (currentAlbumId && removeFromCurrentAlbum) {
      await removeAssetsFromAlbum(currentAlbumId, assetIds);
      clearSelect();
      onAddToAlbum(assetIds, currentAlbumId, true);
    }
  };
</script>

<MenuOption
  {onClick}
  text={shared ? $t('add_to_shared_album') : $t('add_to_album')}
  icon={shared ? mdiShareVariantOutline : mdiImageAlbum}
  shortcut={{ key: 'l', shift: shared }}
/>
