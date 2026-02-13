package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Tilemap编辑器控制器
 * 处理Tilemap编辑器的页面路由和数据传递
 */
@Controller
public class TilemapEditorController {

    /**
     * 处理Tilemap编辑器页面请求
     *
     * @param model Spring MVC模型对象，用于向模板传递数据
     * @return tilemap-editor模板名称
     */
    @GetMapping("/tilemap-editor")
    public String tilemapEditor(Model model) {
        java.lang.System.out.println("=== Tilemap Editor Request ===");
        System.out.println("请求到达 TilemapEditorController");

        // 定义可用的图块图片列表（文件名）
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

        java.lang.System.out.println("tileImages 数量: " + tileImages.size());
        System.out.println("tileNames 数量: " + tileNames.size());

        // 将数据传递给模板
        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("title", "Tilemap编辑器");
        model.addAttribute("defaultGridSize", 16);

        java.lang.System.out.println("返回模板: tilemap-editor");
        return "tilemap-editor";
    }
}

