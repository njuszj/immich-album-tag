<script lang="ts">
  import TagTreeWithAlbums from '$lib/components/shared-components/tree/tag-tree-with-albums.svelte';
  import { type TreeNode } from '$lib/utils/tree-utils';
  import type { AlbumResponseDto, TagResponseDto } from '@immich/sdk';

  interface Props {
    tree: TreeNode;
    active: string;
    icons: { default: string; active: string };
    getLink: (path: string) => string;
    tags: TagResponseDto[];
    albums: AlbumResponseDto[];
  }

  let { tree, active, icons, getLink, tags, albums }: Props = $props();
</script>

<ul class="list-none ms-2">
  {#each tree.children as node (node.color ? node.path + node.color : node.path)}
    <li>
      <TagTreeWithAlbums {node} {icons} {active} {getLink} {tags} {albums} />
    </li>
  {/each}
</ul>