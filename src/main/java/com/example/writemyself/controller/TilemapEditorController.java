package com.example.writemyself.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TilemapEditorController {

    @GetMapping("/tilemap-editor")
    public String tilemapEditor(Model model) {
        // 图块配置信息
        String[] tileImages = {
            "brown.png", "stone-wall.png", "stone.png",
            "green.png", "stone2.png", "green2.png", "obstacle.png"
        };

        String[] tileNames = {
            "棕色地块", "石墙", "石头",
            "绿色地块", "石头2", "绿色地块2", "障碍物"
        };

        model.addAttribute("title", "Tilemap编辑器");
        model.addAttribute("tileImages", tileImages);
        model.addAttribute("tileNames", tileNames);
        model.addAttribute("defaultGridSize", 16);

        return "tilemap-editor";
    }
}

