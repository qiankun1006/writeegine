package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
public class HomeController {

    /**
     * 首页 - 游戏创作平台门户
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("title", "WriteMyself - 游戏创作平台");
        return "index";
    }

    /**
     * 创作游戏目录页面
     * 显示两个功能入口：地图编辑和图片编辑
     */
    @GetMapping("/create-game")
    public String createGame(Model model) {
        model.addAttribute("title", "创作游戏");
        return "create-game";
    }

    /**
     * Tilemap 地图编辑页面
     * 在此页面中嵌入完整的 Tilemap 编辑器
     */
    @GetMapping("/create-game/tilemap")
    public String createGameTilemap(Model model) {
        model.addAttribute("title", "地图编辑 - 创作游戏");

        // 为嵌入的 Tilemap 编辑器准备数据（与 TilemapEditorController 相同）
        List<String> tileImages = new ArrayList<>(Arrays.asList(
            "brown.png",           // 棕色地块
            "green.png",           // 绿色地块
            "green2.png",          // 绿色地块2
            "obstacle.png",        // 障碍物
            "stone-wall.png",      // 石墙
            "stone.png",           // 石头
            "stone2.png"           // 石头2
        ));

        // 定义对应的图块显示名称（中文）
        List<String> tileNames = new ArrayList<>(Arrays.asList(
            "棕色地块",
            "绿色地块",
            "绿色地块2",
            "障碍物",
            "石墙",
            "石头",
            "石头2"
        ));

        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);

