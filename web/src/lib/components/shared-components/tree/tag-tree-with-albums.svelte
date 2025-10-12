<script lang="ts">
  import TagAlbums from '$lib/components/shared-components/tree/tag-albums.svelte';
  import TreeItems from '$lib/components/shared-components/tree/tree-items.svelte';
  import { TreeNode } from '$lib/utils/tree-utils';
  import type { AlbumResponseDto, TagResponseDto } from '@immich/sdk';
  import { Icon } from '@immich/ui';
  import { mdiChevronDown, mdiChevronRight } from '@mdi/js';

  interface Props {
    node: TreeNode;
    active: string;
    icons: { default: string; active: string };
    getLink: (path: string) => string;
    tags: TagResponseDto[];
    albums: AlbumResponseDto[];
  }

  let { node, active, icons, getLink, tags, albums }: Props = $props();

  const isTarget = $derived(active === node.path);
  const isActive = $derived(active === node.path || active.startsWith(node.value === '/' ? '/' : `${node.path}/`));
  let isOpen = $derived(isActive);

  // Find the tag corresponding to this node by ID
  const currentTag = $derived(node.id ? tags.find(tag => tag.id === node.id) : undefined);

  const onclick = (event: MouseEvent) => {
    event.preventDefault();
    isOpen = !isOpen;
  };
</script>

<a
  href={getLink(node.path)}
  title={node.value}
  class={`flex grow place-items-center ps-2 py-1 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:font-semibold ${isTarget ? 'bg-slate-100 dark:bg-slate-700 font-semibold text-primary' : 'dark:text-gray-200'}`}
  data-sveltekit-keepfocus
>
  {#if node.size > 0}
    <button type="button" {onclick}>
      <Icon icon={isOpen ? mdiChevronDown : mdiChevronRight} class="text-gray-400" size="20" />
    </button>
  {/if}
  <div class={node.size === 0 ? 'ml-[1.5em] ' : ''}>
    <Icon
      icon={isActive ? icons.active : icons.default}
      class={isActive ? 'text-primary' : 'text-gray-400'}
      color={node.color}
      size="20"
    />
  </div>
  <span class="text-nowrap overflow-hidden text-ellipsis font-mono ps-1 pt-1 whitespace-pre-wrap">{node.value}</span>
</a>

{#if isOpen}
  <!-- Show child tags first -->
  <div>
    {#each node.children as childNode (childNode.color ? childNode.path + childNode.color : childNode.path)}
      <li style="list-style: none;">
        <svelte:self node={childNode} {icons} {active} {getLink} {tags} {albums} />
      </li>
    {/each}
  </div>
  
  <!-- Show albums for this tag -->
  {#if currentTag}
    <TagAlbums tag={currentTag} {albums} />
  {/if}
{/if}