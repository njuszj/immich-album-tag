<script lang="ts">
  import AlbumCardGroup from '$lib/components/album-page/album-card-group.svelte';
  import AlbumTableRow from '$lib/components/album-page/albums-table-row.svelte';
  import AlbumTableHeader from '$lib/components/album-page/albums-table-header.svelte';
  import { preferences } from '$lib/stores/user.store';
  import { AlbumViewMode, type AlbumViewSettings } from '$lib/stores/preferences.store';
  import { toggleAlbumGroupCollapsing, isAlbumGroupCollapsed, sortOptionsMetadata } from '$lib/utils/album-utils';
  import { TreeNode } from '$lib/utils/tree-utils';
  import type { ContextMenuPosition } from '$lib/utils/context-menu';
  import type { AlbumResponseDto } from '@immich/sdk';
  import { Icon } from '@immich/ui';
  import { mdiChevronDown, mdiChevronRight, mdiTag } from '@mdi/js';
  import { t } from 'svelte-i18n';

  interface Props {
    albums: AlbumResponseDto[];
    userSettings: AlbumViewSettings;
    showOwner?: boolean;
    onShowContextMenu?: (position: ContextMenuPosition, album: AlbumResponseDto) => void;
    onTreeNodeIdsCollected?: (nodeIds: string[]) => void;
  }

  let { albums, userSettings, showOwner = false, onShowContextMenu, onTreeNodeIdsCollected }: Props = $props();

  // Enhanced TreeNode to include albums
  interface TagTreeNode extends TreeNode {
    albums?: AlbumResponseDto[];
  }

  // Create tag tree from all unique tags found in albums
  const tagTree = $derived((): TagTreeNode => {
    const allTags: { value: string; id: string; color?: string }[] = [];
    const tagToAlbumsMap = new Map<string, AlbumResponseDto[]>();
    const untaggedAlbums: AlbumResponseDto[] = [];

    // Collect all unique tags and build album mappings
    for (const album of albums) {
      if (!album.tags || album.tags.length === 0) {
        untaggedAlbums.push(album);
      } else {
        for (const tag of album.tags) {
          // Add tag to unique list if not already present
          if (!allTags.find(t => t.id === tag.id)) {
            allTags.push({
              value: tag.value,
              id: tag.id,
              color: tag.color,
            });
          }

          // Map tag to albums
          if (!tagToAlbumsMap.has(tag.id)) {
            tagToAlbumsMap.set(tag.id, []);
          }
          if (!tagToAlbumsMap.get(tag.id)!.find(a => a.id === album.id)) {
            tagToAlbumsMap.get(tag.id)!.push(album);
          }
        }
      }
    }

    // Create tree structure
    const tree = TreeNode.fromTags(allTags.map(tag => ({
      id: tag.id,
      value: tag.value,
      color: tag.color,
      name: tag.value.split('/').pop() || tag.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))) as TagTreeNode;

    // Attach album data to tree nodes
    const attachAlbumsToNode = (node: TagTreeNode) => {
      if (node.id && tagToAlbumsMap.has(node.id)) {
        (node as any).albums = tagToAlbumsMap.get(node.id)!;
      }

      for (const child of node.children) {
        attachAlbumsToNode(child as TagTreeNode);
      }
    };

    attachAlbumsToNode(tree);

    // Add untagged albums if any
    if (untaggedAlbums.length > 0) {
      const untaggedNode = TreeNode.fromTags([{
        id: 'untagged',
        value: 'untagged',
        color: undefined,
        name: 'untagged',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]).children[0] as TagTreeNode;
      (untaggedNode as any).albums = untaggedAlbums;
      (tree as any).set('untagged', untaggedNode);
    }

    return tree;
  });

  const handleNodeToggle = (nodeId: string) => {
    toggleAlbumGroupCollapsing(nodeId);
  };

  // Collect all tree node IDs and notify parent
  $effect(() => {
    if (onTreeNodeIdsCollected) {
      const nodeIds = new Set<string>();
      
      const collectNodeIds = (node: TagTreeNode) => {
        if (node.path) {
          nodeIds.add(node.path);
        }
        for (const child of node.children) {
          collectNodeIds(child as TagTreeNode);
        }
      };
      
      const tree = tagTree();
      collectNodeIds(tree);
      
      onTreeNodeIdsCollected(Array.from(nodeIds));
    }
  });
</script>

{#if $preferences?.tags?.enabled}
  {#if userSettings.view === AlbumViewMode.List}
    <!-- Tree view in list mode -->
    <div class="album-tag-tree-list">
      <!-- Table header -->
      <table class="w-full text-start mb-4">
        <thead class="mb-4 flex h-12 w-full rounded-md border bg-gray-50 text-primary dark:border-immich-dark-gray dark:bg-immich-dark-gray">
          <tr class="flex w-full place-items-center p-2 md:p-5">
            {#each sortOptionsMetadata as option, index (index)}
              <AlbumTableHeader {option} />
            {/each}
          </tr>
        </thead>
      </table>
      
      {#each tagTree().children as node (node.path)}
        {@render renderTreeNodeList(node, 0)}
      {/each}
    </div>
  {:else}
    <!-- Tree view in card mode -->
    <div class="album-tag-tree">
      {#each tagTree().children as node (node.path)}
        {@render renderTreeNode(node, 0)}
      {/each}
    </div>
  {/if}
{/if}

{#snippet renderTreeNode(node: TagTreeNode, level: number)}
  {@const isCollapsed = isAlbumGroupCollapsed(userSettings, node.path)}
  {@const hasChildren = node.children.length > 0}
  {@const hasAlbums = (node as any).albums && (node as any).albums.length > 0}
  {@const shouldShow = hasChildren || hasAlbums}

  {#if shouldShow}
    <div class="tree-node" style="margin-left: {level * 1}rem">
      <div class="tree-node-header">
        <button
          type="button"
          onclick={() => handleNodeToggle(node.path)}
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
        >
          <Icon
            icon={isCollapsed ? mdiChevronRight : mdiChevronDown}
            size="20"
            class="text-gray-400 flex-shrink-0"
          />
          <Icon icon={mdiTag} size="20" color={node.color} class="text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <span class="font-medium text-sm truncate">
            {node.value === 'untagged' ? $t('untagged') : node.value.split('/').pop()}
          </span>
          <span class="text-xs text-gray-500 ml-auto flex-shrink-0">
            ({hasAlbums ? (node as any).albums.length : 0})
          </span>
        </button>
      </div>

      {#if !isCollapsed}
        <!-- Render albums for this node -->
        {#if hasAlbums}
          <div class="tree-node-albums" style="margin-left: 1.5rem; margin-bottom: 1rem">
            <AlbumCardGroup
              albums={(node as any).albums}
              {showOwner}
              showDateRange
              showItemCount
              {onShowContextMenu}
            />
          </div>
        {/if}

        <!-- Render child nodes -->
        {#if hasChildren}
          <div class="tree-node-children" style="margin-left: 0.5rem">
            {#each node.children as child (child.path)}
              {@render renderTreeNode(child as TagTreeNode, level + 1)}
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
{/snippet}

{#snippet renderTreeNodeList(node: TagTreeNode, level: number)}
  {@const isCollapsed = isAlbumGroupCollapsed(userSettings, node.path)}
  {@const hasChildren = node.children.length > 0}
  {@const hasAlbums = (node as any).albums && (node as any).albums.length > 0}
  {@const shouldShow = hasChildren || hasAlbums}
  {@const indent = level * 2}  <!-- 2rem per level for clearer hierarchy -->

  {#if shouldShow}
    <div class="tree-node-list">
      <!-- Tree node header in list mode with hierarchy indentation -->
      <div class="tree-node-header-list" style="padding-left: {indent}rem">
        <button
          type="button"
          onclick={() => handleNodeToggle(node.path)}
          class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left mb-2 bg-gray-50 dark:bg-immich-dark-gray/50"
        >
          <Icon
            icon={isCollapsed ? mdiChevronRight : mdiChevronDown}
            size="24"
            class="text-gray-400 flex-shrink-0"
          />
          <Icon icon={mdiTag} size="24" color={node.color} class="text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <div class="flex flex-col flex-1 min-w-0">
            <span class="font-bold text-lg truncate text-black dark:text-white">
              {node.value === 'untagged' ? $t('untagged') : node.value.split('/').pop()}
            </span>
            {#if level > 0 && node.value !== 'untagged'}
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {node.value}
              </span>
            {/if}
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 font-medium">
            ({hasAlbums ? (node as any).albums.length : 0})
          </span>
        </button>
      </div>

      {#if !isCollapsed}
        <!-- Render albums for this node in table format -->
        {#if hasAlbums}
          <div class="tree-node-albums-list" style="margin-left: {indent + 2}rem; margin-bottom: 1rem">
            <div class="w-full overflow-y-auto rounded-md border dark:border-immich-dark-gray dark:text-immich-dark-fg">
              {#each (node as any).albums as album (album.id)}
                <AlbumTableRow {album} {onShowContextMenu} />
              {/each}
            </div>
          </div>
        {/if}

        <!-- Render child nodes -->
        {#if hasChildren}
          <div class="tree-node-children-list">
            {#each node.children as child (child.path)}
              {@render renderTreeNodeList(child as TagTreeNode, level + 1)}
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
{/snippet}

<style>
  .album-tag-tree {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .album-tag-tree-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tree-node-header {
    border-left: 2px solid rgb(229 231 235);
  }

  .tree-node-header-list {
    position: relative;
  }

  .tree-node-header-list::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, rgb(229 231 235), rgb(243 244 246));
  }

  :global(.dark) .tree-node-header {
    border-left: 2px solid rgb(75 85 99);
  }

  :global(.dark) .tree-node-header-list::before {
    background: linear-gradient(to bottom, rgb(75 85 99), rgb(55 65 81));
  }

  .tree-node-albums {
    border-left: 2px solid rgb(243 244 246);
  }

  .tree-node-albums-list {
    position: relative;
  }

  .tree-node-albums-list::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: rgb(243 244 246);
  }

  :global(.dark) .tree-node-albums {
    border-left: 2px solid rgb(55 65 81);
  }

  :global(.dark) .tree-node-albums-list::before {
    background-color: rgb(55 65 81);
  }

  .tree-node-children {
    border-left: 1px solid rgb(243 244 246);
  }

  .tree-node-children-list {
    position: relative;
  }

  .tree-node-children-list::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: rgb(229 231 235);
  }

  :global(.dark) .tree-node-children {
    border-left: 1px solid rgb(55 65 81);
  }

  :global(.dark) .tree-node-children-list::before {
    background-color: rgb(75 85 99);
  }
</style>