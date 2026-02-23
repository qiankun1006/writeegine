#!/bin/bash

# 文件菜单同步脚本
# 自动将源文件复制到编译输出目录

echo "=========================================="
echo "    图片编辑器文件菜单同步工具"
echo "=========================================="
echo ""

# 定义源文件和目标文件
FILES=(
  "src/main/resources/static/js/image-editor/MenuManager.js:target/classes/static/js/image-editor/MenuManager.js"
  "src/main/resources/static/js/image-editor/app.js:target/classes/static/js/image-editor/app.js"
  "src/main/resources/static/css/image-editor.css:target/classes/static/css/image-editor.css"
  "src/main/resources/templates/create-game-image.html:target/classes/templates/create-game-image.html"
)

# 计数器
copied=0
failed=0

# 复制文件
for file_pair in "${FILES[@]}"; do
  IFS=':' read -r source target <<< "$file_pair"

  echo -n "复制 $source ... "

  if [ -f "$source" ]; then
    if cp "$source" "$target" 2>/dev/null; then
      size=$(ls -lh "$target" | awk '{print $5}')
      echo "✓ 成功 ($size)"
      ((copied++))
    else
      echo "✗ 失败（无权限）"
      ((failed++))
    fi
  else
    echo "✗ 源文件不存在"
    ((failed++))
  fi
done

echo ""
echo "=========================================="
echo "同步结果："
echo "  ✓ 成功: $copied 个文件"
echo "  ✗ 失败: $failed 个文件"
echo "=========================================="

if [ $failed -eq 0 ]; then
  echo ""
  echo "✓ 所有文件同步完成！"
  echo ""
  echo "下一步操作："
  echo "  1. 重启应用服务器"
  echo "  2. 清理浏览器缓存（Ctrl+Shift+Delete）"
  echo "  3. 刷新页面"
  echo "  4. 打开开发者工具 (F12) 查看 Console 日志"
  echo ""
  exit 0
else
  echo ""
  echo "✗ 同步过程中出现错误"
  echo "  请检查文件路径和权限"
  echo ""
  exit 1
fi

