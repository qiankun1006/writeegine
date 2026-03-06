## Why

The current `/create-game/asset/map-grid` page (战棋网格地图) provides basic tilemap editing functionality but lacks AI-powered map generation capabilities. Users need to manually place each tile, which is time-consuming for creating professional game maps. By integrating AI generation similar to the character portrait page, users can first sketch the rough layout with tiles and then use AI to generate high-quality, production-ready game maps based on their pixel art outline and specified parameters.

## What Changes

- **Page Title**: Change from "战棋网格地图" to "游戏地图"
- **Enhanced UI**: Add AI generation parameter inputs alongside existing tilemap editor
- **AI Parameters**: Include style, dimensions, game type, fine-tuning models, reference images, etc.
- **Generation Button**: Add "Generate" button to trigger AI map generation
- **Workflow**: Users sketch with tiles → Set AI parameters → Generate professional map
- **Preserve Existing**: Keep all current tilemap functionality intact

## Impact

Affected specs: [game-map-generation, ai-integration, tilemap-editor, ui-feedback]
Affected code: [HomeController.java, map-grid.html, tilemap-editor.js, new AI map generation components]

**Key Decisions:**
1. **Hybrid Approach**: Maintain existing tilemap editor as the base layer, add AI generation as an enhancement
2. **Parameter Set**: Use similar AI parameters as character portrait (style, dimensions, game type, etc.)
3. **UI Layout**: Side-by-side layout with tilemap editor on left, AI parameters on right
4. **Generation Flow**: Tile sketch → AI enhancement → Professional output
5. **Backward Compatibility**: All existing tilemap functionality remains unchanged

