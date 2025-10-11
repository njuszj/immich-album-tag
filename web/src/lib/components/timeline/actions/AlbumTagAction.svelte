<script lang="ts">
  import { shortcut } from '$lib/actions/shortcut';
  import AlbumTagModal from '$lib/modals/AlbumTagModal.svelte';
  import { IconButton, modalManager } from '@immich/ui';
  import { mdiTagMultipleOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import MenuOption from '../../shared-components/context-menu/menu-option.svelte';

  interface Props {
    albumId: string;
    menuItem?: boolean;
  }

  let { albumId, menuItem = false }: Props = $props();

  const text = $t('tag');
  const icon = mdiTagMultipleOutline;

  const handleTagAlbum = async () => {
    await modalManager.show(AlbumTagModal, { albumId });
  };
</script>

<svelte:document use:shortcut={{ shortcut: { key: 't' }, onShortcut: handleTagAlbum }} />

{#if menuItem}
  <MenuOption {text} {icon} onClick={handleTagAlbum} />
{/if}

{#if !menuItem}
  <IconButton shape="round" color="secondary" variant="ghost" aria-label={text} {icon} onclick={handleTagAlbum} />
{/if}