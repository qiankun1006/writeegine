# 变更：添加游戏素材创作系统

## 为什么

当前系统已经提供了图片编辑器和地图编辑器，但缺少一个完整的游戏素材创作系统。为了提供完整的游戏开发工具链，需要添加游戏素材创作功能，使用户能够在浏览器中创建和管理游戏所需的各种素材（角色、地图、UI、特效等）。

## 改变什么

- 添加新的游戏素材创作页面，与图片编辑器和地图编辑器同级
- 实现基于 Canvas 2D 的素材编辑功能
- 提供 6 大类 39 种素材类型的创作支持
- 实现素材管理、导入、导出功能
- 添加后端 API 支持素材的 CRUD 操作
- 提供与现有编辑器一致的用户体验和界面风格

## 影响范围

- **受影响的功能**：`game-asset-creator` 新增功能
- **受影响的代码**：
  - `/src/main/resources/templates/create-game-asset.html` - 新增素材创作页面
  - `/src/main/resources/static/css/game-asset-creator.css` - 新增样式文件
  - `/src/main/resources/static/js/game-asset-creator/` - 新增 JavaScript 模块
  - `/src/main/java/com/example/writemyself/controller/AssetController.java` - 新增 API 控制器
  - `/src/main/java/com/example/writemyself/service/AssetService.java` - 新增业务服务
  - `/src/main/java/com/example/writemyself/controller/HomeController.java` - 修改，添加素材创作路由