        return "create-game-tilemap";
    }

    /**
     * 图片编辑页面
     * 显示图片编辑器（开发中）
     */
    @GetMapping("/create-game/image")
    public String createGameImage(Model model) {
        model.addAttribute("title", "图片编辑 - 创作游戏");
        return "create-game-image";
    }

    /**
     * 游戏素材创作页面 - 综合入口（保留用于导航）
     * 提供完整的游戏资源编辑系统：角色、地图、UI、特效等
     */
    @GetMapping("/create-game/asset")
    public String createGameAsset(Model model) {
        model.addAttribute("title", "游戏素材创作 - 创作游戏");
        return "create-game-asset-portal";
    }

    // ===== 角色相关 =====
    /**
     * 角色立绘编辑页面
     */
    @GetMapping("/create-game/asset/character-portrait")
    public String createCharacterPortrait(Model model) {
        model.addAttribute("title", "角色立绘 - 游戏素材创作");
        return "asset-editors/character-portrait";
    }

    /**
     * Q版/SD战棋模型编辑页面
     */
    @GetMapping("/create-game/asset/character-sd")
    public String createCharacterSD(Model model) {
        model.addAttribute("title", "Q版/SD战棋 - 游戏素材创作");
        return "asset-editors/character-sd";
    }

    /**
     * 角色战斗动画编辑页面
     */
    @GetMapping("/create-game/asset/character-animation")
    public String createCharacterAnimation(Model model) {
        model.addAttribute("title", "战斗动画 - 游戏素材创作");
        return "asset-editors/character-animation";
    }

    /**
     * 骨骼动画帧序列编辑页面
     */
    @GetMapping("/create-game/asset/character-frame-sequence")
    public String createCharacterFrameSequence(Model model) {
        model.addAttribute("title", "动画帧序列 - 游戏素材创作");
        return "asset-editors/character-frame-sequence";
    }

    /**
     * 角色头像编辑页面
     */
    @GetMapping("/create-game/asset/character-avatar")
    public String createCharacterAvatar(Model model) {
        model.addAttribute("title", "角色头像 - 游戏素材创作");
        return "asset-editors/character-avatar";
    }

    /**
     * 职业转职编辑页面
     */
    @GetMapping("/create-game/asset/character-job")
    public String createCharacterJob(Model model) {
        model.addAttribute("title", "职业转职 - 游戏素材创作");
        return "asset-editors/character-job";
    }

    /**
     * 技能图标编辑页面
     */
    @GetMapping("/create-game/asset/character-skill-icon")
    public String createCharacterSkillIcon(Model model) {
        model.addAttribute("title", "技能图标 - 游戏素材创作");
        return "asset-editors/character-skill-icon";
    }

    /**
     * 状态图标编辑页面
     */
    @GetMapping("/create-game/asset/character-status-icon")
    public String createCharacterStatusIcon(Model model) {
        model.addAttribute("title", "状态图标 - 游戏素材创作");
        return "asset-editors/character-status-icon";
    }

    // ===== 地图与场景 =====
    /**
     * 游戏地图编辑页面（包含AI地图生成功能）
     */
    @GetMapping("/create-game/asset/map-grid")
    public String createMapGrid(Model model) {
        model.addAttribute("title", "游戏地图 - 游戏素材创作");
        List<String> tileImages = new ArrayList<>(Arrays.asList(
            "brown.png", "green.png", "green2.png", "obstacle.png",
            "stone-wall.png", "stone.png", "stone2.png"
        ));
        List<String> tileNames = new ArrayList<>(Arrays.asList(
            "棕色地块", "绿色地块", "绿色地块2", "障碍物",
            "石墙", "石头", "石头2"
        ));
        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);
        return "asset-editors/map-grid";
    }

    /**
     * 地形块素材编辑页面
     */
    @GetMapping("/create-game/asset/map-terrain")
    public String createMapTerrain(Model model) {
        model.addAttribute("title", "地形块素材 - 游戏素材创作");
        return "asset-editors/map-terrain";
    }

    /**
     * 障碍物编辑页面
     */
    @GetMapping("/create-game/asset/map-obstacle")
    public String createMapObstacle(Model model) {
        model.addAttribute("title", "障碍物 - 游戏素材创作");
        return "asset-editors/map-obstacle";
    }

    /**
     * 地图装饰编辑页面
     */
    @GetMapping("/create-game/asset/map-decoration")
    public String createMapDecoration(Model model) {
        model.addAttribute("title", "地图装饰 - 游戏素材创作");
        return "asset-editors/map-decoration";
    }

    /**
     * 战场背景编辑页面
     */
    @GetMapping("/create-game/asset/map-background")
    public String createMapBackground(Model model) {
        model.addAttribute("title", "战场背景 - 游戏素材创作");
        return "asset-editors/map-background";
    }

    /**
     * 关卡载入图编辑页面
     */
    @GetMapping("/create-game/asset/map-loading")
    public String createMapLoading(Model model) {
        model.addAttribute("title", "关卡载入图 - 游戏素材创作");
        return "asset-editors/map-loading";
    }

    // ===== UI 界面类 =====
    /**
     * 主菜单UI设计页面
     */
    @GetMapping("/create-game/asset/ui-main-menu")
    public String createUIMainMenu(Model model) {
        model.addAttribute("title", "主菜单 UI - 游戏素材创作");
        return "asset-editors/ui-main-menu";
    }

    /**
     * 关卡选择UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-level-select")
    public String createUILevelSelect(Model model) {
        model.addAttribute("title", "关卡选择 - 游戏素材创作");
        return "asset-editors/ui-level-select";
    }

    /**
     * 剧情对话UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-dialog")
    public String createUIDialog(Model model) {
        model.addAttribute("title", "剧情对话 - 游戏素材创作");
        return "asset-editors/ui-dialog";
    }

    /**
     * 范围提示UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-battle-range")
    public String createUIBattleRange(Model model) {
        model.addAttribute("title", "范围提示 - 游戏素材创作");
        return "asset-editors/ui-battle-range";
    }

    /**
     * 战斗HUD编辑页面
     */
    @GetMapping("/create-game/asset/ui-battle-hud")
    public String createUIBattleHUD(Model model) {
        model.addAttribute("title", "战斗HUD - 游戏素材创作");
        return "asset-editors/ui-battle-hud";
    }

    /**
     * 人物属性面板编辑页面
     */
    @GetMapping("/create-game/asset/ui-character-panel")
    public String createUICharacterPanel(Model model) {
        model.addAttribute("title", "人物属性 - 游戏素材创作");
        return "asset-editors/ui-character-panel";
    }

    /**
     * 物品装备UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-inventory")
    public String createUIInventory(Model model) {
        model.addAttribute("title", "物品装备 - 游戏素材创作");
        return "asset-editors/ui-inventory";
    }

    /**
     * 技能魔法UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-skill")
    public String createUISkill(Model model) {
        model.addAttribute("title", "技能魔法 - 游戏素材创作");
        return "asset-editors/ui-skill";
    }

    /**
     * 战斗结算UI编辑页面
     */
    @GetMapping("/create-game/asset/ui-battle-result")
    public String createUIBattleResult(Model model) {
        model.addAttribute("title", "战斗结算 - 游戏素材创作");
        return "asset-editors/ui-battle-result";
    }

    // ===== 特效与动画 =====
    /**
     * 移动轨迹特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-movement")
    public String createEffectMovement(Model model) {
        model.addAttribute("title", "移动轨迹 - 游戏素材创作");
        return "asset-editors/effect-movement";
    }

    /**
     * 攻击特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-attack")
    public String createEffectAttack(Model model) {
        model.addAttribute("title", "攻击特效 - 游戏素材创作");
        return "asset-editors/effect-attack";
    }

    /**
     * 魔法特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-magic")
    public String createEffectMagic(Model model) {
        model.addAttribute("title", "魔法特效 - 游戏素材创作");
        return "asset-editors/effect-magic";
    }

    /**
     * 治愈特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-heal")
    public String createEffectHeal(Model model) {
        model.addAttribute("title", "治愈特效 - 游戏素材创作");
        return "asset-editors/effect-heal";
    }

    /**
     * 暴击特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-critical")
    public String createEffectCritical(Model model) {
        model.addAttribute("title", "暴击特效 - 游戏素材创作");
        return "asset-editors/effect-critical";
    }

    /**
     * 命中/闪避特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-status")
    public String createEffectStatus(Model model) {
        model.addAttribute("title", "命中/闪避 - 游戏素材创作");
        return "asset-editors/effect-status";
    }

    /**
     * 升级特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-levelup")
    public String createEffectLevelup(Model model) {
        model.addAttribute("title", "升级特效 - 游戏素材创作");
        return "asset-editors/effect-levelup";
    }

    /**
     * 地形陷阱特效编辑页面
     */
    @GetMapping("/create-game/asset/effect-trap")
    public String createEffectTrap(Model model) {
        model.addAttribute("title", "地形陷阱 - 游戏素材创作");
        return "asset-editors/effect-trap";
    }

    // ===== 文字与图标 =====
    /**
     * 数字字体编辑页面
     */
    @GetMapping("/create-game/asset/font-numbers")
    public String createFontNumbers(Model model) {
        model.addAttribute("title", "数字字体 - 游戏素材创作");
        return "asset-editors/font-numbers";
    }

    /**
     * 按钮图标编辑页面
     */
    @GetMapping("/create-game/asset/icon-button")
    public String createIconButton(Model model) {
        model.addAttribute("title", "按钮图标 - 游戏素材创作");
        return "asset-editors/icon-button";
    }

    /**
     * 职业图标编辑页面
     */
    @GetMapping("/create-game/asset/icon-job")
    public String createIconJob(Model model) {
        model.addAttribute("title", "职业图标 - 游戏素材创作");
        return "asset-editors/icon-job";
    }

    /**
     * 属性图标编辑页面
     */
    @GetMapping("/create-game/asset/icon-attribute")
    public String createIconAttribute(Model model) {
        model.addAttribute("title", "属性图标 - 游戏素材创作");
        return "asset-editors/icon-attribute";
    }

    /**
     * 任务图标编辑页面
     */
    @GetMapping("/create-game/asset/icon-quest")
    public String createIconQuest(Model model) {
        model.addAttribute("title", "任务图标 - 游戏素材创作");
        return "asset-editors/icon-quest";
    }

    // ===== 剧情与过场 =====
    /**
     * 剧情立绘编辑页面
     */
    @GetMapping("/create-game/asset/story-portrait")
    public String createStoryPortrait(Model model) {
        model.addAttribute("title", "剧情立绘 - 游戏素材创作");
        return "asset-editors/story-portrait";
    }

    /**
     * 对话框编辑页面
     */
    @GetMapping("/create-game/asset/story-dialog-box")
    public String createStoryDialogBox(Model model) {
        model.addAttribute("title", "对话框 - 游戏素材创作");
        return "asset-editors/story-dialog-box";
    }

    /**
     * 过场背景编辑页面
     */
    @GetMapping("/create-game/asset/story-transition")
    public String createStoryTransition(Model model) {
        model.addAttribute("title", "过场背景 - 游戏素材创作");
        return "asset-editors/story-transition";
    }

    /**
     * 剧情头像编辑页面
     */
    @GetMapping("/create-game/asset/story-avatar")
    public String createStoryAvatar(Model model) {
        model.addAttribute("title", "剧情头像 - 游戏素材创作");
        return "asset-editors/story-avatar";
    }

    /**
     * Java 代码编辑器页面
     * 在线代码编辑、文件管理、代码索引功能
     */
    @GetMapping("/create-game/code")
    public String createGameCode(Model model) {
        model.addAttribute("title", "Java 代码编辑器 - 创作游戏");
        return "create-game-code";
    }

    /**
     * 游戏进度条组件演示页面
     * 展示6种游戏场景常用的进度条效果，基于Vue3 + Composition API开发
     * 此页面完全独立，不会影响现有的游戏素材创作页面
     */
    @GetMapping("/create-game/asset/progress-bar-demo")
    public String createProgressBarDemo(Model model) {
        model.addAttribute("title", "游戏进度条组件演示 - 游戏素材创作");
        return "create-game-asset-progress-bar-demo";
    }

    /**
     * 粒子效果编辑器页面
     * 用于创建和编辑游戏粒子效果（火焰、雪花、爆炸等）
     */
    @GetMapping("/particle-effect-editor")
    public String particleEffectEditor(Model model) {
        model.addAttribute("title", "粒子效果编辑器 - 游戏素材创作");
        return "particle-editor";
    }

    /**
     * 我的游戏列表
     */
    @GetMapping("/my-games")
    public String myGames(Model model) {
        model.addAttribute("title", "我的游戏");
        // TODO: 从数据库加载用户的游戏列表
        // model.addAttribute("games", gameService.getUserGames());
        return "my-games";
    }

    /**
     * 游戏广场
     */
    @GetMapping("/game-plaza")
    public String gamePlaza(Model model) {
        model.addAttribute("title", "游戏广场");
        // TODO: 从数据库加载已发布的游戏
        // model.addAttribute("sharedGames", gameService.getPublishedGames());
        return "game-plaza";
    }

    /**
     * 关于我们（保留）
     */
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("title", "关于我们");
        return "about";
    }

    /**
     * Favicon 处理
     * 浏览器自动请求 /favicon.ico，我们将其重定向到 SVG 版本
     */
    @GetMapping("/favicon.ico")
    public RedirectView favicon() {
        return new RedirectView("/static/images/favicon.svg");
    }
}

