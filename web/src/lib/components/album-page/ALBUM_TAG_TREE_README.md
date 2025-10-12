# Album Tag Tree View Implementation

This implementation adds hierarchical tag tree view support for album grouping in Immich.

## Features Implemented

### 1. New Album Grouping Option
- Added `AlbumGroupBy.TagTree` enum value for hierarchical tag grouping
- Albums can now be grouped by tag hierarchy using "/" as path separator

### 2. Tree View Component
- Created `AlbumTagTreeView` component that displays albums in a hierarchical tag structure
- Supports collapsible/expandable tree nodes
- Shows album count for each tag node
- Handles untagged albums separately

### 3. Tag Hierarchy Support
- Tags with "/" separators (e.g., "Travel/2023/Europe") are displayed as hierarchical trees
- Tree structure: Travel → 2023 → Europe
- Albums can appear under multiple tag paths if they have multiple tags

### 4. UI Integration
- Added "Group by tag tree" option to album controls dropdown
- Integrates with existing collapse/expand functionality
- Respects user preferences for tag feature enablement

## How It Works

### Tag Parsing
```
Example tags:
- "Travel/2023/Europe" → Tree: Travel → 2023 → Europe
- "Work/Projects" → Tree: Work → Projects  
- "Personal" → Tree: Personal (root level)
```

### Album Distribution
- Albums with tag "Travel/2023/Europe" appear under the Europe node
- Albums with multiple tags appear under each corresponding tag node
- Untagged albums are grouped separately at the bottom

### Tree Navigation
- Click chevron icons to expand/collapse tree branches
- Albums are displayed under their deepest tag path
- Visual hierarchy with indentation and connecting lines

## Files Modified

1. **preferences.store.ts** - Added `TagTree` enum value
2. **album-utils.ts** - Added TagTree grouping metadata
3. **albums-list.svelte** - Added tree view rendering logic
4. **album-tag-tree-view.svelte** - New tree view component
5. **albums-controls.svelte** - Added UI label for new option
6. **en.json** - Added internationalization support

## Usage

1. Navigate to Albums page
2. Click "Group albums by..." dropdown
3. Select "Group by tag tree"
4. Albums will be displayed in hierarchical tag structure
5. Use expand/collapse controls to navigate the tree

## Example Tree Structure

```
📁 Travel
  📁 2023
    📁 Europe
      🖼️ Paris Vacation
      🖼️ Rome Trip
    📁 Asia
      🖼️ Tokyo Adventure
  📁 2024
    🖼️ Beach Holiday

📁 Work
  📁 Projects
    🖼️ Team Building
    🖼️ Conference Photos

📁 Untagged
  🖼️ Random Photos
  🖼️ Screenshots
```

This implementation provides a more organized way to browse albums when using hierarchical tag structures, making it easier to navigate large collections of tagged albums.